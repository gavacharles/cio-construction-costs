#!/usr/bin/env python3
"""
site_check.py — the robot visitor: opens every public page in every language, the way a person would, and
reports what is broken. Runs daily (cycle.py daily); the result is shown in /admin and a failure is reported to the
organiser.

In a real browser (headless Chrome), for each page × language (en, sw, fr):
  - JavaScript errors;
  - text a person would see that is broken: NaN, undefined, Infinity, [object Object], an unfilled {placeholder},
    or a translation key shown instead of words (e.g. "lp.sub2");
  - on pages with a forecast, that the verdict was filled in.
Without a browser:
  - every internal link and asset in public/ points to a file that exists;
  - translation keys missing in Kiswahili or French (a warning: the English text is shown instead).

    python src/ops/site_check.py [--url http://127.0.0.1:8000] [--quick]
Environment: CIO_SITE_URL (default: the local app, else the files in public/), CIO_CHROME (browser path).
Output: data/live/site_check.json; exit 1 when something is broken.
"""
from __future__ import annotations

import argparse
import html
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime
from pathlib import Path
from urllib.parse import urljoin, urlsplit

ROOT = Path(__file__).resolve().parents[2]
PUB = ROOT / "public"
OUT = ROOT / "data" / "live" / "site_check.json"
I18N = ROOT / "src" / "site" / "i18n.js"
LANGS = ("en", "sw", "fr")
BROKEN = [("NaN", r"\bNaN\b"), ("undefined", r"\bundefined\b"), ("Infinity", r"\bInfinity\b"),
          ("[object Object]", r"\[object Object\]"), ("unfilled placeholder", r"\{[a-z]{1,12}\}")]
CHROMES = ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "google-chrome", "google-chrome-stable",
           "chromium", "chromium-browser"]


def chrome() -> str | None:
    for c in [os.environ.get("CIO_CHROME")] + CHROMES:
        if c and (Path(c).exists() or shutil.which(c)):
            return shutil.which(c) or c
    return None


def pages() -> list[str]:
    """Every page a person can open (notes are plain HTML: checked for links only)."""
    top = sorted(p.name for p in PUB.glob("*.html") if p.name not in ("contract-index.html",))
    countries = sorted(f"countries/{d.name}/index.html" for d in (PUB / "countries").iterdir() if (d / "index.html").exists())
    return top + countries


def i18n_keys() -> dict[str, set[str]]:
    s = I18N.read_text(encoding="utf-8")
    keys = {}
    for i, lang in enumerate(("sw", "fr", "en")):
        a = s.index(f"    {lang}: {{\n")
        nxt = [s.index(f"    {o}: {{\n") for o in ("sw", "fr", "en") if s.index(f"    {o}: {{\n") > a]
        b = min(nxt) if nxt else s.index("\n  };", a)
        keys[lang] = set(re.findall(r'"([a-z][a-z0-9_]*(?:\.[a-z0-9_]+)+)":', s[a:b]))
    return keys


def visible_text(dom: str) -> str:
    dom = re.sub(r"(?is)<(script|style|template|svg)\b.*?</\1>", " ", dom)
    dom = re.sub(r"(?is)<!--.*?-->", " ", dom)
    return html.unescape(re.sub(r"<[^>]+>", " ", dom))


def visit(browser: str, url: str, keys: set[str]) -> list[str]:
    with tempfile.TemporaryDirectory() as prof:
        try:
            r = subprocess.run([browser, "--headless=new", "--disable-gpu", f"--user-data-dir={prof}", "--no-first-run",
                                "--allow-file-access-from-files", "--enable-logging=stderr", "--v=0",
                                "--virtual-time-budget=6000", "--dump-dom", url], capture_output=True, text=True, timeout=90)
        except subprocess.TimeoutExpired:
            return ["page did not finish loading in 90 s"]
    probs = [f"JavaScript error: {l.split('] ', 1)[-1][:160]}" for l in r.stderr.splitlines()
             if "Uncaught" in l or ("CONSOLE" in l and "rror" in l)]
    dom = r.stdout
    if len(dom) < 500:
        return probs + ["page came back empty"]
    text = visible_text(dom)
    for name, pat in BROKEN:
        m = re.search(pat, text)
        if m:
            probs.append(f"shows “{name}”: …{' '.join(text[max(0, m.start() - 50):m.end() + 30].split())}…")
    shown = {k for k in keys if f">{k}<" in dom.replace(" ", "")}
    if shown:
        probs.append("translation key shown instead of words: " + ", ".join(sorted(shown)[:5]))
    v = re.search(r"data-verdict[^>]*>([^<]*)<", dom)
    if v and v.group(1).strip() in ("", "–"):
        probs.append("forecast verdict was not filled in")
    return probs


def link_problems() -> list[str]:
    """Internal href/src in the built pages that point to nothing."""
    bad = []
    for f in PUB.rglob("*.html"):
        for ref in set(re.findall(r'''(?:href|src)=["']?([^"' >]+)''', f.read_text(encoding="utf-8", errors="replace"))):
            if re.match(r"^(https?:|mailto:|tel:|data:|javascript:|#|\$\{|//)", ref) or "{" in ref:
                continue
            path = urlsplit(ref).path
            if not path:
                continue
            target = (f.parent / path).resolve() if not path.startswith("/") else (PUB / path.lstrip("/")).resolve()
            if path.startswith("/api/"):
                continue
            if not (target.exists() and (target.is_file() or (target / "index.html").exists())):
                bad.append(f"{f.relative_to(PUB)} → {ref}")
    return sorted(set(bad))


def base_url(arg: str | None) -> str:
    for u in [arg, os.environ.get("CIO_SITE_URL"), "http://127.0.0.1:8000/"]:
        if not u:
            continue
        try:
            urllib.request.urlopen(u.rstrip("/") + "/", timeout=10)
            return u.rstrip("/") + "/"
        except Exception:
            continue
    return PUB.as_uri() + "/"                      # no server: the built files themselves


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[1])
    ap.add_argument("--url")
    ap.add_argument("--quick", action="store_true", help="English only")
    a = ap.parse_args(argv)
    keys = i18n_keys()
    fails = [f"broken link: {x}" for x in link_problems()]
    warns = [f"{len(keys['en'] - keys[l])} texts not yet translated into {name} (English shown instead)"
             for l, name in (("sw", "Kiswahili"), ("fr", "French")) if keys["en"] - keys[l]]
    browser, base, visited = chrome(), base_url(a.url), 0
    if not browser:
        warns.append("no browser found (set CIO_CHROME): pages were not opened")
    else:
        jobs = [(p, l) for l in (("en",) if a.quick else LANGS) for p in pages()]
        def one(job):
            p, l = job
            return p, l, visit(browser, urljoin(base, p) + f"?lang={l}", keys["en"])
        with ThreadPoolExecutor(max_workers=4) as ex:
            for p, l, probs in ex.map(one, jobs):
                visited += 1
                fails += [f"{p} ({l}): {x}" for x in probs]
    res = {"run": datetime.now().isoformat(timespec="minutes"), "site": base, "pages_opened": visited,
           "status": "fail" if fails else ("warn" if warns else "ok"), "problems": fails, "warnings": warns}
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(res, indent=1, ensure_ascii=False), encoding="utf-8")
    for x in fails + warns:
        print(("FAIL " if x in fails else "WARN ") + x)
    print(f"site check: {visited} page views, {len(fails)} problems, {len(warns)} warnings ({base})")
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
