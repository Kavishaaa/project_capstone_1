"""POST /compliance-check — validate AI/agent responses against enterprise policy."""
from fastapi import APIRouter

from app.schemas.compliance import ComplianceCheckRequest, ComplianceCheckResponse, ComplianceFlag
from app.services.compliance_engine import check_compliance

router = APIRouter(tags=["compliance"])


@router.post("/compliance-check", response_model=ComplianceCheckResponse)
def compliance_check(request: ComplianceCheckRequest):
    result = check_compliance(request.industry, request.draft_response)
    return ComplianceCheckResponse(
        passed=result["passed"],
        risk_level=result["risk_level"],
        flags=[ComplianceFlag(**f) for f in result["flags"]],
        matched_policies=result["matched_policies"],
    )
