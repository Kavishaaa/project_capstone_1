"""Relational mirror of the enterprise knowledge base.

The authoritative searchable text lives in the Chroma vector store; these
tables let the Dashboard/Analytics endpoints run fast relational queries
(e.g. "most searched policies") without needing to hit the vector store.
"""
from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class KnowledgeArticle(Base):
    __tablename__ = "knowledge_articles"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    industry: Mapped[str] = mapped_column(String, index=True, nullable=False)
    source_type: Mapped[str] = mapped_column(String, index=True, nullable=False)  # kb, faq, sop, policy
    title: Mapped[str] = mapped_column(String, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    tags: Mapped[str] = mapped_column(String, default="")
