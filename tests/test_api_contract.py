"""Tests for the review API contract."""

import unittest
from datetime import datetime
from unittest.mock import patch

from fastapi import HTTPException
from pydantic import ValidationError

from app.main import app
from app.models import ReviewCreate
from app.routers import reviews


class ApiContractTests(unittest.TestCase):
    def test_requested_routes_are_registered(self) -> None:
        paths = app.openapi()["paths"]
        self.assertIn("/api/employees", paths)
        self.assertIn("/api/review-periods", paths)
        self.assertIn("/api/reviews", paths)
        self.assertIn("/api/reviews/{review_id}", paths)
        self.assertIn("get", paths["/api/reviews/{review_id}"])

    def test_uvicorn_root_import_resolves_to_fastapi_app(self) -> None:
        from uvicorn.importer import import_from_string

        self.assertIs(import_from_string("main:app"), app)

    def test_review_input_rejects_invalid_ratings_and_blank_comments(self) -> None:
        payload = {
            "employee_id": 1,
            "period_id": 1,
            "quality_rating": 6,
            "delivery_rating": 4,
            "teamwork_rating": 4,
            "comments": "Valid comment",
        }
        with self.assertRaises(ValidationError):
            ReviewCreate.model_validate(payload)

        payload["quality_rating"] = 4
        payload["comments"] = "   "
        with self.assertRaises(ValidationError):
            ReviewCreate.model_validate(payload)

    def test_review_input_forbids_client_supplied_average(self) -> None:
        payload = {
            "employee_id": 1,
            "period_id": 1,
            "quality_rating": 4,
            "delivery_rating": 5,
            "teamwork_rating": 4,
            "comments": "  Strong performance  ",
            "average_rating": 5,
        }
        with self.assertRaises(ValidationError):
            ReviewCreate.model_validate(payload)

        payload.pop("average_rating")
        review = ReviewCreate.model_validate(payload)
        self.assertEqual(review.comments, "Strong performance")

    def test_missing_review_is_returned_as_not_found(self) -> None:
        with patch.object(reviews.review_service, "get_review", return_value=None):
            with self.assertRaises(HTTPException) as raised:
                reviews.get_review(1)
        self.assertEqual(raised.exception.status_code, 404)

    def test_create_review_returns_service_result(self) -> None:
        payload = ReviewCreate(
            employee_id=1,
            period_id=1,
            quality_rating=4,
            delivery_rating=5,
            teamwork_rating=4,
            comments="Strong performance",
        )
        expected = {
            "id": 7,
            "employee_id": 1,
            "period_id": 1,
            "quality_rating": 4,
            "delivery_rating": 5,
            "teamwork_rating": 4,
            "average_rating": 4.33,
            "comments": "Strong performance",
            "created_at": datetime(2026, 1, 15, 10, 30),
        }
        with patch.object(
            reviews.review_service, "create_review", return_value=expected
        ) as create_review:
            result = reviews.create_review(payload)

        create_review.assert_called_once_with(payload)
        self.assertEqual(result, expected)


if __name__ == "__main__":
    unittest.main()
