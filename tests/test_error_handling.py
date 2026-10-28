"""Tests for mapping service errors to HTTP responses."""

import asyncio
import json
import unittest
from unittest.mock import patch

import psycopg
from fastapi import HTTPException

from app.main import database_unavailable
from app.models import ReviewCreate
from app.routers import reviews
from app.services.reviews import (
    DuplicateReviewError,
    EmployeeNotFoundError,
    ReviewPeriodClosedError,
    ReviewPeriodNotFoundError,
)

PAYLOAD = ReviewCreate(
    employee_id=1,
    period_id=1,
    quality_rating=4,
    delivery_rating=4,
    teamwork_rating=4,
    comments="Good work",
)


class ErrorHandlingTests(unittest.TestCase):
    def test_service_errors_map_to_status_codes(self) -> None:
        cases = [
            (EmployeeNotFoundError("Employee not found"), 404),
            (ReviewPeriodNotFoundError("Review period not found"), 404),
            (ReviewPeriodClosedError("Review period is not open"), 400),
            (DuplicateReviewError("A review already exists"), 409),
        ]
        for error, status_code in cases:
            with self.subTest(error=type(error).__name__):
                with patch.object(
                    reviews.review_service, "create_review", side_effect=error
                ):
                    with self.assertRaises(HTTPException) as raised:
                        reviews.create_review(PAYLOAD)
                self.assertEqual(raised.exception.status_code, status_code)
                self.assertEqual(raised.exception.detail, str(error))

    def test_database_outage_returns_service_unavailable(self) -> None:
        response = asyncio.run(
            database_unavailable(None, psycopg.OperationalError("refused"))  # type: ignore[arg-type]
        )
        self.assertEqual(response.status_code, 503)
        self.assertEqual(
            json.loads(response.body), {"detail": "Database is unavailable"}
        )


if __name__ == "__main__":
    unittest.main()
