"""Pydantic схемы для валидации данных"""

from .category import Category, CategoryCreate, CategoryUpdate, CategoryType
from .transaction import (
    Transaction,
    TransactionCreate,
    TransactionUpdate,
    TransactionType,
    RecurringPattern,
)
from .budget import Budget, BudgetCreate, BudgetUpdate, BudgetPeriod, BudgetProgress
from .recurring_transaction import (
    RecurringTransaction,
    RecurringTransactionCreate,
    RecurringTransactionUpdate,
    FrequencyType,
)
from .csv_import import (
    CSVColumnMapping,
    CSVImportRequest,
    CSVImportResult,
    CSVExportRequest,
)
from .currency import Currency, CurrencyBase, ExchangeRate, ExchangeRateBase
from .task import TaskStatus, TaskStatusResponse

__all__ = [
    # Category schemas
    "Category",
    "CategoryCreate",
    "CategoryUpdate",
    "CategoryType",
    # Transaction schemas
    "Transaction",
    "TransactionCreate",
    "TransactionUpdate",
    "TransactionType",
    "RecurringPattern",
    # Budget schemas
    "Budget",
    "BudgetCreate",
    "BudgetUpdate",
    "BudgetPeriod",
    "BudgetProgress",
    # Recurring transaction schemas
    "RecurringTransaction",
    "RecurringTransactionCreate",
    "RecurringTransactionUpdate",
    "FrequencyType",
    # CSV schemas
    "CSVColumnMapping",
    "CSVImportRequest",
    "CSVImportResult",
    "CSVExportRequest",
    # Currency schemas
    "Currency",
    "CurrencyBase",
    "ExchangeRate",
    "ExchangeRateBase",
    # Task schemas
    "TaskStatus",
    "TaskStatusResponse",
]
