"""
Фоновые задачи импорта CSV.
Сохраняют статус в TaskResult (running → completed/failed).
"""

import logging
from uuid import uuid4

from app.tasks.celery_app import celery_app
from app.schemas.csv_import import CSVColumnMapping

logger = logging.getLogger(__name__)


async def _run_import(csv_content: str, mapping: dict, date_format: str, task_id: str):
    """Асинхронная логика импорта с сохранением результата в TaskResult."""
    from app.core.async_runner import get_session_factory
    from app.repositories.category import CategoryRepository
    from app.repositories.transaction import TransactionRepository
    from app.services.transaction import TransactionService
    from app.services.csv_import import CSVImportService
    from app.models.task_result import TaskResult

    factory = get_session_factory()
    async with factory() as session:
        task_result = TaskResult(
            id=uuid4(),
            task_id=task_id,
            task_type="csv_import",
            status="running",
        )
        session.add(task_result)
        await session.commit()
        await session.refresh(task_result)

        try:
            mapping_obj = CSVColumnMapping(**mapping)
            transaction_repo = TransactionRepository(session)
            category_repo = CategoryRepository(session)
            transaction_service = TransactionService(transaction_repo, category_repo)
            csv_service = CSVImportService(transaction_service, category_repo)
            result = await csv_service._process_csv(
                csv_content, mapping_obj, date_format
            )
            task_result.status = "completed"
            task_result.result = result.model_dump()
            task_result.error = None
        except Exception as e:
            logger.exception("Ошибка импорта CSV: %s", e)
            task_result.status = "failed"
            task_result.result = None
            task_result.error = str(e)
        await session.commit()


@celery_app.task(bind=True)
def import_csv_task(self, csv_content: str, mapping: dict, date_format: str) -> dict:
    """Фоновая задача импорта CSV. Сохраняет статус в TaskResult."""
    from app.core.async_runner import run_async

    task_id = self.request.id
    run_async(_run_import(csv_content, mapping, date_format, task_id))
    return {"task_id": task_id, "status": "completed"}
