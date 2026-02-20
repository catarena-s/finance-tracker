"""add task_results and recurring_template_id to transactions

Revision ID: 20260220000003
Revises: 20260220000002
Create Date: 2026-02-20

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "20260220000003"
down_revision: Union[str, None] = "20260220000002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "task_results",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("task_id", sa.String(length=255), nullable=False),
        sa.Column("task_type", sa.String(length=50), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("result", postgresql.JSONB(), nullable=True),
        sa.Column("error", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_task_results_task_id"), "task_results", ["task_id"], unique=True
    )
    op.create_index(
        op.f("ix_task_results_task_type"), "task_results", ["task_type"], unique=False
    )
    op.create_index(
        op.f("ix_task_results_status"), "task_results", ["status"], unique=False
    )

    op.add_column(
        "transactions",
        sa.Column(
            "recurring_template_id", postgresql.UUID(as_uuid=True), nullable=True
        ),
    )
    op.create_foreign_key(
        "fk_transactions_recurring_template_id",
        "transactions",
        "recurring_transactions",
        ["recurring_template_id"],
        ["id"],
        ondelete="SET NULL",
    )


def downgrade() -> None:
    op.drop_constraint(
        "fk_transactions_recurring_template_id", "transactions", type_="foreignkey"
    )
    op.drop_column("transactions", "recurring_template_id")

    op.drop_index(op.f("ix_task_results_status"), table_name="task_results")
    op.drop_index(op.f("ix_task_results_task_type"), table_name="task_results")
    op.drop_index(op.f("ix_task_results_task_id"), table_name="task_results")
    op.drop_table("task_results")
