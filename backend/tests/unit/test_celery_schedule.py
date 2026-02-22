"""Тесты для динамического расписания Celery"""

import pytest
from unittest.mock import patch, MagicMock


def test_get_recurring_task_schedule_from_db():
    """Тест чтения расписания из БД"""
    from app.tasks.celery_app import get_recurring_task_schedule

    # Мокаем подключение к БД
    with patch("app.tasks.celery_app.create_engine") as mock_engine:
        mock_conn = MagicMock()
        mock_engine.return_value.connect.return_value.__enter__.return_value = (
            mock_conn
        )

        # Мокаем результаты запросов
        mock_conn.execute.return_value.scalar.side_effect = ["12", "30"]

        schedule = get_recurring_task_schedule()

        # Проверяем, что расписание создано с правильными параметрами
        assert schedule.hour == {12}
        assert schedule.minute == {30}


def test_get_recurring_task_schedule_default_on_error():
    """Тест использования значений по умолчанию при ошибке"""
    from app.tasks.celery_app import get_recurring_task_schedule

    # Мокаем ошибку при подключении к БД
    with patch("app.tasks.celery_app.create_engine") as mock_engine:
        mock_engine.side_effect = Exception("DB connection error")

        schedule = get_recurring_task_schedule()

        # Проверяем, что используются значения по умолчанию
        assert schedule.hour == {0}
        assert schedule.minute == {0}


def test_get_recurring_task_schedule_validates_values():
    """Тест валидации значений часа и минуты"""
    from app.tasks.celery_app import get_recurring_task_schedule

    with patch("app.tasks.celery_app.create_engine") as mock_engine:
        mock_conn = MagicMock()
        mock_engine.return_value.connect.return_value.__enter__.return_value = (
            mock_conn
        )

        # Тестируем граничные значения (должны быть ограничены)
        mock_conn.execute.return_value.scalar.side_effect = ["25", "70"]  # Невалидные

        schedule = get_recurring_task_schedule()

        # Проверяем, что значения ограничены допустимым диапазоном
        assert schedule.hour == {23}  # max 23
        assert schedule.minute == {59}  # max 59
