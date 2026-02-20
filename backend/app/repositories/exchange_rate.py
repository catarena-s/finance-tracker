"""Репозиторий для курсов валют"""

from datetime import date
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.exchange_rate import ExchangeRate
from app.repositories.base import BaseRepository


class ExchangeRateRepository(BaseRepository[ExchangeRate]):
    """Репозиторий для курсов валют."""

    def __init__(self, session: AsyncSession):
        super().__init__(ExchangeRate, session)

    async def get_rate(
        self, from_currency: str, to_currency: str, rate_date: date
    ) -> ExchangeRate | None:
        """Получить курс на определённую дату."""
        result = await self.session.execute(
            select(ExchangeRate).where(
                and_(
                    ExchangeRate.from_currency == from_currency.upper(),
                    ExchangeRate.to_currency == to_currency.upper(),
                    ExchangeRate.date == rate_date,
                )
            )
        )
        return result.scalar_one_or_none()

    async def get_latest_rate(
        self, from_currency: str, to_currency: str
    ) -> ExchangeRate | None:
        """Получить последний известный курс."""
        result = await self.session.execute(
            select(ExchangeRate)
            .where(
                and_(
                    ExchangeRate.from_currency == from_currency.upper(),
                    ExchangeRate.to_currency == to_currency.upper(),
                )
            )
            .order_by(ExchangeRate.date.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()

    async def bulk_create(self, rates: list[dict]) -> None:
        """Массовое создание записей курсов."""
        instances = [ExchangeRate(**r) for r in rates]
        self.session.add_all(instances)
        await self.session.commit()
