"""Сервис для управления настройками приложения"""

from app.repositories.app_setting import AppSettingRepository
from app.schemas.app_setting import AppSetting as AppSettingSchema, AppSettingUpdate
from app.core.exceptions import NotFoundException


class AppSettingService:
    """Сервис управления настройками приложения"""

    def __init__(self, repo: AppSettingRepository):
        self.repo = repo

    async def get_by_key(self, key: str) -> AppSettingSchema:
        """Получить настройку по ключу"""
        setting = await self.repo.get_by_key(key)
        if not setting:
            raise NotFoundException(f"Настройка с ключом '{key}' не найдена")
        return AppSettingSchema.model_validate(setting)

    async def get_all(self) -> list[AppSettingSchema]:
        """Получить все настройки"""
        settings = await self.repo.get_all()
        return [AppSettingSchema.model_validate(s) for s in settings]

    async def update(self, key: str, data: AppSettingUpdate) -> AppSettingSchema:
        """Обновить настройку"""
        setting = await self.repo.update(key, data.value)
        if not setting:
            raise NotFoundException(f"Настройка с ключом '{key}' не найдена")
        return AppSettingSchema.model_validate(setting)
