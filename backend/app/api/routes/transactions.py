"""API маршруты для транзакций"""

from typing import Annotated
from datetime import date
from decimal import Decimal
import uuid

from fastapi import APIRouter, Depends, Query, UploadFile, File, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.services.transaction import TransactionService
from app.repositories.transaction import TransactionRepository
from app.repositories.category import CategoryRepository
from app.schemas.transaction import TransactionCreate, TransactionUpdate, Transaction


router = APIRouter(prefix="/transactions", tags=["transactions"])


async def get_transaction_service(
    session: Annotated[AsyncSession, Depends(get_session)]
) -> TransactionService:
    """Dependency для получения TransactionService"""
    transaction_repo = TransactionRepository(session)
    category_repo = CategoryRepository(session)
    return TransactionService(transaction_repo, category_repo)


@router.post(
    "/",
    response_model=Transaction,
    response_model_by_alias=True,
    status_code=201,
    summary="Создать транзакцию",
    description="Создает новую транзакцию дохода или расхода",
)
async def create_transaction(
    data: TransactionCreate,
    service: Annotated[TransactionService, Depends(get_transaction_service)],
):
    """Создать новую транзакцию"""
    return await service.create_transaction(data)


@router.get(
    "/",
    response_model=dict,
    response_model_by_alias=True,
    summary="Список транзакций",
    description="Получить список транзакций с фильтрацией и пагинацией",
)
async def list_transactions(
    service: Annotated[TransactionService, Depends(get_transaction_service)],
    start_date: date | None = Query(None),
    end_date: date | None = Query(None),
    category_id: uuid.UUID | None = Query(None),
    transaction_type: str | None = Query(None),
    min_amount: Decimal | None = Query(None),
    max_amount: Decimal | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
):
    """Получить список транзакций с фильтрацией и пагинацией"""
    return await service.list_transactions(
        start_date=start_date,
        end_date=end_date,
        category_id=category_id,
        transaction_type=transaction_type,
        min_amount=min_amount,
        max_amount=max_amount,
        page=page,
        page_size=page_size,
    )


@router.post(
    "/import",
    response_model=dict,
    summary="Импорт транзакций",
    description="Импортировать транзакции из CSV файла",
)
async def import_transactions(
    service: Annotated[TransactionService, Depends(get_transaction_service)],
    file: UploadFile = File(...),
):
    """Импортировать транзакции из CSV файла"""
    content = await file.read()
    csv_content = content.decode("utf-8")
    return await service.import_from_csv(csv_content)


@router.get(
    "/export",
    response_class=Response,
    summary="Экспорт транзакций",
    description="Экспортировать транзакции в CSV файл",
)
async def export_transactions(
    service: Annotated[TransactionService, Depends(get_transaction_service)],
    start_date: date | None = Query(None),
    end_date: date | None = Query(None),
    category_id: uuid.UUID | None = Query(None),
):
    """Экспортировать транзакции в CSV файл"""
    csv_content = await service.export_to_csv(
        start_date=start_date, end_date=end_date, category_id=category_id
    )
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=transactions.csv"},
    )


@router.get(
    "/{transaction_id}",
    response_model=Transaction,
    response_model_by_alias=True,
    summary="Получить транзакцию",
    description="Получить транзакцию по ID",
)
async def get_transaction(
    transaction_id: uuid.UUID,
    service: Annotated[TransactionService, Depends(get_transaction_service)],
):
    """Получить транзакцию по ID"""
    return await service.get_transaction(transaction_id)


@router.put(
    "/{transaction_id}",
    response_model=Transaction,
    response_model_by_alias=True,
    summary="Обновить транзакцию",
    description="Обновить существующую транзакцию",
)
async def update_transaction(
    transaction_id: uuid.UUID,
    data: TransactionUpdate,
    service: Annotated[TransactionService, Depends(get_transaction_service)],
):
    """Обновить транзакцию"""
    return await service.update_transaction(transaction_id, data)


@router.delete(
    "/{transaction_id}",
    status_code=204,
    summary="Удалить транзакцию",
    description="Удалить транзакцию по ID",
)
async def delete_transaction(
    transaction_id: uuid.UUID,
    service: Annotated[TransactionService, Depends(get_transaction_service)],
):
    """Удалить транзакцию"""
    await service.delete_transaction(transaction_id)
    return Response(status_code=204)
