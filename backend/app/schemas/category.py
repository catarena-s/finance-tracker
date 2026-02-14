"""Pydantic схемы для категорий"""
from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from enum import Enum
import uuid


class CategoryType(str, Enum):
    """Тип категории"""
    INCOME = "income"
    EXPENSE = "expense"


class CategoryBase(BaseModel):
    """Базовая схема категории"""
    name: str = Field(..., min_length=1, max_length=100)
    icon: str = Field(..., min_length=1, max_length=50)
    color: str = Field(..., pattern="^#[0-9A-Fa-f]{6}$")
    type: CategoryType
    
    @field_validator("color")
    @classmethod
    def validate_color(cls, v: str) -> str:
        """Конвертировать цвет в верхний регистр"""
        return v.upper()


class CategoryCreate(CategoryBase):
    """Схема для создания категории"""
    pass


class CategoryUpdate(BaseModel):
    """Схема для обновления категории"""
    name: str | None = Field(None, min_length=1, max_length=100)
    icon: str | None = Field(None, min_length=1, max_length=50)
    color: str | None = Field(None, pattern="^#[0-9A-Fa-f]{6}$")
    type: CategoryType | None = None


class Category(CategoryBase):
    """Схема категории с полными данными"""
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    
    model_config = {"from_attributes": True}
