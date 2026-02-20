"""API маршруты для валют и курсов"""

from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.repositories.currency import CurrencyRepository
from app.repositories.exchange_rate import ExchangeRateRepository
from app.services.currency import CurrencyService
from app.services.exchange_rate import ExchangeRateService
from app.schemas.currency import Currency, ExchangeRate

router = APIRouter(prefix="/currencies", tags=["currencies"])


async def get_currency_service(
    session: Annotated[AsyncSession, Depends(get_session)]
) -> CurrencyService:
    currency_repo = CurrencyRepository(session)
    exchange_repo = ExchangeRateRepository(session)
    return CurrencyService(currency_repo, exchange_repo)


async def get_exchange_rate_service(
    session: Annotated[AsyncSession, Depends(get_session)]
) -> ExchangeRateService:
    exchange_repo = ExchangeRateRepository(session)
    currency_repo = CurrencyRepository(session)
    return ExchangeRateService(exchange_repo, currency_repo)


@router.get(
    "/",
    response_model=list[Currency],
    summary="Список валют",
)
async def list_currencies(
    service: Annotated[CurrencyService, Depends(get_currency_service)],
):
    return await service.get_currencies()


@router.get(
    "/exchange-rate",
    response_model=ExchangeRate,
    summary="Курс на дату",
)
async def get_exchange_rate(
    service: Annotated[ExchangeRateService, Depends(get_exchange_rate_service)],
    from_currency: str = Query(..., min_length=3, max_length=3),
    to_currency: str = Query(..., min_length=3, max_length=3),
    rate_date: date = Query(..., description="Дата курса"),
):
    return await service.get_rate(from_currency, to_currency, rate_date)
