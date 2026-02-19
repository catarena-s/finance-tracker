"""
Integration tests for transaction routes
"""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_transaction_success(client: AsyncClient):
    """Тест успешного создания транзакции"""
    # Создаем категорию
    cat_response = await client.post(
        "/api/v1/categories/",
        json={"name": "Супермаркет", "icon": "🛒", "type": "expense", "color": "#FF0000"},
    )
    category_id = cat_response.json()["id"]

    # Создаем транзакцию
    response = await client.post(
        "/api/v1/transactions/",
        json={
            "amount": 1500.50,
            "type": "expense",
            "category_id": category_id,
            "description": "Покупки в магазине",
            "transaction_date": "2024-02-15",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert float(data["amount"]) == 1500.50
    assert data["type"] == "expense"
    assert data["category_id"] == category_id
    assert "id" in data


@pytest.mark.asyncio
async def test_create_transaction_invalid_amount(client: AsyncClient):
    """Тест создания транзакции с невалидной суммой"""
    cat_response = await client.post(
        "/api/v1/categories/",
        json={"name": "Тест", "icon": "📝", "type": "expense", "color": "#000000"},
    )
    category_id = cat_response.json()["id"]

    response = await client.post(
        "/api/v1/transactions/",
        json={
            "amount": -100.0,
            "type": "expense",
            "category_id": category_id,
            "transaction_date": "2024-02-15",
        },
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_get_transactions_list(client: AsyncClient):
    """Тест получения списка транзакций"""
    cat_response = await client.post(
        "/api/v1/categories/",
        json={"name": "Разное", "icon": "📦", "type": "expense", "color": "#AAAAAA"},
    )
    category_id = cat_response.json()["id"]

    # Создаем несколько транзакций
    await client.post(
        "/api/v1/transactions/",
        json={
            "amount": 100.0,
            "type": "expense",
            "category_id": category_id,
            "transaction_date": "2024-02-15",
        },
    )
    await client.post(
        "/api/v1/transactions/",
        json={
            "amount": 200.0,
            "type": "expense",
            "category_id": category_id,
            "transaction_date": "2024-02-16",
        },
    )

    response = await client.get("/api/v1/transactions/")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert len(data["items"]) >= 2


@pytest.mark.asyncio
async def test_get_transaction_by_id(client: AsyncClient):
    """Тест получения транзакции по ID"""
    cat_response = await client.post(
        "/api/v1/categories/",
        json={"name": "Кино", "icon": "🎬", "type": "expense", "color": "#FF00FF"},
    )
    category_id = cat_response.json()["id"]

    create_response = await client.post(
        "/api/v1/transactions/",
        json={
            "amount": 500.0,
            "type": "expense",
            "category_id": category_id,
            "description": "Билеты в кино",
            "transaction_date": "2024-02-15",
        },
    )
    transaction_id = create_response.json()["id"]

    response = await client.get(f"/api/v1/transactions/{transaction_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == transaction_id
    assert float(data["amount"]) == 500.0


@pytest.mark.asyncio
async def test_update_transaction(client: AsyncClient):
    """Тест обновления транзакции"""
    cat_response = await client.post(
        "/api/v1/categories/",
        json={"name": "Такси", "icon": "🚕", "type": "expense", "color": "#FFFF00"},
    )
    category_id = cat_response.json()["id"]

    create_response = await client.post(
        "/api/v1/transactions/",
        json={
            "amount": 300.0,
            "type": "expense",
            "category_id": category_id,
            "transaction_date": "2024-02-15",
        },
    )
    transaction_id = create_response.json()["id"]

    response = await client.put(
        f"/api/v1/transactions/{transaction_id}",
        json={"amount": 350.0, "description": "Поездка на такси"},
    )
    assert response.status_code == 200
    data = response.json()
    assert float(data["amount"]) == 350.0
    assert data["description"] == "Поездка на такси"


@pytest.mark.asyncio
async def test_delete_transaction(client: AsyncClient):
    """Тест удаления транзакции"""
    cat_response = await client.post(
        "/api/v1/categories/",
        json={"name": "Удалить", "icon": "🗑️", "type": "expense", "color": "#000000"},
    )
    category_id = cat_response.json()["id"]

    create_response = await client.post(
        "/api/v1/transactions/",
        json={
            "amount": 100.0,
            "type": "expense",
            "category_id": category_id,
            "transaction_date": "2024-02-15",
        },
    )
    transaction_id = create_response.json()["id"]

    response = await client.delete(f"/api/v1/transactions/{transaction_id}")
    assert response.status_code == 204

    get_response = await client.get(f"/api/v1/transactions/{transaction_id}")
    assert get_response.status_code == 404


@pytest.mark.asyncio
async def test_filter_transactions_by_type(client: AsyncClient):
    """Тест фильтрации транзакций по типу"""
    cat_response = await client.post(
        "/api/v1/categories/",
        json={"name": "Фильтр", "icon": "🔍", "type": "expense", "color": "#123456"},
    )
    category_id = cat_response.json()["id"]

    await client.post(
        "/api/v1/transactions/",
        json={
            "amount": 100.0,
            "type": "expense",
            "category_id": category_id,
            "transaction_date": "2024-02-15",
        },
    )

    response = await client.get("/api/v1/transactions/?type=expense")
    assert response.status_code == 200
    data = response.json()
    assert all(item["type"] == "expense" for item in data["items"])
