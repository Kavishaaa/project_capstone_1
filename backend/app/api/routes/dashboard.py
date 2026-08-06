"""GET /dashboard and GET /analytics — aggregated operational insights."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.dashboard import AnalyticsResponse, DashboardResponse
from app.services.analytics_service import get_analytics_data, get_dashboard_data

router = APIRouter(tags=["dashboard"])


@router.get("/dashboard", response_model=DashboardResponse)
def dashboard(db: Session = Depends(get_db)):
    return DashboardResponse(**get_dashboard_data(db))


@router.get("/analytics", response_model=AnalyticsResponse)
def analytics(db: Session = Depends(get_db)):
    return AnalyticsResponse(**get_analytics_data(db))
