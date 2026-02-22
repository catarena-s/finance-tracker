-- Seed data for budgets table
-- 3 budgets for different categories

INSERT INTO budgets (id, category_id, amount, currency, period, start_date, end_date, created_at, updated_at) VALUES
-- Monthly budget for groceries
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440004', 15000.00, 'RUB', 'monthly', '2026-02-01', '2026-02-28', NOW(), NOW()),

-- Monthly budget for transport
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440005', 5000.00, 'RUB', 'monthly', '2026-02-01', '2026-02-28', NOW(), NOW()),

-- Monthly budget for entertainment
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440007', 10000.00, 'RUB', 'monthly', '2026-02-01', '2026-02-28', NOW(), NOW());
