"""
Конфигурация Celery для фоновых задач.

- Broker: Redis
- Celery Beat: повторяющиеся транзакции (время из БД), обновление курсов (01:00 UTC)
"""

from celery import Celery
from celery.schedules import crontab

from app.core.config import settings


def get_recurring_task_schedule():
    """
    Получить расписание для задачи создания повторяющихся транзакций из БД.
    Если настройки не найдены, используется 00:00 UTC по умолчанию.
    """
    try:
        from sqlalchemy import create_engine, select
        from app.models.app_setting import AppSetting

        # Создаём синхронный engine для чтения настроек
        sync_db_url = settings.DATABASE_URL.replace("+asyncpg", "")
        engine = create_engine(sync_db_url, pool_pre_ping=True)

        with engine.connect() as conn:
            # Читаем настройки
            hour_result = conn.execute(
                select(AppSetting.value).where(AppSetting.key == "recurring_task_hour")
            ).scalar()
            minute_result = conn.execute(
                select(AppSetting.value).where(
                    AppSetting.key == "recurring_task_minute"
                )
            ).scalar()

            hour = int(hour_result) if hour_result else 0
            minute = int(minute_result) if minute_result else 0

            # Валидация
            hour = max(0, min(23, hour))
            minute = max(0, min(59, minute))

            return crontab(hour=hour, minute=minute)
    except Exception as e:
        # Если не удалось прочитать настройки, используем значение по умолчанию
        print(f"Warning: Could not read task schedule from DB: {e}")
        return crontab(hour=0, minute=0)


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

# Расписание Celery Beat (динамически читается из БД при старте)
celery_app.conf.beat_schedule = {
    "create-recurring-transactions": {
        "task": "app.tasks.recurring_tasks.create_recurring_transactions_task",
        "schedule": get_recurring_task_schedule(),  # Читается из БД
    },
    "update-exchange-rates": {
        "task": "app.tasks.currency_tasks.update_exchange_rates_task",
        "schedule": crontab(hour=1, minute=0),  # Ежедневно 01:00 UTC
    },
}
