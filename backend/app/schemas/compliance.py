"""Schemas for POST /compliance-check — validate AI/agent responses against policy."""
from pydantic import BaseModel


class ComplianceCheckRequest(BaseModel):
    industry: str
    draft_response: str


class ComplianceFlag(BaseModel):
    rule: str
    severity: str  # High | Medium | Low
    explanation: str
    matched_policy: str | None = None


class ComplianceCheckResponse(BaseModel):
    passed: bool
    risk_level: str  # Low | Medium | High
    flags: list[ComplianceFlag]
    matched_policies: list[str]
