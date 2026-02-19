"""add_default_categories

Revision ID: 297d11cd0e3e
Revises: 20260214200000
Create Date: 2026-02-19 20:41:25.375685

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '297d11cd0e3e'
down_revision: Union[str, None] = '20260214200000'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Добавляем базовые категории расходов
    op.execute("""
        INSERT INTO categories (name, type, color, description, created_at, updated_at)
        VALUES
            ('Продукты', 'expense', '#FF6B6B', 'Покупки продуктов питания', NOW(), NOW()),
            ('Транспорт', 'expense', '#4ECDC4', 'Расходы на транспорт', NOW(), NOW()),
            ('Жильё', 'expense', '#45B7D1', 'Аренда, коммунальные услуги', NOW(), NOW()),
            ('Здоровье', 'expense', '#96CEB4', 'Медицина, аптека', NOW(), NOW()),
            ('Развлечения', 'expense', '#FFEAA7', 'Кино, рестораны, хобби', NOW(), NOW()),
            ('Одежда', 'expense', '#DFE6E9', 'Покупка одежды и обуви', NOW(), NOW()),
            ('Образование', 'expense', '#74B9FF', 'Курсы, книги, обучение', NOW(), NOW()),
            ('Связь', 'expense', '#A29BFE', 'Интернет, мобильная связь', NOW(), NOW()),
            ('Прочее', 'expense', '#B2BEC3', 'Прочие расходы', NOW(), NOW())
        ON CONFLICT (name, type) DO NOTHING;
    """)
    
    # Добавляем базовые категории доходов
    op.execute("""
        INSERT INTO categories (name, type, color, description, created_at, updated_at)
        VALUES
            ('Зарплата', 'income', '#00B894', 'Основной доход', NOW(), NOW()),
            ('Фриланс', 'income', '#00CEC9', 'Доход от фриланса', NOW(), NOW()),
            ('Инвестиции', 'income', '#FDCB6E', 'Дивиденды, проценты', NOW(), NOW()),
            ('Подарки', 'income', '#E17055', 'Подарки, призы', NOW(), NOW()),
            ('Прочее', 'income', '#636E72', 'Прочие доходы', NOW(), NOW())
        ON CONFLICT (name, type) DO NOTHING;
    """)


def downgrade() -> None:
    # Удаляем базовые категории
    op.execute("""
        DELETE FROM categories WHERE name IN (
            'Продукты', 'Транспорт', 'Жильё', 'Здоровье', 'Развлечения',
            'Одежда', 'Образование', 'Связь', 'Зарплата', 'Фриланс',
            'Инвестиции', 'Подарки'
        ) OR (name = 'Прочее' AND type IN ('expense', 'income'));
    """)
