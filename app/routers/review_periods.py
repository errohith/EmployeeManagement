from fastapi import APIRouter

from app.models import ReviewPeriod
from app.services import review_periods as review_period_service

router = APIRouter(prefix="/review-periods", tags=["review periods"])


@router.get("", response_model=list[ReviewPeriod])
def list_review_periods() -> list[dict[str, object]]:
    return review_period_service.list_review_periods()
