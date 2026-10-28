import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import employees, review_periods, reviews

app = FastAPI(
    title="Employee Performance Review Management System",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        origin.strip()
        for origin in os.getenv(
            "FRONTEND_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
        ).split(",")
        if origin.strip()
    ],
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

app.include_router(employees.router, prefix="/api")
app.include_router(review_periods.router, prefix="/api")
app.include_router(reviews.router, prefix="/api")
