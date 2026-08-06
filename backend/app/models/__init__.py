"""Import all ORM models so Base.metadata is fully populated for create_all()."""
from app.models.analytics import AgentProductivity, FeedbackEvent, SearchLog
from app.models.conversation import Conversation, Message
from app.models.crm import Customer, Ticket
from app.models.knowledge import KnowledgeArticle

__all__ = [
    "AgentProductivity",
    "FeedbackEvent",
    "SearchLog",
    "Conversation",
    "Message",
    "Customer",
    "Ticket",
    "KnowledgeArticle",
]
