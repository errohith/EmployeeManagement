"""Performance-review data access and business rules."""

from typing import Any

from psycopg.errors import UniqueViolation
from psycopg import sql

from app.database import connect
from app.models import ReviewCreate


class EmployeeNotFoundError(Exception):
    """Raised when a requested employee does not exist."""


class ReviewPeriodNotFoundError(Exception):
    """Raised when a requested review period does not exist."""


class ReviewPeriodClosedError(Exception):
    """Raised when a review period is not open for submissions."""


class DuplicateReviewError(Exception):
    """Raised when an employee already has a review for the period."""


_REVIEW_DETAILS = sql.SQL(
    """
    SELECT r.id, r.employee_id, e.employee_id AS employee_code,
           e.name AS employee_name, r.period_id, p.name AS period_name,
           r.quality_rating, r.delivery_rating, r.teamwork_rating,
           r.average_rating, r.comments, r.created_at
    FROM performance_reviews AS r
    JOIN employees AS e ON e.id = r.employee_id
    JOIN review_periods AS p ON p.id = r.period_id
    """
)


def list_reviews(
    employee_id: int | None,
    period_id: int | None,
    limit: int,
    offset: int,
) -> list[dict[str, Any]]:
    conditions: list[sql.Composable] = []
    parameters: list[int] = []
    if employee_id is not None:
        conditions.append(sql.SQL("r.employee_id = %s"))
        parameters.append(employee_id)
    if period_id is not None:
        conditions.append(sql.SQL("r.period_id = %s"))
        parameters.append(period_id)

    query = _REVIEW_DETAILS
    if conditions:
        query += sql.SQL(" WHERE ") + sql.SQL(" AND ").join(conditions)
    query += sql.SQL(
        " ORDER BY r.created_at DESC, r.id DESC LIMIT %s OFFSET %s"
    )
    parameters.extend((limit, offset))

    with connect() as connection:
        with connection.cursor() as cursor:
            cursor.execute(query, parameters)
            return cursor.fetchall()


def get_review(review_id: int) -> dict[str, Any] | None:
    with connect() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                _REVIEW_DETAILS + sql.SQL(" WHERE r.id = %s"),
                (review_id,),
            )
            return cursor.fetchone()


def create_review(review: ReviewCreate) -> dict[str, Any]:
    values = review.model_dump()
    average_rating = round(
        (
            values["quality_rating"]
            + values["delivery_rating"]
            + values["teamwork_rating"]
        )
        / 3,
        2,
    )

    try:
        with connect() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT id FROM employees WHERE id = %s FOR UPDATE",
                    (values["employee_id"],),
                )
                if cursor.fetchone() is None:
                    raise EmployeeNotFoundError("Employee not found")

                cursor.execute(
                    "SELECT status FROM review_periods WHERE id = %s FOR SHARE",
                    (values["period_id"],),
                )
                period = cursor.fetchone()
                if period is None:
                    raise ReviewPeriodNotFoundError("Review period not found")
                if period["status"] != "Open":
                    raise ReviewPeriodClosedError(
                        "Review period is not open for submissions"
                    )

                cursor.execute(
                    """
                    SELECT id
                    FROM performance_reviews
                    WHERE employee_id = %s AND period_id = %s
                    """,
                    (values["employee_id"], values["period_id"]),
                )
                if cursor.fetchone() is not None:
                    raise DuplicateReviewError(
                        "A review already exists for this employee and period"
                    )

                cursor.execute(
                    """
                    INSERT INTO performance_reviews (
                        employee_id, period_id, quality_rating,
                        delivery_rating, teamwork_rating, average_rating,
                        comments
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    RETURNING id, employee_id, period_id, quality_rating,
                              delivery_rating, teamwork_rating, average_rating,
                              comments, created_at
                    """,
                    (
                        values["employee_id"],
                        values["period_id"],
                        values["quality_rating"],
                        values["delivery_rating"],
                        values["teamwork_rating"],
                        average_rating,
                        values["comments"],
                    ),
                )
                created_review = cursor.fetchone()
                if created_review is None:
                    raise RuntimeError("Review insert returned no record")
                return created_review
    except UniqueViolation as error:
        raise DuplicateReviewError(
            "A review already exists for this employee and period"
        ) from error
