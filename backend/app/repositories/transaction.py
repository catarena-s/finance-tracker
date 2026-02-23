"""Репозиторий для работы с транзакциями"""

from datetime import date
from decimal import Decimal
from typing import List, Tuple
from sqlalchemy import select, and_, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
import uuid

from app.models.transaction import Transaction
from app.repositories.base import BaseRepository


class TransactionRepository(BaseRepository[Transaction]):
    """Репозиторий для транзакций"""

    def __init__(self, session: AsyncSession):
        super().__init__(Transaction, session)

    async def create(self, **kwargs) -> Transaction:
        """Создать транзакцию с загрузкой категории"""
        transaction = await super().create(**kwargs)
        # Перезагрузить с категорией
        await self.session.refresh(transaction, ["category"])
        return transaction

    async def get_by_id(self, id: uuid.UUID) -> Transaction | None:
        """Получить транзакцию по ID с загрузкой категории"""
        result = await self.session.execute(
            select(Transaction)
            .options(selectinload(Transaction.category))
            .where(Transaction.id == id)
        )
        return result.scalar_one_or_none()

    async def update(self, id: uuid.UUID, data: dict) -> Transaction | None:
        """Обновить транзакцию и вернуть с загруженной категорией"""
        # Сначала обновляем через базовый метод
        transaction = await super().update(id, **data)
        if transaction is None:
            return None

        # Затем перезагружаем с категорией
        await self.session.refresh(transaction, ["category"])
        return transaction

    async def get_filtered(
        self,
        start_date: date | None = None,
        end_date: date | None = None,
        category_id: uuid.UUID | None = None,
        transaction_type: str | None = None,
        min_amount: Decimal | None = None,
        max_amount: Decimal | None = None,
        skip: int = 0,
        limit: int = 100,
    ) -> Tuple[List[Transaction], int]:
        """Получить отфильтрованные транзакции с пагинацией"""
        filters = []

        if start_date:
            filters.append(Transaction.transaction_date >= start_date)
        if end_date:
            filters.append(Transaction.transaction_date <= end_date)
        if category_id:
            filters.append(Transaction.category_id == category_id)
        if transaction_type:
            filters.append(Transaction.type == transaction_type)
        if min_amount:
            filters.append(Transaction.amount >= min_amount)
        if max_amount:
            filters.append(Transaction.amount <= max_amount)

        # Построить базовый запрос для подсчета
        count_query = select(func.count(Transaction.id))
        if filters:
            count_query = count_query.where(and_(*filters))

        # Получить общее количество
        count_result = await self.session.execute(count_query)
        total = count_result.scalar() or 0

        # Построить запрос для получения данных с eager loading категории
        query = select(Transaction).options(selectinload(Transaction.category))
        if filters:
            query = query.where(and_(*filters))

        # Получить данные с пагинацией
        query = (
            query.offset(skip)
            .limit(limit)
            .order_by(Transaction.transaction_date.desc())
        )
        result = await self.session.execute(query)
        transactions = list(result.scalars().all())

        return transactions, total

    async def get_by_date_range(
        self, start_date: date, end_date: date
    ) -> List[Transaction]:
        """Получить транзакции за период"""
        result = await self.session.execute(
            select(Transaction)
            .options(selectinload(Transaction.category))
            .where(
                and_(
                    Transaction.transaction_date >= start_date,
                    Transaction.transaction_date <= end_date,
                )
            )
            .order_by(Transaction.transaction_date.desc())
        )
        return list(result.scalars().all())
