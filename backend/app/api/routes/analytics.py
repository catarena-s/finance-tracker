"""API маршруты для аналитики"""

from typing import Annotated, Optional
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


@router.get(
    "/summary",
    response_model=dict,
    summary="Сводная статистика",
    description="Получить сводную статистику доходов, расходов и баланса за период",
)
async def get_summary(
    start_date: date,
    end_date: date,
    service: Annotated[AnalyticsService, Depends(get_analytics_service)],
    currency: Optional[str] = Query(
        None, description="Валюта для конвертации (опционально)"
    ),
):
    """Получить сводную статистику за период"""
    return await service.get_summary(start_date, end_date, currency)


@router.get(
    "/trends",
    response_model=dict,
    summary="Динамика по периоду",
    description="Получить динамику доходов и расходов (day/week/month/year)",
)
async def get_trends(
    start_date: date,
    end_date: date,
    service: Annotated[AnalyticsService, Depends(get_analytics_service)],
    period: str = Query(
        "month", description="Период группировки: day, week, month, year"
    ),
    currency: Optional[str] = Query(
        None, description="Валюта для конвертации (опционально)"
    ),
):
    """Получить динамику доходов и расходов по выбранному периоду"""
    return await service.get_trends(start_date, end_date, period, currency)


@router.get(
    "/by-category",
    response_model=dict,
    summary="Распределение по категориям",
    description="Получить распределение расходов по категориям",
)
async def get_category_breakdown(
    start_date: date,
    end_date: date,
    service: Annotated[AnalyticsService, Depends(get_analytics_service)],
):
    """Получить распределение расходов по категориям"""
    return await service.get_category_breakdown(start_date, end_date)


@router.get(
    "/top-categories",
    response_model=dict,
    summary="Топ категорий",
    description="Получить топ категорий по расходам",
)
async def get_top_categories(
    start_date: date,
    end_date: date,
    service: Annotated[AnalyticsService, Depends(get_analytics_service)],
    limit: int = Query(5, ge=1, le=20),
):
    """Получить топ категорий по расходам"""
    return await service.get_top_categories(start_date, end_date, limit)
