"""
Конфигурация Celery для фоновых задач.

- Broker: Redis
- Celery Beat: повторяющиеся транзакции (00:00 UTC), обновление курсов (01:00 UTC)
"""

from celery import Celery
from celery.schedules import crontab

from app.core.config import settings

celery_app = Celery(
    "finance_tracker",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_BROKER_URL,
    include=[
        "app.tasks.csv_tasks",
        "app.tasks.recurring_tasks",
        "app.tasks.currency_tasks",
    ],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,  # 30 минут
    worker_max_tasks_per_child=1000,
    worker_prefetch_multiplier=1,
)

# Расписание Celery Beat
celery_app.conf.beat_schedule = {
    "create-recurring-transactions": {
        "task": "app.tasks.recurring_tasks.create_recurring_transactions_task",
        "schedule": crontab(hour=0, minute=0),  # Ежедневно 00:00 UTC
    },
    "update-exchange-rates": {
        "task": "app.tasks.currency_tasks.update_exchange_rates_task",
        "schedule": crontab(hour=1, minute=0),  # Ежедневно 01:00 UTC
    },
}
