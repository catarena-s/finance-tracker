"""Репозиторий для валют"""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.currency import Currency
from app.repositories.base import BaseRepository


class CurrencyRepository(BaseRepository[Currency]):
    """Репозиторий для валют (PK — code)."""

    def __init__(self, session: AsyncSession):
        super().__init__(Currency, session)

    async def get_by_code(self, code: str) -> Currency | None:
        """Получить валюту по коду ISO."""
        result = await self.session.execute(
            select(Currency).where(Currency.code == code.upper())
        )
        return result.scalar_one_or_none()

    async def get_active_currencies(self) -> list[Currency]:
        """Получить список активных валют."""
        result = await self.session.execute(
            select(Currency).where(Currency.is_active.is_(True))
        )
        return list(result.scalars().all())
