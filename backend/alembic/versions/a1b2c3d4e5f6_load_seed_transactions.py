"""load_seed_transactions

Revision ID: 20260222150000
Revises: 68a28a4c61c8
Create Date: 2026-02-22 15:00:00.000000

"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from datetime import datetime, timedelta
import random


# revision identifiers, used by Alembic.
revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, None] = "68a28a4c61c8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


# Категории (ID из seed_categories.sql)
INCOME_CATEGORIES = [
    (None, 'Зарплата', (70000, 80000)),
    (None, 'Фриланс', (15000, 35000)),
    (None, 'Инвестиции', (5000, 20000)),
]

EXPENSE_CATEGORIES = [
    (None, 'Продукты', (500, 3000)),
    (None, 'Транспорт', (200, 2000)),
    (None, 'Жильё', (20000, 30000)),
    (None, 'Развлечения', (500, 5000)),
    (None, 'Здоровье', (1000, 8000)),
    (None, 'Образование', (2000, 10000)),
    (None, 'Одежда', (1000, 8000)),
    (None, 'Связь', (500, 2000)),
    (None, 'Прочее', (200, 3000)),
]

DESCRIPTIONS = {
    'Зарплата': ['Зарплата за {}', 'Аванс за {}', 'Премия за {}'],
    'Фриланс': ['Фриланс проект', 'Разработка сайта', 'Консультация', 'Дизайн логотипа'],
    'Инвестиции': ['Дивиденды', 'Проценты по вкладу', 'Продажа акций'],
    'Продукты': ['Продукты в супермаркете', 'Овощи и фрукты', 'Мясо и рыба'],
    'Транспорт': ['Бензин', 'Метро', 'Такси', 'Автобус'],
    'Жильё': ['Аренда квартиры', 'Коммунальные услуги', 'Интернет'],
    'Развлечения': ['Кино', 'Театр', 'Концерт', 'Боулинг'],
    'Здоровье': ['Аптека', 'Врач', 'Анализы', 'Стоматолог'],
    'Образование': ['Курсы программирования', 'Английский язык', 'Книги'],
    'Одежда': ['Куртка', 'Джинсы', 'Обувь', 'Футболка'],
    'Связь': ['Мобильная связь', 'Интернет дома', 'Подписки'],
    'Прочее': ['Подарок', 'Хозтовары', 'Косметика', 'Цветы', 'Обед в кафе', 'Кофе'],
}

MONTHS_RU = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь',
             'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь']


def upgrade() -> None:
    # Удаляем старые тестовые транзакции
    op.execute("DELETE FROM transactions;")
    
    # Получаем реальные ID категорий из БД
    conn = op.get_bind()
    
    # Маппинг категорий: (name, type) -> id
    category_map = {}
    
    # Получаем ID категорий доходов
    for _, category_name, _ in INCOME_CATEGORIES:
        result = conn.execute(
            sa.text(f"SELECT id FROM categories WHERE name = '{category_name}' AND type = 'income'")
        )
        row = result.fetchone()
        if row:
            category_map[(category_name, 'income')] = str(row[0])
    
    # Получаем ID категорий расходов
    for _, category_name, _ in EXPENSE_CATEGORIES:
        result = conn.execute(
            sa.text(f"SELECT id FROM categories WHERE name = '{category_name}' AND type = 'expense'")
        )
        row = result.fetchone()
        if row:
            category_map[(category_name, 'expense')] = str(row[0])
    
    # Генерируем 220 транзакций
    end_date = datetime.now()
    start_date = end_date - timedelta(days=180)  # 6 месяцев
    
    transactions = []
    
    # Доходы (15%)
    for _ in range(33):
        _, category_name, (min_amount, max_amount) = random.choice(INCOME_CATEGORIES)
        category_id = category_map.get((category_name, 'income'))
        if not category_id:
            continue
            
        amount = round(random.uniform(min_amount, max_amount), 2)
        
        days_diff = (end_date - start_date).days
        random_days = random.randint(0, days_diff)
        transaction_date = start_date + timedelta(days=random_days)
        
        if category_name == 'Зарплата':
            transaction_date = transaction_date.replace(day=15)
            month_name = MONTHS_RU[transaction_date.month - 1]
            description = random.choice(DESCRIPTIONS[category_name]).format(month_name)
        else:
            description = random.choice(DESCRIPTIONS[category_name])
        
        transactions.append((amount, category_id, description, transaction_date.strftime('%Y-%m-%d'), 'income'))
    
    # Расходы (85%)
    for _ in range(187):
        _, category_name, (min_amount, max_amount) = random.choice(EXPENSE_CATEGORIES)
        category_id = category_map.get((category_name, 'expense'))
        if not category_id:
            continue
            
        amount = round(random.uniform(min_amount, max_amount), 2)
        
        days_diff = (end_date - start_date).days
        random_days = random.randint(0, days_diff)
        transaction_date = start_date + timedelta(days=random_days)
        
        if category_name == 'Жильё' and 'Аренда' in DESCRIPTIONS[category_name][0]:
            transaction_date = transaction_date.replace(day=1)
        
        description = random.choice(DESCRIPTIONS[category_name])
        
        transactions.append((amount, category_id, description, transaction_date.strftime('%Y-%m-%d'), 'expense'))
    
    # Сортируем по дате
    transactions.sort(key=lambda x: x[3])
    
    # Вставляем транзакции пакетами по 50
    for i in range(0, len(transactions), 50):
        batch = transactions[i:i+50]
        values = []
        for amount, category_id, description, date, trans_type in batch:
            # Экранируем одинарные кавычки
            description = description.replace("'", "''")
            values.append(f"(gen_random_uuid(), {amount}, 'RUB', '{category_id}', '{description}', '{date}', '{trans_type}', false, NOW(), NOW())")
        
        sql = f"""
        INSERT INTO transactions (id, amount, currency, category_id, description, transaction_date, type, is_recurring, created_at, updated_at)
        VALUES {', '.join(values)};
        """
        op.execute(sql)


def downgrade() -> None:
    # Удаляем все транзакции
    op.execute("DELETE FROM transactions;")

