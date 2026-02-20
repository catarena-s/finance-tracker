"""API маршруты для импорта и экспорта CSV"""

from datetime import date
from typing import Annotated
import uuid
from fastapi import APIRouter, Depends, Query
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.repositories.transaction import TransactionRepository
from app.repositories.category import CategoryRepository
from app.services.transaction import TransactionService
from app.services.csv_import import CSVImportService
from app.services.csv_export import CSVExportService
from app.schemas.csv_import import (
    CSVImportRequest,
    CSVImportResult,
)

router = APIRouter(prefix="/csv", tags=["csv"])


async def get_csv_import_service(
    session: Annotated[AsyncSession, Depends(get_session)]
) -> CSVImportService:
    transaction_repo = TransactionRepository(session)
    category_repo = CategoryRepository(session)
    transaction_service = TransactionService(transaction_repo, category_repo)
    return CSVImportService(transaction_service, category_repo)


async def get_csv_export_service(
    session: Annotated[AsyncSession, Depends(get_session)]
) -> CSVExportService:
    transaction_repo = TransactionRepository(session)
    return CSVExportService(transaction_repo)


@router.post(
    "/import",
    response_model=CSVImportResult,
    summary="Импорт транзакций из CSV",
    description="Загрузка CSV с маппингом колонок. При >1000 строк выполняется в фоне.",
)
async def import_csv(
    body: CSVImportRequest,
    service: Annotated[CSVImportService, Depends(get_csv_import_service)],
) -> CSVImportResult:
    """Импортировать транзакции из CSV (тело: file_content Base64, mapping, date_format)."""
    return await service.import_csv(body.file_content, body.mapping, body.date_format)


@router.get(
    "/export",
    response_class=Response,
    summary="Экспорт транзакций в CSV",
    description="Скачать CSV с выбранными колонками и форматом даты.",
)
async def export_csv(
    service: Annotated[CSVExportService, Depends(get_csv_export_service)],
    start_date: date | None = Query(None),
    end_date: date | None = Query(None),
    category_id: uuid.UUID | None = Query(None),
    columns: str | None = Query(
        None,
        description="Колонки через запятую: amount,currency,category_name,description,transaction_date,type",
    ),
    date_format: str = Query("%Y-%m-%d", description="Формат даты"),
):
    """Экспортировать транзакции в CSV."""
    column_list = (
        [c.strip() for c in columns.split(",")]
        if columns
        else [
            "amount",
            "currency",
            "category_name",
            "description",
            "transaction_date",
            "type",
        ]
    )
    content = await service.export_csv(
        start_date, end_date, category_id, column_list, date_format
    )
    filename = f"transactions_{date.today().isoformat()}.csv"
    return Response(
        content=content,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
