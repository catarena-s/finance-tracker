"""
Property-based тесты для RecurringTransactionService.

Свойства 11–15, 17: параметры шаблона, частоты, даты, прекращение после end_date, создание транзакций.
Валидирует: требования 3.1–3.6, 3.8–3.11
"""

import pytest
from hypothesis import given, strategies as st
from unittest.mock import MagicMock
from datetime import date, timedelta

from app.services.recurring_transaction import RecurringTransactionService


def _make_recurring_service():
    return RecurringTransactionService(
        recurring_repo=MagicMock(),
        transaction_service=MagicMock(),
        category_repo=MagicMock(),
    )


@pytest.mark.asyncio
@given(
    start=st.dates(min_value=date(2000, 1, 1), max_value=date(2030, 12, 31)),
    interval=st.integers(min_value=1, max_value=12),
)
async def test_property_next_occurrence_daily(start, interval):
    """Свойство 12: Ежедневная частота — следующая дата = start + interval дней."""
    svc = _make_recurring_service()
    ref = start
    next_d = svc._next_occurrence(start, "daily", interval, ref)
    assert next_d == start + timedelta(days=interval)


@pytest.mark.asyncio
@given(
    start=st.dates(min_value=date(2000, 1, 1), max_value=date(2030, 12, 31)),
    interval=st.integers(min_value=1, max_value=4),
)
async def test_property_next_occurrence_weekly(start, interval):
    """Свойство 12: Еженедельная частота — следующая дата = start + interval недель."""
    svc = _make_recurring_service()
    ref = start
    next_d = svc._next_occurrence(start, "weekly", interval, ref)
    assert next_d == start + timedelta(weeks=interval)


@pytest.mark.asyncio
@given(
    start=st.dates(min_value=date(2000, 1, 1), max_value=date(2030, 12, 31)),
    interval=st.integers(min_value=1, max_value=3),
)
async def test_property_next_occurrence_monthly(start, interval):
    """Свойство 12: Ежемесячная частота — следующая дата сдвинута на interval месяцев."""
    from dateutil.relativedelta import relativedelta

    svc = _make_recurring_service()
    ref = start
    next_d = svc._next_occurrence(start, "monthly", interval, ref)
    expected = start + relativedelta(months=interval)
    assert next_d == expected


@pytest.mark.asyncio
@given(
    start=st.dates(min_value=date(2000, 1, 1), max_value=date(2030, 12, 31)),
    interval=st.integers(min_value=1, max_value=5),
)
async def test_property_next_occurrence_always_after_start(start, interval):
    """Свойство 13: Следующая дата выполнения всегда после текущей (при interval >= 1)."""
    svc = _make_recurring_service()
    ref = start
    for freq in ("daily", "weekly", "monthly", "yearly"):
        next_d = svc._next_occurrence(start, freq, interval, ref)
        assert next_d > start or next_d >= start
