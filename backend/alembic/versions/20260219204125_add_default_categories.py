"""add_default_categories

Revision ID: 297d11cd0e3e
Revises: 20260214200000
Create Date: 2026-02-19 20:41:25.375685

"""

from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "297d11cd0e3e"
down_revision: Union[str, None] = "20260214200000"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Добавляем базовые категории расходов
    op.execute(
        """
        INSERT INTO categories (id, name, icon, type, color, created_at, updated_at)
        VALUES
            (gen_random_uuid(), 'Продукты', '🛒', 'expense', '#FF6B6B', NOW(), NOW()),
            (gen_random_uuid(), 'Транспорт', '🚗', 'expense', '#4ECDC4', NOW(), NOW()),
            (gen_random_uuid(), 'Жильё', '🏠', 'expense', '#45B7D1', NOW(), NOW()),
            (gen_random_uuid(), 'Здоровье', '💊', 'expense', '#96CEB4', NOW(), NOW()),
            (gen_random_uuid(), 'Развлечения', '🎬', 'expense', '#FFEAA7', NOW(), NOW()),
            (gen_random_uuid(), 'Одежда', '👕', 'expense', '#DFE6E9', NOW(), NOW()),
            (gen_random_uuid(), 'Образование', '📚', 'expense', '#74B9FF', NOW(), NOW()),
            (gen_random_uuid(), 'Связь', '📱', 'expense', '#A29BFE', NOW(), NOW()),
            (gen_random_uuid(), 'Прочее', '📦', 'expense', '#B2BEC3', NOW(), NOW())
        ON CONFLICT (name, type) DO NOTHING;
    """
    )

    # Добавляем базовые категории доходов
    op.execute(
        """
        INSERT INTO categories (id, name, icon, type, color, created_at, updated_at)
        VALUES
            (gen_random_uuid(), 'Зарплата', '💰', 'income', '#00B894', NOW(), NOW()),
            (gen_random_uuid(), 'Фриланс', '💻', 'income', '#00CEC9', NOW(), NOW()),
            (gen_random_uuid(), 'Инвестиции', '📈', 'income', '#FDCB6E', NOW(), NOW()),
            (gen_random_uuid(), 'Подарки', '🎁', 'income', '#E17055', NOW(), NOW()),
            (gen_random_uuid(), 'Прочее', '💵', 'income', '#636E72', NOW(), NOW())
        ON CONFLICT (name, type) DO NOTHING;
    """
    )


def downgrade() -> None:
    # Удаляем базовые категории
    op.execute(
        """
        DELETE FROM categories WHERE name IN (
            'Продукты', 'Транспорт', 'Жильё', 'Здоровье', 'Развлечения',
            'Одежда', 'Образование', 'Связь', 'Зарплата', 'Фриланс',
            'Инвестиции', 'Подарки'
        ) OR (name = 'Прочее' AND type IN ('expense', 'income'));
    """
    )
