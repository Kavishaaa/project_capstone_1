"""Retrieval Augmented Generation orchestration.

Thin layer on top of vector_store.query() that provides convenience
retrieval methods used across services (chat, summarize, next-action,
knowledge-search, compliance). Kept separate from vector_store so the
retrieval *strategy* (top_k defaults, source-type groupings) lives in one
place distinct from the raw Chroma access layer.
"""
from __future__ import annotations

from app.services import vector_store

# Source types that make sense to search when looking for "policy-like" grounding.
POLICY_LIKE_SOURCE_TYPES = ["policy", "sop", "kb", "faq"]


def retrieve_for_reply(customer_message: str, industry: str, top_k: int = 4) -> list[dict]:
    return vector_store.query(
        customer_message, top_k=top_k, industry=industry, source_types=POLICY_LIKE_SOURCE_TYPES
    )


def retrieve_for_summary(transcript_text: str, industry: str, top_k: int = 3) -> list[dict]:
    return vector_store.query(
        transcript_text, top_k=top_k, industry=industry, source_types=POLICY_LIKE_SOURCE_TYPES
    )


def retrieve_sops(topic_text: str, industry: str, top_k: int = 2) -> list[dict]:
    return vector_store.query(topic_text, top_k=top_k, industry=industry, source_types=["sop"])


def retrieve_policies(topic_text: str, industry: str, top_k: int = 3) -> list[dict]:
    return vector_store.query(topic_text, top_k=top_k, industry=industry, source_types=["policy"])


def retrieve_similar_tickets(topic_text: str, industry: str, top_k: int = 3) -> list[dict]:
    return vector_store.query(topic_text, top_k=top_k, industry=industry, source_types=["ticket"])


def search_knowledge(
    query_text: str, industry: str | None, source_type: str | None, top_k: int = 8
) -> list[dict]:
    source_types = [source_type] if source_type else None
    return vector_store.query(query_text, top_k=top_k, industry=industry, source_types=source_types)
