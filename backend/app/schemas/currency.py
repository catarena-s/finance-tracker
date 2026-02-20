"""Pydantic схемы для валют и курсов"""

from datetime import date, datetime
import uuid
from pydantic import BaseModel, Field, condecimal


class CurrencyBase(BaseModel):
    """Базовая схема валюты"""

    code: str = Field(..., min_length=3, max_length=3)
    name: str = Field(..., min_length=1, max_length=100)
    symbol: str = Field(..., min_length=1, max_length=10)


class Currency(CurrencyBase):
    """Схема валюты с полными данными"""

    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class ExchangeRateBase(BaseModel):
    """Базовая схема курса валюты"""

    from_currency: str = Field(..., min_length=3, max_length=3)
    to_currency: str = Field(..., min_length=3, max_length=3)
    rate: condecimal(gt=0, decimal_places=10) = Field(...)
    date: date


class ExchangeRate(ExchangeRateBase):
    """Схема курса с полными данными"""

    id: uuid.UUID
    created_at: datetime

    model_config = {"from_attributes": True}
