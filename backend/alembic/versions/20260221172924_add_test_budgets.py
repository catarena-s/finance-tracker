"""add_test_budgets

Revision ID: 7f8d70c5dd82
Revises: e091b1619867
Create Date: 2026-02-21 17:29:24.730006

"""

from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "7f8d70c5dd82"
down_revision: Union[str, None] = "e091b1619867"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Добавляем тестовые бюджеты
    # Бюджет на продукты (месячный)
    op.execute(
        """
        INSERT INTO budgets (id, category_id, amount, currency, period, start_date, end_date, created_at, updated_at)
        SELECT gen_random_uuid(), id, 15000.00, 'RUB', 'monthly', '2026-02-01', '2026-02-28', NOW(), NOW()
        FROM categories WHERE name = 'Продукты' AND type = 'expense' LIMIT 1;
    """
    )

    # Бюджет на транспорт (месячный)
    op.execute(
        """
        INSERT INTO budgets (id, category_id, amount, currency, period, start_date, end_date, created_at, updated_at)
        SELECT gen_random_uuid(), id, 10000.00, 'RUB', 'monthly', '2026-02-01', '2026-02-28', NOW(), NOW()
        FROM categories WHERE name = 'Транспорт' AND type = 'expense' LIMIT 1;
    """
    )

    # Бюджет на развлечения (месячный)
    op.execute(
        """
        INSERT INTO budgets (id, category_id, amount, currency, period, start_date, end_date, created_at, updated_at)
        SELECT gen_random_uuid(), id, 5000.00, 'RUB', 'monthly', '2026-02-01', '2026-02-28', NOW(), NOW()
        FROM categories WHERE name = 'Развлечения' AND type = 'expense' LIMIT 1;
    """
    )


def downgrade() -> None:
    # Удаляем тестовые бюджеты
    op.execute(
        """
        DELETE FROM budgets 
        WHERE start_date = '2026-02-01' 
        AND end_date = '2026-02-28'
        AND period = 'monthly';
    """
    )
