"""Тесты для проверки исправлений повторяющихся транзакций"""

import pytest
from httpx import AsyncClient
from datetime import date


@pytest.mark.asyncio
async def test_update_transaction_set_is_recurring(client: AsyncClient):
    """Тест установки флага is_recurring при редактировании транзакции"""
    # Создаем категорию
    cat_response = await client.post(
        "/api/v1/categories/",
        json={"name": "Зарплата", "icon": "💰", "type": "income", "color": "#00FF00"},
    )
    assert cat_response.status_code == 201
    category_id = cat_response.json()["id"]

    # Создаем обычную транзакцию (не повторяющуюся)
    create_response = await client.post(
        "/api/v1/transactions/",
        json={
            "amount": 50000.0,
            "type": "income",
            "category_id": category_id,
            "transaction_date": date.today().isoformat(),
            "description": "Зарплата",
        },
    )
    assert create_response.status_code == 201
    transaction_id = create_response.json()["id"]

    # Проверяем, что транзакция не повторяющаяся
    data = create_response.json()
    assert data.get("isRecurring") is False

    # Обновляем транзакцию, устанавливая is_recurring=True
    update_response = await client.put(
        f"/api/v1/transactions/{transaction_id}",
        json={
            "isRecurring": True,
            "recurringPattern": {"frequency": "monthly", "interval": 1},
        },
    )
    assert update_response.status_code == 200, update_response.text
    updated_data = update_response.json()

    # Проверяем, что флаг is_recurring установлен
    assert updated_data.get("isRecurring") is True
    assert updated_data.get("recurringPattern") is not None
    assert updated_data["recurringPattern"]["frequency"] == "monthly"
    assert updated_data["recurringPattern"]["interval"] == 1


@pytest.mark.asyncio
async def test_create_recurring_template(client: AsyncClient):
    """Тест создания шаблона повторяющейся транзакции"""
    # Создаем категорию
    cat_response = await client.post(
        "/api/v1/categories/",
        json={"name": "Аренда", "icon": "🏠", "type": "expense", "color": "#FF0000"},
    )
    assert cat_response.status_code == 201
    category_id = cat_response.json()["id"]

    # Создаем шаблон повторяющейся транзакции
    template_response = await client.post(
        "/api/v1/recurring-transactions/",
        json={
            "name": "Аренда квартиры",
            "amount": 30000.0,
            "currency": "RUB",
            "type": "expense",
            "categoryId": category_id,
            "description": "Ежемесячная аренда квартиры",
            "frequency": "monthly",
            "interval": 1,
            "startDate": date.today().isoformat(),
        },
    )
    assert template_response.status_code == 201, template_response.text
    template_data = template_response.json()

    # Проверяем, что шаблон создан
    assert template_data.get("id") is not None
    assert float(template_data["amount"]) == 30000.0
    assert template_data["frequency"] == "monthly"
    assert template_data["interval"] == 1
    assert template_data.get("is_active") is True
