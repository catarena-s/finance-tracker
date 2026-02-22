"""Unit-тесты для Celery задач (eager mode, моки)."""

import pytest
from unittest.mock import patch, AsyncMock

try:
    from app.tasks.csv_tasks import import_csv_task
    from app.tasks.recurring_tasks import create_recurring_transactions_task
    from app.tasks.currency_tasks import update_exchange_rates_task

    CELERY_AVAILABLE = True
except ImportError:
    CELERY_AVAILABLE = False

pytestmark = pytest.mark.skipif(not CELERY_AVAILABLE, reason="celery not installed")


@pytest.fixture(autouse=True)
def celery_eager():
    """Запуск задач в eager mode (синхронно, без брокера)."""
    from app.tasks.celery_app import celery_app

    celery_app.conf.task_always_eager = True
    yield
    celery_app.conf.task_always_eager = False


def test_import_csv_task_returns_task_id_and_status():
    """Задача импорта CSV возвращает task_id и статус; _run_import вызывается."""
    with patch("app.tasks.csv_tasks._run_import", new_callable=AsyncMock) as mock_import:
        mock_import.return_value = None
        result = import_csv_task.apply(
            args=(
                "amount,date,type,category\n100,2024-01-01,income,Test",
                {
                    "amount": "amount",
                    "category_name": "category",
                    "transaction_date": "date",
                    "type": "type",
                },
                "%Y-%m-%d",
            )
        ).get()
        assert "task_id" in result
        assert result["status"] == "completed"
        mock_import.assert_called_once()


def test_import_csv_task_propagates_exception():
    """При ошибке в _run_import исключение пробрасывается."""
    with patch("app.tasks.csv_tasks._run_import", new_callable=AsyncMock) as mock_import:
        mock_import.side_effect = RuntimeError("DB error")
        with pytest.raises(RuntimeError, match="DB error"):
            import_csv_task.apply(
                args=(
                    "csv",
                    {
                        "amount": "a",
                        "category_name": "c",
                        "transaction_date": "d",
                        "type": "income",
                    },
                    "%Y-%m-%d",
                )
            ).get()


def test_create_recurring_transactions_task_returns_dict():
    """Задача повторяющихся транзакций возвращает dict с created_count и errors."""
    with patch(
        "app.tasks.recurring_tasks._run_recurring", new_callable=AsyncMock
    ) as mock_recurring:
        mock_recurring.return_value = {"created_count": 0, "error_count": 0, "errors": []}
        result = create_recurring_transactions_task.apply().get()
        assert result["created_count"] == 0
        assert "errors" in result
        mock_recurring.assert_called_once()


def test_update_exchange_rates_task_returns_dict():
    """Задача обновления курсов возвращает dict с success/updated_count."""
    with patch(
        "app.tasks.currency_tasks._run_update_rates", new_callable=AsyncMock
    ) as mock_update:
        mock_update.return_value = {
            "success": True,
            "updated_count": 10,
            "date": "2024-01-01",
        }
        result = update_exchange_rates_task.apply().get()
        assert result["success"] is True
        assert result["updated_count"] == 10
        mock_update.assert_called_once()


def test_update_exchange_rates_task_on_error_returns_dict():
    """При ошибке API сервис возвращает success: False — задача не падает."""
    with patch(
        "app.tasks.currency_tasks._run_update_rates", new_callable=AsyncMock
    ) as mock_update:
        mock_update.return_value = {"success": False, "error": "API unavailable"}
        result = update_exchange_rates_task.apply().get()
        assert result["success"] is False
        assert "error" in result
