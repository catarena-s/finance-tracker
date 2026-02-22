# Архитектура проекта Finance Tracker

## Обзор

Full-Stack приложение для трекинга личных финансов с трёхслойной архитектурой: Next.js frontend, FastAPI backend, PostgreSQL база данных. Все компоненты контейнеризированы с Docker Compose.

## Технологический стек

### Frontend
- **Framework**: Next.js 14+ (React + TypeScript)
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Charts**: Chart.js + react-chartjs-2
- **Forms**: React Hook Form
- **Testing**: Jest + React Testing Library + Playwright

### Backend
- **Framework**: FastAPI
- **ORM**: SQLAlchemy 2.0+ (async)
- **Validation**: Pydantic v2
- **Database**: PostgreSQL 15+
- **Migrations**: Alembic
- **Testing**: pytest + pytest-asyncio + Hypothesis

### DevOps
- **Контейнеризация**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Линтинг**: ESLint (frontend), Ruff (backend)
- **Форматирование**: Prettier (frontend), Black (backend)

## Структура проекта

```
finance-tracker/
├── backend/           # FastAPI приложение
│   ├── app/
│   │   ├── api/       # API эндпоинты
│   │   ├── core/      # Конфигурация и утилиты
│   │   ├── models/    # SQLAlchemy модели
│   │   ├── repositories/ # Data access layer
│   │   ├── schemas/   # Pydantic схемы
│   │   ├── services/  # Бизнес-логика
│   │   └── tasks/     # Celery задачи
│   └── tests/         # Тесты (unit, integration, property-based)
├── database/          # Миграции и seed данные
│   ├── init/          # Инициализация БД
│   ├── migrations/    # Alembic миграции
│   └── seeds/         # Seed данные
├── docs/              # 📚 Документация проекта
│   ├── ADMIN_GUIDE.md
│   ├── ARCHITECTURE.md
│   ├── DATABASE_SCHEMA.md
│   ├── FRONTEND_TESTING_GUIDE.md
│   ├── INTEGRATION_TEST_REPORT.md
│   ├── QUICKSTART.md
│   ├── REPORT.md
│   └── WARNINGS_ANALYSIS.md
├── frontend/          # Next.js приложение
│   ├── src/
│   │   ├── app/       # Next.js App Router
│   │   ├── components/ # React компоненты
│   │   ├── contexts/  # React Context
│   │   ├── lib/       # Утилиты
│   │   └── types/     # TypeScript типы
│   └── __tests__/     # Jest тесты
├── scripts/           # 🛠️ Утилиты и скрипты
│   ├── manual-tests/  # Ручные тесты для проверки
│   ├── init.bat       # Инициализация (Windows)
│   └── init.sh        # Инициализация (Linux/Mac)
├── .github/workflows/ # CI/CD конфигурация
└── docker-compose.yml # Docker Compose
```

## План разработки

### Этап 1: Настройка инфраструктуры
- Структура проекта и документация
- Docker Compose конфигурация
- CI/CD pipeline (GitHub Actions)
- Базовая настройка frontend и backend

### Этап 2: Backend API
- Модели данных (Transaction, Category, Budget)
- Repository слой
- Service слой с бизнес-логикой
- REST API эндпоинты
- OpenAPI документация

### Этап 3: Frontend
- UI компоненты (транзакции, категории, бюджеты)
- Дашборд с графиками
- Формы и валидация
- API интеграция

### Этап 4: Дополнительные фичи
- Импорт/экспорт CSV
- Повторяющиеся транзакции
- Мультивалютность
- Фоновые задачи (Celery + Redis)

### Этап 5: Тестирование и документация
- Unit тесты
- Property-based тесты
- Integration тесты
- E2E тесты
- Документация API

### Этап 6: Seed данные и финальная интеграция
- Seed данные (200+ транзакций, 12 категорий, 3 бюджета)
- Финальное тестирование
- Оптимизация производительности

## Архитектурные принципы

1. **Разделение ответственности**: Четкое разделение между presentation, business logic и data слоями
2. **RESTful API**: Стандартизированные HTTP методы и коды статуса
3. **Типобезопасность**: TypeScript на frontend, Pydantic на backend
4. **Тестируемость**: Изолированные компоненты, dependency injection
5. **Документация**: OpenAPI/Swagger для API, JSDoc/docstrings для кода

## Схема базы данных

Проект использует PostgreSQL с 8 основными таблицами для хранения финансовых данных.

> **📚 Подробное описание**: См. [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) для полной документации схемы БД с таблицами, связями, ограничениями и примерами запросов.

### Основные таблицы

**transactions** - Транзакции (доходы и расходы)
- id, amount, currency, category_id, description
- transaction_date, type (income/expense)
- is_recurring, recurring_pattern, recurring_template_id
- created_at, updated_at

**categories** - Категории для классификации
- id, name, icon, color, type (income/expense)
- created_at, updated_at

**budgets** - Лимиты расходов по категориям
- id, category_id, amount, currency
- period (monthly/yearly), start_date, end_date
- created_at, updated_at

**recurring_transactions** - Шаблоны повторяющихся транзакций
- id, name, amount, currency, category_id
- type, frequency, interval, start_date, end_date
- next_occurrence, is_active
- created_at, updated_at

**currencies** - Справочник валют (ISO 4217)
- code (PK), name, symbol, is_active
- created_at

**exchange_rates** - Курсы валют на дату
- id, from_currency, to_currency, rate, date
- created_at

**task_results** - Результаты фоновых задач
- id, task_id, task_type, status, result, error
- created_at, updated_at

**app_settings** - Настройки приложения
- key (PK), value, description
- created_at, updated_at

### Связи

- `transactions.category_id` → `categories.id` (RESTRICT)
- `transactions.recurring_template_id` → `recurring_transactions.id` (SET NULL)
- `budgets.category_id` → `categories.id` (CASCADE)
- `recurring_transactions.category_id` → `categories.id` (RESTRICT)
- `exchange_rates.from_currency` → `currencies.code` (RESTRICT)
- `exchange_rates.to_currency` → `currencies.code` (RESTRICT)

## API эндпоинты

### Транзакции (`/api/v1/transactions`)
- `GET /api/v1/transactions` - Список транзакций (с фильтрами и пагинацией)
- `POST /api/v1/transactions` - Создать транзакцию
- `GET /api/v1/transactions/{id}` - Получить транзакцию
- `PUT /api/v1/transactions/{id}` - Обновить транзакцию
- `DELETE /api/v1/transactions/{id}` - Удалить транзакцию
- `POST /api/v1/transactions/import` - Импорт из CSV
- `GET /api/v1/transactions/export` - Экспорт в CSV

### Категории (`/api/v1/categories`)
- `GET /api/v1/categories` - Список категорий
- `POST /api/v1/categories` - Создать категорию
- `GET /api/v1/categories/{id}` - Получить категорию
- `PUT /api/v1/categories/{id}` - Обновить категорию
- `DELETE /api/v1/categories/{id}` - Удалить категорию

### Бюджеты (`/api/v1/budgets`)
- `GET /api/v1/budgets` - Список бюджетов
- `POST /api/v1/budgets` - Создать бюджет
- `GET /api/v1/budgets/{id}` - Получить бюджет
- `PUT /api/v1/budgets/{id}` - Обновить бюджет
- `DELETE /api/v1/budgets/{id}` - Удалить бюджет
- `GET /api/v1/budgets/{id}/progress` - Прогресс выполнения бюджета

### Повторяющиеся транзакции (`/api/v1/recurring-transactions`)
- `GET /api/v1/recurring-transactions` - Список шаблонов
- `POST /api/v1/recurring-transactions` - Создать шаблон
- `GET /api/v1/recurring-transactions/{id}` - Получить шаблон
- `PUT /api/v1/recurring-transactions/{id}` - Обновить шаблон
- `DELETE /api/v1/recurring-transactions/{id}` - Удалить шаблон

### Валюты (`/api/v1/currencies`)
- `GET /api/v1/currencies` - Список валют
- `GET /api/v1/currencies/exchange-rate` - Получить курс обмена

### Аналитика (`/api/v1/analytics`)
- `GET /api/v1/analytics/summary` - Сводная статистика
- `GET /api/v1/analytics/trends` - Тренды во времени
- `GET /api/v1/analytics/by-category` - Расходы по категориям
- `GET /api/v1/analytics/top-categories` - Топ категорий

### Задачи (`/api/v1/tasks`)
- `GET /api/v1/tasks/{task_id}/status` - Статус фоновой задачи

### Настройки (`/api/v1/settings`)
- `GET /api/v1/settings` - Список настроек
- `GET /api/v1/settings/{key}` - Получить настройку
- `PUT /api/v1/settings/{key}` - Обновить настройку

### Админка (`/api/v1/admin`)
- `POST /api/v1/admin/tasks/run-recurring` - Запустить создание повторяющихся транзакций

## Развертывание

### Docker Compose

```bash
docker-compose up -d
```

Сервисы:
- **frontend**: http://localhost:3000
- **backend**: http://localhost:8000
- **database**: PostgreSQL на порту 5433 (внутри контейнера 5432)
- **redis**: Redis на порту 6379 (для фоновых задач)

### CI/CD

**На push в feature ветки**:
- Линтинг и форматирование (ESLint, Ruff, Prettier, Black)

**На PR в main**:
- Полный набор тестов (unit, integration, property-based)
- Сборка Docker образов
- Проверка покрытия кода

## Безопасность

- Валидация всех входных данных через Pydantic
- Параметризованные SQL запросы (защита от SQL injection)
- CORS настройки для frontend
- Environment variables для секретов
- HTTPS в production

## Производительность

- Async/await для I/O операций
- Connection pooling для БД
- Кэширование курсов валют (Redis, TTL 24h)
- Code splitting на frontend
- Lazy loading компонентов и изображений
- Индексы БД на часто запрашиваемые поля

## Мониторинг и логирование

- Структурированное логирование (JSON format)
- Логирование всех API запросов
- Отслеживание ошибок и исключений
- Метрики производительности

