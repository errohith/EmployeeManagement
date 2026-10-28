"""Review-period data access."""

from typing import Any

from app.database import connect


def list_review_periods() -> list[dict[str, Any]]:
    with connect() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT id, name, start_date, end_date, status
                FROM review_periods
                ORDER BY start_date DESC, id DESC
                """
            )
            return cursor.fetchall()
