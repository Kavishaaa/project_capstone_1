"""POST /crm-note — automatic CRM note generation."""
from fastapi import APIRouter

from app.schemas.crm_note import CrmNoteRequest, CrmNoteResponse
from app.services.llm_router import get_llm_engine
from app.services.summarizer import summarize_transcript

DISPOSITION_BY_KEYWORD = [
    (["denied", "denial", "appeal"], "Dispute/Appeal"),
    (["refund", "credit", "waive"], "Billing Adjustment"),
    (["escalat"], "Escalation"),
    (["lost", "missing"], "Claims/Investigation"),
]

router = APIRouter(tags=["crm-note"])


def _classify(transcript_text: str) -> tuple[str, str]:
    lowered = transcript_text.lower()
    for keywords, disposition in DISPOSITION_BY_KEYWORD:
        if any(k in lowered for k in keywords):
            return disposition, "Resolved" if "resolved" in lowered or "thank you" in lowered else "Pending"
    return "General Inquiry", "Resolved"


@router.post("/crm-note", response_model=CrmNoteResponse)
def crm_note(request: CrmNoteRequest):
    summary = summarize_transcript(request.industry, request.transcript)
    transcript_text = "\n".join(f"{t.sender}: {t.text}" for t in request.transcript)
    category, disposition = _classify(transcript_text)

    engine = get_llm_engine()
    note_text = engine.generate_crm_note(request.customer_name, request.industry, summary)

    return CrmNoteResponse(note_text=note_text, category=category, disposition=disposition)
