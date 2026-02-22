#!/bin/sh
set -e

echo "Checking database state..."

# Проверяем состояние БД и сбрасываем alembic_version если нужно
python check_db.py 2>&1 | grep -E "RESET|OK|ERROR" || true

echo "Running database migrations..."
alembic upgrade head

echo "Starting application..."
exec "$@"
