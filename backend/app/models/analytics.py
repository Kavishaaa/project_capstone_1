"""Analytics/telemetry models: search logs and feedback events."""
from datetime import datetime

from sqlalchemy import DateTime, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class SearchLog(Base):
    __tablename__ = "search_logs"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    query: Mapped[str] = mapped_column(String, nullable=False)
    industry: Mapped[str] = mapped_column(String, default="")
    source_type: Mapped[str] = mapped_column(String, default="")
    top_result_title: Mapped[str] = mapped_column(String, default="")
    top_result_source_type: Mapped[str] = mapped_column(String, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class FeedbackEvent(Base):
    __tablename__ = "feedback_events"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    conversation_id: Mapped[str] = mapped_column(String, default="")
    suggestion_type: Mapped[str] = mapped_column(String, nullable=False)  # suggested_reply, next_action, ...
    rating: Mapped[str] = mapped_column(String, nullable=False)  # up | down
    comment: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class AgentProductivity(Base):
    __tablename__ = "agent_productivity"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    agent_name: Mapped[str] = mapped_column(String, nullable=False)
    tickets_resolved: Mapped[int] = mapped_column(default=0)
    avg_handle_time_minutes: Mapped[float] = mapped_column(default=0.0)
    avg_csat: Mapped[float] = mapped_column(default=0.0)
    fcr_rate: Mapped[float] = mapped_column(default=0.0)
