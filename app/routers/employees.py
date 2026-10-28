from fastapi import APIRouter

from app.models import Employee
from app.services import employees as employee_service

router = APIRouter(prefix="/employees", tags=["employees"])


@router.get("", response_model=list[Employee])
def list_employees() -> list[dict[str, object]]:
    return employee_service.list_employees()
