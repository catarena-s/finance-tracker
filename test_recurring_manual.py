"""Ручной тест создания шаблона повторяющейся транзакции"""
import asyncio
import httpx
from datetime import date


async def test_create_recurring():
    async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
        # 1. Создаем категорию
        cat_response = await client.post(
            "/api/v1/categories/",
            json={
                "name": "Аренда",
                "icon": "🏠",
                "type": "expense",
                "color": "#FF0000"
            }
        )
        print(f"Категория создана: {cat_response.status_code}")
        if cat_response.status_code != 201:
            print(f"Ошибка: {cat_response.text}")
            return
        
        category_id = cat_response.json()["id"]
        print(f"ID категории: {category_id}")
        
        # 2. Создаем шаблон повторяющейся транзакции
        template_response = await client.post(
            "/api/v1/recurring-transactions/",
            json={
                "name": "Аренда квартиры",
                "amount": 30000.0,
                "currency": "RUB",
                "type": "expense",
                "categoryId": category_id,
                "description": "Ежемесячная аренда",
                "frequency": "monthly",
                "interval": 1,
                "startDate": date.today().isoformat()
            }
        )
        
        print(f"\nШаблон создан: {template_response.status_code}")
        if template_response.status_code == 201:
            data = template_response.json()
            print(f"Успешно! ID шаблона: {data.get('id')}")
            print(f"Данные: {data}")
        else:
            print(f"Ошибка: {template_response.text}")


if __name__ == "__main__":
    asyncio.run(test_create_recurring())
