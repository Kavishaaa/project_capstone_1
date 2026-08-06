"""Schemas for conversation CRUD + the unified Copilot panel bundle."""
from pydantic import BaseModel

from app.schemas.chat import SourceCitation
from app.schemas.compliance import ComplianceFlag
from app.schemas.next_action import NextBestAction


class MessageOut(BaseModel):
    id: str
    sender: str
    text: str
    created_at: str


class ConversationOut(BaseModel):
    id: str
    customer_id: str
    customer_name: str
    industry: str
    subject: str
    status: str
    agent_name: str
    started_at: str
    messages: list[MessageOut]


class ConversationListItem(BaseModel):
    id: str
    customer_name: str
    industry: str
    subject: str
    status: str
    agent_name: str
    last_message_preview: str


class SimilarCase(BaseModel):
    ticket_id: str
    subject: str
    resolution: str
    industry: str
    relevance_score: float


class CopilotBundle(BaseModel):
    """Everything the right-hand Copilot panel needs for one conversation."""

    suggested_reply: str
    confidence: float
    customer_summary: str
    next_best_actions: list[NextBestAction]
    escalation_recommended: bool
    escalation_reason: str
    relevant_sops: list[SourceCitation]
    related_policies: list[SourceCitation]
    compliance_flags: list[ComplianceFlag]
    similar_cases: list[SimilarCase]
    used_live_llm: bool


class FeedbackRequest(BaseModel):
    conversation_id: str | None = None
    suggestion_type: str
    rating: str  # up | down
    comment: str = ""
