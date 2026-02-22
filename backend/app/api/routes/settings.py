"""API маршруты для настроек приложения"""

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.repositories.app_setting import AppSettingRepository
from app.services.app_setting import AppSettingService
from app.schemas.app_setting import AppSetting, AppSettingUpdate

router = APIRouter(prefix="/settings", tags=["settings"])


async def get_setting_service(
    session: Annotated[AsyncSession, Depends(get_session)]
) -> AppSettingService:
    repo = AppSettingRepository(session)
    return AppSettingService(repo)


@router.get(
    "/",
    response_model=list[AppSetting],
    summary="Получить все настройки",
)
async def get_all_settings(
    service: Annotated[AppSettingService, Depends(get_setting_service)],
):
    """Получить список всех настроек приложения"""
    return await service.get_all()


@router.get(
    "/{key}",
    response_model=AppSetting,
    summary="Получить настройку по ключу",
)
async def get_setting(
    key: str,
    service: Annotated[AppSettingService, Depends(get_setting_service)],
):
    """Получить конкретную настройку по ключу"""
    return await service.get_by_key(key)


@router.put(
    "/{key}",
    response_model=AppSetting,
    summary="Обновить настройку",
)
async def update_setting(
    key: str,
    data: AppSettingUpdate,
    service: Annotated[AppSettingService, Depends(get_setting_service)],
):
    """Обновить значение настройки"""
    return await service.update(key, data)
