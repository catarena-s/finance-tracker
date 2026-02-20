"""API маршруты для шаблонов повторяющихся транзакций"""

from typing import Annotated
import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.repositories.recurring_transaction import RecurringTransactionRepository
from app.repositories.category import CategoryRepository
from app.repositories.transaction import TransactionRepository
from app.services.transaction import TransactionService
from app.services.recurring_transaction import RecurringTransactionService
from app.schemas.recurring_transaction import (
    RecurringTransaction,
    RecurringTransactionCreate,
    RecurringTransactionUpdate,
)

router = APIRouter(prefix="/recurring-transactions", tags=["recurring-transactions"])


async def get_recurring_service(
    session: Annotated[AsyncSession, Depends(get_session)]
) -> RecurringTransactionService:
    recurring_repo = RecurringTransactionRepository(session)
    category_repo = CategoryRepository(session)
    transaction_repo = TransactionRepository(session)
    transaction_service = TransactionService(transaction_repo, category_repo)
    return RecurringTransactionService(
        recurring_repo, transaction_service, category_repo
    )


@router.post(
    "/",
    response_model=RecurringTransaction,
    status_code=201,
    summary="Создать шаблон",
)
async def create_recurring(
    data: RecurringTransactionCreate,
    service: Annotated[RecurringTransactionService, Depends(get_recurring_service)],
):
    return await service.create(data)


@router.get(
    "/",
    response_model=list[RecurringTransaction],
    summary="Список шаблонов",
)
async def list_recurring(
    service: Annotated[RecurringTransactionService, Depends(get_recurring_service)],
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
):
    return await service.list_all(skip=skip, limit=limit)


@router.get(
    "/{recurring_id}",
    response_model=RecurringTransaction,
    summary="Получить шаблон",
)
async def get_recurring(
    recurring_id: uuid.UUID,
    service: Annotated[RecurringTransactionService, Depends(get_recurring_service)],
):
    return await service.get_by_id(recurring_id)


@router.put(
    "/{recurring_id}",
    response_model=RecurringTransaction,
    summary="Обновить шаблон",
)
async def update_recurring(
    recurring_id: uuid.UUID,
    data: RecurringTransactionUpdate,
    service: Annotated[RecurringTransactionService, Depends(get_recurring_service)],
):
    return await service.update(recurring_id, data)


@router.delete(
    "/{recurring_id}",
    status_code=204,
    summary="Удалить шаблон",
)
async def delete_recurring(
    recurring_id: uuid.UUID,
    service: Annotated[RecurringTransactionService, Depends(get_recurring_service)],
):
    await service.delete(recurring_id)
