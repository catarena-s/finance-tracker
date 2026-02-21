"""
Тесты для проверки создания шаблона при обновлении транзакции
"""

import pytest


@pytest.mark.asyncio
async def test_update_transaction_set_recurring_creates_template(client, test_db):
    """Тест: при установке is_recurring=True создаётся шаблон"""
    # Создать категорию
    category_response = await client.post(
        "/api/v1/categories/",
        json={
            "name": "Продукты",
            "type": "expense",
            "icon": "🛒",
            "color": "#FF6B6B",
        },
    )
    assert category_response.status_code == 201
    category = category_response.json()

    # Создать обычную транзакцию (не повторяющуюся)
    transaction_response = await client.post(
        "/api/v1/transactions/",
        json={
            "type": "expense",
            "amount": 1500.00,
            "currency": "RUB",
            "categoryId": category["id"],
            "description": "Покупка продуктов",
            "transactionDate": "2026-02-19",
            "isRecurring": False,
        },
    )
    assert transaction_response.status_code == 201
    transaction = transaction_response.json()
    assert transaction["isRecurring"] is False
    assert transaction.get("recurringTemplateId") is None

    # Обновить транзакцию, установив is_recurring=True
    update_response = await client.put(
        f"/api/v1/transactions/{transaction['id']}",
        json={
            "isRecurring": True,
            "recurringPattern": {"frequency": "monthly", "interval": 1},
        },
    )
    assert update_response.status_code == 200
    updated_transaction = update_response.json()

    # Проверить, что транзакция теперь повторяющаяся
    assert updated_transaction["isRecurring"] is True
    assert updated_transaction["recurringTemplateId"] is not None

    # Проверить, что шаблон создан
    template_id = updated_transaction["recurringTemplateId"]
    template_response = await client.get(
        f"/api/v1/recurring-transactions/{template_id}"
    )
    assert template_response.status_code == 200
    template = template_response.json()

    assert template["name"] == "Покупка продуктов"
    assert template["amount"] == "1500.00"
    assert template["currency"] == "RUB"
    assert template["frequency"] == "monthly"
    assert template["interval"] == 1
    assert template["isActive"] is True


@pytest.mark.asyncio
async def test_update_transaction_recurring_twice_no_duplicate(client, test_db):
    """Тест: повторное обновление не создаёт дубликат шаблона"""
    # Создать категорию
    category_response = await client.post(
        "/api/v1/categories/",
        json={
            "name": "Аренда",
            "type": "expense",
            "icon": "🏠",
            "color": "#4ECDC4",
        },
    )
    assert category_response.status_code == 201
    category = category_response.json()

    # Создать транзакцию
    transaction_response = await client.post(
        "/api/v1/transactions/",
        json={
            "type": "expense",
            "amount": 30000.00,
            "currency": "RUB",
            "categoryId": category["id"],
            "description": "Аренда квартиры",
            "transactionDate": "2026-02-01",
            "isRecurring": False,
        },
    )
    assert transaction_response.status_code == 201
    transaction = transaction_response.json()

    # Первое обновление - установить is_recurring=True
    update1_response = await client.put(
        f"/api/v1/transactions/{transaction['id']}",
        json={
            "isRecurring": True,
            "recurringPattern": {"frequency": "monthly", "interval": 1},
        },
    )
    assert update1_response.status_code == 200
    updated1 = update1_response.json()
    template_id_1 = updated1["recurringTemplateId"]
    assert template_id_1 is not None

    # Второе обновление - изменить описание
    update2_response = await client.put(
        f"/api/v1/transactions/{transaction['id']}",
        json={
            "description": "Аренда квартиры (обновлено)",
            "isRecurring": True,
            "recurringPattern": {"frequency": "monthly", "interval": 1},
        },
    )
    assert update2_response.status_code == 200
    updated2 = update2_response.json()
    template_id_2 = updated2["recurringTemplateId"]

    # Проверить, что ID шаблона не изменился
    assert template_id_2 == template_id_1

    # Проверить, что создан только один шаблон
    templates_response = await client.get("/api/v1/recurring-transactions/")
    assert templates_response.status_code == 200
    templates = templates_response.json()

    # Должен быть только один шаблон для этой категории
    matching_templates = [t for t in templates if t["categoryId"] == category["id"]]
    assert len(matching_templates) == 1
