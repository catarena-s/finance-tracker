"""
Тесты для проверки отсутствия дублирования повторяющихся транзакций
"""

import pytest
from datetime import date, timedelta
from decimal import Decimal

from app.schemas.transaction import TransactionCreate, TransactionType
from app.schemas.recurring_transaction import FrequencyType
from app.services.transaction import TransactionService
from app.services.recurring_transaction import RecurringTransactionService
from app.repositories.transaction import TransactionRepository
from app.repositories.recurring_transaction import RecurringTransactionRepository
from app.repositories.category import CategoryRepository


@pytest.mark.asyncio
async def test_no_duplicate_when_converting_existing_transaction(test_db):
    """
    Тест: при установке is_recurring=True на существующую транзакцию
    не должна создаваться дублирующая транзакция при следующем запуске задачи
    """
    # Arrange
    category_repo = CategoryRepository(test_db)
    transaction_repo = TransactionRepository(test_db)
    recurring_repo = RecurringTransactionRepository(test_db)
    
    transaction_service = TransactionService(
        transaction_repo, category_repo, recurring_repo
    )
    recurring_service = RecurringTransactionService(
        recurring_repo, transaction_service, category_repo
    )

    # Создаём категорию
    category = await category_repo.create(
        name="Test Category", type="expense", color="#FF0000", icon="🏠"
    )

    # Создаём транзакцию 3 дня назад
    past_date = date.today() - timedelta(days=3)
    transaction_data = TransactionCreate(
        amount=Decimal("100.00"),
        currency="RUB",
        category_id=category.id,
        description="Test transaction",
        transaction_date=past_date,
        type=TransactionType.EXPENSE,
        is_recurring=False,
    )
    
    transaction = await transaction_service.create_transaction(transaction_data)
    
    # Act: Устанавливаем is_recurring=True (имитация редактирования через UI)
    from app.schemas.transaction import TransactionUpdate, RecurringPattern
    
    update_data = TransactionUpdate(
        is_recurring=True,
        recurring_pattern=RecurringPattern(
            frequency=FrequencyType.MONTHLY,
            interval=1,
        ),
    )
    
    updated_transaction = await transaction_service.update_transaction(
        transaction.id, update_data
    )
    
    # Проверяем что создался шаблон
    assert updated_transaction.recurring_template_id is not None
    
    # Получаем шаблон
    template = await recurring_service.get_by_id(
        updated_transaction.recurring_template_id
    )
    
    # Assert: next_occurrence должен быть в БУДУЩЕМ, не в прошлом
    assert template.next_occurrence > past_date, (
        f"next_occurrence ({template.next_occurrence}) должен быть после "
        f"даты транзакции ({past_date})"
    )
    
    # Запускаем обработку повторяющихся транзакций для сегодняшней даты
    result = await recurring_service.process_due(date.today())
    
    # Проверяем что НЕ создалась новая транзакция
    # (потому что next_occurrence в будущем)
    assert result["created_count"] == 0, (
        "Не должно создаваться транзакций, так как next_occurrence в будущем"
    )
    
    # Проверяем что в базе только одна транзакция
    all_transactions = await transaction_repo.get_all()
    assert len(all_transactions) == 1, (
        f"Должна быть только одна транзакция, но найдено {len(all_transactions)}"
    )


@pytest.mark.asyncio
async def test_next_occurrence_calculated_correctly_for_monthly(test_db):
    """
    Тест: для месячной периодичности next_occurrence должен быть
    на месяц позже даты транзакции
    """
    # Arrange
    category_repo = CategoryRepository(test_db)
    transaction_repo = TransactionRepository(test_db)
    recurring_repo = RecurringTransactionRepository(test_db)
    
    transaction_service = TransactionService(
        transaction_repo, category_repo, recurring_repo
    )
    recurring_service = RecurringTransactionService(
        recurring_repo, transaction_service, category_repo
    )

    category = await category_repo.create(
        name="Test Category", type="expense", color="#FF0000", icon="🏠"
    )

    # Создаём транзакцию 19 февраля
    transaction_date = date(2026, 2, 19)
    transaction_data = TransactionCreate(
        amount=Decimal("100.00"),
        currency="RUB",
        category_id=category.id,
        description="Test transaction",
        transaction_date=transaction_date,
        type=TransactionType.EXPENSE,
        is_recurring=False,
    )
    
    transaction = await transaction_service.create_transaction(transaction_data)
    
    # Act: Устанавливаем месячную периодичность
    from app.schemas.transaction import TransactionUpdate, RecurringPattern
    
    update_data = TransactionUpdate(
        is_recurring=True,
        recurring_pattern=RecurringPattern(
            frequency=FrequencyType.MONTHLY,
            interval=1,
        ),
    )
    
    updated_transaction = await transaction_service.update_transaction(
        transaction.id, update_data
    )
    
    # Получаем шаблон
    template = await recurring_service.get_by_id(
        updated_transaction.recurring_template_id
    )
    
    # Assert: next_occurrence должен быть 19 марта (через месяц)
    expected_next = date(2026, 3, 19)
    assert template.next_occurrence == expected_next, (
        f"next_occurrence должен быть {expected_next}, "
        f"но получен {template.next_occurrence}"
    )

