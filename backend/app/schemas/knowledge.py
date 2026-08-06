"""Schemas for POST /knowledge-search — enterprise knowledge search via RAG."""
from pydantic import BaseModel


class KnowledgeSearchRequest(BaseModel):
    query: str
    industry: str | None = None
    source_type: str | None = None  # crm, policy, faq, kb, sop, ticket
    top_k: int = 8


class KnowledgeResult(BaseModel):
    id: str
    title: str
    source_type: str
    industry: str
    snippet: str
    relevance_score: float


class KnowledgeSearchResponse(BaseModel):
    results: list[KnowledgeResult]
    total: int
