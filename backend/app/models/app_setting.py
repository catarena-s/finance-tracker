"""
Модель настроек приложения
"""

from sqlalchemy import Column, String, Text, DateTime
from sqlalchemy.sql import func

from app.models.base import Base


class AppSetting(Base):
    """Настройки приложения"""

    __tablename__ = "app_settings"

    key = Column(String(100), primary_key=True, index=True)
    value = Column(Text, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
