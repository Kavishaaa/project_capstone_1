"""Schemas for POST /next-action — Next Best Action recommendations."""
from pydantic import BaseModel

from app.schemas.chat import ChatTurn


class NextActionRequest(BaseModel):
    conversation_id: str | None = None
    industry: str
    transcript: list[ChatTurn]


class NextBestAction(BaseModel):
    action: str
    rationale: str
    priority: str  # High | Medium | Low


class NextActionResponse(BaseModel):
    actions: list[NextBestAction]
    escalation_recommended: bool
    escalation_reason: str
