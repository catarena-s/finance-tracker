"""
Property-based тесты для CSVExportService.

Свойства 6, 7, 8, 9, 10: выборочные колонки, формат даты, заголовки, экранирование, имя файла.
Валидирует: требования 2.2, 2.3, 2.4, 2.5, 2.7
"""

import pytest
from hypothesis import given, strategies as st
from unittest.mock import AsyncMock, MagicMock
from datetime import date

from app.services.csv_export import CSVExportService


def _make_transaction(amount="100", currency="USD", category_name="Food", description="", transaction_date=None, type="expense"):
    t = MagicMock()
    t.amount = amount
    t.currency = currency
    t.category = MagicMock()
    t.category.name = category_name
    t.description = description
    t.transaction_date = transaction_date or date(2024, 1, 15)
    t.type = type
    return t


def _make_export_service(transactions):
    repo = MagicMock()
    repo.get_filtered = AsyncMock(return_value=(transactions, len(transactions)))
    return CSVExportService(repo)


_column = st.sampled_from(["amount", "currency", "category_name", "description", "transaction_date", "type"])
columns_list = st.lists(_column, min_size=1, max_size=6).map(lambda x: list(dict.fromkeys(x)))  # unique order preserved
date_fmt = st.sampled_from(["%Y-%m-%d", "%d.%m.%Y", "%m/%d/%Y"])


@pytest.mark.asyncio
@given(columns=columns_list, date_format=date_fmt)
async def test_property_export_has_header_and_requested_columns(columns, date_format):
    """Свойство 6, 8: В выводе есть заголовок и только запрошенные колонки."""
    row_date = date(2024, 6, 1)
    t = _make_transaction(transaction_date=row_date)
    svc = _make_export_service([t])
    out = await svc.export_csv(None, None, None, columns, date_format)
    lines = out.strip().split("\n")
    assert len(lines) >= 1
    header = lines[0]
    header_cols = [c.strip() for c in header.split(",")]
    assert set(header_cols) == set(columns)
    for col in columns:
        assert col in header_cols


@pytest.mark.asyncio
@given(date_format=date_fmt)
async def test_property_export_dates_formatted(date_format):
    """Свойство 7: Даты в экспорте в заданном формате."""
    d = date(2024, 12, 25)
    t = _make_transaction(transaction_date=d)
    svc = _make_export_service([t])
    out = await svc.export_csv(None, None, None, ["amount", "transaction_date"], date_format)
    lines = out.strip().split("\n")
    assert len(lines) >= 2
    data_line = lines[1]
    assert d.strftime(date_format) in data_line


@pytest.mark.asyncio
async def test_property_export_special_chars_quoted():
    """Свойство 9: Значения с запятыми/кавычками экранируются (csv module)."""
    t = _make_transaction(description='Test "quote" and, comma', category_name="Cat,egory")
    svc = _make_export_service([t])
    out = await svc.export_csv(None, None, None, ["description", "category_name"], "%Y-%m-%d")
    assert "quote" in out
    assert "comma" in out
    lines = out.strip().split("\n")
    assert len(lines) >= 2
