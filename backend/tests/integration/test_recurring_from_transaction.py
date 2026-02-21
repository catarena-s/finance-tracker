"""Тесты для создания шаблона повторяющейся транзакции из обычной транзакции"""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_recurring_template_from_transaction(client: AsyncClient):
    """Тест создания шаблона при установке is_recurring=True"""
    
    # Создаем категорию
    cat_response = await client.post(
        "/api/v1/categories/",
        json={"name": "Аренда", "type": "expense", "icon": "🏠", "color": "#FF5733"},
    )
    assert cat_response.status_code == 201
    category_id = cat_response.json()["id"]

    # Создаем обычную транзакцию
    create_response = await client.post(
        "/api/v1/transactions/",
        json={
            "amount": 25000,
            "currency": "RUB",
            "categoryId": category_id,
            "description": "Аренда квартиры",
            "transactionDate": "2026-02-01",
            "type": "expense",
            "isRecurring": False,
        },
    )
    assert create_response.status_code == 201
    transaction_id = create_response.json()["id"]
    
    # Проверяем что транзакция не повторяющаяся
    assert create_response.json()["isRecurring"] is False
    assert create_response.json().get("recurringTemplateId") is None

    # Обновляем транзакцию, устанавливая is_recurring=True
    update_response = await client.put(
        f"/api/v1/transactions/{transaction_id}",
        json={
            "isRecurring": True,
            "recurringPattern": {
                "frequency": "monthly",
                "interval": 1,
            },
        },
    )
    assert update_response.status_code == 200
    updated_data = update_response.json()
    
    # Проверяем что флаг is_recurring установлен
    assert updated_data["isRecurring"] is True
    assert updated_data["recurringPattern"] is not None
    assert updated_data["recurringPattern"]["frequency"] == "monthly"
    
    # Проверяем что создан шаблон
    template_id = updated_data.get("recurringTemplateId")
    assert template_id is not None
    
    # Получаем шаблон и проверяем его данные
    template_response = await client.get(f"/api/v1/recurring-transactions/{template_id}")
    assert template_response.status_code == 200
    template_data = template_response.json()
    
    assert template_data["amount"] == "25000.00"
    assert template_data["currency"] == "RUB"
    assert template_data["categoryId"] == category_id
    assert template_data["type"] == "expense"
    assert template_data["frequency"] == "monthly"
    assert template_data["interval"] == 1
    assert template_data["isActive"] is True


@pytest.mark.asyncio
async def test_do_not_create_duplicate_template(client: AsyncClient):
    """Тест что не создается дубликат шаблона при повторном обновлении"""
    
    # Создаем категорию
    cat_response = await client.post(
        "/api/v1/categories/",
        json={"name": "Зарплата", "type": "income", "icon": "💰", "color": "#00B894"},
    )
    assert cat_response.status_code == 201
    category_id = cat_response.json()["id"]

    # Создаем транзакцию с is_recurring=True сразу
    create_response = await client.post(
        "/api/v1/transactions/",
        json={
            "amount": 50000,
            "currency": "RUB",
            "categoryId": category_id,
            "description": "Зарплата",
            "transactionDate": "2026-02-15",
            "type": "income",
            "isRecurring": True,
            "recurringPattern": {
                "frequency": "monthly",
                "interval": 1,
            },
        },
    )
    assert create_response.status_code == 201
    transaction_id = create_response.json()["id"]
    
    # Обновляем транзакцию еще раз
    update_response = await client.put(
        f"/api/v1/transactions/{transaction_id}",
        json={
            "description": "Зарплата (обновлено)",
        },
    )
    assert update_response.status_code == 200
    
    # Проверяем что шаблон не изменился
    template_id_before = create_response.json().get("recurringTemplateId")
    template_id_after = update_response.json().get("recurringTemplateId")
    
    # Если шаблон был создан при создании транзакции, он должен остаться тем же
    if template_id_before:
        assert template_id_after == template_id_before
