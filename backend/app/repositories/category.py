"""Репозиторий для работы с категориями"""

from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
import uuid

from app.models.category import Category
from app.models.transaction import Transaction
from app.repositories.base import BaseRepository


class CategoryRepository(BaseRepository[Category]):
    """Репозиторий для категорий"""

    def __init__(self, session: AsyncSession):
        super().__init__(Category, session)

    async def get_by_name_and_type(self, name: str, type: str) -> Category | None:
        """Получить категорию по имени и типу"""
        result = await self.session.execute(
            select(Category).where(and_(Category.name == name, Category.type == type))
        )
        return result.scalar_one_or_none()

    async def has_transactions(self, category_id: uuid.UUID) -> bool:
        """Проверить наличие транзакций у категории"""
        result = await self.session.execute(
            select(func.count(Transaction.id)).where(
                Transaction.category_id == category_id
            )
        )
        count = result.scalar()
        return count > 0
