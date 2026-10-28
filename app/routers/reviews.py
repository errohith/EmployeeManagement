from fastapi import APIRouter, HTTPException, Path, Query

from app.models import ReviewCreate, ReviewListItem, ReviewResponse
from app.services import reviews as review_service
from app.services.reviews import (
    DuplicateReviewError,
    EmployeeNotFoundError,
    ReviewPeriodClosedError,
    ReviewPeriodNotFoundError,
)

router = APIRouter(prefix="/reviews", tags=["reviews"])


@router.get("", response_model=list[ReviewListItem])
def list_reviews(
    employee_id: int | None = Query(default=None, ge=1),
    period_id: int | None = Query(default=None, ge=1),
    limit: int = Query(default=100, ge=1, le=1000),
    offset: int = Query(default=0, ge=0),
) -> list[dict[str, object]]:
    return review_service.list_reviews(employee_id, period_id, limit, offset)


@router.get("/{review_id}", response_model=ReviewListItem)
def get_review(
    review_id: int = Path(ge=1, le=2_147_483_647),
) -> dict[str, object]:
    review = review_service.get_review(review_id)
    if review is None:
        raise HTTPException(status_code=404, detail="Review not found")
    return review


@router.post("", response_model=ReviewResponse, status_code=201)
def create_review(review: ReviewCreate) -> dict[str, object]:
    try:
        return review_service.create_review(review)
    except EmployeeNotFoundError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error
    except ReviewPeriodNotFoundError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error
    except ReviewPeriodClosedError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    except DuplicateReviewError as error:
        raise HTTPException(status_code=409, detail=str(error)) from error
