"""Schemas for POST /summarize — automatic conversation summarization."""
from pydantic import BaseModel

from app.schemas.chat import ChatTurn


class SummarizeRequest(BaseModel):
    conversation_id: str | None = None
    industry: str
    transcript: list[ChatTurn]


class SummarizeResponse(BaseModel):
    customer_issue: str
    root_cause: str
    actions_performed: list[str]
    resolution: str
    follow_up: str
    sentiment: str
    crm_note: str
