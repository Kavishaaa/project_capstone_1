"""FastAPI application entrypoint for EXLSmartAssist."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import (
    auth,
    chat,
    compliance,
    conversations,
    crm_note,
    dashboard,
    knowledge_search,
    next_action,
    summarize,
)
from app.config import get_settings

settings = get_settings()

app = FastAPI(
    title="EXLSmartAssist API",
    description="GenAI-powered Enterprise Operations Copilot backend for EXL.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(summarize.router, prefix="/api")
app.include_router(next_action.router, prefix="/api")
app.include_router(knowledge_search.router, prefix="/api")
app.include_router(crm_note.router, prefix="/api")
app.include_router(compliance.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(conversations.router, prefix="/api")


@app.get("/api/health")
def health_check():
    """Liveness probe used by the Docker healthcheck."""
    return {"status": "ok"}
