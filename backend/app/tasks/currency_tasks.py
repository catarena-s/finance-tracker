"""
Фоновые задачи обновления курсов валют.

Ежедневное обновление курсов (01:00 UTC).
Полная реализация — в задаче 7.4.
"""

from datetime import date

from app.tasks.celery_app import celery_app


@celery_app.task
def update_exchange_rates_task() -> dict:
    """Ежедневная задача обновления курсов валют (заглушка)."""
    return {"success": True, "date": str(date.today())}
