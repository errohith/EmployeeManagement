
-- =========================================
-- 1. Employees Table
-- =========================================
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    department VARCHAR(100),
    email VARCHAR(100),
    status VARCHAR(20) DEFAULT 'Active'
);

-- =========================================
-- 2. Review Periods Table
-- =========================================
CREATE TABLE review_periods (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'Open',

    CONSTRAINT chk_review_dates
        CHECK (end_date >= start_date)
);

-- =========================================
-- 3. Performance Reviews Table
-- =========================================
CREATE TABLE performance_reviews (
    id SERIAL PRIMARY KEY,

    employee_id INTEGER NOT NULL,
    period_id INTEGER NOT NULL,

    quality_rating INTEGER NOT NULL,
    delivery_rating INTEGER NOT NULL,
    teamwork_rating INTEGER NOT NULL,

    average_rating DECIMAL(3,2) NOT NULL,
    comments TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),

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

    CONSTRAINT uq_performance_reviews_employee_period
        UNIQUE (employee_id, period_id)
);

-- Indexes for common lookup operations
CREATE INDEX idx_reviews_employee_id
    ON performance_reviews(employee_id);

CREATE INDEX idx_reviews_period_id
    ON performance_reviews(period_id);
