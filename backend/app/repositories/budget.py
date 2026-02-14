"""Репозиторий для работы с бюджетами"""
from datetime import date
from typing import List
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
import uuid

from app.models.budget import Budget
from app.repositories.base import BaseRepository


class BudgetRepository(BaseRepository[Budget]):
    """Репозиторий для бюджетов"""
    
    def __init__(self, session: AsyncSession):
        super().__init__(Budget, session)
    
    async def get_by_category_and_period(
        self, category_id: uuid.UUID, period: str, start_date: date
    ) -> Budget | None:
        """Получить бюджет по категории, периоду и дате начала"""
        result = await self.session.execute(
            select(Budget).where(
                and_(
                    Budget.category_id == category_id,
                    Budget.period == period,
                    Budget.start_date == start_date
                )
            )
        )
        return result.scalar_one_or_none()
    
    async def get_active_budgets(self, current_date: date) -> List[Budget]:
        """Получить активные бюджеты на текущую дату"""
        result = await self.session.execute(
            select(Budget).where(
                and_(
                    Budget.start_date <= current_date,
                    Budget.end_date >= current_date
                )
            )
        )
        return list(result.scalars().all())
