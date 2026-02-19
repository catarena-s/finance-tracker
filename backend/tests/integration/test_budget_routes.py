"""
Integration tests for budget routes
"""

import pytest
from httpx import AsyncClient
from datetime import date, timedelta


@pytest.mark.asyncio
async def test_create_budget_success(client: AsyncClient):
    """Тест успешного создания бюджета"""
    cat_response = await client.post(
        "/api/v1/categories/",
        json={"name": "Продукты", "type": "expense", "color": "#FF0000"},
    )
    category_id = cat_response.json()["id"]

    today = date.today()
    response = await client.post(
        "/api/v1/budgets/",
        json={
            "category_id": category_id,
            "amount": 10000.0,
            "period": "monthly",
            "start_date": today.isoformat(),
            "end_date": (today + timedelta(days=30)).isoformat(),
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["amount"] == 10000.0
    assert data["period"] == "monthly"
    assert "id" in data


@pytest.mark.asyncio
async def test_create_budget_duplicate(client: AsyncClient):
    """Тест создания дубликата бюджета"""
    cat_response = await client.post(
        "/api/v1/categories/",
        json={"name": "Транспорт", "type": "expense", "color": "#00FF00"},
    )
    category_id = cat_response.json()["id"]

    today = date.today()
    budget_data = {
        "category_id": category_id,
        "amount": 5000.0,
        "period": "monthly",
        "start_date": today.isoformat(),
        "end_date": (today + timedelta(days=30)).isoformat(),
    }

    response1 = await client.post("/api/v1/budgets/", json=budget_data)
    assert response1.status_code == 201

    response2 = await client.post("/api/v1/budgets/", json=budget_data)
    assert response2.status_code == 409


@pytest.mark.asyncio
async def test_get_budgets_list(client: AsyncClient):
    """Тест получения списка бюджетов"""
    cat_response = await client.post(
        "/api/v1/categories/",
        json={"name": "Развлечения", "type": "expense", "color": "#0000FF"},
    )
    category_id = cat_response.json()["id"]

    today = date.today()
    await client.post(
        "/api/v1/budgets/",
        json={
            "category_id": category_id,
            "amount": 3000.0,
            "period": "monthly",
            "start_date": today.isoformat(),
            "end_date": (today + timedelta(days=30)).isoformat(),
        },
    )

    response = await client.get("/api/v1/budgets/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1


@pytest.mark.asyncio
async def test_get_budget_by_id(client: AsyncClient):
    """Тест получения бюджета по ID"""
    cat_response = await client.post(
        "/api/v1/categories/",
        json={"name": "Одежда", "type": "expense", "color": "#FF00FF"},
    )
    category_id = cat_response.json()["id"]

    today = date.today()
    create_response = await client.post(
        "/api/v1/budgets/",
        json={
            "category_id": category_id,
            "amount": 7000.0,
            "period": "monthly",
            "start_date": today.isoformat(),
            "end_date": (today + timedelta(days=30)).isoformat(),
        },
    )
    budget_id = create_response.json()["id"]

    response = await client.get(f"/api/v1/budgets/{budget_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == budget_id
    assert data["amount"] == 7000.0


@pytest.mark.asyncio
async def test_update_budget(client: AsyncClient):
    """Тест обновления бюджета"""
    cat_response = await client.post(
        "/api/v1/categories/",
        json={"name": "Здоровье", "type": "expense", "color": "#FFFF00"},
    )
    category_id = cat_response.json()["id"]

    today = date.today()
    create_response = await client.post(
        "/api/v1/budgets/",
        json={
            "category_id": category_id,
            "amount": 5000.0,
            "period": "monthly",
            "start_date": today.isoformat(),
            "end_date": (today + timedelta(days=30)).isoformat(),
        },
    )
    budget_id = create_response.json()["id"]

    response = await client.put(
        f"/api/v1/budgets/{budget_id}", json={"amount": 6000.0}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["amount"] == 6000.0


@pytest.mark.asyncio
async def test_delete_budget(client: AsyncClient):
    """Тест удаления бюджета"""
    cat_response = await client.post(
        "/api/v1/categories/",
        json={"name": "Временный", "type": "expense", "color": "#AAAAAA"},
    )
    category_id = cat_response.json()["id"]

    today = date.today()
    create_response = await client.post(
        "/api/v1/budgets/",
        json={
            "category_id": category_id,
            "amount": 1000.0,
            "period": "monthly",
            "start_date": today.isoformat(),
            "end_date": (today + timedelta(days=30)).isoformat(),
        },
    )
    budget_id = create_response.json()["id"]

    response = await client.delete(f"/api/v1/budgets/{budget_id}")
    assert response.status_code == 204

    get_response = await client.get(f"/api/v1/budgets/{budget_id}")
    assert get_response.status_code == 404


@pytest.mark.asyncio
async def test_get_budget_progress(client: AsyncClient):
    """Тест получения прогресса бюджета"""
    cat_response = await client.post(
        "/api/v1/categories/",
        json={"name": "Кафе", "type": "expense", "color": "#123456"},
    )
    category_id = cat_response.json()["id"]

    today = date.today()
    budget_response = await client.post(
        "/api/v1/budgets/",
        json={
            "category_id": category_id,
            "amount": 5000.0,
            "period": "monthly",
            "start_date": today.isoformat(),
            "end_date": (today + timedelta(days=30)).isoformat(),
        },
    )
    budget_id = budget_response.json()["id"]

    # Создаем транзакцию
    await client.post(
        "/api/v1/transactions/",
        json={
            "amount": 1500.0,
            "type": "expense",
            "category_id": category_id,
            "date": today.isoformat(),
        },
    )

    response = await client.get(f"/api/v1/budgets/{budget_id}/progress")
    assert response.status_code == 200
    data = response.json()
    assert data["budget_amount"] == 5000.0
    assert data["spent_amount"] == 1500.0
    assert data["remaining_amount"] == 3500.0
    assert data["percentage_used"] == 30.0
