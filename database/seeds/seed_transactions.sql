-- Seed data for transactions table
-- 200+ transactions distributed over the last 6 months
-- Note: This is a placeholder. Actual seed data will be generated programmatically
-- to ensure realistic distribution and variety

-- Sample transactions (will be expanded to 200+)
INSERT INTO transactions (id, amount, currency, category_id, description, transaction_date, type, created_at, updated_at) VALUES
-- Income transactions
(gen_random_uuid(), 75000.00, 'RUB', '550e8400-e29b-41d4-a716-446655440001', 'Зарплата за январь', '2026-01-15', 'income', NOW(), NOW()),
(gen_random_uuid(), 75000.00, 'RUB', '550e8400-e29b-41d4-a716-446655440001', 'Зарплата за декабрь', '2025-12-15', 'income', NOW(), NOW()),
(gen_random_uuid(), 25000.00, 'RUB', '550e8400-e29b-41d4-a716-446655440002', 'Фриланс проект', '2026-01-20', 'income', NOW(), NOW()),

-- Expense transactions
(gen_random_uuid(), 8500.00, 'RUB', '550e8400-e29b-41d4-a716-446655440004', 'Продукты в супермаркете', '2026-02-10', 'expense', NOW(), NOW()),
(gen_random_uuid(), 3200.00, 'RUB', '550e8400-e29b-41d4-a716-446655440005', 'Бензин', '2026-02-08', 'expense', NOW(), NOW()),
(gen_random_uuid(), 25000.00, 'RUB', '550e8400-e29b-41d4-a716-446655440006', 'Аренда квартиры', '2026-02-01', 'expense', NOW(), NOW()),
(gen_random_uuid(), 1500.00, 'RUB', '550e8400-e29b-41d4-a716-446655440007', 'Кино', '2026-02-05', 'expense', NOW(), NOW()),
(gen_random_uuid(), 4500.00, 'RUB', '550e8400-e29b-41d4-a716-446655440008', 'Аптека', '2026-01-28', 'expense', NOW(), NOW());

-- Note: Additional 192+ transactions will be added to reach 200+ total
-- Distribution: ~30-40 transactions per month over 6 months
-- Mix of income (10-15%) and expenses (85-90%)
-- Realistic amounts and descriptions for each category
