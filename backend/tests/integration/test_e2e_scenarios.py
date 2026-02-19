"""
End-to-end integration tests
Тестируют полные сценарии использования API
"""

import pytest
from httpx import AsyncClient
from datetime import date, timedelta
import io


@pytest.mark.asyncio
async def test_full_user_flow(client: AsyncClient):
    """
    Тест полного пользовательского сценария:
    1. Создание категорий
    2. Создание транзакций
    3. Создание бюджета
    4. Получение аналитики
    """
    today = date.today()

    # Шаг 1: Создаем категории
    food_cat = await client.post(
        "/api/v1/categories/",
        json={"name": "Продукты", "type": "expense", "color": "#FF0000"},
    )
    assert food_cat.status_code == 201
    food_cat_id = food_cat.json()["id"]

    salary_cat = await client.post(
        "/api/v1/categories/",
        json={"name": "Зарплата", "type": "income", "color": "#00FF00"},
    )
    assert salary_cat.status_code == 201
    salary_cat_id = salary_cat.json()["id"]

    # Шаг 2: Создаем транзакции
    income_tx = await client.post(
        "/api/v1/transactions/",
        json={
            "amount": 100000.0,
            "type": "income",
            "category_id": salary_cat_id,
            "description": "Месячная зарплата",
            "date": today.isoformat(),
        },
    )
    assert income_tx.status_code == 201

    expense_tx1 = await client.post(
        "/api/v1/transactions/",
        json={
            "amount": 5000.0,
            "type": "expense",
            "category_id": food_cat_id,
            "description": "Покупки в супермаркете",
            "date": today.isoformat(),
        },
    )
    assert expense_tx1.status_code == 201

    expense_tx2 = await client.post(
        "/api/v1/transactions/",
        json={
            "amount": 3000.0,
            "type": "expense",
            "category_id": food_cat_id,
            "description": "Ресторан",
            "date": today.isoformat(),
        },
    )
    assert expense_tx2.status_code == 201

    # Шаг 3: Создаем бюджет
    budget = await client.post(
        "/api/v1/budgets/",
        json={
            "category_id": food_cat_id,
            "amount": 15000.0,
            "period": "monthly",
            "start_date": today.isoformat(),
            "end_date": (today + timedelta(days=30)).isoformat(),
        },
    )
    assert budget.status_code == 201
    budget_id = budget.json()["id"]

    # Шаг 4: Проверяем прогресс бюджета
    progress = await client.get(f"/api/v1/budgets/{budget_id}/progress")
    assert progress.status_code == 200
    progress_data = progress.json()
    assert progress_data["budget_amount"] == 15000.0
    assert progress_data["spent_amount"] == 8000.0  # 5000 + 3000
    assert progress_data["remaining_amount"] == 7000.0

    # Шаг 5: Получаем аналитику
    start_date = (today - timedelta(days=1)).isoformat()
    end_date = (today + timedelta(days=1)).isoformat()

    summary = await client.get(
        f"/api/v1/analytics/summary?start_date={start_date}&end_date={end_date}"
    )
    assert summary.status_code == 200
    summary_data = summary.json()
    assert summary_data["total_income"] == 100000.0
    assert summary_data["total_expense"] == 8000.0
    assert summary_data["balance"] == 92000.0

    # Шаг 6: Получаем разбивку по категориям
    breakdown = await client.get(
        f"/api/v1/analytics/by-category?start_date={start_date}&end_date={end_date}"
    )
    assert breakdown.status_code == 200
    breakdown_data = breakdown.json()
    assert len(breakdown_data) >= 1


@pytest.mark.asyncio
async def test_error_handling_flow(client: AsyncClient):
    """Тест обработки ошибок"""
    # Попытка создать транзакцию с несуществующей категорией
    response = await client.post(
        "/api/v1/transactions/",
        json={
            "amount": 100.0,
            "type": "expense",
            "category_id": 99999,
            "date": date.today().isoformat(),
        },
    )
    assert response.status_code in [404, 422]

    # Попытка получить несуществующую категорию
    response = await client.get("/api/v1/categories/99999")
    assert response.status_code == 404

    # Попытка создать категорию с невалидными данными
    response = await client.post(
        "/api/v1/categories/",
        json={"name": "", "type": "invalid", "color": "not-a-color"},
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_csv_import_export_flow(client: AsyncClient):
    """Тест импорта и экспорта CSV"""
    # Создаем категорию
    cat_response = await client.post(
        "/api/v1/categories/",
        json={"name": "Тестовая", "type": "expense", "color": "#123456"},
    )
    assert cat_response.status_code == 201
    cat_id = cat_response.json()["id"]

    # Создаем транзакции
    today = date.today()
    for i in range(3):
        await client.post(
            "/api/v1/transactions/",
            json={
                "amount": 100.0 * (i + 1),
                "type": "expense",
                "category_id": cat_id,
                "description": f"Транзакция {i+1}",
                "date": today.isoformat(),
            },
        )

    # Экспортируем в CSV
    export_response = await client.get("/api/v1/transactions/export")
    assert export_response.status_code == 200
    assert "text/csv" in export_response.headers["content-type"]

    # Проверяем что CSV содержит данные
    csv_content = export_response.text
    assert "amount" in csv_content.lower()
    assert "type" in csv_content.lower()


@pytest.mark.asyncio
async def test_budget_lifecycle(client: AsyncClient):
    """Тест полного жизненного цикла бюджета"""
    # Создаем категорию
    cat_response = await client.post(
        "/api/v1/categories/",
        json={"name": "Развлечения", "type": "expense", "color": "#FF00FF"},
    )
    cat_id = cat_response.json()["id"]

    today = date.today()

    # Создаем бюджет
    budget_response = await client.post(
        "/api/v1/budgets/",
        json={
            "category_id": cat_id,
            "amount": 10000.0,
            "period": "monthly",
            "start_date": today.isoformat(),
            "end_date": (today + timedelta(days=30)).isoformat(),
        },
    )
    assert budget_response.status_code == 201
    budget_id = budget_response.json()["id"]

    # Добавляем транзакции
    await client.post(
        "/api/v1/transactions/",
        json={
            "amount": 2000.0,
            "type": "expense",
            "category_id": cat_id,
            "date": today.isoformat(),
        },
    )

    # Проверяем прогресс
    progress = await client.get(f"/api/v1/budgets/{budget_id}/progress")
    assert progress.status_code == 200
    assert progress.json()["spent_amount"] == 2000.0

    # Обновляем бюджет
    update_response = await client.put(
        f"/api/v1/budgets/{budget_id}", json={"amount": 12000.0}
    )
    assert update_response.status_code == 200
    assert update_response.json()["amount"] == 12000.0

    # Удаляем бюджет
    delete_response = await client.delete(f"/api/v1/budgets/{budget_id}")
    assert delete_response.status_code == 204

    # Проверяем что бюджет удален
    get_response = await client.get(f"/api/v1/budgets/{budget_id}")
    assert get_response.status_code == 404
