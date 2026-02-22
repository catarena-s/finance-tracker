# Ручные тесты

Эта папка содержит скрипты для ручного тестирования различных функций приложения.

## Python тесты

### test_recurring_manual.py
Ручной тест создания шаблона повторяющейся транзакции.

```bash
python scripts/manual-tests/test_recurring_manual.py
```

### test_russian_language.py
Тест работы API с русским языком (создание, чтение, экспорт/импорт CSV).

```bash
python scripts/manual-tests/test_russian_language.py
```

### test_top_categories.py
Тест API топ категорий.

```bash
python scripts/manual-tests/test_top_categories.py
```

### test_transactions_dates.py
Проверка дат транзакций и аналитики за период.

```bash
python scripts/manual-tests/test_transactions_dates.py
```

## JavaScript тесты

### create_test_data.js
Создание тестовых данных для проверки интеграции.

```bash
node scripts/manual-tests/create_test_data.js
```

### test_api_format.js
Тест формата API (проверка структуры ответов).

```bash
node scripts/manual-tests/test_api_format.js
```

### test_integration.js
Тест интеграции фронтенда и бэкенда.

```bash
node scripts/manual-tests/test_integration.js
```

### test_frontend_api.html
HTML страница для визуального тестирования API через браузер.

Откройте файл в браузере:
```bash
open scripts/manual-tests/test_frontend_api.html
```

## Требования

- Backend должен быть запущен на `http://localhost:8000`
- Frontend должен быть запущен на `http://localhost:3000` (для некоторых тестов)
- Python 3.11+ с установленными зависимостями (`httpx`, `requests`)
- Node.js 18+ (для JavaScript тестов)

## Примечание

Эти тесты предназначены для ручной проверки функциональности во время разработки.
Для автоматизированного тестирования используйте:
- `pytest` для backend тестов
- `npm test` для frontend тестов
