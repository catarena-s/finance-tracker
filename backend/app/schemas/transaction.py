"""Pydantic схемы для транзакций"""
from pydantic import BaseModel, Field, field_validator
from datetime import date, datetime
from decimal import Decimal
from enum import Enum
import uuid


class TransactionType(str, Enum):
    """Тип транзакции"""
    INCOME = "income"
    EXPENSE = "expense"


class RecurringPattern(BaseModel):
    """Паттерн повторяющейся транзакции"""
    frequency: str = Field(..., pattern="^(daily|weekly|monthly|yearly)$")
    interval: int = Field(..., gt=0)


class TransactionBase(BaseModel):
    """Базовая схема транзакции"""
    amount: Decimal = Field(..., gt=0, decimal_places=2)
    currency: str = Field(default="USD", min_length=3, max_length=3)
    category_id: uuid.UUID
    description: str | None = None
    transaction_date: date
    type: TransactionType
    is_recurring: bool = False
    recurring_pattern: RecurringPattern | None = None
    
    @field_validator("currency")
    @classmethod
    def validate_currency(cls, v: str) -> str:
        """Конвертировать валюту в верхний регистр"""
        return v.upper()
    
    @field_validator("recurring_pattern")
    @classmethod
    def validate_recurring_pattern(cls, v, info):
        """Проверить обязательность recurring_pattern для повторяющихся транзакций"""
        if info.data.get("is_recurring") and v is None:
            raise ValueError("recurring_pattern required when is_recurring=True")
        return v


class TransactionCreate(TransactionBase):
    """Схема для создания транзакции"""
    pass


class TransactionUpdate(BaseModel):
    """Схема для обновления транзакции"""
    amount: Decimal | None = Field(None, gt=0, decimal_places=2)
    currency: str | None = Field(None, min_length=3, max_length=3)
    category_id: uuid.UUID | None = None
    description: str | None = None
    transaction_date: date | None = None
    type: TransactionType | None = None
    is_recurring: bool | None = None
    recurring_pattern: RecurringPattern | None = None


class Transaction(TransactionBase):
    """Схема транзакции с полными данными"""
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    
    model_config = {"from_attributes": True}
