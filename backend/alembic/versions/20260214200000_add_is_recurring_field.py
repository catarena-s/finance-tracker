"""Add is_recurring field to transactions

Revision ID: 20260214200000
Revises: 20260214185500
Create Date: 2026-02-14 20:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '20260214200000'
down_revision: Union[str, None] = '20260214185500'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add is_recurring column to transactions table
    op.add_column('transactions', sa.Column('is_recurring', sa.Boolean(), nullable=False, server_default='false'))


def downgrade() -> None:
    # Remove is_recurring column from transactions table
    op.drop_column('transactions', 'is_recurring')
