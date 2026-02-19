#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Тест работы API с русским языком
"""

import requests
import json

BASE_URL = "http://localhost:8000/api/v1"

def test_categories():
    """Тест получения категорий с русскими названиями"""
    print("=" * 60)
    print("ТЕСТ 1: Получение категорий")
    print("=" * 60)
    
    response = requests.get(f"{BASE_URL}/categories")
    assert response.status_code == 200
    
    categories = response.json()
    print(f"Получено категорий: {len(categories)}")
    
    for cat in categories[:3]:
        print(f"  - {cat['name']} ({cat['icon']}) - {cat['type']}")
    
    print("✓ Категории с русскими названиями читаются корректно\n")
    return categories

def test_create_transaction(category_id):
    """Тест создания транзакции с русским описанием"""
    print("=" * 60)
    print("ТЕСТ 2: Создание транзакции с русским описанием")
    print("=" * 60)
    
    data = {
        "amount": 2500.50,
        "currency": "RUB",
        "category_id": category_id,
        "description": "Покупка продуктов в магазине Пятёрочка",
        "transaction_date": "2024-02-19",
        "type": "expense",
        "is_recurring": False
    }
    
    response = requests.post(f"{BASE_URL}/transactions/", json=data)
    assert response.status_code == 201
    
    transaction = response.json()
    print(f"Создана транзакция:")
    print(f"  ID: {transaction['id']}")
    print(f"  Описание: {transaction['description']}")
    print(f"  Сумма: {transaction['amount']} {transaction['currency']}")
    
    print("✓ Транзакция с русским описанием создана корректно\n")
    return transaction

def test_get_transaction(transaction_id):
    """Тест получения транзакции"""
    print("=" * 60)
    print("ТЕСТ 3: Получение транзакции")
    print("=" * 60)
    
    response = requests.get(f"{BASE_URL}/transactions/{transaction_id}")
    assert response.status_code == 200
    
    transaction = response.json()
    print(f"Получена транзакция:")
    print(f"  Описание: {transaction['description']}")
    
    assert transaction['description'] == "Покупка продуктов в магазине Пятёрочка"
    print("✓ Русский текст сохранился и читается корректно\n")

def test_export_csv():
    """Тест экспорта в CSV"""
    print("=" * 60)
    print("ТЕСТ 4: Экспорт в CSV")
    print("=" * 60)
    
    response = requests.get(f"{BASE_URL}/transactions/export?start_date=2024-02-19&end_date=2024-02-19")
    assert response.status_code == 200
    
    csv_content = response.text
    lines = csv_content.strip().split('\n')
    
    print(f"Экспортировано строк: {len(lines) - 1}")
    print("Содержимое CSV:")
    for line in lines[:3]:
        print(f"  {line}")
    
    # Проверяем что русский текст присутствует
    assert "Покупка продуктов в магазине Пятёрочка" in csv_content
    print("✓ CSV экспорт с русским языком работает корректно\n")

def test_import_csv():
    """Тест импорта из CSV"""
    print("=" * 60)
    print("ТЕСТ 5: Импорт из CSV")
    print("=" * 60)
    
    csv_content = """amount,currency,category_name,description,transaction_date,type
3500.00,RUB,Продукты,Покупка мяса и рыбы,2024-02-20,expense
15000.00,RUB,Транспорт,Ремонт автомобиля,2024-02-20,expense
"""
    
    files = {'file': ('import_test.csv', csv_content.encode('utf-8'), 'text/csv')}
    response = requests.post(f"{BASE_URL}/transactions/import", files=files)
    assert response.status_code == 200
    
    result = response.json()
    print(f"Импортировано: {result['created']}")
    print(f"Ошибок: {len(result['errors'])}")
    
    if result['errors']:
        for error in result['errors']:
            print(f"  Ошибка в строке {error['row']}: {error['error']}")
    
    assert result['created'] == 2
    print("✓ CSV импорт с русским языком работает корректно\n")

def main():
    print("\n" + "=" * 60)
    print("ПРОВЕРКА РАБОТЫ API С РУССКИМ ЯЗЫКОМ")
    print("=" * 60 + "\n")
    
    try:
        # Тест 1: Получение категорий
        categories = test_categories()
        expense_category = next(c for c in categories if c['type'] == 'expense')
        
        # Тест 2: Создание транзакции
        transaction = test_create_transaction(expense_category['id'])
        
        # Тест 3: Получение транзакции
        test_get_transaction(transaction['id'])
        
        # Тест 4: Экспорт CSV
        test_export_csv()
        
        # Тест 5: Импорт CSV
        test_import_csv()
        
        print("=" * 60)
        print("✓ ВСЕ ТЕСТЫ ПРОЙДЕНЫ УСПЕШНО!")
        print("✓ API корректно работает с русским языком")
        print("=" * 60 + "\n")
        
    except AssertionError as e:
        print(f"\n✗ ОШИБКА: {e}\n")
        return 1
    except Exception as e:
        print(f"\n✗ НЕОЖИДАННАЯ ОШИБКА: {e}\n")
        import traceback
        traceback.print_exc()
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())
