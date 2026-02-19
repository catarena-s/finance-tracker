"""
Integration tests for category routes
"""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession


@pytest.mark.asyncio
async def test_create_category_success(client: AsyncClient):
    """Тест успешного создания категории"""
    response = await client.post(
        "/api/v1/categories/",
        json={
            "name": "Продукты",
            "type": "expense",
            "color": "#FF5733",
            "description": "Расходы на продукты питания",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Продукты"
    assert data["type"] == "expense"
    assert data["color"] == "#FF5733"
    assert "id" in data


@pytest.mark.asyncio
async def test_create_category_duplicate(client: AsyncClient, db_session: AsyncSession):
    """Тест создания дубликата категории"""
    # Создаем первую категорию
    response1 = await client.post(
        "/api/v1/categories/",
        json={"name": "Зарплата", "type": "income", "color": "#00FF00"},
    )
    assert response1.status_code == 201

    # Пытаемся создать дубликат
    response2 = await client.post(
        "/api/v1/categories/",
        json={"name": "Зарплата", "type": "income", "color": "#00FF00"},
    )
    assert response2.status_code == 409
    assert "already exists" in response2.json()["detail"].lower()


@pytest.mark.asyncio
async def test_create_category_invalid_color(client: AsyncClient):
    """Тест создания категории с невалидным цветом"""
    response = await client.post(
        "/api/v1/categories/",
        json={"name": "Транспорт", "type": "expense", "color": "invalid"},
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_get_categories_list(client: AsyncClient):
    """Тест получения списка категорий"""
    # Создаем несколько категорий
    await client.post(
        "/api/v1/categories/",
        json={"name": "Еда", "type": "expense", "color": "#FF0000"},
    )
    await client.post(
        "/api/v1/categories/",
        json={"name": "Доход", "type": "income", "color": "#00FF00"},
    )

    response = await client.get("/api/v1/categories/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2


@pytest.mark.asyncio
async def test_get_category_by_id(client: AsyncClient):
    """Тест получения категории по ID"""
    # Создаем категорию
    create_response = await client.post(
        "/api/v1/categories/",
        json={"name": "Развлечения", "type": "expense", "color": "#0000FF"},
    )
    category_id = create_response.json()["id"]

    # Получаем категорию
    response = await client.get(f"/api/v1/categories/{category_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == category_id
    assert data["name"] == "Развлечения"


@pytest.mark.asyncio
async def test_get_category_not_found(client: AsyncClient):
    """Тест получения несуществующей категории"""
    response = await client.get("/api/v1/categories/99999")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_update_category(client: AsyncClient):
    """Тест обновления категории"""
    # Создаем категорию
    create_response = await client.post(
        "/api/v1/categories/",
        json={"name": "Одежда", "type": "expense", "color": "#FFFF00"},
    )
    category_id = create_response.json()["id"]

    # Обновляем категорию
    response = await client.put(
        f"/api/v1/categories/{category_id}",
        json={"name": "Одежда и обувь", "color": "#FF00FF"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Одежда и обувь"
    assert data["color"] == "#FF00FF"


@pytest.mark.asyncio
async def test_delete_category_success(client: AsyncClient):
    """Тест успешного удаления категории"""
    # Создаем категорию
    create_response = await client.post(
        "/api/v1/categories/",
        json={"name": "Временная", "type": "expense", "color": "#AAAAAA"},
    )
    category_id = create_response.json()["id"]

    # Удаляем категорию
    response = await client.delete(f"/api/v1/categories/{category_id}")
    assert response.status_code == 204

    # Проверяем что категория удалена
    get_response = await client.get(f"/api/v1/categories/{category_id}")
    assert get_response.status_code == 404


@pytest.mark.asyncio
async def test_delete_category_with_transactions(client: AsyncClient):
    """Тест удаления категории с транзакциями"""
    # Создаем категорию
    cat_response = await client.post(
        "/api/v1/categories/",
        json={"name": "Кафе", "type": "expense", "color": "#123456"},
    )
    category_id = cat_response.json()["id"]

    # Создаем транзакцию
    await client.post(
        "/api/v1/transactions/",
        json={
            "amount": 500.0,
            "type": "expense",
            "category_id": category_id,
            "description": "Обед",
            "date": "2024-02-15",
        },
    )

    # Пытаемся удалить категорию
    response = await client.delete(f"/api/v1/categories/{category_id}")
    assert response.status_code == 409
