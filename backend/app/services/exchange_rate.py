"""Сервис обновления и получения курсов валют."""

import logging
from datetime import date
from decimal import Decimal

from app.core.currency_api_client import CurrencyAPIClient
from app.repositories.exchange_rate import ExchangeRateRepository
from app.repositories.currency import CurrencyRepository
from app.schemas.currency import ExchangeRate
from app.core.exceptions import NotFoundException

logger = logging.getLogger(__name__)


class ExchangeRateService:
    """Сервис курсов валют с интеграцией внешнего API и кэшем."""

    def __init__(
        self,
        exchange_rate_repo: ExchangeRateRepository,
        currency_repo: CurrencyRepository,
        api_client: CurrencyAPIClient | None = None,
    ):
        self.exchange_rate_repo = exchange_rate_repo
        self.currency_repo = currency_repo
        self.api_client = api_client or CurrencyAPIClient()

    async def update_rates(self, base_currency: str = "USD") -> dict:
        """Обновить курсы валют из API и сохранить в БД."""
        rates_data = await self.api_client.get_latest_rates(base_currency)
        if not rates_data:
            return {"success": False, "error": "Нет данных от API", "updated_count": 0}

        currencies = await self.currency_repo.get_active_currencies()
        codes = [c.code for c in currencies]
        today = date.today()
        to_save = []
        for to_code in codes:
            if to_code == base_currency:
                continue
            if to_code not in rates_data:
                continue
            to_save.append(
                {
                    "from_currency": base_currency,
                    "to_currency": to_code,
                    "rate": Decimal(str(rates_data[to_code])),
                    "date": today,
                }
            )
        if to_save:
            await self.exchange_rate_repo.bulk_create(to_save)
        return {
            "success": True,
            "updated_count": len(to_save),
            "date": today.isoformat(),
        }

    async def get_rate(
        self, from_currency: str, to_currency: str, rate_date: date
    ) -> ExchangeRate:
        """Получить курс на дату; при отсутствии — последний известный."""
        rate = await self.exchange_rate_repo.get_rate(
            from_currency, to_currency, rate_date
        )
        if not rate:
            rate = await self.exchange_rate_repo.get_latest_rate(
                from_currency, to_currency
            )
        if not rate:
            raise NotFoundException(f"Курс не найден: {from_currency} -> {to_currency}")
        return ExchangeRate.model_validate(rate)
