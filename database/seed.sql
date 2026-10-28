-- Sample data for local development. Safe to re-run.

INSERT INTO employees (employee_id, name, department, email, status)
VALUES
    ('EMP001', 'Aarav Sharma', 'Engineering', 'aarav.sharma@example.com', 'Active'),
    ('EMP002', 'Priya Nair', 'Engineering', 'priya.nair@example.com', 'Active'),
    ('EMP003', 'Karthik Raj', 'Quality Assurance', 'karthik.raj@example.com', 'Active'),
    ('EMP004', 'Meera Iyer', 'Product', 'meera.iyer@example.com', 'Active'),
    ('EMP005', 'Rahul Verma', 'Design', 'rahul.verma@example.com', 'Active'),
    ('EMP006', 'Divya Menon', 'Human Resources', 'divya.menon@example.com', 'Inactive')
ON CONFLICT (employee_id) DO NOTHING;

INSERT INTO review_periods (name, start_date, end_date, status)
VALUES
    ('H1 2025', '2025-01-01', '2025-06-30', 'Closed'),
    ('H2 2025', '2025-07-01', '2025-12-31', 'Closed'),
    ('Annual 2025', '2025-01-01', '2025-12-31', 'Closed'),
    ('H1 2026', '2026-01-01', '2026-06-30', 'Open'),
    ('H2 2026', '2026-07-01', '2026-12-31', 'Open')
ON CONFLICT (name) DO NOTHING;

INSERT INTO performance_reviews (
    employee_id, period_id, quality_rating, delivery_rating,
    teamwork_rating, average_rating, comments
)
SELECT e.id, p.id, v.quality, v.delivery, v.teamwork,
       ROUND((v.quality + v.delivery + v.teamwork) / 3.0, 2), v.comments
FROM (
    VALUES
        ('EMP001', 'H1 2025', 4, 5, 4, 'Consistently delivers high-quality features ahead of schedule.'),
        ('EMP002', 'H1 2025', 5, 4, 5, 'Excellent collaborator and mentor to new joiners.'),
        ('EMP003', 'H1 2025', 3, 3, 4, 'Solid test coverage; should take more ownership of releases.'),
        ('EMP001', 'H2 2025', 5, 5, 4, 'Led the payments migration end to end.'),
        ('EMP004', 'H2 2025', 4, 4, 5, 'Clear roadmap communication across teams.'),
        ('EMP005', 'H1 2026', 4, 3, 4, 'Strong design system work; deadlines slipped twice.')
) AS v(employee_code, period_name, quality, delivery, teamwork, comments)
JOIN employees AS e ON e.employee_id = v.employee_code
JOIN review_periods AS p ON p.name = v.period_name
ON CONFLICT (employee_id, period_id) DO NOTHING;
