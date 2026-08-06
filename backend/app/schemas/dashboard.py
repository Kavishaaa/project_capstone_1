"""Schemas for GET /dashboard and GET /analytics."""
from pydantic import BaseModel


class KpiSnapshot(BaseModel):
    label: str
    value: str
    delta: str
    trend: str  # up | down | flat


class ActiveConversationSummary(BaseModel):
    id: str
    customer_name: str
    industry: str
    subject: str
    status: str
    agent_name: str
    last_message_preview: str


class RecentSummaryItem(BaseModel):
    conversation_id: str
    customer_name: str
    customer_issue: str
    resolution: str
    created_at: str


class PendingAction(BaseModel):
    id: str
    description: str
    priority: str
    related_conversation_id: str | None = None


class AiInsight(BaseModel):
    title: str
    detail: str
    category: str  # trend | risk | opportunity


class DashboardResponse(BaseModel):
    kpis: list[KpiSnapshot]
    active_conversations: list[ActiveConversationSummary]
    recent_summaries: list[RecentSummaryItem]
    pending_actions: list[PendingAction]
    ai_insights: list[AiInsight]


class TrendPoint(BaseModel):
    label: str
    value: float


class TopPolicy(BaseModel):
    title: str
    industry: str
    search_count: int


class AgentProductivityRow(BaseModel):
    agent_name: str
    tickets_resolved: int
    avg_handle_time_minutes: float
    avg_csat: float
    fcr_rate: float


class AnalyticsResponse(BaseModel):
    aht_trend: list[TrendPoint]
    csat_trend: list[TrendPoint]
    fcr_trend: list[TrendPoint]
    top_policies: list[TopPolicy]
    agent_productivity: list[AgentProductivityRow]
