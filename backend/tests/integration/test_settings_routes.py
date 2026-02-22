"""Тесты для API настроек приложения"""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_get_all_settings(client: AsyncClient, app_settings):
    """Тест получения всех настроек"""
    response = await client.get("/api/v1/settings/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 2  # Минимум 2 начальные настройки

    # Проверяем наличие ключевых настроек
    keys = [item["key"] for item in data]
    assert "recurring_task_hour" in keys
    assert "recurring_task_minute" in keys


@pytest.mark.asyncio
async def test_get_setting_by_key(client: AsyncClient, app_settings):
    """Тест получения настройки по ключу"""
    response = await client.get("/api/v1/settings/recurring_task_hour")
    assert response.status_code == 200
    data = response.json()
    assert data["key"] == "recurring_task_hour"
    assert data["value"] == "0"
    assert "description" in data
    assert "created_at" in data
    assert "updated_at" in data


@pytest.mark.asyncio
async def test_get_nonexistent_setting(client: AsyncClient, app_settings):
    """Тест получения несуществующей настройки"""
    response = await client.get("/api/v1/settings/nonexistent_key")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_update_setting(client: AsyncClient, app_settings):
    """Тест обновления настройки"""
    # Обновляем значение
    response = await client.put(
        "/api/v1/settings/recurring_task_hour", json={"value": "12"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["key"] == "recurring_task_hour"
    assert data["value"] == "12"

    # Проверяем, что значение изменилось
    response = await client.get("/api/v1/settings/recurring_task_hour")
    assert response.status_code == 200
    assert response.json()["value"] == "12"

    # Возвращаем обратно
    await client.put("/api/v1/settings/recurring_task_hour", json={"value": "0"})


@pytest.mark.asyncio
async def test_update_nonexistent_setting(client: AsyncClient, app_settings):
    """Тест обновления несуществующей настройки"""
    response = await client.put(
        "/api/v1/settings/nonexistent_key", json={"value": "test"}
    )
    assert response.status_code == 404
