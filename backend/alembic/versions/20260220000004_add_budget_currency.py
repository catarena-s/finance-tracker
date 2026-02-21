"""add currency to budgets

Revision ID: 20260220000004
Revises: 20260220000003
Create Date: 2026-02-20

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "20260220000004"
down_revision: Union[str, None] = "20260220000003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "budgets",
        sa.Column(
            "currency", sa.String(length=3), nullable=False, server_default="USD"
        ),
    )
    op.create_check_constraint(
        "ck_budget_currency_iso4217",
        "budgets",
        "currency ~ '^[A-Z]{3}$'",
    )


def downgrade() -> None:
    op.drop_constraint("ck_budget_currency_iso4217", "budgets", type_="check")
    op.drop_column("budgets", "currency")
