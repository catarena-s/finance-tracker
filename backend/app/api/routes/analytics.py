"""API маршруты для аналитики"""
from typing import Annotated
from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.services.analytics import AnalyticsService
from app.repositories.transaction import TransactionRepository
from app.repositories.budget import BudgetRepository


router = APIRouter(prefix="/analytics", tags=["analytics"])


async def get_analytics_service(
    session: Annotated[AsyncSession, Depends(get_session)]
) -> AnalyticsService:
    """Dependency для получения AnalyticsService"""
    transaction_repo = TransactionRepository(session)
    budget_repo = BudgetRepository(session)
    return AnalyticsService(transaction_repo, budget_repo)


@router.get("/summary", response_model=dict)
async def get_summary(
    start_date: date,
    end_date: date,
    service: Annotated[AnalyticsService, Depends(get_analytics_service)]
):
    """Получить сводную статистику за период"""
    return await service.get_summary(start_date, end_date)


@router.get("/trends", response_model=dict)
async def get_trends(
    start_date: date,
    end_date: date,
    service: Annotated[AnalyticsService, Depends(get_analytics_service)]
):
    """Получить динамику доходов и расходов по месяцам"""
    return await service.get_trends(start_date, end_date)


@router.get("/by-category", response_model=dict)
async def get_category_breakdown(
    start_date: date,
    end_date: date,
    service: Annotated[AnalyticsService, Depends(get_analytics_service)]
):
    """Получить распределение расходов по категориям"""
    return await service.get_category_breakdown(start_date, end_date)


@router.get("/top-categories", response_model=dict)
async def get_top_categories(
    start_date: date,
    end_date: date,
    limit: int = Query(5, ge=1, le=20),
    service: Annotated[AnalyticsService, Depends(get_analytics_service)]
):
    """Получить топ категорий по расходам"""
    return await service.get_top_categories(start_date, end_date, limit)
