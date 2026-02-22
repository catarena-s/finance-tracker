#!/bin/bash
# Скрипт автоматической инициализации Finance Tracker (Linux/Mac)

set -e  # Остановка при ошибке

echo "========================================"
echo "Finance Tracker - Автоматическая инициализация"
echo "========================================"
echo ""

echo "[1/5] Остановка старых контейнеров..."
docker-compose down -v || echo "ПРЕДУПРЕЖДЕНИЕ: Не удалось остановить контейнеры (возможно, они не запущены)"

echo ""
echo "[2/5] Запуск Docker контейнеров..."
docker-compose up -d

echo ""
echo "[3/5] Ожидание запуска базы данных (30 секунд)..."
sleep 30

echo ""
echo "[4/5] Применение миграций базы данных..."
docker-compose exec backend alembic upgrade head

echo ""
echo "[5/5] Загрузка тестовых данных..."
docker-compose exec backend python ../database/seeds/load_seeds.py

echo ""
echo "========================================"
echo "✓ Инициализация завершена успешно!"
echo "========================================"
echo ""
echo "Доступные сервисы:"
echo "  - Swagger UI:  http://localhost:8000/docs"
echo "  - ReDoc:       http://localhost:8000/redoc"
echo "  - Frontend:    http://localhost:3000"
echo "  - Health:      http://localhost:8000/health"
echo ""
echo "Для остановки: docker-compose down"
echo "Для полной очистки: docker-compose down -v"
echo ""
