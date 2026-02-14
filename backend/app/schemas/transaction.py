"""Pydantic схемы для транзакций"""

from pydantic import BaseModel, Field, field_validator, condecimal
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

    amount: condecimal(gt=0, decimal_places=2) = Field(...)
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
        """Валидация ISO 4217 кода валюты"""
        v = v.upper()
        # Список популярных ISO 4217 кодов валют
        valid_currencies = {
            "USD",
            "EUR",
            "GBP",
            "JPY",
            "CNY",
            "RUB",
            "INR",
            "BRL",
            "CAD",
            "AUD",
            "CHF",
            "SEK",
            "NOK",
            "DKK",
            "PLN",
            "CZK",
            "HUF",
            "RON",
            "BGN",
            "HRK",
            "TRY",
            "ILS",
            "ZAR",
            "MXN",
            "ARS",
            "CLP",
            "COP",
            "PEN",
            "VES",
            "KRW",
            "THB",
            "IDR",
            "MYR",
            "SGD",
            "PHP",
            "VND",
            "NZD",
            "AED",
            "SAR",
            "QAR",
            "KWD",
            "BHD",
            "OMR",
            "JOD",
            "EGP",
            "MAD",
            "DZD",
            "TND",
            "LYD",
            "NGN",
            "KES",
            "GHS",
            "UGX",
            "TZS",
            "ZMW",
            "BWP",
            "MUR",
            "SCR",
            "MGA",
            "XOF",
            "XAF",
            "KMF",
            "DJF",
            "SOS",
            "ETB",
            "ERN",
            "SDG",
            "SSP",
            "UZS",
            "KZT",
            "GEL",
            "AMD",
            "AZN",
            "BYN",
            "UAH",
            "MDL",
            "TJS",
            "TMT",
            "KGS",
            "MNT",
            "AFN",
            "PKR",
            "BDT",
            "LKR",
            "NPR",
            "BTN",
            "MVR",
            "MMK",
            "LAK",
            "KHR",
        }
        if v not in valid_currencies:
            raise ValueError(
                f"Invalid currency code: {v}. Must be a valid ISO 4217 code."
            )
        return v

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

    amount: condecimal(gt=0, decimal_places=2) | None = Field(None)
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
