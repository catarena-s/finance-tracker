"""add recurring_transactions table

Revision ID: 20260220000001
Revises: 297d11cd0e3e
Create Date: 2026-02-20

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "20260220000001"
down_revision: Union[str, None] = "297d11cd0e3e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "recurring_transactions",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("amount", sa.Numeric(precision=15, scale=2), nullable=False),
        sa.Column("currency", sa.String(length=3), nullable=False),
        sa.Column("category_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("type", sa.String(length=10), nullable=False),
        sa.Column("frequency", sa.String(length=20), nullable=False),
        sa.Column("interval", sa.Integer(), nullable=False),
        sa.Column("start_date", sa.Date(), nullable=False),
        sa.Column("end_date", sa.Date(), nullable=True),
        sa.Column("next_occurrence", sa.Date(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.Column(
            "updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.ForeignKeyConstraint(["category_id"], ["categories.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
        sa.CheckConstraint("amount > 0", name="ck_recurring_amount_positive"),
        sa.CheckConstraint("type IN ('income', 'expense')", name="ck_recurring_type"),
        sa.CheckConstraint(
            "frequency IN ('daily', 'weekly', 'monthly', 'yearly')",
            name="ck_recurring_frequency",
        ),
        sa.CheckConstraint("interval > 0", name="ck_recurring_interval_positive"),
        sa.CheckConstraint("currency ~ '^[A-Z]{3}$'", name="ck_recurring_currency_iso4217"),
    )
    op.create_index(
        op.f("ix_recurring_transactions_next_occurrence"),
        "recurring_transactions",
        ["next_occurrence"],
        unique=False,
    )
    op.create_index(
        op.f("ix_recurring_transactions_is_active"),
        "recurring_transactions",
        ["is_active"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(
        op.f("ix_recurring_transactions_is_active"), table_name="recurring_transactions"
    )
    op.drop_index(
        op.f("ix_recurring_transactions_next_occurrence"),
        table_name="recurring_transactions",
    )
    op.drop_table("recurring_transactions")
