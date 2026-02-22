"""Схемы для настроек приложения"""

from datetime import datetime
from pydantic import BaseModel, Field


class AppSettingBase(BaseModel):
    """Базовая схема настройки"""

    key: str = Field(..., max_length=100)
    value: str
    description: str | None = None


class AppSetting(AppSettingBase):
    """Схема настройки с датами"""

    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class AppSettingUpdate(BaseModel):
    """Схема для обновления настройки"""

    value: str
