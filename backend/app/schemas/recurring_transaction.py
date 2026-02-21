"""Pydantic схемы для повторяющихся транзакций"""

from datetime import date, datetime
from decimal import Decimal
from enum import Enum
from typing import Any
import uuid

from pydantic import BaseModel, ConfigDict, Field, field_validator


class FrequencyType(str, Enum):
    """Частота повторения"""

    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    YEARLY = "yearly"


class RecurringTransactionBase(BaseModel):
    """Базовая схема шаблона повторяющейся транзакции. Принимает camelCase и snake_case."""

    model_config = ConfigDict(populate_by_name=True)

    name: str = Field(..., min_length=1, max_length=200)
    amount: Decimal = Field(..., gt=0)
    currency: str = Field(default="USD", min_length=3, max_length=3)
    category_id: uuid.UUID = Field(..., alias="categoryId")
    description: str | None = None
    type: str = Field(..., pattern="^(income|expense)$")
    frequency: FrequencyType
    interval: int = Field(..., gt=0)
    start_date: date = Field(..., alias="startDate")
    end_date: date | None = Field(None, alias="endDate")

    @field_validator("end_date")
    @classmethod
    def validate_end_date(cls, v: date | None, info: Any) -> date | None:
        if v is not None and "start_date" in info.data:
            start = info.data["start_date"]
            if start is not None and v <= start:
                raise ValueError("end_date должно быть позже start_date")
        return v


class RecurringTransactionCreate(RecurringTransactionBase):
    """Схема для создания шаблона"""

    pass


class RecurringTransactionUpdate(BaseModel):
    """Схема для обновления шаблона. Принимает camelCase и snake_case."""

    model_config = ConfigDict(populate_by_name=True)

    name: str | None = Field(None, min_length=1, max_length=200)
    amount: Decimal | None = None
    currency: str | None = Field(None, min_length=3, max_length=3)
    category_id: uuid.UUID | None = Field(None, alias="categoryId")
    description: str | None = None
    type: str | None = Field(None, pattern="^(income|expense)$")
    frequency: FrequencyType | None = None
    interval: int | None = Field(None, gt=0)
    start_date: date | None = Field(None, alias="startDate")
    end_date: date | None = Field(None, alias="endDate")
    is_active: bool | None = Field(None, alias="isActive")


class RecurringTransaction(RecurringTransactionBase):
    """Схема шаблона с полными данными"""

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: uuid.UUID
    next_occurrence: date
    is_active: bool
    created_at: datetime
    updated_at: datetime
