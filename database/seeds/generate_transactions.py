#!/usr/bin/env python3
"""
Скрипт для генерации seed данных транзакций.
Создаёт 200+ реалистичных транзакций за последние 6 месяцев.
"""

import random
from datetime import datetime, timedelta
from typing import List, Tuple

# Категории из seed_categories.sql
INCOME_CATEGORIES = [
    ('550e8400-e29b-41d4-a716-446655440001', 'Зарплата', (70000, 80000)),
    ('550e8400-e29b-41d4-a716-446655440002', 'Фриланс', (15000, 35000)),
    ('550e8400-e29b-41d4-a716-446655440003', 'Инвестиции', (5000, 20000)),
]

EXPENSE_CATEGORIES = [
    ('550e8400-e29b-41d4-a716-446655440004', 'Продукты', (500, 3000)),
    ('550e8400-e29b-41d4-a716-446655440005', 'Транспорт', (200, 2000)),
    ('550e8400-e29b-41d4-a716-446655440006', 'Жильё', (20000, 30000)),
    ('550e8400-e29b-41d4-a716-446655440007', 'Развлечения', (500, 5000)),
    ('550e8400-e29b-41d4-a716-446655440008', 'Здоровье', (1000, 8000)),
    ('550e8400-e29b-41d4-a716-446655440009', 'Образование', (2000, 10000)),
    ('550e8400-e29b-41d4-a716-446655440010', 'Одежда', (1000, 8000)),
    ('550e8400-e29b-41d4-a716-446655440011', 'Кафе и рестораны', (300, 2500)),
    ('550e8400-e29b-41d4-a716-446655440012', 'Прочее', (200, 3000)),
]

# Описания для транзакций
DESCRIPTIONS = {
    'Зарплата': ['Зарплата за {}', 'Аванс за {}', 'Премия за {}'],
    'Фриланс': ['Фриланс проект {}', 'Разработка сайта', 'Консультация', 'Дизайн логотипа', 'Верстка страниц'],
    'Инвестиции': ['Дивиденды', 'Проценты по вкладу', 'Продажа акций', 'Доход от облигаций'],
    'Продукты': ['Продукты в супермаркете', 'Овощи и фрукты', 'Мясо и рыба', 'Молочные продукты', 'Хлеб и выпечка'],
    'Транспорт': ['Бензин', 'Метро', 'Такси', 'Автобус', 'Парковка', 'Техобслуживание авто'],
    'Жильё': ['Аренда квартиры', 'Коммунальные услуги', 'Интернет', 'Ремонт', 'Мебель'],
    'Развлечения': ['Кино', 'Театр', 'Концерт', 'Боулинг', 'Квест-комната', 'Парк развлечений'],
    'Здоровье': ['Аптека', 'Врач', 'Анализы', 'Стоматолог', 'Массаж', 'Витамины'],
    'Образование': ['Курсы программирования', 'Английский язык', 'Книги', 'Онлайн-курс', 'Семинар'],
    'Одежда': ['Куртка', 'Джинсы', 'Обувь', 'Футболка', 'Платье', 'Аксессуары'],
    'Кафе и рестораны': ['Обед в кафе', 'Ужин в ресторане', 'Кофе', 'Пицца', 'Суши', 'Бургеры'],
    'Прочее': ['Подарок', 'Хозтовары', 'Косметика', 'Цветы', 'Благотворительность'],
}

MONTHS_RU = [
    'январь', 'февраль', 'март', 'апрель', 'май', 'июнь',
    'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'
]


def generate_transactions(count: int = 220, months: int = 6) -> List[Tuple]:
    """
    Генерирует список транзакций.
    
    Args:
        count: Количество транзакций (по умолчанию 220)
        months: Количество месяцев назад (по умолчанию 6)
    
    Returns:
        Список кортежей (amount, currency, category_id, description, date, type)
    """
    transactions = []
    end_date = datetime.now()
    start_date = end_date - timedelta(days=months * 30)
    
    # Генерируем доходы (15% от общего количества)
    income_count = int(count * 0.15)
    for _ in range(income_count):
        category_id, category_name, (min_amount, max_amount) = random.choice(INCOME_CATEGORIES)
        amount = round(random.uniform(min_amount, max_amount), 2)
        
        # Генерируем случайную дату
        days_diff = (end_date - start_date).days
        random_days = random.randint(0, days_diff)
        transaction_date = start_date + timedelta(days=random_days)
        
        # Зарплата обычно в середине месяца
        if category_name == 'Зарплата':
            transaction_date = transaction_date.replace(day=15)
            month_name = MONTHS_RU[transaction_date.month - 1]
            description = random.choice(DESCRIPTIONS[category_name]).format(month_name)
        else:
            description = random.choice(DESCRIPTIONS[category_name])
            if '{}' in description:
                description = description.format(random.randint(1, 5))
        
        transactions.append((
            amount,
            'RUB',
            category_id,
            description,
            transaction_date.strftime('%Y-%m-%d'),
            'income'
        ))
    
    # Генерируем расходы (85% от общего количества)
    expense_count = count - income_count
    for _ in range(expense_count):
        category_id, category_name, (min_amount, max_amount) = random.choice(EXPENSE_CATEGORIES)
        amount = round(random.uniform(min_amount, max_amount), 2)
        
        # Генерируем случайную дату
        days_diff = (end_date - start_date).days
        random_days = random.randint(0, days_diff)
        transaction_date = start_date + timedelta(days=random_days)
        
        # Аренда обычно в начале месяца
        if category_name == 'Жильё' and 'Аренда' in DESCRIPTIONS[category_name][0]:
            transaction_date = transaction_date.replace(day=1)
        
        description = random.choice(DESCRIPTIONS[category_name])
        
        transactions.append((
            amount,
            'RUB',
            category_id,
            description,
            transaction_date.strftime('%Y-%m-%d'),
            'expense'
        ))
    
    # Сортируем по дате (старые первыми)
    transactions.sort(key=lambda x: x[4])
    
    return transactions


def generate_sql(transactions: List[Tuple]) -> str:
    """
    Генерирует SQL INSERT запрос для транзакций.
    
    Args:
        transactions: Список транзакций
    
    Returns:
        SQL запрос
    """
    sql = """-- Seed data for transactions table
-- 200+ transactions distributed over the last 6 months
-- Generated automatically by generate_transactions.py

INSERT INTO transactions (id, amount, currency, category_id, description, transaction_date, type, created_at, updated_at) VALUES
"""
    
    values = []
    for amount, currency, category_id, description, date, trans_type in transactions:
        # Экранируем одинарные кавычки в описании
        description = description.replace("'", "''")
        
        value = f"(gen_random_uuid(), {amount}, '{currency}', '{category_id}', '{description}', '{date}', '{trans_type}', NOW(), NOW())"
        values.append(value)
    
    sql += ',\n'.join(values) + ';\n'
    
    return sql


def main():
    """Основная функция."""
    print("Генерация seed данных транзакций...")
    
    # Генерируем 220 транзакций (с запасом)
    transactions = generate_transactions(count=220, months=6)
    
    print(f"Сгенерировано транзакций: {len(transactions)}")
    print(f"  - Доходы: {sum(1 for t in transactions if t[5] == 'income')}")
    print(f"  - Расходы: {sum(1 for t in transactions if t[5] == 'expense')}")
    
    # Генерируем SQL
    sql = generate_sql(transactions)
    
    # Сохраняем в файл
    output_file = 'seed_transactions.sql'
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(sql)
    
    print(f"\nSQL файл сохранён: {output_file}")
    print(f"Размер файла: {len(sql)} байт")
    
    # Статистика по месяцам
    from collections import defaultdict
    by_month = defaultdict(int)
    for t in transactions:
        month = t[4][:7]  # YYYY-MM
        by_month[month] += 1
    
    print("\nРаспределение по месяцам:")
    for month in sorted(by_month.keys()):
        print(f"  {month}: {by_month[month]} транзакций")


if __name__ == '__main__':
    main()
