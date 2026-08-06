"""Structured call/conversation summarization service."""
from __future__ import annotations

from app.services import rag_pipeline
from app.services.llm_mock import detect_sentiment
from app.services.llm_router import get_llm_engine


def _transcript_to_text(turns: list) -> str:
    return "\n".join(f"{t.sender}: {t.text}" for t in turns)


def summarize_transcript(industry: str, turns: list) -> dict:
    transcript_text = _transcript_to_text(turns)
    sources = rag_pipeline.retrieve_for_summary(transcript_text, industry)
    engine = get_llm_engine()
    fields = engine.generate_summary_fields(transcript_text, industry, sources)

    actions_performed = [
        f"Reviewed customer statement: \"{t.text[:80]}\"" for t in turns if t.sender == "agent"
    ][:4] or ["Reviewed customer's reported issue and researched relevant policy guidance."]

    all_customer_text = " ".join(t.text for t in turns if t.sender == "customer")
    sentiment = detect_sentiment(all_customer_text)

    follow_up = (
        "Monitor account for 5 business days to confirm resolution holds; proactively contact customer if not."
        if sentiment == "Negative"
        else "No further follow-up required unless customer re-contacts."
    )

    customer_name_hint = turns[0].text.split(",")[0] if turns else "the customer"
    crm_note = engine.generate_crm_note(
        customer_name_hint, industry, {**fields, "follow_up": follow_up}
    )

    return {
        "customer_issue": fields["customer_issue"],
        "root_cause": fields["root_cause"],
        "actions_performed": actions_performed,
        "resolution": fields["resolution"],
        "follow_up": follow_up,
        "sentiment": sentiment,
        "crm_note": crm_note,
    }
