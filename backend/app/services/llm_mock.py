"""Grounded Mock LLM Simulator.

This is the zero-cost, zero-API-key default "model" used whenever no live
LLM credentials are configured. It is intentionally NOT a canned string —
it composes structured, context-aware text by interpolating the actual
retrieved RAG chunks, customer/industry entities, and detected intent
keywords from the conversation, so answers change meaningfully with the
query and the underlying data. This keeps the entire product fully
demoable offline while presenting a uniform interface
(`LLMEngine.generate(...)`) that app/services/llm_router.py swaps for a
real Azure OpenAI / OpenAI call when credentials are present.
"""
from __future__ import annotations

import re

ESCALATION_KEYWORDS = [
    "cancel my account",
    "speak to a manager",
    "unacceptable",
    "lawsuit",
    "attorney",
    "switch providers",
    "switch carriers",
    "regulator",
    "complaint filed",
    "third time",
]

NEGATIVE_SENTIMENT_KEYWORDS = [
    "frustrated",
    "angry",
    "unacceptable",
    "ridiculous",
    "disappointed",
    "unhappy",
    "terrible",
]


def _clean(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def detect_sentiment(text: str) -> str:
    lowered = text.lower()
    if any(k in lowered for k in NEGATIVE_SENTIMENT_KEYWORDS):
        return "Negative"
    if any(k in lowered for k in ["thank you", "thanks", "appreciate", "great"]):
        return "Positive"
    return "Neutral"


def detect_escalation(text: str) -> tuple[bool, str]:
    lowered = text.lower()
    for kw in ESCALATION_KEYWORDS:
        if kw in lowered:
            return True, f"Customer language matched escalation trigger phrase: '{kw}'."
    return False, ""


class MockLLM:
    """Deterministic, template-driven text generator grounded in RAG context."""

    def generate_reply(self, customer_message: str, industry: str, sources: list[dict]) -> str:
        top = sources[0] if sources else None
        sentiment = detect_sentiment(customer_message)
        opener = {
            "Negative": "I completely understand your frustration, and I want to get this resolved for you right away.",
            "Positive": "Thanks so much for the context — happy to help get this sorted.",
            "Neutral": "Thanks for reaching out — let me help you with that.",
        }[sentiment]

        if top:
            grounding = _clean(top["snippet"])
            body = (
                f"Based on our {top['source_type']} guidance (\"{top['title']}\"), here's what applies to your "
                f"{industry.lower()} case: {grounding[:280]}"
            )
        else:
            body = (
                f"I've reviewed your {industry.lower()} account details and I don't see a documented policy "
                "that directly matches this yet — let me escalate to a specialist who can confirm the exact next step."
            )

        closer = "Is it alright if I go ahead and take that action for you now?"
        return f"{opener} {body} {closer}"

    def generate_summary_fields(self, transcript_text: str, industry: str, sources: list[dict]) -> dict:
        first_customer_line = next(
            (line for line in transcript_text.split("\n") if line.strip()), "Customer reported an issue."
        )
        top = sources[0] if sources else None
        root_cause = (
            f"Root cause traced to: {_clean(top['snippet'])[:200]}"
            if top
            else "Root cause requires further investigation; no single documented policy match was found."
        )
        resolution = (
            f"Resolved in line with '{top['title']}'."
            if top
            else "Escalated for manual resolution given no direct KB match."
        )
        return {
            "customer_issue": _clean(first_customer_line)[:240],
            "root_cause": root_cause,
            "resolution": resolution,
        }

    def generate_crm_note(self, customer_name: str, industry: str, summary: dict) -> str:
        return (
            f"[{industry}] Customer: {customer_name}. Issue: {summary['customer_issue']} "
            f"Root cause: {summary['root_cause']} Resolution: {summary['resolution']} "
            f"Follow-up: {summary.get('follow_up', 'Monitor for recurrence; no further action required unless customer re-contacts.')}"
        )


_mock_llm_instance: MockLLM | None = None


def get_mock_llm() -> MockLLM:
    global _mock_llm_instance
    if _mock_llm_instance is None:
        _mock_llm_instance = MockLLM()
    return _mock_llm_instance
