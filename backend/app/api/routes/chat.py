"""POST /chat — real-time agent assistance with a RAG-grounded suggested reply."""
from fastapi import APIRouter

from app.schemas.chat import ChatRequest, ChatResponse, SourceCitation
from app.services import rag_pipeline
from app.services.llm_mock import detect_sentiment
from app.services.llm_router import get_llm_engine, is_using_live_llm

router = APIRouter(tags=["chat"])


@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    sources = rag_pipeline.retrieve_for_reply(request.customer_message, request.industry)
    engine = get_llm_engine()
    reply = engine.generate_reply(request.customer_message, request.industry, sources)

    sentiment = detect_sentiment(request.customer_message)
    tone = "Empathetic" if sentiment == "Negative" else "Professional"
    confidence = round(0.6 + 0.1 * min(len(sources), 4), 2)

    return ChatResponse(
        suggested_reply=reply,
        confidence=confidence,
        tone=tone,
        sources=[SourceCitation(**s) for s in sources],
        used_live_llm=is_using_live_llm(),
    )
