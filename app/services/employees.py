"""Employee data access."""

from typing import Any

from app.database import connect


def list_employees() -> list[dict[str, Any]]:
    with connect() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT id, employee_id, name, department, email, status
                FROM employees
                ORDER BY id
                """
            )
            return cursor.fetchall()
