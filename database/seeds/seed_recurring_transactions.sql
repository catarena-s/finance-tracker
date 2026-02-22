-- Seed data for recurring_transactions table
-- Шаблоны повторяющихся транзакций

-- Зарплата (ежемесячно, 15-го числа)
INSERT INTO recurring_transactions (
    id, 
    amount, 
    currency, 
    category_id, 
    description, 
    type, 
    frequency, 
    interval_value, 
    start_date, 
    next_occurrence, 
    is_active, 
    created_at, 
    updated_at
) VALUES (
    gen_random_uuid(),
    75000.00,
    'RUB',
    (SELECT id FROM categories WHERE name = 'Зарплата' AND type = 'income' LIMIT 1),
    'Ежемесячная зарплата',
    'income',
    'monthly',
    1,
    '2026-01-15',
    '2026-03-15',
    true,
    NOW(),
    NOW()
);

-- Аренда квартиры (ежемесячно, 1-го числа)
INSERT INTO recurring_transactions (
    id, 
    amount, 
    currency, 
    category_id, 
    description, 
    type, 
    frequency, 
    interval_value, 
    start_date, 
    next_occurrence, 
    is_active, 
    created_at, 
    updated_at
) VALUES (
    gen_random_uuid(),
    25000.00,
    'RUB',
    (SELECT id FROM categories WHERE name = 'Жильё' AND type = 'expense' LIMIT 1),
    'Аренда квартиры',
    'expense',
    'monthly',
    1,
    '2026-01-01',
    '2026-03-01',
    true,
    NOW(),
    NOW()
);

-- Подписка на сервисы (ежемесячно, 5-го числа)
INSERT INTO recurring_transactions (
    id, 
    amount, 
    currency, 
    category_id, 
    description, 
    type, 
    frequency, 
    interval_value, 
    start_date, 
    next_occurrence, 
    is_active, 
    created_at, 
    updated_at
) VALUES (
    gen_random_uuid(),
    1500.00,
    'RUB',
    (SELECT id FROM categories WHERE name = 'Связь' AND type = 'expense' LIMIT 1),
    'Подписки (Netflix, Spotify)',
    'expense',
    'monthly',
    1,
    '2026-01-05',
    '2026-03-05',
    true,
    NOW(),
    NOW()
);
