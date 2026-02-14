"""Pydantic схемы для бюджетов"""
from pydantic import BaseModel, Field, field_validator
from datetime import date, datetime
from decimal import Decimal
from enum import Enum
import uuid


class BudgetPeriod(str, Enum):
    """Период бюджета"""
    MONTHLY = "monthly"
    YEARLY = "yearly"


class BudgetBase(BaseModel):
    """Базовая схема бюджета"""
    category_id: uuid.UUID
    amount: Decimal = Field(..., gt=0, decimal_places=2)
    period: BudgetPeriod
    start_date: date
    end_date: date
    
    @field_validator("end_date")
    @classmethod
    def validate_date_range(cls, v, info):
        """Проверить что end_date > start_date"""
        if "start_date" in info.data and v <= info.data["start_date"]:
            raise ValueError("end_date must be after start_date")
        return v


class BudgetCreate(BudgetBase):
    """Схема для создания бюджета"""
    pass


class BudgetUpdate(BaseModel):
    """Схема для обновления бюджета"""
    category_id: uuid.UUID | None = None
    amount: Decimal | None = Field(None, gt=0, decimal_places=2)
    period: BudgetPeriod | None = None
    start_date: date | None = None
    end_date: date | None = None


class Budget(BudgetBase):
    """Схема бюджета с полными данными"""
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    
    model_config = {"from_attributes": True}


class BudgetProgress(BaseModel):
    """Схема прогресса выполнения бюджета"""
    budget: Budget
    spent: Decimal
    remaining: Decimal
    percentage: Decimal
