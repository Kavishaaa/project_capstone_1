"""Next Best Action recommendation engine.

Combines heuristic intent signals from the transcript (keywords indicating
billing disputes, escalation risk, documentation gaps, etc.) with RAG
retrieval of the SOP/policy that should govern the recommended action, so
each suggested action is traceable back to real enterprise guidance rather
than being a generic canned suggestion.
"""
from __future__ import annotations

from app.services import rag_pipeline
from app.services.llm_mock import detect_escalation

INTENT_ACTIONS: list[dict] = [
    {
        "keywords": ["denied", "denial", "rejected"],
        "action": "Review denial reason and offer documented appeal/resubmission path",
        "priority": "High",
    },
    {
        "keywords": ["refund", "credit", "waive", "reimburse"],
        "action": "Verify eligibility against policy threshold before committing to a refund/credit",
        "priority": "Medium",
    },
    {
        "keywords": ["delay", "still waiting", "haven't heard", "status", "how long"],
        "action": "Check SLA against filing/request date and escalate if breached",
        "priority": "High",
    },
    {
        "keywords": ["lost", "missing", "never arrived", "never received"],
        "action": "Open a lost-item/lost-package investigation and issue interim compensation per policy",
        "priority": "Medium",
    },
    {
        "keywords": ["cancel", "cancellation", "switch"],
        "action": "Initiate retention workflow and confirm root cause before processing cancellation",
        "priority": "High",
    },
]


def recommend_actions(transcript_text: str, industry: str) -> dict:
    lowered = transcript_text.lower()
    actions = []
    for intent in INTENT_ACTIONS:
        if any(kw in lowered for kw in intent["keywords"]):
            sops = rag_pipeline.retrieve_sops(intent["action"], industry, top_k=1)
            rationale = (
                f"Matched procedure: '{sops[0]['title']}'." if sops else "Based on detected customer intent signals."
            )
            actions.append(
                {"action": intent["action"], "rationale": rationale, "priority": intent["priority"]}
            )

    if not actions:
        actions.append(
            {
                "action": "Confirm customer's core issue is fully understood, then search knowledge base for a direct match",
                "rationale": "No strong intent signal detected yet; clarify before recommending a specific action.",
                "priority": "Low",
            }
        )

    escalate, reason = detect_escalation(transcript_text)
    if not escalate and any(a["priority"] == "High" for a in actions) and len(actions) >= 2:
        escalate = True
        reason = "Multiple high-priority issues detected in a single interaction; recommend supervisor review."

    return {"actions": actions, "escalation_recommended": escalate, "escalation_reason": reason}
