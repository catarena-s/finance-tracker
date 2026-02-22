"""Тесты для административных API"""

import pytest
from httpx import AsyncClient
from datetime import date, timedelta


@pytest.mark.asyncio
async def test_run_recurring_task_default_date(
    client: AsyncClient, test_db, sample_category
):
    """Тест принудительного запуска задачи с датой по умолчанию"""
    # Создаём шаблон повторяющейся транзакции
    recurring_data = {
        "name": "Test Recurring",
        "amount": 100.0,
        "currency": "RUB",
        "category_id": str(sample_category.id),
        "type": "expense",
        "frequency": "monthly",
        "interval": 1,
        "start_date": date.today().isoformat(),
    }
    response = await client.post("/api/v1/recurring-transactions/", json=recurring_data)
    assert response.status_code == 201

    # Запускаем задачу
    response = await client.post("/api/v1/admin/tasks/run-recurring")
    assert response.status_code == 200
    data = response.json()

    assert data["status"] == "completed"
    assert "date" in data
    assert "created_count" in data
    assert "error_count" in data
    assert "errors" in data
    assert data["error_count"] == 0


@pytest.mark.asyncio
async def test_run_recurring_task_with_target_date(
    client: AsyncClient, test_db, sample_category
):
    """Тест принудительного запуска задачи с указанной датой"""
    # Создаём шаблон с датой в прошлом
    past_date = date.today() - timedelta(days=5)
    recurring_data = {
        "name": "Past Recurring",
        "amount": 200.0,
        "currency": "RUB",
        "category_id": str(sample_category.id),
        "type": "income",
        "frequency": "weekly",
        "interval": 1,
        "start_date": past_date.isoformat(),
    }
    response = await client.post("/api/v1/recurring-transactions/", json=recurring_data)
    assert response.status_code == 201

    # Запускаем задачу с указанной датой
    target_date = date.today()
    response = await client.post(
        f"/api/v1/admin/tasks/run-recurring?target_date={target_date.isoformat()}"
    )
    assert response.status_code == 200
    data = response.json()

    assert data["status"] == "completed"
    assert data["date"] == target_date.isoformat()
    assert data["created_count"] >= 0


@pytest.mark.asyncio
async def test_run_recurring_task_no_due_templates(client: AsyncClient, test_db):
    """Тест запуска задачи когда нет шаблонов к выполнению"""
    # Запускаем задачу без создания шаблонов
    response = await client.post("/api/v1/admin/tasks/run-recurring")
    assert response.status_code == 200
    data = response.json()

    assert data["status"] == "completed"
    assert data["created_count"] == 0
    assert data["error_count"] == 0
