"""
Интеграционные тесты для API: currencies, recurring-transactions, tasks, csv.
"""

import base64
import pytest
from httpx import AsyncClient
from datetime import date, timedelta


@pytest.mark.integration
@pytest.mark.asyncio
async def test_get_currencies_list(client: AsyncClient):
    """GET /api/v1/currencies/ возвращает список валют (после seed — непустой)."""
    response = await client.get("/api/v1/currencies/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


@pytest.mark.integration
@pytest.mark.asyncio
async def test_get_recurring_transactions_list(client: AsyncClient):
    """GET /api/v1/recurring-transactions/ возвращает список шаблонов."""
    response = await client.get("/api/v1/recurring-transactions/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


@pytest.mark.integration
@pytest.mark.asyncio
async def test_get_task_status_unknown_id(client: AsyncClient):
    """GET /api/v1/tasks/{task_id}/status для неизвестного id возвращает pending."""
    response = await client.get("/api/v1/tasks/unknown-task-id-12345/status")
    assert response.status_code == 200
    data = response.json()
    assert data["task_id"] == "unknown-task-id-12345"
    assert data["status"] == "pending"


@pytest.mark.integration
@pytest.mark.asyncio
async def test_create_recurring_transaction(client: AsyncClient):
    """Создание шаблона повторяющейся транзакции."""
    cat = await client.post(
        "/api/v1/categories/",
        json={"name": "Подписка", "icon": "📱", "type": "expense", "color": "#333333"},
    )
    assert cat.status_code == 201
    category_id = cat.json()["id"]

    start = date.today()
    end = start + timedelta(days=365)
    response = await client.post(
        "/api/v1/recurring-transactions/",
        json={
            "name": "Netflix",
            "amount": 10.99,
            "currency": "USD",
            "category_id": category_id,
            "type": "expense",
            "frequency": "monthly",
            "interval": 1,
            "start_date": start.isoformat(),
            "end_date": end.isoformat(),
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Netflix"
    assert data["frequency"] == "monthly"
    assert "id" in data
    assert "next_occurrence" in data


@pytest.mark.integration
@pytest.mark.asyncio
async def test_csv_export_empty(client: AsyncClient):
    """GET /api/v1/csv/export возвращает CSV с заголовками."""
    response = await client.get("/api/v1/csv/export")
    assert response.status_code == 200
    assert "text/csv" in response.headers.get("content-type", "")
    lines = response.text.strip().split("\n")
    assert len(lines) >= 1
    assert "amount" in lines[0].lower() or "date" in lines[0].lower()


@pytest.mark.integration
@pytest.mark.asyncio
async def test_csv_import_sync_small(client: AsyncClient):
    """POST /api/v1/csv/import с малым файлом возвращает результат синхронно."""
    csv_content = "amount,date,type,category\n100.50,2024-01-15,income,Зарплата"
    encoded = base64.b64encode(csv_content.encode("utf-8")).decode("ascii")
    # Создаём категорию
    await client.post(
        "/api/v1/categories/",
        json={"name": "Зарплата", "icon": "💰", "type": "income", "color": "#00FF00"},
    )
    response = await client.post(
        "/api/v1/csv/import",
        json={
            "file_content": encoded,
            "mapping": {
                "amount": "amount",
                "category_name": "category",
                "transaction_date": "date",
                "type": "type",
            },
            "date_format": "%Y-%m-%d",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "task_id" in data
    assert data["status"] in ("completed", "pending")
    if data["status"] == "completed":
        assert "created_count" in data
