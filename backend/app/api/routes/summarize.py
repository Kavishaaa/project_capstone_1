"""POST /summarize — automatic conversation summarization."""
from fastapi import APIRouter

from app.schemas.summarize import SummarizeRequest, SummarizeResponse
from app.services.summarizer import summarize_transcript

router = APIRouter(tags=["summarize"])


@router.post("/summarize", response_model=SummarizeResponse)
def summarize(request: SummarizeRequest):
    result = summarize_transcript(request.industry, request.transcript)
    return SummarizeResponse(**result)
