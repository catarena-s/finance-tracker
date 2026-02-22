"""
Интеграционные тесты для фильтрации транзакций
"""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession


@pytest.mark.asyncio
async def test_filter_transactions_by_type_income(
    client: AsyncClient, test_db: AsyncSession
):
    """Тест фильтрации транзакций по типу income"""
    # Создаем категории
    income_cat = await client.post(
        "/api/v1/categories/",
        json={"name": "Зарплата", "icon": "💰", "type": "income", "color": "#00B894"},
    )
    expense_cat = await client.post(
        "/api/v1/categories/",
        json={"name": "Продукты", "icon": "🛒", "type": "expense", "color": "#FF6B6B"},
    )

    income_cat_id = income_cat.json()["id"]
    expense_cat_id = expense_cat.json()["id"]

    # Создаем транзакции разных типов
    await client.post(
        "/api/v1/transactions/",
        json={
            "amount": 50000.0,
            "type": "income",
            "categoryId": income_cat_id,
            "transactionDate": "2024-02-15",
            "description": "Зарплата за февраль",
        },
    )
    await client.post(
        "/api/v1/transactions/",
        json={
            "amount": 3000.0,
            "type": "expense",
            "categoryId": expense_cat_id,
            "transactionDate": "2024-02-16",
            "description": "Покупка продуктов",
        },
    )
    await client.post(
        "/api/v1/transactions/",
        json={
            "amount": 10000.0,
            "type": "income",
            "categoryId": income_cat_id,
            "transactionDate": "2024-02-17",
            "description": "Бонус",
        },
    )

    # Фильтруем только доходы
    response = await client.get("/api/v1/transactions/?type=income")
    assert response.status_code == 200
    data = response.json()

    assert len(data["items"]) == 2
    assert all(item["type"] == "income" for item in data["items"])
    assert data["total"] == 2


@pytest.mark.asyncio
async def test_filter_transactions_by_type_expense(
    client: AsyncClient, test_db: AsyncSession
):
    """Тест фильтрации транзакций по типу expense"""
    # Создаем категории
    income_cat = await client.post(
        "/api/v1/categories/",
        json={"name": "Зарплата", "icon": "💰", "type": "income", "color": "#00B894"},
    )
    expense_cat = await client.post(
        "/api/v1/categories/",
        json={"name": "Продукты", "icon": "🛒", "type": "expense", "color": "#FF6B6B"},
    )

    income_cat_id = income_cat.json()["id"]
    expense_cat_id = expense_cat.json()["id"]

    # Создаем транзакции
    await client.post(
        "/api/v1/transactions/",
        json={
            "amount": 50000.0,
            "type": "income",
            "categoryId": income_cat_id,
            "transactionDate": "2024-02-15",
        },
    )
    await client.post(
        "/api/v1/transactions/",
        json={
            "amount": 3000.0,
            "type": "expense",
            "categoryId": expense_cat_id,
            "transactionDate": "2024-02-16",
        },
    )
    await client.post(
        "/api/v1/transactions/",
        json={
            "amount": 1500.0,
            "type": "expense",
            "categoryId": expense_cat_id,
            "transactionDate": "2024-02-17",
        },
    )

    # Фильтруем только расходы
    response = await client.get("/api/v1/transactions/?type=expense")
    assert response.status_code == 200
    data = response.json()

    assert len(data["items"]) == 2
    assert all(item["type"] == "expense" for item in data["items"])
    assert data["total"] == 2


@pytest.mark.asyncio
async def test_filter_transactions_without_type(
    client: AsyncClient, test_db: AsyncSession
):
    """Тест получения всех транзакций без фильтра по типу"""
    # Создаем категории
    income_cat = await client.post(
        "/api/v1/categories/",
        json={"name": "Зарплата", "icon": "💰", "type": "income", "color": "#00B894"},
    )
    expense_cat = await client.post(
        "/api/v1/categories/",
        json={"name": "Продукты", "icon": "🛒", "type": "expense", "color": "#FF6B6B"},
    )

    income_cat_id = income_cat.json()["id"]
    expense_cat_id = expense_cat.json()["id"]

    # Создаем транзакции
    await client.post(
        "/api/v1/transactions/",
        json={
            "amount": 50000.0,
            "type": "income",
            "categoryId": income_cat_id,
            "transactionDate": "2024-02-15",
        },
    )
    await client.post(
        "/api/v1/transactions/",
        json={
            "amount": 3000.0,
            "type": "expense",
            "categoryId": expense_cat_id,
            "transactionDate": "2024-02-16",
        },
    )

    # Получаем все транзакции
    response = await client.get("/api/v1/transactions/")
    assert response.status_code == 200
    data = response.json()

    assert len(data["items"]) == 2
    assert data["total"] == 2
    # Проверяем, что есть оба типа
    types = {item["type"] for item in data["items"]}
    assert types == {"income", "expense"}


@pytest.mark.asyncio
async def test_filter_transactions_by_type_and_category(
    client: AsyncClient, test_db: AsyncSession
):
    """Тест комбинированной фильтрации по типу и категории"""
    # Создаем категории
    salary_cat = await client.post(
        "/api/v1/categories/",
        json={"name": "Зарплата", "icon": "💰", "type": "income", "color": "#00B894"},
    )
    freelance_cat = await client.post(
        "/api/v1/categories/",
        json={"name": "Фриланс", "icon": "💻", "type": "income", "color": "#00CEC9"},
    )

    salary_cat_id = salary_cat.json()["id"]
    freelance_cat_id = freelance_cat.json()["id"]

    # Создаем транзакции
    await client.post(
        "/api/v1/transactions/",
        json={
            "amount": 50000.0,
            "type": "income",
            "categoryId": salary_cat_id,
            "transactionDate": "2024-02-15",
            "description": "Зарплата",
        },
    )
    await client.post(
        "/api/v1/transactions/",
        json={
            "amount": 15000.0,
            "type": "income",
            "categoryId": freelance_cat_id,
            "transactionDate": "2024-02-16",
            "description": "Проект",
        },
    )
    await client.post(
        "/api/v1/transactions/",
        json={
            "amount": 45000.0,
            "type": "income",
            "categoryId": salary_cat_id,
            "transactionDate": "2024-03-15",
            "description": "Зарплата за март",
        },
    )

    # Фильтруем по типу income и категории "Зарплата"
    response = await client.get(
        f"/api/v1/transactions/?type=income&category_id={salary_cat_id}"
    )
    assert response.status_code == 200
    data = response.json()

    assert len(data["items"]) == 2
    assert all(item["type"] == "income" for item in data["items"])
    assert all(item["categoryId"] == salary_cat_id for item in data["items"])
    assert data["total"] == 2


@pytest.mark.asyncio
async def test_filter_transactions_by_type_and_date_range(
    client: AsyncClient, test_db: AsyncSession
):
    """Тест фильтрации по типу и диапазону дат"""
    # Создаем категорию
    expense_cat = await client.post(
        "/api/v1/categories/",
        json={"name": "Продукты", "icon": "🛒", "type": "expense", "color": "#FF6B6B"},
    )
    expense_cat_id = expense_cat.json()["id"]

    # Создаем транзакции в разные даты
    await client.post(
        "/api/v1/transactions/",
        json={
            "amount": 1000.0,
            "type": "expense",
            "categoryId": expense_cat_id,
            "transactionDate": "2024-02-10",
        },
    )
    await client.post(
        "/api/v1/transactions/",
        json={
            "amount": 1500.0,
            "type": "expense",
            "categoryId": expense_cat_id,
            "transactionDate": "2024-02-15",
        },
    )
    await client.post(
        "/api/v1/transactions/",
        json={
            "amount": 2000.0,
            "type": "expense",
            "categoryId": expense_cat_id,
            "transactionDate": "2024-02-25",
        },
    )

    # Фильтруем по типу expense и диапазону дат
    response = await client.get(
        "/api/v1/transactions/?type=expense&start_date=2024-02-12&end_date=2024-02-20"
    )
    assert response.status_code == 200
    data = response.json()

    assert len(data["items"]) == 1
    assert data["items"][0]["transactionDate"] == "2024-02-15"
    assert data["items"][0]["type"] == "expense"
    assert data["total"] == 1


@pytest.mark.asyncio
async def test_filter_transactions_empty_result(
    client: AsyncClient, test_db: AsyncSession
):
    """Тест фильтрации с пустым результатом"""
    # Создаем категорию
    expense_cat = await client.post(
        "/api/v1/categories/",
        json={"name": "Продукты", "icon": "🛒", "type": "expense", "color": "#FF6B6B"},
    )
    expense_cat_id = expense_cat.json()["id"]

    # Создаем только expense транзакции
    await client.post(
        "/api/v1/transactions/",
        json={
            "amount": 1000.0,
            "type": "expense",
            "categoryId": expense_cat_id,
            "transactionDate": "2024-02-15",
        },
    )

    # Фильтруем по типу income (которых нет)
    response = await client.get("/api/v1/transactions/?type=income")
    assert response.status_code == 200
    data = response.json()

    assert len(data["items"]) == 0
    assert data["total"] == 0
