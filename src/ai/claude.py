"""
claude.py — the one place CiO Costs talks to Claude (Anthropic API): client, model, cost of each call, spending cap.

Off unless an Anthropic credential is set (ANTHROPIC_API_KEY). Everything that uses it (the data scout, the
contract reader) says so plainly and does nothing when it is off.
Environment:
  ANTHROPIC_API_KEY     the API key (console.anthropic.com)
  CIO_AI_MODEL          model id (default claude-opus-5-5)
  CIO_AI_MONTHLY_USD    spending cap per calendar month (default 30): calls stop for the month once it is reached
"""
from __future__ import annotations

import os

MODEL = os.environ.get("CIO_AI_MODEL", "claude-opus-5-5")
MONTHLY_USD = float(os.environ.get("CIO_AI_MONTHLY_USD", "30"))
PRICES = {"claude-opus-5-5": (4.0, 20.0), "claude-sonnet-5-5": (2.0, 10.0), "claude-haiku-5-5": (0.10, 0.50)}   # US$ per million tokens
SEARCH_USD = 0.01                                        # per web search
# If Claude declines a request, the API retries it on a suitable fallback model inside the same call.
FALLBACK = {"betas": ["server-side-fallback-2026-07-01"], "fallbacks": "default"}


class AIError(Exception):
    """Shown to the person using the feature, so worded for them."""


def enabled() -> bool:
    return bool(os.environ.get("ANTHROPIC_API_KEY") or os.environ.get("ANTHROPIC_AUTH_TOKEN"))


def client():
    if not enabled():
        raise AIError("The assistant is not switched on yet.")
    import anthropic
    return anthropic.Anthropic(max_retries=3, timeout=600)


def cost(usage, model: str = MODEL) -> float:
    """US$ for one response, from its usage block (cache writes at 1.25x, cache reads at 0.1x the input price)."""
    pin, pout = PRICES.get(model, PRICES["claude-opus-5-5"])
    g = lambda k: getattr(usage, k, 0) or 0
    tokens_in = g("input_tokens") + 1.25 * g("cache_creation_input_tokens") + 0.1 * g("cache_read_input_tokens")
    searches = getattr(getattr(usage, "server_tool_use", None), "web_search_requests", 0) or 0
    return (tokens_in * pin + g("output_tokens") * pout) / 1e6 + searches * SEARCH_USD


def create(cl, **kw):
    """One Messages API call with the default model, effort and refusal fallback."""
    import anthropic
    kw.setdefault("output_config", {}).setdefault("effort", "medium")
    try:
        return cl.beta.messages.create(model=MODEL, **FALLBACK, **kw)
    except anthropic.RateLimitError:
        raise AIError("The assistant is busy; please try again in a minute.")
    except anthropic.APIStatusError as err:
        raise AIError(f"The assistant could not answer (error {err.status_code}); please try again later.")
    except anthropic.APIConnectionError:
        raise AIError("The assistant could not be reached; please try again later.")
