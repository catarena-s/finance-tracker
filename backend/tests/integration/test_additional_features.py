"""
Интеграционные тесты для доработок: аналитика (валюта, период),
повторяющиеся транзакции (camelCase), бюджеты (валюта), транзакции (валюта, is_recurring).
"""

import pytest
from httpx import AsyncClient
from datetime import date, timedelta


# --- Analytics: by_currency, period, currency param ---


@pytest.mark.asyncio
async def test_analytics_summary_returns_by_currency(client: AsyncClient):
    """Сводка возвращает разбивку по валютам (by_currency)."""
    cat = await client.post(
        "/api/v1/categories/",
        json={"name": "Еда", "icon": "🍔", "type": "expense", "color": "#FF0000"},
    )
    assert cat.status_code == 201
    cat_id = cat.json()["id"]

    today = date.today()
    await client.post(
        "/api/v1/transactions/",
        json={
            "amount": 100.0,
            "currency": "EUR",
            "type": "expense",
            "category_id": cat_id,
            "transaction_date": today.isoformat(),
        },
    )
    start = (today - timedelta(days=1)).isoformat()
    end = (today + timedelta(days=1)).isoformat()
    response = await client.get(
        f"/api/v1/analytics/summary?start_date={start}&end_date={end}"
    )
    assert response.status_code == 200
    data = response.json()
    assert "by_currency" in data
    assert isinstance(data["by_currency"], list)
    currencies = [row["currency"] for row in data["by_currency"]]
    assert "EUR" in currencies


@pytest.mark.asyncio
async def test_analytics_trends_period_day(client: AsyncClient):
    """Тренды принимают период period=day и группируют по дням."""
    cat = await client.post(
        "/api/v1/categories/",
        json={"name": "Транспорт", "icon": "🚗", "type": "expense", "color": "#0000FF"},
    )
    assert cat.status_code == 201
    cat_id = cat.json()["id"]
    today = date.today()
    await client.post(
        "/api/v1/transactions/",
        json={
            "amount": 50.0,
            "type": "expense",
            "category_id": cat_id,
            "transaction_date": today.isoformat(),
        },
    )
    start = (today - timedelta(days=3)).isoformat()
    end = (today + timedelta(days=1)).isoformat()
    response = await client.get(
        f"/api/v1/analytics/trends?start_date={start}&end_date={end}&period=day"
    )
    assert response.status_code == 200
    data = response.json()
    assert "trends" in data
    assert isinstance(data["trends"], list)


@pytest.mark.asyncio
async def test_analytics_top_categories_limit(client: AsyncClient):
    """Топ категорий возвращает не более limit записей."""
    cat = await client.post(
        "/api/v1/categories/",
        json={"name": "Кафе", "icon": "☕", "type": "expense", "color": "#888888"},
    )
    assert cat.status_code == 201
    cat_id = cat.json()["id"]
    today = date.today()
    await client.post(
        "/api/v1/transactions/",
        json={
            "amount": 100.0,
            "type": "expense",
            "category_id": cat_id,
            "transaction_date": today.isoformat(),
        },
    )
    start = (today - timedelta(days=7)).isoformat()
    end = (today + timedelta(days=1)).isoformat()
    response = await client.get(
        f"/api/v1/analytics/top-categories?start_date={start}&end_date={end}&limit=5"
    )
    assert response.status_code == 200
    data = response.json()
    assert "top_categories" in data
    assert len(data["top_categories"]) <= 5


# --- Recurring: создание с camelCase (как с фронта) ---


@pytest.mark.asyncio
async def test_recurring_create_camelCase_payload(client: AsyncClient):
    """Создание шаблона повторяющейся транзакции с camelCase (как отправляет фронт)."""
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
            "name": "Spotify",
            "amount": 9.99,
            "currency": "USD",
            "categoryId": category_id,
            "description": "Музыка",
            "type": "expense",
            "frequency": "monthly",
            "interval": 1,
            "startDate": start.isoformat(),
            "endDate": end.isoformat(),
        },
    )
    assert response.status_code == 201, response.text
    data = response.json()
    assert data["name"] == "Spotify"
    assert data["frequency"] == "monthly"
    assert data["currency"] == "USD"
    assert "id" in data
    assert "next_occurrence" in data or "nextOccurrence" in data


# --- Budget: создание с валютой ---


@pytest.mark.asyncio
async def test_budget_create_with_currency(client: AsyncClient):
    """Создание бюджета с полем currency."""
    cat = await client.post(
        "/api/v1/categories/",
        json={"name": "Продукты", "icon": "🛒", "type": "expense", "color": "#00AA00"},
    )
    assert cat.status_code == 201
    cat_id = cat.json()["id"]

    start = date.today().replace(day=1)
    end = start + timedelta(days=30)
    response = await client.post(
        "/api/v1/budgets/",
        json={
            "category_id": cat_id,
            "amount": 5000.0,
            "currency": "RUB",
            "period": "monthly",
            "start_date": start.isoformat(),
            "end_date": end.isoformat(),
        },
    )
    assert response.status_code == 201, response.text
    data = response.json()
    assert float(data["amount"]) == 5000.0
    assert data.get("currency") == "RUB"


# --- Transaction: создание с currency и is_recurring ---


@pytest.mark.asyncio
async def test_transaction_create_with_currency_and_is_recurring(client: AsyncClient):
    """Создание транзакции с currency и is_recurring."""
    cat = await client.post(
        "/api/v1/categories/",
        json={"name": "Зарплата", "icon": "💰", "type": "income", "color": "#00FF00"},
    )
    assert cat.status_code == 201
    cat_id = cat.json()["id"]
    today = date.today()
    response = await client.post(
        "/api/v1/transactions/",
        json={
            "amount": 100000.0,
            "currency": "RUB",
            "type": "income",
            "category_id": cat_id,
            "transaction_date": today.isoformat(),
            "is_recurring": True,
            "recurring_pattern": {"frequency": "monthly", "interval": 1},
        },
    )
    assert response.status_code == 201, response.text
    data = response.json()
    assert float(data["amount"]) == 100000.0
    assert data.get("currency") == "RUB"
    assert data.get("is_recurring") is True
