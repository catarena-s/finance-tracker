"""API маршруты для административных задач"""

from typing import Annotated
from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.repositories.recurring_transaction import RecurringTransactionRepository
from app.repositories.category import CategoryRepository
from app.repositories.transaction import TransactionRepository
from app.services.transaction import TransactionService
from app.services.recurring_transaction import RecurringTransactionService

router = APIRouter(prefix="/admin", tags=["admin"])


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
    "/tasks/run-recurring",
    summary="Принудительный запуск создания повторяющихся транзакций",
)
async def run_recurring_task(
    service: Annotated[RecurringTransactionService, Depends(get_recurring_service)],
    target_date: date = Query(
        default=None,
        description="Дата для обработки (по умолчанию - сегодня)",
    ),
):
    """
    Принудительно запустить создание повторяющихся транзакций.
    Полезно для тестирования без ожидания запланированного времени.
    """
    process_date = target_date or date.today()
    result = await service.process_due(process_date)
    return {
        "status": "completed",
        "date": process_date.isoformat(),
        **result,
    }
