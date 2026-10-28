-- Employee Performance Review Management System schema.
-- Safe to re-run: every object is created only if it does not exist.

-- =========================================
-- 1. Employees Table
-- =========================================
CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    department VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'Active',

    CONSTRAINT chk_employee_status
        CHECK (status IN ('Active', 'Inactive'))
);

-- =========================================
-- 2. Review Periods Table
-- =========================================
CREATE TABLE IF NOT EXISTS review_periods (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Open',

    CONSTRAINT chk_review_dates
        CHECK (end_date >= start_date),

    CONSTRAINT chk_review_period_status
        CHECK (status IN ('Open', 'Closed'))
);

-- =========================================
-- 3. Performance Reviews Table
-- =========================================
CREATE TABLE IF NOT EXISTS performance_reviews (
    id SERIAL PRIMARY KEY,

    employee_id INTEGER NOT NULL,
    period_id INTEGER NOT NULL,

    quality_rating INTEGER NOT NULL,
    delivery_rating INTEGER NOT NULL,
    teamwork_rating INTEGER NOT NULL,

    average_rating DECIMAL(3,2) NOT NULL,
    comments TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_review_employee
        FOREIGN KEY (employee_id)
        REFERENCES employees(id),

    CONSTRAINT fk_review_period
        FOREIGN KEY (period_id)
        REFERENCES review_periods(id),

    CONSTRAINT chk_quality_rating
        CHECK (quality_rating BETWEEN 1 AND 5),

    CONSTRAINT chk_delivery_rating
        CHECK (delivery_rating BETWEEN 1 AND 5),

    CONSTRAINT chk_teamwork_rating
        CHECK (teamwork_rating BETWEEN 1 AND 5),

    CONSTRAINT chk_average_rating
        CHECK (average_rating BETWEEN 1 AND 5),

    CONSTRAINT chk_comments_not_blank
        CHECK (btrim(comments) <> ''),

    CONSTRAINT uq_performance_reviews_employee_period
        UNIQUE (employee_id, period_id)
);

-- Lookups by employee use the leading column of
-- uq_performance_reviews_employee_period, so only period needs an index.
CREATE INDEX IF NOT EXISTS idx_reviews_period_id
    ON performance_reviews(period_id);

-- Supports the default newest-first ordering of the review list.
CREATE INDEX IF NOT EXISTS idx_reviews_created_at
    ON performance_reviews(created_at DESC, id DESC);
