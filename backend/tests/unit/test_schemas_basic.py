"""Базовые тесты для Pydantic схем"""
import pytest
from datetime import date
from decimal import Decimal
import uuid
from pydantic import ValidationError

from app.schemas.category import CategoryCreate, CategoryType
from app.schemas.transaction import TransactionCreate, TransactionType, RecurringPattern
from app.schemas.budget import BudgetCreate, BudgetPeriod


def test_category_create_valid():
    """Тест создания валидной категории"""
    category = CategoryCreate(
        name="Groceries",
        icon="shopping-cart",
        color="#FF5733",
        type=CategoryType.EXPENSE
    )
    assert category.name == "Groceries"
    assert category.color == "#FF5733"
    assert category.type == CategoryType.EXPENSE


def test_category_invalid_color():
    """Тест невалидного hex цвета"""
    with pytest.raises(ValidationError) as exc_info:
        CategoryCreate(
            name="Groceries",
            icon="shopping-cart",
            color="FF5733",  # Missing #
            type=CategoryType.EXPENSE
        )
    assert "color" in str(exc_info.value)


def test_transaction_create_valid():
    """Тест создания валидной транзакции"""
    transaction = TransactionCreate(
        amount=Decimal("100.50"),
        currency="USD",
        category_id=uuid.uuid4(),
        description="Test transaction",
        transaction_date=date.today(),
        type=TransactionType.EXPENSE,
        is_recurring=False
    )
    assert transaction.amount == Decimal("100.50")
    assert transaction.currency == "USD"
    assert transaction.type == TransactionType.EXPENSE


def test_transaction_negative_amount():
    """Тест отрицательной суммы транзакции"""
    with pytest.raises(ValidationError) as exc_info:
        TransactionCreate(
            amount=Decimal("-100.50"),
            currency="USD",
            category_id=uuid.uuid4(),
            transaction_date=date.today(),
            type=TransactionType.EXPENSE
        )
    assert "amount" in str(exc_info.value)


def test_transaction_recurring_pattern_required():
    """Тест обязательности recurring_pattern для повторяющихся транзакций"""
    with pytest.raises(ValidationError) as exc_info:
        TransactionCreate(
            amount=Decimal("100.50"),
            currency="USD",
            category_id=uuid.uuid4(),
            transaction_date=date.today(),
            type=TransactionType.EXPENSE,
            is_recurring=True,
            recurring_pattern=None
        )
    assert "recurring_pattern" in str(exc_info.value)


def test_transaction_with_recurring_pattern():
    """Тест транзакции с паттерном повторения"""
    pattern = RecurringPattern(frequency="monthly", interval=1)
    transaction = TransactionCreate(
        amount=Decimal("100.50"),
        currency="USD",
        category_id=uuid.uuid4(),
        transaction_date=date.today(),
        type=TransactionType.EXPENSE,
        is_recurring=True,
        recurring_pattern=pattern
    )
    assert transaction.is_recurring is True
    assert transaction.recurring_pattern.frequency == "monthly"
    assert transaction.recurring_pattern.interval == 1


def test_budget_create_valid():
    """Тест создания валидного бюджета"""
    budget = BudgetCreate(
        category_id=uuid.uuid4(),
        amount=Decimal("1000.00"),
        period=BudgetPeriod.MONTHLY,
        start_date=date(2024, 1, 1),
        end_date=date(2024, 1, 31)
    )
    assert budget.amount == Decimal("1000.00")
    assert budget.period == BudgetPeriod.MONTHLY


def test_budget_invalid_date_range():
    """Тест невалидного диапазона дат бюджета"""
    with pytest.raises(ValidationError) as exc_info:
        BudgetCreate(
            category_id=uuid.uuid4(),
            amount=Decimal("1000.00"),
            period=BudgetPeriod.MONTHLY,
            start_date=date(2024, 1, 31),
            end_date=date(2024, 1, 1)  # end_date <= start_date
        )
    assert "end_date" in str(exc_info.value)


def test_budget_negative_amount():
    """Тест отрицательной суммы бюджета"""
    with pytest.raises(ValidationError) as exc_info:
        BudgetCreate(
            category_id=uuid.uuid4(),
            amount=Decimal("-1000.00"),
            period=BudgetPeriod.MONTHLY,
            start_date=date(2024, 1, 1),
            end_date=date(2024, 1, 31)
        )
    assert "amount" in str(exc_info.value)
