#!/usr/bin/env python3
"""Тест для проверки API топ категорий"""
import requests
from datetime import datetime, timedelta

# Параметры
base_url = "http://localhost:8000/api/v1"
today = datetime.now().date()
start_date = "2026-01-01"
end_date = today.isoformat()

# Запрос к API
url = f"{base_url}/analytics/top-categories"
params = {
    "start_date": start_date,
    "end_date": end_date,
    "limit": 5
}

print(f"Запрос: {url}")
print(f"Параметры: {params}")
print()

response = requests.get(url, params=params)
print(f"Статус: {response.status_code}")
print(f"Ответ: {response.json()}")
