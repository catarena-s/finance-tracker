"""Сервис для работы с категориями"""
from typing import List
import uuid

from app.repositories.category import CategoryRepository
from app.schemas.category import CategoryCreate, CategoryUpdate, Category
from app.core.exceptions import NotFoundException, ConflictException


class CategoryService:
    """Сервис для управления категориями"""
    
    def __init__(self, category_repo: CategoryRepository):
        self.category_repo = category_repo
    
    async def create_category(self, data: CategoryCreate) -> Category:
        """Создать категорию"""
        # Проверить уникальность
        existing = await self.category_repo.get_by_name_and_type(data.name, data.type)
        if existing:
            raise ConflictException(
                f"Category with name '{data.name}' and type '{data.type}' already exists"
            )
        
        category = await self.category_repo.create(**data.model_dump())
        return Category.model_validate(category)
    
    async def get_category(self, category_id: uuid.UUID) -> Category:
        """Получить категорию по ID"""
        category = await self.category_repo.get_by_id(category_id)
        if not category:
            raise NotFoundException("Category not found")
        return Category.model_validate(category)
    
    async def list_categories(self) -> List[Category]:
        """Получить список всех категорий"""
        categories = await self.category_repo.get_all(limit=1000)
        return [Category.model_validate(c) for c in categories]
    
    async def update_category(
        self, category_id: uuid.UUID, data: CategoryUpdate
    ) -> Category:
        """Обновить категорию"""
        existing = await self.category_repo.get_by_id(category_id)
        if not existing:
            raise NotFoundException("Category not found")
        
        # Проверить уникальность если имя или тип меняются
        if data.name or data.type:
            name = data.name or existing.name
            type_ = data.type or existing.type
            duplicate = await self.category_repo.get_by_name_and_type(name, type_)
            if duplicate and duplicate.id != category_id:
                raise ConflictException(
                    f"Category with name '{name}' and type '{type_}' already exists"
                )
        
        updated = await self.category_repo.update(
            category_id, **data.model_dump(exclude_unset=True)
        )
        return Category.model_validate(updated)
    
    async def delete_category(self, category_id: uuid.UUID) -> None:
        """Удалить категорию"""
        # Проверить наличие транзакций
        has_transactions = await self.category_repo.has_transactions(category_id)
        if has_transactions:
            raise ConflictException(
                "Cannot delete category with existing transactions"
            )
        
        deleted = await self.category_repo.delete(category_id)
        if not deleted:
            raise NotFoundException("Category not found")
