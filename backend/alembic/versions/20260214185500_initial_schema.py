"""Initial schema

Revision ID: 20260214185500
Revises: 
Create Date: 2026-02-14 18:55:00.000000

"""

from typing import Sequence, Union


# revision identifiers, used by Alembic.
revision: str = "20260214185500"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    Placeholder for initial schema migration
    Will be populated when models are created
    """
    pass


def downgrade() -> None:
    """
    Placeholder for downgrade
    """
    pass
