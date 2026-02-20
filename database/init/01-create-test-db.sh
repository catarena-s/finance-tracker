#!/bin/bash
# Создаёт БД для интеграционных тестов (при первой инициализации тома или при добавлении скрипта — не падает, если БД уже есть)
psql --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -c "CREATE DATABASE finance_tracker_test;" || true
