"""Repository для настроек приложения"""

from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.app_setting import AppSetting


class AppSettingRepository:
    """Repository для работы с настройками приложения"""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_key(self, key: str) -> Optional[AppSetting]:
        """Получить настройку по ключу"""
        result = await self.session.execute(
            select(AppSetting).where(AppSetting.key == key)
        )
        return result.scalar_one_or_none()

    async def get_all(self) -> list[AppSetting]:
        """Получить все настройки"""
        result = await self.session.execute(select(AppSetting))
        return list(result.scalars().all())

    async def update(self, key: str, value: str) -> Optional[AppSetting]:
        """Обновить значение настройки"""
        setting = await self.get_by_key(key)
        if setting:
            setting.value = value
            await self.session.commit()
            await self.session.refresh(setting)
        return setting
