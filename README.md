# Employee Performance Review Management System

A web-based application for managing employee performance reviews,
tracking ratings across review periods, and viewing review details. The
backend is built with **Python** and **FastAPI**, with **PostgreSQL** as
the relational database.

## Table of Contents

-   [Project Overview](#project-overview)
-   [Features](#features)
-   [Technology Stack](#technology-stack)
-   [Application Screens](#application-screens)
-   [Application Walkthrough](#application-walkthrough)
-   [Database Design](#database-design)
-   [API Specification](#api-specification)
-   [Example API Requests and
    Responses](#example-api-requests-and-responses)
-   [Business Rules and Validation](#business-rules-and-validation)
-   [Setup and Installation](#setup-and-installation)
-   [Testing Strategy](#testing-strategy)
-   [Current Project Structure](#current-project-structure)
-   [Future Enhancements](#future-enhancements)

## Project Overview

The Employee Performance Review Management System allows managers to
submit employee reviews for defined review periods. Each review
evaluates an employee against three criteria:

1.  Quality of Work
2.  Delivery & Ownership
3.  Teamwork & Collaboration

The backend validates submissions, calculates the overall average
rating, and stores review data in PostgreSQL. REST APIs provide access
to employee information, review periods, review lists, and individual
review details.

## Features

### Mandatory

-   Retrieve employees and review periods.
-   Submit a performance review.
-   Validate ratings from 1 to 5.
-   Calculate the average rating on the backend.
-   Retrieve reviews, with optional employee and review-period filters.
-   Persist review data in PostgreSQL.
-   Provide request validation and interactive API documentation through
    FastAPI.

### Optional / Future Scope

-   View individual review details.
-   Pagination and sorting for review lists.
-   Delete a review.
-   Department-wise performance summaries.
-   Role-based access control and audit logging.

## Technology Stack

  Component                       Technology
  ------------------------------- -------------
  Programming language            Python
  Backend framework               FastAPI
  Database                        PostgreSQL
  API architecture                REST
  Request/response format         JSON
  Data validation                 Pydantic
  ASGI server                     Uvicorn
  API specification               OpenAPI 3.0
  Interactive API documentation   Swagger UI
  API testing                     Postman
  Database validation             SQL

**Base URL:** `http://localhost:8000/api`

When the application is running, FastAPI's interactive API documentation
is normally available at `http://localhost:8000/docs`, and the OpenAPI
schema at `http://localhost:8000/openapi.json`.

## Application Screens

The application now includes a responsive React + TypeScript frontend,
organized into reusable components, API hooks, typed models, and page
views under `UI/src/`.

### 1. Submit Performance Review --- Mandatory

The form includes:

-   Employee selection (required).
-   Review period selection (required).
-   Quality of Work rating (1--5).
-   Delivery & Ownership rating (1--5).
-   Teamwork & Collaboration rating (1--5).
-   Overall comments (required by business rules).
-   Submit and Reset actions.

On successful submission, the backend validates the data, calculates the
average rating, and saves the review.

### 2. Performance Review List --- Mandatory

The list displays:

  Column          Description
  --------------- ----------------------------------------
  Employee ID     Employee code, such as `EMP101`
  Employee Name   Employee's full name
  Period          Review period, such as `H1 2026`
  Ratings         The three individual ratings
  Average         Calculated average rating
  Status          Review status shown by the application
  Action          Link to view details, if implemented

The list should support filtering by employee and review period.
Pagination is recommended for larger datasets.

### 3. Review Details --- Optional

The details screen displays employee information, review period, overall
rating, individual criterion ratings, and manager comments.

### Frontend workflow

-   **Dashboard:** overview of employee and review activity, average
    ratings, and recent reviews.
-   **Submit review:** choose an employee and open review period, rate
    all three performance criteria, and enter required comments. The
    form shows a live average preview and reports API validation errors.
-   **Review history:** browse reviews, filter by employee or period, and
    navigate through paginated results.
-   **Review details:** view employee and period information, individual
    ratings, the overall score, submission date, and comments.
-   **Employees and review periods:** browse the employee directory and
    configured review cycles.

## Application Walkthrough

The following recording demonstrates the application flow:

[▶ Watch the application walkthrough](docs/demo/application-flow.mp4)

<video controls width="100%" preload="metadata">
  <source src="docs/demo/application-flow.mp4" type="video/mp4">
  Your Markdown viewer does not support embedded video.
</video>

## Database Design

The database contains three tables: `employees`, `review_periods`, and
`performance_reviews`.

### Entity Relationships

-   One employee can have multiple performance reviews.
-   One review period can have multiple performance reviews.
-   Each performance review belongs to one employee and one review
    period.

``` text
employees (1) ──────< performance_reviews >────── (1) review_periods
                           many reviews
```

### Table: `employees`

  -----------------------------------------------------------------------
  Column            Data Type         Constraints       Description
  ----------------- ----------------- ----------------- -----------------
  `id`              SERIAL            PRIMARY KEY       Unique employee
                                                        database ID

  `employee_id`     VARCHAR(20)       UNIQUE, NOT NULL  Employee code,
                                                        e.g. `EMP101`

  `name`            VARCHAR(100)      NOT NULL          Employee full
                                                        name

  `department`      VARCHAR(100)      NULL              Department name

  `email`           VARCHAR(100)      NULL              Employee email

  `status`          VARCHAR(20)       DEFAULT           Employment status
                                      `'Active'`        
  -----------------------------------------------------------------------

### Table: `review_periods`

  Column         Data Type     Constraints        Description
  -------------- ------------- ------------------ -----------------------------
  `id`           SERIAL        PRIMARY KEY        Unique review period ID
  `name`         VARCHAR(50)   NOT NULL           Period name, e.g. `H1 2026`
  `start_date`   DATE          NOT NULL           Period start date
  `end_date`     DATE          NOT NULL           Period end date
  `status`       VARCHAR(20)   DEFAULT `'Open'`   Review period status

### Table: `performance_reviews`

  -----------------------------------------------------------------------------
  Column              Data Type         Constraints       Description
  ------------------- ----------------- ----------------- ---------------------
  `id`                SERIAL            PRIMARY KEY       Unique review ID

  `employee_id`       INTEGER           NOT NULL, FOREIGN References
                                        KEY               `employees.id`

  `period_id`         INTEGER           NOT NULL, FOREIGN References
                                        KEY               `review_periods.id`

  `quality_rating`    INTEGER           NOT NULL          Quality rating (1--5)

  `delivery_rating`   INTEGER           NOT NULL          Delivery rating
                                                          (1--5)

  `teamwork_rating`   INTEGER           NOT NULL          Teamwork rating
                                                          (1--5)

  `average_rating`    DECIMAL(3,2)      NOT NULL          Calculated average

  `comments`          TEXT              Nullable in the   Manager comments;
                                        screenshot schema required for
                                                          submission by
                                                          business rules

  `created_at`        TIMESTAMP         DEFAULT `NOW()`   Review submission
                                                          timestamp
  -----------------------------------------------------------------------------

The schema above documents the fields in the supplied design. Apply the
business rules in the backend and, where appropriate, enforce them with
database constraints. The SQL below includes rating checks, valid
review-period dates, and one review per employee per period.

### PostgreSQL Schema

Save the following as `database/schema.sql` and run it against your
PostgreSQL database.

``` sql
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    department VARCHAR(100),
    email VARCHAR(100),
    status VARCHAR(20) DEFAULT 'Active'
);

CREATE TABLE review_periods (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'Open',
    CONSTRAINT chk_review_period_dates
        CHECK (end_date >= start_date)
);

CREATE TABLE performance_reviews (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL
        REFERENCES employees(id),
    period_id INTEGER NOT NULL
        REFERENCES review_periods(id),
    quality_rating INTEGER NOT NULL
        CHECK (quality_rating BETWEEN 1 AND 5),
    delivery_rating INTEGER NOT NULL
        CHECK (delivery_rating BETWEEN 1 AND 5),
    teamwork_rating INTEGER NOT NULL
        CHECK (teamwork_rating BETWEEN 1 AND 5),
    average_rating DECIMAL(3,2) NOT NULL
        CHECK (average_rating BETWEEN 1 AND 5),
    comments TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT uq_employee_review_period
        UNIQUE (employee_id, period_id)
);

CREATE INDEX idx_performance_reviews_employee_id
    ON performance_reviews(employee_id);

CREATE INDEX idx_performance_reviews_period_id
    ON performance_reviews(period_id);
```

**Implementation note:** The API should calculate `average_rating` as
`(quality_rating + delivery_rating + teamwork_rating) / 3.0` and store
it rounded to two decimal places. Do not trust a client-supplied
average. If you need to match the screenshot's nullable `comments`
column exactly, remove `NOT NULL` from that column; the submission
endpoint should still require comments.

## API Specification

**Base URL:** `http://localhost:8000/api`

  Method   Endpoint            Description                        Priority
  -------- ------------------- ---------------------------------- -----------
  GET      `/employees`        Get the list of employees          Mandatory
  GET      `/review-periods`   Get review periods                 Mandatory
  GET      `/reviews`          Get reviews, optionally filtered   Mandatory
  GET      `/reviews/{id}`     Get review details                 Optional
  POST     `/reviews`          Submit a new review                Mandatory

### Review List Filters

Example request:

``` http
GET /api/reviews?employee_id=1&period_id=1
```

Suggested query parameters:

-   `employee_id`: employee database ID.
-   `period_id`: review period database ID.

These parameter names are implementation choices. Keep them consistent
with the FastAPI route definitions and OpenAPI documentation.

## Example API Requests and Responses

The examples below illustrate the intended API contract. Actual response
fields may vary depending on the implementation.

### Get Employees

**Request**

``` http
GET /api/employees
```

**Example response --- `200 OK`**

``` json
[
  {
    "id": 1,
    "employee_id": "EMP101",
    "name": "John Smith",
    "department": "Engineering",
    "email": "john@example.com",
    "status": "Active"
  }
]
```

### Get Review Periods

**Request**

``` http
GET /api/review-periods
```

**Example response --- `200 OK`**

``` json
[
  {
    "id": 1,
    "name": "H1 2026",
    "start_date": "2026-01-01",
    "end_date": "2026-06-30",
    "status": "Open"
  }
]
```

### Get Performance Reviews

**Request**

``` http
GET /api/reviews
```

**Example response --- `200 OK`**

``` json
[
  {
    "id": 1,
    "employee_id": 1,
    "employee_code": "EMP101",
    "employee_name": "John Smith",
    "period_id": 1,
    "period_name": "H1 2026",
    "quality_rating": 4,
    "delivery_rating": 5,
    "teamwork_rating": 4,
    "average_rating": 4.33,
    "comments": "Strong performer with great teamwork.",
    "created_at": "2026-01-15T10:30:00"
  }
]
```

`employee_code`, `employee_name`, and `period_name` are display fields
that can be supplied by joining the related tables; they are not columns
in `performance_reviews`.

### Submit a Performance Review

**Request**

``` http
POST /api/reviews
Content-Type: application/json
```

**Request body**

``` json
{
  "employee_id": 1,
  "period_id": 1,
  "quality_rating": 4,
  "delivery_rating": 5,
  "teamwork_rating": 4,
  "comments": "Strong performer with great teamwork."
}
```

**Example response --- `201 Created`**

``` json
{
  "id": 1,
  "employee_id": 1,
  "period_id": 1,
  "quality_rating": 4,
  "delivery_rating": 5,
  "teamwork_rating": 4,
  "average_rating": 4.33,
  "comments": "Strong performer with great teamwork.",
  "created_at": "2026-01-15T10:30:00"
}
```

### Average Rating Calculation

``` text
Average Rating =
(Quality Rating + Delivery Rating + Teamwork Rating) / 3
```

For ratings of 4, 5, and 4:

``` text
(4 + 5 + 4) / 3 = 4.33
```

Store the average to two decimal places. The UI may display one decimal
place (for example, `4.3 / 5`) while the API returns `4.33`.

### Suggested Error Responses

  -----------------------------------------------------------------------
  HTTP Status                         Scenario
  ----------------------------------- -----------------------------------
  400 Bad Request                     Invalid request or business-rule
                                      violation, if implemented this way

  404 Not Found                       Employee, review period, or review
                                      does not exist

  409 Conflict                        Duplicate review for the same
                                      employee and period

  422 Unprocessable Entity            Request validation failure,
                                      commonly used by FastAPI

  500 Internal Server Error           Unexpected server-side error
  -----------------------------------------------------------------------

Use consistent error response formats and status codes across endpoints.

## Business Rules and Validation

1.  Each individual rating must be an integer between 1 and 5,
    inclusive.
2.  The average rating is calculated from the three individual ratings.
3.  An employee can have only one review per review period.
4.  Comments are required when submitting a review.
5.  Review periods may be configured as annual or half-yearly.
6.  Only review periods with status `Open` can accept new reviews.
7.  The selected employee and review period must exist.
8.  The backend calculates the average rating; clients cannot set the
    authoritative value.
9.  Invalid submissions must not create a review record.

## Setup and Installation

The exact commands depend on the repository and chosen database
driver/ORM. The following steps provide a starting point.

### Prerequisites

-   Python (use a version supported by your dependencies).
-   PostgreSQL.
-   Git.
-   An API client such as Postman (optional).

### 1. Clone the Repository

``` bash
git clone <your-repository-url>
cd <your-project-directory>
```

Replace the placeholders with your repository URL and directory name.

### 2. Create and Activate a Virtual Environment

**Windows PowerShell**

``` powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

**Linux / macOS**

``` bash
python3 -m venv .venv
source .venv/bin/activate
```

### 3. Install Dependencies

If the repository contains a `requirements.txt` file:

``` bash
pip install -r requirements.txt
```

Typical packages for this stack include `fastapi`, `uvicorn`,
`pydantic`, and a PostgreSQL driver or ORM. Install the dependencies
declared by the actual project rather than assuming these are already
configured.

### 4. Create the Database

Connect to PostgreSQL and run:

``` sql
CREATE DATABASE employee_performance_db;
```

### 5. Configure Environment Variables

Create a local `.env` file if the application is configured to load one.
For example:

``` dotenv
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=employee_performance_db
DATABASE_USER=postgres
DATABASE_PASSWORD=<your-local-password>
```

Use the variable names expected by your application. Do not commit real
passwords, tokens, or other secrets to version control.

### 6. Create the Tables

Execute `database/schema.sql` against `employee_performance_db` using
`psql`, pgAdmin, or your project's migration tool.

### 7. Start the FastAPI Application

From the repository root, start the FastAPI application with:

``` powershell
.\.venv\Scripts\python.exe -m uvicorn main:app --reload
```

The root `main.py` exposes the application defined in `app.main`. If
Uvicorn is available on your `PATH`, `uvicorn main:app --reload` also works.

### 8. Open the API Documentation

-   Swagger UI: `http://localhost:8000/docs`
-   ReDoc: `http://localhost:8000/redoc`
-   OpenAPI JSON: `http://localhost:8000/openapi.json`

These documentation routes are FastAPI defaults unless customized or
disabled.

### 9. Start the React Frontend

The React + TypeScript frontend is in `UI/`. With the backend running,
open a second terminal from the repository root and run:

``` powershell
Set-Location UI
npm install
npm run dev
```

Open `http://localhost:5173`. Vite proxies `/api` requests to the
FastAPI server at `http://127.0.0.1:8000`.

To create a production build, run `npm run build` from `UI/`. The
optimized static files are written to `UI/dist/`.

To use a different API URL, copy `UI/.env.example` to `UI/.env` and set
`VITE_API_BASE_URL`. For browser access from another frontend origin, add
that origin to `FRONTEND_ORIGINS` in the backend environment.

## Testing Strategy

### Functional Testing

-   Verify employees and review periods are returned correctly.
-   Submit a valid performance review.
-   Confirm the average rating is calculated correctly.
-   Verify the new review appears in the review list.
-   Verify filtering by employee and period.
-   Verify review details, if implemented.

### Negative Testing

-   Submit without an employee.
-   Submit without a review period.
-   Submit without comments.
-   Submit ratings below 1 or above 5.
-   Submit an unknown employee or review period ID.
-   Submit a review for a closed period.
-   Submit a duplicate review for the same employee and period.

### API Testing

-   Validate HTTP status codes and response schemas.
-   Check mandatory fields and data types.
-   Verify foreign-key and rating constraints.
-   Verify average rating calculations.
-   Test filter combinations and pagination, if implemented.
-   Check error handling for invalid payloads.

### Database Validation

Inspect recently created reviews:

``` sql
SELECT *
FROM performance_reviews
ORDER BY created_at DESC;
```

Compare stored and expected average ratings:

``` sql
SELECT
    id,
    quality_rating,
    delivery_rating,
    teamwork_rating,
    average_rating,
    ROUND(
        (quality_rating + delivery_rating + teamwork_rating) / 3.0,
        2
    ) AS expected_average
FROM performance_reviews;
```

## Current Project Structure

The repository is organized into a FastAPI backend and a React + TypeScript
frontend:

``` text
employee-performance-review/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── database.py
│   ├── models/
│   │   └── __init__.py
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── employees.py
│   │   ├── review_periods.py
│   │   └── reviews.py
│   ├── schemas/
│   │   └── __init__.py
│   └── services/
│       ├── __init__.py
│       ├── employees.py
│       ├── review_periods.py
│       └── reviews.py
├── database/
│   └── schema.sql
├── tests/
│   ├── __init__.py
│   └── test_api_contract.py
├── docs/
│   ├── openapi.yaml
│   └── demo/
│       └── application-flow.mp4
├── UI/
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── .env.example
│   └── src/
│       ├── App.tsx
│       ├── main.tsx
│       ├── styles.css
│       ├── vite-env.d.ts
│       ├── components/
│       │   ├── Alert.tsx
│       │   ├── AppShell.tsx
│       │   ├── Brand.tsx
│       │   ├── EmptyState.tsx
│       │   ├── LoadingState.tsx
│       │   ├── PageHeading.tsx
│       │   ├── RatingStars.tsx
│       │   ├── RatingSummary.tsx
│       │   ├── ReviewTable.tsx
│       │   └── Sidebar.tsx
│       ├── hooks/
│       │   ├── useApiResource.ts
│       │   ├── useEmployees.ts
│       │   ├── useReviewPeriods.ts
│       │   └── useReviews.ts
│       ├── lib/
│       │   └── api.ts
│       ├── pages/
│       │   ├── DashboardPage.tsx
│       │   ├── EmployeesPage.tsx
│       │   ├── ReviewDetailsPage.tsx
│       │   ├── ReviewFormPage.tsx
│       │   ├── ReviewPeriodsPage.tsx
│       │   └── ReviewsPage.tsx
│       └── types/
│           └── api.ts
├── .env.example
├── .gitignore
├── requirements.txt
├── main.py
└── README.md
```

Generated directories such as `.venv/`, `UI/node_modules/`, and
`UI/dist/` are excluded from this overview.

## Future Enhancements

-   Add authentication and role-based authorization.
-   Add audit history for review changes.
-   Generate department-wise performance reports.
-   Add pagination, sorting, and richer filtering.
-   Automate API and UI regression testing.
-   Integrate CI/CD and test reporting.
-   Add database migrations and structured application logging.

## License

Add the license applicable to your project before distributing it
publicly.
