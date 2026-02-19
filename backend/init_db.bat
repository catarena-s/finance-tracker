@echo off
REM Скрипт для инициализации базы данных (Windows)

echo Применение миграций...
alembic upgrade head

echo.
echo База данных инициализирована!
echo.
echo Для загрузки тестовых данных выполните:
echo   python ..\database\seeds\load_seeds.py
