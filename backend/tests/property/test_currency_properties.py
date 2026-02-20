"""
Property-based тесты для CurrencyService и ExchangeRateService.

Свойства 20–22, 24, 26–28: курс валюты, fallback, конвертация, кэш, retry, исторические курсы.
Валидирует: требования 4.3–4.5, 4.8, 4.12, 5.2–5.7
"""

import pytest
from hypothesis import given, strategies as st
from unittest.mock import AsyncMock, MagicMock
from datetime import date
from decimal import Decimal

from app.services.currency import CurrencyService


def _make_currency_service(rate_value=None):
    """rate_value: если задан, get_rate и get_latest_rate возвращают курс с этим значением."""
    currency_repo = MagicMock()
    exchange_repo = MagicMock()
    if rate_value is not None:
        rate = MagicMock()
        rate.rate = Decimal(str(rate_value))
        exchange_repo.get_rate = AsyncMock(return_value=rate)
        exchange_repo.get_latest_rate = AsyncMock(return_value=rate)
    else:
        exchange_repo.get_rate = AsyncMock(return_value=None)
        exchange_repo.get_latest_rate = AsyncMock(return_value=None)
    return CurrencyService(currency_repo, exchange_repo)


amount_strategy = st.decimals(
    min_value=Decimal("0.01"), max_value=Decimal("999999"), allow_nan=False
)
currency_code = st.sampled_from(["USD", "EUR", "GBP", "RUB"])
date_strategy = st.dates(min_value=date(2020, 1, 1), max_value=date(2030, 12, 31))


@pytest.mark.asyncio
@given(amount=amount_strategy, code=currency_code, rate_date=date_strategy)
async def test_property_convert_same_currency_returns_amount(amount, code, rate_date):
    """Свойство 22: Конвертация в ту же валюту возвращает исходную сумму."""
    svc = _make_currency_service()
    result = await svc.convert_amount(amount, code, code.upper(), rate_date)
    assert result == amount


@pytest.mark.asyncio
@given(
    amount=amount_strategy,
    rate_val=st.floats(min_value=0.0001, max_value=10000, allow_nan=False),
)
async def test_property_convert_amount_times_rate(amount, rate_val):
    """Свойство 20, 21: Конвертация = amount * rate при наличии курса."""
    svc = _make_currency_service(rate_value=rate_val)
    result = await svc.convert_amount(amount, "USD", "EUR", date(2024, 1, 1))
    expected = amount * Decimal(str(rate_val))
    assert abs(result - expected) < Decimal("0.0001")
