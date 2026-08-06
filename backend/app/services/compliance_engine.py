"""Compliance checking for AI-drafted and agent-drafted responses.

Combines a deterministic rule set (regex/keyword matching for language that
is never allowed to reach a customer verbatim — guarantees, legal admissions,
unauthorized commitments, PII disclosure without verification) with RAG
retrieval of the policies the response should be grounded against. This
mirrors how a real enterprise compliance layer would work: fast, auditable
rules first, with retrieval-augmented policy citation as supporting evidence.
"""
from __future__ import annotations

import re

from app.services import rag_pipeline

RULES: list[dict] = [
    {
        "rule": "Absolute guarantee language",
        "pattern": re.compile(r"\b(guarantee(d)?|100% (approved|covered)|promise you|no matter what)\b", re.I),
        "severity": "High",
        "explanation": (
            "Response makes an unconditional guarantee. Enterprise policy requires all approvals/coverage "
            "statements to be conditioned on verification and documented policy terms."
        ),
    },
    {
        "rule": "Legal fault admission",
        "pattern": re.compile(r"\b(it'?s our fault|we admit (fault|liability)|we are liable)\b", re.I),
        "severity": "High",
        "explanation": (
            "Response admits legal fault or liability. Only Legal/Claims leadership may make liability "
            "determinations; agents and AI must avoid language that could be used in litigation."
        ),
    },
    {
        "rule": "Unauthorized financial commitment",
        "pattern": re.compile(r"\b(i('| )?ll (waive|refund|credit) (the |your )?(full|entire|whole)\b|free of charge, no questions)", re.I),
        "severity": "Medium",
        "explanation": (
            "Response commits to a specific financial waiver/refund without referencing a documented policy "
            "threshold or supervisor approval."
        ),
    },
    {
        "rule": "Sensitive data disclosure without verification",
        "pattern": re.compile(r"\b(your (ssn|social security|account balance|full card number|date of birth) is)\b", re.I),
        "severity": "High",
        "explanation": (
            "Response appears to disclose sensitive personal/financial data. Identity verification must be "
            "completed and logged before any such disclosure."
        ),
    },
    {
        "rule": "Discouraging escalation or regulatory rights",
        "pattern": re.compile(r"\b(there'?s no point (filing|escalating)|you can'?t (appeal|dispute))\b", re.I),
        "severity": "High",
        "explanation": (
            "Response discourages a customer from exercising a right to escalate, appeal, or dispute, which "
            "may violate consumer protection and regulatory requirements."
        ),
    },
]


def check_compliance(industry: str, draft_response: str) -> dict:
    flags = []
    for rule in RULES:
        if rule["pattern"].search(draft_response):
            flags.append(
                {
                    "rule": rule["rule"],
                    "severity": rule["severity"],
                    "explanation": rule["explanation"],
                    "matched_policy": None,
                }
            )

    matched_policies = rag_pipeline.retrieve_policies(draft_response, industry, top_k=2)
    matched_policy_titles = [p["title"] for p in matched_policies]
    for flag in flags:
        if matched_policy_titles:
            flag["matched_policy"] = matched_policy_titles[0]

    if any(f["severity"] == "High" for f in flags):
        risk_level = "High"
    elif flags:
        risk_level = "Medium"
    else:
        risk_level = "Low"

    return {
        "passed": len(flags) == 0,
        "risk_level": risk_level,
        "flags": flags,
        "matched_policies": matched_policy_titles,
    }
