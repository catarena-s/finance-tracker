"""add_test_transactions

Revision ID: e091b1619867
Revises: 20260220000004
Create Date: 2026-02-21 17:24:38.114416

"""

from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "e091b1619867"
down_revision: Union[str, None] = "20260220000004"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Добавляем тестовые транзакции
    # Каждый INSERT должен быть отдельным вызовом op.execute() для asyncpg

    # Транзакция 1
    op.execute(
        """
        INSERT INTO transactions (id, amount, currency, category_id, description, transaction_date, type, is_recurring, created_at, updated_at)
        SELECT gen_random_uuid(), 50000.00, 'RUB', id, 'Месячная зарплата', '2024-02-18', 'income', false, NOW(), NOW()
        FROM categories WHERE name = 'Зарплата' AND type = 'income' LIMIT 1;
    """
    )

    # Транзакция 2
    op.execute(
        """
        INSERT INTO transactions (id, amount, currency, category_id, description, transaction_date, type, is_recurring, created_at, updated_at)
        SELECT gen_random_uuid(), 5000.00, 'RUB', id, 'Проездной билет', '2024-02-18', 'expense', false, NOW(), NOW()
        FROM categories WHERE name = 'Транспорт' AND type = 'expense' LIMIT 1;
    """
    )

    # Транзакция 3
    op.execute(
        """
        INSERT INTO transactions (id, amount, currency, category_id, description, transaction_date, type, is_recurring, created_at, updated_at)
        SELECT gen_random_uuid(), 1200.00, 'RUB', id, 'Покупка овощей и фруктов', '2024-02-18', 'expense', false, NOW(), NOW()
        FROM categories WHERE name = 'Продукты' AND type = 'expense' LIMIT 1;
    """
    )

    # Транзакция 4
    op.execute(
        """
        INSERT INTO transactions (id, amount, currency, category_id, description, transaction_date, type, is_recurring, created_at, updated_at)
        SELECT gen_random_uuid(), 500.00, 'RUB', id, 'Покупка хлеба и молока', '2024-02-17', 'expense', false, NOW(), NOW()
        FROM categories WHERE name = 'Продукты' AND type = 'expense' LIMIT 1;
    """
    )

    # Транзакция 5
    op.execute(
        """
        INSERT INTO transactions (id, amount, currency, category_id, description, transaction_date, type, is_recurring, created_at, updated_at)
        SELECT gen_random_uuid(), 3500.00, 'RUB', id, 'Покупка мяса и рыбы', '2024-02-20', 'expense', false, NOW(), NOW()
        FROM categories WHERE name = 'Продукты' AND type = 'expense' LIMIT 1;
    """
    )

    # Транзакция 6
    op.execute(
        """
        INSERT INTO transactions (id, amount, currency, category_id, description, transaction_date, type, is_recurring, created_at, updated_at)
        SELECT gen_random_uuid(), 15000.00, 'RUB', id, 'Ремонт автомобиля', '2024-02-20', 'expense', false, NOW(), NOW()
        FROM categories WHERE name = 'Транспорт' AND type = 'expense' LIMIT 1;
    """
    )

    # Транзакция 7
    op.execute(
        """
        INSERT INTO transactions (id, amount, currency, category_id, description, transaction_date, type, is_recurring, created_at, updated_at)
        SELECT gen_random_uuid(), 2500.50, 'RUB', id, 'Покупка продуктов в магазине Пятёрочка', '2024-02-19', 'expense', false, NOW(), NOW()
        FROM categories WHERE name = 'Продукты' AND type = 'expense' LIMIT 1;
    """
    )

    # Транзакции за февраль 2026
    # Транзакция 8
    op.execute(
        """
        INSERT INTO transactions (id, amount, currency, category_id, description, transaction_date, type, is_recurring, created_at, updated_at)
        SELECT gen_random_uuid(), 50000.00, 'USD', id, 'Зарплата за февраль', '2026-02-19', 'income', false, NOW(), NOW()
        FROM categories WHERE name = 'Зарплата' AND type = 'income' LIMIT 1;
    """
    )

    # Транзакция 9
    op.execute(
        """
        INSERT INTO transactions (id, amount, currency, category_id, description, transaction_date, type, is_recurring, created_at, updated_at)
        SELECT gen_random_uuid(), 1500.00, 'USD', id, 'Покупка продуктов', '2026-02-19', 'expense', false, NOW(), NOW()
        FROM categories WHERE name = 'Продукты' AND type = 'expense' LIMIT 1;
    """
    )

    # Транзакция 10
    op.execute(
        """
        INSERT INTO transactions (id, amount, currency, category_id, description, transaction_date, type, is_recurring, created_at, updated_at)
        SELECT gen_random_uuid(), 800.00, 'USD', id, 'Кофе в кафе', '2026-02-18', 'expense', false, NOW(), NOW()
        FROM categories WHERE name = 'Продукты' AND type = 'expense' LIMIT 1;
    """
    )

    # Транзакция 11
    op.execute(
        """
        INSERT INTO transactions (id, amount, currency, category_id, description, transaction_date, type, is_recurring, created_at, updated_at)
        SELECT gen_random_uuid(), 3000.00, 'USD', id, 'Ужин в ресторане', '2026-02-18', 'expense', false, NOW(), NOW()
        FROM categories WHERE name = 'Продукты' AND type = 'expense' LIMIT 1;
    """
    )


def downgrade() -> None:
    # Удаляем тестовые транзакции
    op.execute(
        """
        DELETE FROM transactions WHERE description IN (
            'Месячная зарплата',
            'Проездной билет',
            'Покупка овощей и фруктов',
            'Покупка хлеба и молока',
            'Покупка мяса и рыбы',
            'Ремонт автомобиля',
            'Покупка продуктов в магазине Пятёрочка',
            'Зарплата за февраль',
            'Покупка продуктов',
            'Кофе в кафе',
            'Ужин в ресторане'
        );
    """
    )
