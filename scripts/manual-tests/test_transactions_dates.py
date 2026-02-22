#!/usr/bin/env python3
"""Проверка дат транзакций"""
import requests
from datetime import datetime, timedelta

base_url = "http://localhost:8000/api/v1"

# Последние 30 дней
end = datetime.now().date()
start = end - timedelta(days=30)

print(f"Период: {start} - {end}")
print()

# Запрос транзакций
url = f"{base_url}/transactions"
params = {
    "start_date": start.isoformat(),
    "end_date": end.isoformat()
}

response = requests.get(url, params=params)
if response.status_code == 200:
    data = response.json()
    transactions = data.get('transactions', []) if isinstance(data, dict) else data
    print(f"Найдено транзакций: {len(transactions) if isinstance(transactions, list) else 'N/A'}")
    print(f"Тип ответа: {type(data)}")
    print(f"Ответ: {data}")
else:
    print(f"Ошибка: {response.status_code}")
    print(response.text)

# Топ категории за этот период
print(f"\nТоп категории за период {start} - {end}:")
url = f"{base_url}/analytics/top-categories"
params = {
    "start_date": start.isoformat(),
    "end_date": end.isoformat(),
    "limit": 5
}

response = requests.get(url, params=params)
if response.status_code == 200:
    data = response.json()
    print(f"Ответ: {data}")
else:
    print(f"Ошибка: {response.status_code}")
