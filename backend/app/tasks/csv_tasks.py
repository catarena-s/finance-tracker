"""
Фоновые задачи импорта CSV.

Полная реализация — в задаче 7.2.
"""

from app.tasks.celery_app import celery_app


@celery_app.task(bind=True)
def import_csv_task(self, csv_content: str, mapping: dict, date_format: str) -> dict:
    """Фоновая задача импорта CSV (заглушка до реализации сервиса)."""
    return {"status": "pending", "task_id": self.request.id}
