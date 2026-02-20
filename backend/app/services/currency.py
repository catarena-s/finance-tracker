"""Сервис для работы с валютами и конвертацией."""

from datetime import date
from decimal import Decimal

from app.repositories.currency import CurrencyRepository
from app.repositories.exchange_rate import ExchangeRateRepository
from app.schemas.currency import Currency
from app.core.exceptions import NotFoundException


class CurrencyService:
    """Сервис валют и конвертации сумм."""

    def __init__(
        self,
        currency_repo: CurrencyRepository,
        exchange_rate_repo: ExchangeRateRepository,
    ):
        self.currency_repo = currency_repo
        self.exchange_rate_repo = exchange_rate_repo

    async def get_currencies(self) -> list[Currency]:
        """Список активных валют."""
        items = await self.currency_repo.get_active_currencies()
        return [Currency.model_validate(c) for c in items]

    async def get_by_code(self, code: str) -> Currency | None:
        """Получить валюту по коду."""
        c = await self.currency_repo.get_by_code(code)
        return Currency.model_validate(c) if c else None

    async def convert_amount(
        self,
        amount: Decimal,
        from_currency: str,
        to_currency: str,
        rate_date: date,
    ) -> Decimal:
        """Конвертировать сумму из одной валюты в другую на дату."""
        if from_currency.upper() == to_currency.upper():
            return amount

        rate = await self.exchange_rate_repo.get_rate(
            from_currency, to_currency, rate_date
        )
        if not rate:
            rate = await self.exchange_rate_repo.get_latest_rate(
                from_currency, to_currency
            )
        if not rate:
            raise NotFoundException(f"Курс не найден: {from_currency} -> {to_currency}")
        return amount * rate.rate
