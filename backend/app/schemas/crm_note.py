"""Schemas for POST /crm-note — automatic CRM note generation."""
from pydantic import BaseModel

from app.schemas.chat import ChatTurn


class CrmNoteRequest(BaseModel):
    conversation_id: str | None = None
    industry: str
    customer_name: str
    transcript: list[ChatTurn]


class CrmNoteResponse(BaseModel):
    note_text: str
    category: str
    disposition: str
