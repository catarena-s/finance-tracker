"""API эндпоинты для категорий"""
from fastapi import APIRouter, Depends, status
from typing import List
import uuid

from app.services.category import CategoryService
from app.schemas.category import CategoryCreate, CategoryUpdate, Category
from app.repositories.category import CategoryRepository
from app.core.database import get_session
from sqlalchemy.ext.asyncio import AsyncSession


router = APIRouter(prefix="/api/v1/categories", tags=["categories"])


async def get_category_service(
    session: AsyncSession = Depends(get_session)
) -> CategoryService:
    """Dependency injection для CategoryService"""
    category_repo = CategoryRepository(session)
    return CategoryService(category_repo)


@router.post("/", response_model=Category, status_code=status.HTTP_201_CREATED)
async def create_category(
    data: CategoryCreate,
    service: CategoryService = Depends(get_category_service)
):
    """
    Создать новую категорию
    
    - **name**: Название категории
    - **icon**: Иконка категории
    - **color**: Цвет в формате hex (#RRGGBB)
    - **type**: Тип категории (income/expense)
    """
    return await service.create_category(data)


@router.get("/", response_model=List[Category])
async def list_categories(
    service: CategoryService = Depends(get_category_service)
):
    """Получить список всех категорий"""
    return await service.list_categories()


@router.get("/{category_id}", response_model=Category)
async def get_category(
    category_id: uuid.UUID,
    service: CategoryService = Depends(get_category_service)
):
    """Получить категорию по ID"""
    return await service.get_category(category_id)


@router.put("/{category_id}", response_model=Category)
async def update_category(
    category_id: uuid.UUID,
    data: CategoryUpdate,
    service: CategoryService = Depends(get_category_service)
):
    """Обновить категорию"""
    return await service.update_category(category_id, data)


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    category_id: uuid.UUID,
    service: CategoryService = Depends(get_category_service)
):
    """Удалить категорию"""
    await service.delete_category(category_id)
