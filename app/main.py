import logging
import os

import psycopg
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.routers import employees, health, review_periods, reviews

logger = logging.getLogger(__name__)

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


@app.exception_handler(psycopg.OperationalError)
async def database_unavailable(
    request: Request, error: psycopg.OperationalError
) -> JSONResponse:
    logger.error("Database unavailable: %s", error)
    return JSONResponse(
        status_code=503, content={"detail": "Database is unavailable"}
    )


app.include_router(health.router, prefix="/api")
app.include_router(employees.router, prefix="/api")
app.include_router(review_periods.router, prefix="/api")
app.include_router(reviews.router, prefix="/api")
