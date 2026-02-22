#!/bin/bash
# Загружает seed данные в БД при первой инициализации

set -e

echo "Loading seed data..."

# Путь к seed файлам
SEEDS_DIR="/docker-entrypoint-initdb.d/../seeds"

# Проверяем существование файлов
if [ ! -f "$SEEDS_DIR/seed_categories.sql" ]; then
    echo "Warning: seed_categories.sql not found"
    exit 0
fi

# Загружаем seed данные в правильном порядке
echo "Loading categories..."
psql --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f "$SEEDS_DIR/seed_categories.sql"

echo "Loading transactions..."
psql --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f "$SEEDS_DIR/seed_transactions.sql"

echo "Loading budgets..."
psql --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f "$SEEDS_DIR/seed_budgets.sql"

echo "Seed data loaded successfully!"
