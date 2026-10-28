"""Service tests against the PostgreSQL database in DATABASE_URL.

Skipped when the database is unreachable. Each test creates its own
employee and review periods and removes them afterwards.
"""

import unittest
import uuid
from decimal import Decimal

import psycopg

from app.database import connect
from app.models import ReviewCreate
from app.services import reviews as review_service
from app.services.reviews import (
    DuplicateReviewError,
    EmployeeNotFoundError,
    ReviewPeriodClosedError,
)


def _database_available() -> bool:
    try:
        with connect() as connection:
            connection.execute("SELECT 1 FROM performance_reviews LIMIT 1")
        return True
    except (RuntimeError, psycopg.Error):
        return False


@unittest.skipUnless(_database_available(), "PostgreSQL schema not available")
class ReviewServiceIntegrationTests(unittest.TestCase):
    def setUp(self) -> None:
        tag = uuid.uuid4().hex[:8]
        with connect() as connection:
            self.employee_id = connection.execute(
                "INSERT INTO employees (employee_id, name) VALUES (%s, %s) "
                "RETURNING id",
                (f"T{tag}", "Integration Test"),
            ).fetchone()["id"]
            self.open_period_id, self.closed_period_id = (
                connection.execute(
                    "INSERT INTO review_periods (name, start_date, end_date, status) "
                    "VALUES (%s, '2030-01-01', '2030-06-30', %s) RETURNING id",
                    (f"Test {status} {tag}", status),
                ).fetchone()["id"]
                for status in ("Open", "Closed")
            )

    def tearDown(self) -> None:
        with connect() as connection:
            connection.execute(
                "DELETE FROM performance_reviews WHERE employee_id = %s",
                (self.employee_id,),
            )
            connection.execute(
                "DELETE FROM review_periods WHERE id IN (%s, %s)",
                (self.open_period_id, self.closed_period_id),
            )
            connection.execute(
                "DELETE FROM employees WHERE id = %s", (self.employee_id,)
            )

    def _review(self, **overrides: object) -> ReviewCreate:
        values: dict[str, object] = {
            "employee_id": self.employee_id,
            "period_id": self.open_period_id,
            "quality_rating": 4,
            "delivery_rating": 5,
            "teamwork_rating": 4,
            "comments": "Integration test review",
        }
        values.update(overrides)
        return ReviewCreate.model_validate(values)

    def test_create_then_fetch_review(self) -> None:
        created = review_service.create_review(self._review())
        self.assertEqual(created["average_rating"], Decimal("4.33"))

        fetched = review_service.get_review(created["id"])
        assert fetched is not None
        self.assertEqual(fetched["employee_name"], "Integration Test")

        listed = review_service.list_reviews(
            self.employee_id, self.open_period_id, 10, 0
        )
        self.assertEqual([row["id"] for row in listed], [created["id"]])

    def test_duplicate_review_is_rejected(self) -> None:
        review_service.create_review(self._review())
        with self.assertRaises(DuplicateReviewError):
            review_service.create_review(self._review())

    def test_closed_period_is_rejected(self) -> None:
        with self.assertRaises(ReviewPeriodClosedError):
            review_service.create_review(
                self._review(period_id=self.closed_period_id)
            )

    def test_unknown_employee_is_rejected(self) -> None:
        with self.assertRaises(EmployeeNotFoundError):
            review_service.create_review(self._review(employee_id=2_000_000_000))


if __name__ == "__main__":
    unittest.main()
