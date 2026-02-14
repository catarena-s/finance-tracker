"""API маршруты для бюджетов"""
from typing import Annotated, List
import uuid

from fastapi import APIRouter, Depends, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.services.budget import BudgetService
from app.repositories.budget import BudgetRepository
from app.repositories.category import CategoryRepository
from app.repositories.transaction import TransactionRepository
from app.schemas.budget import BudgetCreate, BudgetUpdate, Budget, BudgetProgress


router = APIRouter(prefix="/budgets", tags=["budgets"])


async def get_budget_service(
    session: Annotated[AsyncSession, Depends(get_session)]
) -> BudgetService:
    """Dependency для получения BudgetService"""
    budget_repo = BudgetRepository(session)
    category_repo = CategoryRepository(session)
    transaction_repo = TransactionRepository(session)
    return BudgetService(budget_repo, category_repo, transaction_repo)


@router.post("/", response_model=Budget, status_code=201)
async def create_budget(
    data: BudgetCreate,
    service: Annotated[BudgetService, Depends(get_budget_service)]
):
    """Создать новый бюджет"""
    return await service.create_budget(data)


@router.get("/", response_model=List[Budget])
async def list_budgets(
    service: Annotated[BudgetService, Depends(get_budget_service)]
):
    """Получить список всех бюджетов"""
    return await service.list_budgets()


@router.get("/{budget_id}", response_model=Budget)
async def get_budget(
    budget_id: uuid.UUID,
    service: Annotated[BudgetService, Depends(get_budget_service)]
):
    """Получить бюджет по ID"""
    return await service.get_budget(budget_id)


@router.put("/{budget_id}", response_model=Budget)
async def update_budget(
    budget_id: uuid.UUID,
    data: BudgetUpdate,
    service: Annotated[BudgetService, Depends(get_budget_service)]
):
    """Обновить бюджет"""
    return await service.update_budget(budget_id, data)


@router.delete("/{budget_id}", status_code=204)
async def delete_budget(
    budget_id: uuid.UUID,
    service: Annotated[BudgetService, Depends(get_budget_service)]
):
    """Удалить бюджет"""
    await service.delete_budget(budget_id)
    return Response(status_code=204)


@router.get("/{budget_id}/progress", response_model=BudgetProgress)
async def get_budget_progress(
    budget_id: uuid.UUID,
    service: Annotated[BudgetService, Depends(get_budget_service)]
):
    """Получить прогресс выполнения бюджета"""
    return await service.get_budget_progress(budget_id)
