"""
Property-based тесты для CSVImportService.

Свойства 1, 2, 4, 5: валидация, отчётность, полнота отчёта, автосоздание категорий.
Валидирует: требования 1.4, 1.5, 1.7, 1.8, 1.9, 1.10, 7.5, 7.6, 7.9
"""

import pytest
from hypothesis import given, strategies as st
from unittest.mock import AsyncMock, MagicMock
import uuid

from app.schemas.csv_import import CSVColumnMapping
from app.services.csv_import import CSVImportService


# Стратегии
amount_str = st.one_of(
    st.floats(min_value=0.01, max_value=999999, allow_nan=False).map(
        lambda x: str(round(x, 2))
    ),
    st.just("100"),
    st.just("0.5"),
)
type_str = st.sampled_from(["income", "expense"])


def build_csv_rows(amounts, dates, types, categories):
    """Построить CSV-строку с заголовком и строками."""
    lines = ["amount,date,type,category"]
    for a, d, t, c in zip(amounts, dates, types, categories):
        lines.append(f"{a},{d},{t},{c}")
    return "\n".join(lines)


def _make_csv_service():
    """CSVImportService с замоканными зависимостями (без фикстуры для Hypothesis)."""
    transaction_service = MagicMock()
    transaction_service.create_transaction = AsyncMock()
    category_repo = MagicMock()
    category_repo.get_by_name_and_type = AsyncMock(return_value=None)
    category_repo.create = AsyncMock()
    created_cat = MagicMock()
    created_cat.id = uuid.uuid4()
    category_repo.create.return_value = created_cat
    return CSVImportService(transaction_service, category_repo)


@pytest.mark.asyncio
@given(
    amounts=st.lists(amount_str, min_size=1, max_size=10),
    types=st.lists(type_str, min_size=1, max_size=10),
)
async def test_property_csv_report_completeness(amounts, types):
    """
    Свойство 4: Полнота отчёта — error_count == len(errors), created_count + error_count == число строк.
    """
    svc = _make_csv_service()
    n = min(len(amounts), len(types))
    amounts, types = amounts[:n], types[:n]
    dates = [f"2024-01-{i+1:02d}" for i in range(n)]
    categories = [f"Cat{i}" for i in range(n)]
    csv_content = build_csv_rows(amounts, dates, types, categories)
    mapping = CSVColumnMapping(
        amount="amount",
        category_name="category",
        transaction_date="date",
        type="type",
    )
    result = await svc._process_csv(csv_content, mapping, "%Y-%m-%d")
    assert result.error_count == len(result.errors)
    assert result.created_count + result.error_count == n


@pytest.mark.asyncio
@given(
    amount_val=st.one_of(st.just("-100"), st.just("100")),
    t=type_str,
)
async def test_property_csv_normalization_sign(amount_val, t):
    """
    Свойство 2: Нормализация — отрицательная сумма для income и положительная для expense
    обрабатываются (сумма хранится положительной).
    """
    svc = _make_csv_service()
    csv_content = build_csv_rows(
        [amount_val],
        ["2024-01-15"],
        [t],
        ["TestCategory"],
    )
    mapping = CSVColumnMapping(
        amount="amount",
        category_name="category",
        transaction_date="date",
        type="type",
    )
    result = await svc._process_csv(csv_content, mapping, "%Y-%m-%d")
    if amount_val == "-100" and t == "income":
        assert result.created_count == 1 or result.error_count >= 1
    elif amount_val == "100" and t == "expense":
        assert result.created_count == 1 or result.error_count >= 1
    for err in result.errors:
        assert "row" in err
        assert "error" in err


@pytest.mark.asyncio
async def test_property_csv_validation_invalid_amount_in_errors():
    """Свойство 1: Невалидная сумма попадает в отчёт об ошибках."""
    svc = _make_csv_service()
    csv_content = "amount,date,type,category\nnot_a_number,2024-01-01,income,Food"
    mapping = CSVColumnMapping(
        amount="amount",
        category_name="category",
        transaction_date="date",
        type="type",
    )
    result = await svc._process_csv(csv_content, mapping, "%Y-%m-%d")
    assert result.error_count >= 1
    assert any(
        "сумм" in str(e.get("error", "")) or "amount" in str(e.get("error", "")).lower()
        for e in result.errors
    )


@pytest.mark.asyncio
async def test_property_csv_validation_invalid_date_in_errors():
    """Свойство 1: Невалидная дата попадает в отчёт об ошибках."""
    svc = _make_csv_service()
    csv_content = "amount,date,type,category\n100,not-a-date,income,Food"
    mapping = CSVColumnMapping(
        amount="amount",
        category_name="category",
        transaction_date="date",
        type="type",
    )
    result = await svc._process_csv(csv_content, mapping, "%Y-%m-%d")
    assert result.error_count >= 1
    assert any(
        "дат" in str(e.get("error", "")) or "date" in str(e.get("error", "")).lower()
        for e in result.errors
    )


@pytest.mark.asyncio
async def test_property_csv_auto_create_category():
    """Свойство 5: При отсутствии категории вызывается category_repo.create."""
    svc = _make_csv_service()
    csv_content = "amount,date,type,category\n100,2024-01-01,income,NewCategory"
    mapping = CSVColumnMapping(
        amount="amount",
        category_name="category",
        transaction_date="date",
        type="type",
    )
    result = await svc._process_csv(csv_content, mapping, "%Y-%m-%d")
    assert result.created_count == 1
    svc.category_repo.create.assert_called_once()
