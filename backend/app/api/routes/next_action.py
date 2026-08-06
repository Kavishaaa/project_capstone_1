"""POST /next-action — Next Best Action recommendations."""
from fastapi import APIRouter

from app.schemas.next_action import NextActionRequest, NextActionResponse, NextBestAction
from app.services.next_action_engine import recommend_actions

router = APIRouter(tags=["next-action"])


@router.post("/next-action", response_model=NextActionResponse)
def next_action(request: NextActionRequest):
    transcript_text = "\n".join(f"{t.sender}: {t.text}" for t in request.transcript)
    result = recommend_actions(transcript_text, request.industry)
    return NextActionResponse(
        actions=[NextBestAction(**a) for a in result["actions"]],
        escalation_recommended=result["escalation_recommended"],
        escalation_reason=result["escalation_reason"],
    )
