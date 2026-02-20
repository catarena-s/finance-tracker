"""Репозиторий для шаблонов повторяющихся транзакций"""

from datetime import date
from sqlalchemy import select, and_, or_, update
from sqlalchemy.ext.asyncio import AsyncSession
import uuid

from app.models.recurring_transaction import RecurringTransaction
from app.repositories.base import BaseRepository


class RecurringTransactionRepository(BaseRepository[RecurringTransaction]):
    """Репозиторий для шаблонов повторяющихся транзакций"""

    def __init__(self, session: AsyncSession):
        super().__init__(RecurringTransaction, session)

    async def get_active_due_today(
        self, current_date: date
    ) -> list[RecurringTransaction]:
        """Получить активные шаблоны, которые должны быть выполнены на указанную дату."""
        result = await self.session.execute(
            select(RecurringTransaction).where(
                and_(
                    RecurringTransaction.is_active.is_(True),
                    RecurringTransaction.next_occurrence <= current_date,
                    or_(
                        RecurringTransaction.end_date.is_(None),
                        RecurringTransaction.end_date >= current_date,
                    ),
                )
            )
        )
        return list(result.scalars().all())

    async def update_next_occurrence(
        self, recurring_id: uuid.UUID, next_date: date
    ) -> None:
        """Обновить дату следующего выполнения."""
        await self.session.execute(
            update(RecurringTransaction)
            .where(RecurringTransaction.id == recurring_id)
            .values(next_occurrence=next_date)
        )
        await self.session.commit()
