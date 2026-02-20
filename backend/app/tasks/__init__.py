"""
Celery tasks package.

Фоновые задачи: импорт CSV, создание повторяющихся транзакций, обновление курсов валют.
"""

from app.tasks.celery_app import celery_app

__all__ = ["celery_app"]
