"""
contract_reader.py — reads the price adjustment data out of a contract (CiO Costs Pro).

A contractor or consultant uploads the Contract Data / Particular Conditions (PDF). Claude finds the FIDIC price
adjustment (Sub-Clause 13.7 of the 2017 books, 13.8 of 1999): Base Date, the fixed part "a", and each element
with its coefficient and the index the contract names, quoting the words and the page for every value.
This code then checks, without the model:
  - each quote is in the document, and on which page (when the PDF has text);
  - the coefficients add up to 1;
  - the Base Date is a real date; the suggested index is one the site has.
The person reviews the values before they fill the form. The file is read in memory and never stored.
"""
from __future__ import annotations

import base64
import io
import json
import re
from datetime import date

import claude

MAX_BYTES = 10 * 1024 * 1024
MAX_PAGES = 80

SYSTEM = """You read construction contracts for CiO Costs, a site that works out FIDIC price adjustments for \
Interim Payment Certificates. Find the price adjustment data: FIDIC Sub-Clause 13.7 (2017 books) or 13.8 (1999 \
books), usually in the Contract Data, Particular Conditions, Schedule(s) of cost indexation, Table of Adjustment Data \
or Appendix to Tender.

- Report only what the document says. Copy each coefficient exactly as written; do not normalise, round or complete \
them. If a value is missing, leave it null; do not guess it.
- For every value give the exact words from the document (short: the row or sentence) and the page number.
- If the contract says the price is fixed, not adjusted for changes in cost, or has no adjustment formula, set found \
to false and say so in the note.
- For each element, pick the index option from the list given that best matches the index the contract names, or \
"manual" when none matches (for example a foreign or specific index the site does not have)."""

SCHEMA = {
    "type": "object", "additionalProperties": False,
    "required": ["found", "note", "base_date", "base_date_quote", "base_date_page", "currency", "fixed_coef",
                 "fixed_quote", "fixed_page", "elements"],
    "properties": {
        "found": {"type": "boolean"},
        "note": {"type": "string", "description": "one or two sentences for the user: what you found, or why not"},
        "base_date": {"anyOf": [{"type": "string", "description": "YYYY-MM-DD"}, {"type": "null"}]},
        "base_date_quote": {"type": "string"},
        "base_date_page": {"anyOf": [{"type": "integer"}, {"type": "null"}]},
        "currency": {"anyOf": [{"type": "string"}, {"type": "null"}]},
        "fixed_coef": {"anyOf": [{"type": "number"}, {"type": "null"}]},
        "fixed_quote": {"type": "string"},
        "fixed_page": {"anyOf": [{"type": "integer"}, {"type": "null"}]},
        "elements": {"type": "array", "items": {
            "type": "object", "additionalProperties": False,
            "required": ["label", "coef", "index_named", "source", "quote", "page"],
            "properties": {
                "label": {"type": "string", "description": "the element as the contract names it, e.g. Cement"},
                "coef": {"type": "number"},
                "index_named": {"type": "string", "description": "the index or source the contract names for it"},
                "source": {"type": "string", "description": "one of the index option values given, or manual"},
                "quote": {"type": "string"},
                "page": {"anyOf": [{"type": "integer"}, {"type": "null"}]}}}},
    },
}


class ReadError(Exception):
    pass


def _norm(t: str) -> str:
    return re.sub(r"\s+", "", t or "").lower()


def pages_text(pdf: bytes) -> list[str]:
    from pypdf import PdfReader
    try:
        r = PdfReader(io.BytesIO(pdf))
        if r.is_encrypted:
            raise ReadError("This PDF is password-protected. Please upload a copy without a password.")
        if len(r.pages) > MAX_PAGES:
            raise ReadError(f"This PDF has {len(r.pages)} pages. Please upload only the Contract Data or Particular "
                            f"Conditions (up to {MAX_PAGES} pages).")
        return [(p.extract_text() or "") for p in r.pages]
    except ReadError:
        raise
    except Exception:
        raise ReadError("This file could not be opened as a PDF.")


def find_page(quote: str, pages: list[str]) -> int | None:
    q = _norm(quote)
    if len(q) < 4:
        return None
    for i, t in enumerate(pages, 1):
        if q in _norm(t):
            return i
    return None


def review(out: dict, pages: list[str], options: list[str]) -> dict:
    """Checks done by code on the model's answer; each value gets a 'check' the user sees."""
    has_text = sum(len(t.strip()) for t in pages) > 200

    def chk(quote: str, page) -> str:
        if not has_text:
            return f"see page {page}" if page else "check by hand"
        p = find_page(quote, pages)
        return f"found on page {p}" if p else "not found as quoted: check by hand"

    els = []
    for x in out.get("elements") or []:
        src = x["source"] if x["source"] in options else "manual"
        els.append({**x, "source": src, "check": chk(x["quote"], x["page"])})
    out["elements"] = els
    if out.get("fixed_coef") is not None:
        out["fixed_check"] = chk(out.get("fixed_quote", ""), out.get("fixed_page"))
    bd = out.get("base_date")
    try:
        out["base_date"] = date.fromisoformat(bd).isoformat() if bd else None
    except ValueError:
        out["base_date"] = None
    if out.get("base_date"):
        out["base_date_check"] = chk(out.get("base_date_quote", ""), out.get("base_date_page"))
    total = (out.get("fixed_coef") or 0) + sum(x["coef"] for x in els)
    out["sum"] = round(total, 4)
    out["sum_ok"] = bool(els) and abs(total - 1) <= 0.005
    return out


def read(pdf: bytes, country: str, options: dict[str, str], cl=None) -> tuple[dict, float]:
    """(reviewed result, US$ cost). options: index option value -> label, as offered on the site for this country."""
    if len(pdf) > MAX_BYTES:
        raise ReadError("The file is larger than 10 MB. Please upload only the Contract Data or Particular Conditions.")
    if pdf[:4] != b"%PDF":
        raise ReadError("Please upload a PDF.")
    pages = pages_text(pdf)
    has_text = sum(len(t.strip()) for t in pages) > 200
    opts = "\n".join(f"- {v}: {l}" for v, l in options.items())
    ask = (f"Country of the works: {country.replace('_', ' ').title()}.\nIndex options on CiO Costs for this "
           f"country (value: label):\n{opts}\n- manual: values the user types in\n\nRead the price adjustment data.")
    if has_text:                       # text is far cheaper than page images, and lets the quotes be checked
        doc = "\n\n".join(f"=== Page {i} ===\n{t}" for i, t in enumerate(pages, 1))
        content = [{"type": "text", "text": f"<document>\n{doc}\n</document>"}, {"type": "text", "text": ask}]
    else:                              # a scan: send the PDF itself so the pages are read as images
        content = [{"type": "document", "source": {"type": "base64", "media_type": "application/pdf",
                                                   "data": base64.standard_b64encode(pdf).decode()}},
                   {"type": "text", "text": ask}]
    cl = cl or claude.client()
    r = claude.create(cl, system=SYSTEM, messages=[{"role": "user", "content": content}], max_tokens=16000,
                      output_config={"effort": "medium", "format": {"type": "json_schema", "schema": SCHEMA}})
    usd = claude.cost(r.usage)
    if r.stop_reason == "refusal":
        raise ReadError("The assistant could not read this document.")
    if r.stop_reason == "max_tokens":
        raise ReadError("The document was too long to read in one go. Please upload only the Contract Data.")
    text = next((b.text for b in r.content if b.type == "text"), "")
    try:
        out = json.loads(text)
    except json.JSONDecodeError:
        raise ReadError("The assistant's answer could not be read; please try again.")
    return review(out, pages, list(options)), usd
