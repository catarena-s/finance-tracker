"""add currencies and exchange_rates tables with seed data

Revision ID: 20260220000002
Revises: 20260220000001
Create Date: 2026-02-20

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "20260220000002"
down_revision: Union[str, None] = "20260220000001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

CURRENCIES = [
    ("USD", "US Dollar", "$"),
    ("EUR", "Euro", "€"),
    ("GBP", "British Pound", "£"),
    ("JPY", "Japanese Yen", "¥"),
    ("CNY", "Chinese Yuan", "¥"),
    ("RUB", "Russian Ruble", "₽"),
    ("INR", "Indian Rupee", "₹"),
    ("BRL", "Brazilian Real", "R$"),
    ("CAD", "Canadian Dollar", "C$"),
    ("AUD", "Australian Dollar", "A$"),
]


def upgrade() -> None:
    op.create_table(
        "currencies",
        sa.Column("code", sa.String(length=3), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("symbol", sa.String(length=10), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.PrimaryKeyConstraint("code"),
    )

    conn = op.get_bind()
    for code, name, symbol in CURRENCIES:
        conn.execute(
            sa.text(
                "INSERT INTO currencies (code, name, symbol, is_active) "
                "VALUES (:code, :name, :symbol, true)"
            ).bindparams(code=code, name=name, symbol=symbol)
        )

    op.create_table(
        "exchange_rates",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("from_currency", sa.String(length=3), nullable=False),
        sa.Column("to_currency", sa.String(length=3), nullable=False),
        sa.Column("rate", sa.Numeric(precision=20, scale=10), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.ForeignKeyConstraint(
            ["from_currency"], ["currencies.code"], ondelete="RESTRICT"
        ),
        sa.ForeignKeyConstraint(
            ["to_currency"], ["currencies.code"], ondelete="RESTRICT"
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "from_currency", "to_currency", "date", name="uq_exchange_rate_per_day"
        ),
        sa.CheckConstraint("rate > 0", name="ck_exchange_rate_positive"),
    )


def downgrade() -> None:
    op.drop_table("exchange_rates")
    op.drop_table("currencies")
