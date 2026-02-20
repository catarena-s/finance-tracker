"""Ежедневная задача создания повторяющихся транзакций (00:00 UTC)."""

from datetime import date

from app.tasks.celery_app import celery_app
from app.core.async_runner import run_async, get_session_factory


async def _run_recurring():
    """Создать транзакции по шаблонам с next_occurrence <= сегодня."""
    from app.repositories.recurring_transaction import RecurringTransactionRepository
    from app.repositories.category import CategoryRepository
    from app.repositories.transaction import TransactionRepository
    from app.services.transaction import TransactionService
    from app.services.recurring_transaction import RecurringTransactionService

    async with get_session_factory()() as session:
        recurring_repo = RecurringTransactionRepository(session)
        transaction_repo = TransactionRepository(session)
        category_repo = CategoryRepository(session)
        transaction_service = TransactionService(transaction_repo, category_repo)
        recurring_service = RecurringTransactionService(
            recurring_repo, transaction_service, category_repo
        )
        return await recurring_service.process_due(date.today())


@celery_app.task
def create_recurring_transactions_task() -> dict:
    """Ежедневная задача создания повторяющихся транзакций."""
    return run_async(_run_recurring())
