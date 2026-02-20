"""
Фоновые задачи повторяющихся транзакций.

Ежедневное создание транзакций по шаблонам (00:00 UTC).
Полная реализация — в задаче 7.3.
"""

from datetime import date

from app.tasks.celery_app import celery_app


@celery_app.task
def create_recurring_transactions_task() -> dict:
    """Ежедневная задача создания повторяющихся транзакций (заглушка)."""
    return {"created_count": 0, "date": str(date.today())}
