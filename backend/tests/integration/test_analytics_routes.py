"""
Integration tests for analytics routes
"""

import pytest
from httpx import AsyncClient
from datetime import date, timedelta


@pytest.mark.asyncio
async def test_get_summary(client: AsyncClient):
    """Тест получения сводной статистики"""
    # Создаем категории
    cat1_response = await client.post(
        "/api/v1/categories/",
        json={"name": "Еда", "type": "expense", "color": "#FF0000"},
    )
    cat1_id = cat1_response.json()["id"]

    cat2_response = await client.post(
        "/api/v1/categories/",
        json={"name": "Зарплата", "type": "income", "color": "#00FF00"},
    )
    cat2_id = cat2_response.json()["id"]

    # Создаем транзакции
    today = date.today()
    await client.post(
        "/api/v1/transactions/",
        json={
            "amount": 1000.0,
            "type": "expense",
            "category_id": cat1_id,
            "date": today.isoformat(),
        },
    )
    await client.post(
        "/api/v1/transactions/",
        json={
            "amount": 50000.0,
            "type": "income",
            "category_id": cat2_id,
            "date": today.isoformat(),
        },
    )

    # Получаем статистику
    start_date = (today - timedelta(days=7)).isoformat()
    end_date = (today + timedelta(days=1)).isoformat()
    response = await client.get(
        f"/api/v1/analytics/summary?start_date={start_date}&end_date={end_date}"
    )
    assert response.status_code == 200
    data = response.json()
    assert "total_income" in data
    assert "total_expense" in data
    assert "balance" in data
    assert data["total_income"] >= 50000.0
    assert data["total_expense"] >= 1000.0


@pytest.mark.asyncio
async def test_get_trends(client: AsyncClient):
    """Тест получения трендов"""
    cat_response = await client.post(
        "/api/v1/categories/",
        json={"name": "Покупки", "type": "expense", "color": "#0000FF"},
    )
    cat_id = cat_response.json()["id"]

    today = date.today()
    await client.post(
        "/api/v1/transactions/",
        json={
            "amount": 500.0,
            "type": "expense",
            "category_id": cat_id,
            "date": today.isoformat(),
        },
    )

    start_date = (today - timedelta(days=30)).isoformat()
    end_date = (today + timedelta(days=1)).isoformat()
    response = await client.get(
        f"/api/v1/analytics/trends?start_date={start_date}&end_date={end_date}"
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


@pytest.mark.asyncio
async def test_get_category_breakdown(client: AsyncClient):
    """Тест получения разбивки по категориям"""
    cat_response = await client.post(
        "/api/v1/categories/",
        json={"name": "Транспорт", "type": "expense", "color": "#FF00FF"},
    )
    cat_id = cat_response.json()["id"]

    today = date.today()
    await client.post(
        "/api/v1/transactions/",
        json={
            "amount": 300.0,
            "type": "expense",
            "category_id": cat_id,
            "date": today.isoformat(),
        },
    )

    start_date = (today - timedelta(days=7)).isoformat()
    end_date = (today + timedelta(days=1)).isoformat()
    response = await client.get(
        f"/api/v1/analytics/by-category?start_date={start_date}&end_date={end_date}"
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    if len(data) > 0:
        assert "category_name" in data[0]
        assert "total_amount" in data[0]


@pytest.mark.asyncio
async def test_get_top_categories(client: AsyncClient):
    """Тест получения топ категорий"""
    cat_response = await client.post(
        "/api/v1/categories/",
        json={"name": "Рестораны", "type": "expense", "color": "#FFFF00"},
    )
    cat_id = cat_response.json()["id"]

    today = date.today()
    await client.post(
        "/api/v1/transactions/",
        json={
            "amount": 2000.0,
            "type": "expense",
            "category_id": cat_id,
            "date": today.isoformat(),
        },
    )

    start_date = (today - timedelta(days=7)).isoformat()
    end_date = (today + timedelta(days=1)).isoformat()
    response = await client.get(
        f"/api/v1/analytics/top-categories?start_date={start_date}&end_date={end_date}&limit=5"
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) <= 5
