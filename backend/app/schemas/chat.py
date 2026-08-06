"""Schemas for POST /chat — real-time agent assistance."""
from pydantic import BaseModel, Field


class ChatTurn(BaseModel):
    sender: str = Field(description="customer | agent | ai")
    text: str


class ChatRequest(BaseModel):
    conversation_id: str | None = None
    industry: str = Field(description="Insurance, Banking, Healthcare, Retail, Travel, Utilities, Telecom")
    customer_message: str
    history: list[ChatTurn] = Field(default_factory=list)


class SourceCitation(BaseModel):
    id: str
    title: str
    source_type: str
    snippet: str
    relevance_score: float


class ChatResponse(BaseModel):
    suggested_reply: str
    confidence: float
    tone: str
    sources: list[SourceCitation]
    used_live_llm: bool
