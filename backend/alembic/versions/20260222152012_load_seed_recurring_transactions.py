"""load_seed_recurring_transactions

Revision ID: a6c1b6352e60
Revises: a1b2c3d4e5f6
Create Date: 2026-02-22 15:20:12.746193

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a6c1b6352e60'
down_revision: Union[str, None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Загружаем шаблоны повторяющихся транзакций
    
    # Зарплата (ежемесячно, 15-го числа)
    op.execute("""
        INSERT INTO recurring_transactions (
            id, name, amount, currency, category_id, description, type, 
            frequency, interval, start_date, next_occurrence, 
            is_active, created_at, updated_at
        ) 
        SELECT 
            gen_random_uuid(),
            'Зарплата',
            75000.00,
            'RUB',
            id,
            'Ежемесячная зарплата',
            'income',
            'monthly',
            1,
            '2026-01-15',
            '2026-03-15',
            true,
            NOW(),
            NOW()
        FROM categories 
        WHERE name = 'Зарплата' AND type = 'income' 
        LIMIT 1;
    """)
    
    # Аренда квартиры (ежемесячно, 1-го числа)
    op.execute("""
        INSERT INTO recurring_transactions (
            id, name, amount, currency, category_id, description, type, 
            frequency, interval, start_date, next_occurrence, 
            is_active, created_at, updated_at
        ) 
        SELECT 
            gen_random_uuid(),
            'Аренда',
            25000.00,
            'RUB',
            id,
            'Аренда квартиры',
            'expense',
            'monthly',
            1,
            '2026-01-01',
            '2026-03-01',
            true,
            NOW(),
            NOW()
        FROM categories 
        WHERE name = 'Жильё' AND type = 'expense' 
        LIMIT 1;
    """)
    
    # Подписка на сервисы (ежемесячно, 5-го числа)
    op.execute("""
        INSERT INTO recurring_transactions (
            id, name, amount, currency, category_id, description, type, 
            frequency, interval, start_date, next_occurrence, 
            is_active, created_at, updated_at
        ) 
        SELECT 
            gen_random_uuid(),
            'Подписки',
            1500.00,
            'RUB',
            id,
            'Подписки (Netflix, Spotify)',
            'expense',
            'monthly',
            1,
            '2026-01-05',
            '2026-03-05',
            true,
            NOW(),
            NOW()
        FROM categories 
        WHERE name = 'Связь' AND type = 'expense' 
        LIMIT 1;
    """)


def downgrade() -> None:
    # Удаляем загруженные шаблоны
    op.execute("""
        DELETE FROM recurring_transactions 
        WHERE description IN (
            'Ежемесячная зарплата',
            'Аренда квартиры',
            'Подписки (Netflix, Spotify)'
        );
    """)
