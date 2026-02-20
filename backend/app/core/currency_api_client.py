"""Клиент API курсов валют (exchangerate-api.com или аналог)."""

import logging
from typing import Any

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)


class CurrencyAPIClient:
    """Получение курсов валют через внешний API."""

    def __init__(
        self,
        base_url: str | None = None,
        api_key: str | None = None,
        timeout: float = 10.0,
    ):
        self.base_url = (base_url or settings.EXCHANGE_RATE_API_BASE).rstrip("/")
        self.api_key = api_key or settings.EXCHANGE_RATE_API_KEY
        self.timeout = timeout

    async def get_latest_rates(self, base_currency: str = "USD") -> dict[str, float]:
        """
        Получить последние курсы валют относительно base_currency.
        Возвращает словарь { "EUR": 0.92, "RUB": 95.0, ... }.
        """
        url = f"{self.base_url}/{base_currency}"
        params: dict[str, str] = {}
        if self.api_key:
            params["apikey"] = self.api_key

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                resp = await client.get(url, params=params or None)
                resp.raise_for_status()
                data: dict[str, Any] = resp.json()
        except httpx.HTTPError as e:
            logger.warning("Ошибка запроса курсов валют: %s", e)
            return {}

        rates = data.get("rates") or data.get("conversion_rates")
        if not isinstance(rates, dict):
            return {}
        return {k: float(v) for k, v in rates.items() if isinstance(v, (int, float))}
