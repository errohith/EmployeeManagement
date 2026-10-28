"""API request and response models."""

from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class Employee(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    employee_id: str
    name: str
    department: str | None
    email: str | None
    status: str


class ReviewPeriod(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    start_date: date
    end_date: date
    status: str


class ReviewCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    employee_id: int = Field(ge=1, le=2_147_483_647)
    period_id: int = Field(ge=1, le=2_147_483_647)
    quality_rating: int = Field(ge=1, le=5)
    delivery_rating: int = Field(ge=1, le=5)
    teamwork_rating: int = Field(ge=1, le=5)
    comments: str = Field(min_length=1)

    @field_validator("comments")
    @classmethod
    def comments_must_not_be_blank(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("comments must not be blank")
        return value


class ReviewResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    employee_id: int
    period_id: int
    quality_rating: int
    delivery_rating: int
    teamwork_rating: int
    average_rating: float
    comments: str
    created_at: datetime


class ReviewListItem(ReviewResponse):
    employee_code: str
    employee_name: str
    period_name: str