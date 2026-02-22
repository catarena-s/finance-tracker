"""add_app_settings_table

Revision ID: 68a28a4c61c8
Revises: 7f8d70c5dd82
Create Date: 2026-02-22 12:05:41.411960

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '68a28a4c61c8'
down_revision: Union[str, None] = '7f8d70c5dd82'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Создание таблицы app_settings
    op.create_table(
        'app_settings',
        sa.Column('key', sa.String(length=100), nullable=False),
        sa.Column('value', sa.Text(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('key')
    )
    op.create_index(op.f('ix_app_settings_key'), 'app_settings', ['key'], unique=False)
    
    # Добавление начальных настроек
    op.execute("""
        INSERT INTO app_settings (key, value, description) VALUES
        ('recurring_task_hour', '0', 'Час запуска задачи создания повторяющихся транзакций (UTC, 0-23)'),
        ('recurring_task_minute', '0', 'Минута запуска задачи создания повторяющихся транзакций (0-59)')
    """)


def downgrade() -> None:
    op.drop_index(op.f('ix_app_settings_key'), table_name='app_settings')
    op.drop_table('app_settings')
