"""Conversation CRUD + the unified Copilot bundle for the Agent Workspace.

The Agent Workspace's right-hand Copilot panel needs eight distinct pieces
of AI output (suggested reply, summary, NBA, SOPs, policies, compliance,
similar cases, escalation) for one conversation at once. Rather than making
the frontend fire eight separate requests, GET /conversations/{id}/copilot
composes the same underlying services (rag_pipeline, next_action_engine,
compliance_engine, summarizer) into one bundle.
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.conversation import Conversation, Message
from app.models.crm import Customer
from app.schemas.chat import ChatTurn, SourceCitation
from app.schemas.compliance import ComplianceFlag
from app.schemas.conversation import (
    ConversationListItem,
    ConversationOut,
    CopilotBundle,
    FeedbackRequest,
    MessageOut,
    SimilarCase,
)
from app.schemas.next_action import NextBestAction
from app.services import rag_pipeline
from app.services.compliance_engine import check_compliance
from app.services.llm_router import get_llm_engine, is_using_live_llm
from app.services.next_action_engine import recommend_actions
from app.services.summarizer import summarize_transcript

router = APIRouter(tags=["conversations"])


@router.get("/conversations", response_model=list[ConversationListItem])
def list_conversations(db: Session = Depends(get_db)):
    conversations = db.query(Conversation).order_by(Conversation.started_at.desc()).all()
    items = []
    for conv in conversations:
        customer = db.get(Customer, conv.customer_id)
        last_msg = (
            db.query(Message)
            .filter(Message.conversation_id == conv.id)
            .order_by(Message.created_at.desc())
            .first()
        )
        items.append(
            ConversationListItem(
                id=conv.id,
                customer_name=customer.name if customer else "Unknown",
                industry=conv.industry,
                subject=conv.subject,
                status=conv.status,
                agent_name=conv.agent_name,
                last_message_preview=last_msg.text[:120] if last_msg else "",
            )
        )
    return items


@router.get("/conversations/{conversation_id}", response_model=ConversationOut)
def get_conversation(conversation_id: str, db: Session = Depends(get_db)):
    conv = db.get(Conversation, conversation_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found.")
    customer = db.get(Customer, conv.customer_id)
    messages = (
        db.query(Message).filter(Message.conversation_id == conv.id).order_by(Message.created_at).all()
    )
    return ConversationOut(
        id=conv.id,
        customer_id=conv.customer_id,
        customer_name=customer.name if customer else "Unknown",
        industry=conv.industry,
        subject=conv.subject,
        status=conv.status,
        agent_name=conv.agent_name,
        started_at=conv.started_at.isoformat(),
        messages=[
            MessageOut(id=m.id, sender=m.sender, text=m.text, created_at=m.created_at.isoformat())
            for m in messages
        ],
    )


@router.get("/conversations/{conversation_id}/copilot", response_model=CopilotBundle)
def get_copilot_bundle(conversation_id: str, db: Session = Depends(get_db)):
    conv = db.get(Conversation, conversation_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found.")

    messages = (
        db.query(Message).filter(Message.conversation_id == conv.id).order_by(Message.created_at).all()
    )
    turns = [ChatTurn(sender=m.sender, text=m.text) for m in messages]
    transcript_text = "\n".join(f"{t.sender}: {t.text}" for t in turns)
    last_customer_message = next((t.text for t in reversed(turns) if t.sender == "customer"), transcript_text)

    engine = get_llm_engine()
    reply_sources = rag_pipeline.retrieve_for_reply(last_customer_message, conv.industry)
    suggested_reply = engine.generate_reply(last_customer_message, conv.industry, reply_sources)
    confidence = round(0.6 + 0.1 * min(len(reply_sources), 4), 2)

    summary = summarize_transcript(conv.industry, turns)

    nba_result = recommend_actions(transcript_text, conv.industry)

    sop_sources = rag_pipeline.retrieve_sops(transcript_text, conv.industry, top_k=2)
    policy_sources = rag_pipeline.retrieve_policies(transcript_text, conv.industry, top_k=3)

    compliance_result = check_compliance(conv.industry, suggested_reply)

    similar_tickets = rag_pipeline.retrieve_similar_tickets(transcript_text, conv.industry, top_k=3)
    similar_cases = [
        SimilarCase(
            ticket_id=t["id"],
            subject=t["title"],
            resolution=t["snippet"],
            industry=t["industry"],
            relevance_score=t["relevance_score"],
        )
        for t in similar_tickets
    ]

    return CopilotBundle(
        suggested_reply=suggested_reply,
        confidence=confidence,
        customer_summary=summary["customer_issue"],
        next_best_actions=[NextBestAction(**a) for a in nba_result["actions"]],
        escalation_recommended=nba_result["escalation_recommended"],
        escalation_reason=nba_result["escalation_reason"],
        relevant_sops=[SourceCitation(**s) for s in sop_sources],
        related_policies=[SourceCitation(**s) for s in policy_sources],
        compliance_flags=[ComplianceFlag(**f) for f in compliance_result["flags"]],
        similar_cases=similar_cases,
        used_live_llm=is_using_live_llm(),
    )


@router.post("/feedback")
def submit_feedback(request: FeedbackRequest, db: Session = Depends(get_db)):
    from app.models.analytics import FeedbackEvent

    entry = FeedbackEvent(
        id=str(uuid.uuid4()),
        conversation_id=request.conversation_id or "",
        suggestion_type=request.suggestion_type,
        rating=request.rating,
        comment=request.comment,
    )
    db.add(entry)
    db.commit()
    return {"status": "recorded"}
