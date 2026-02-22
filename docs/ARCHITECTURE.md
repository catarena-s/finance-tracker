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
├── frontend/          # Next.js приложение
├── backend/           # FastAPI приложение  
├── database/          # Миграции и seed данные
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

### Основные таблицы

**transactions**
- id (UUID, PK)
- amount (Decimal)
- currency (VARCHAR)
- category_id (UUID, FK)
- description (TEXT)
- transaction_date (DATE)
- type (VARCHAR: income/expense)
- created_at, updated_at (TIMESTAMP)

**categories**
- id (UUID, PK)
- name (VARCHAR)
- icon (VARCHAR)
- color (VARCHAR)
- type (VARCHAR: income/expense)
- created_at, updated_at (TIMESTAMP)

**budgets**
- id (UUID, PK)
- category_id (UUID, FK)
- amount (Decimal)
- period (VARCHAR: monthly/yearly)
- start_date, end_date (DATE)
- created_at, updated_at (TIMESTAMP)

## API эндпоинты

### Транзакции
- `GET /api/v1/transactions` - Список транзакций (с фильтрами и пагинацией)
- `POST /api/v1/transactions` - Создать транзакцию
- `GET /api/v1/transactions/{id}` - Получить транзакцию
- `PUT /api/v1/transactions/{id}` - Обновить транзакцию
- `DELETE /api/v1/transactions/{id}` - Удалить транзакцию

### Категории
- `GET /api/v1/categories` - Список категорий
- `POST /api/v1/categories` - Создать категорию
- `GET /api/v1/categories/{id}` - Получить категорию
- `PUT /api/v1/categories/{id}` - Обновить категорию
- `DELETE /api/v1/categories/{id}` - Удалить категорию

### Бюджеты
- `GET /api/v1/budgets` - Список бюджетов
- `POST /api/v1/budgets` - Создать бюджет
- `GET /api/v1/budgets/{id}` - Получить бюджет
- `PUT /api/v1/budgets/{id}` - Обновить бюджет
- `DELETE /api/v1/budgets/{id}` - Удалить бюджет

### Аналитика
- `GET /api/v1/analytics/summary` - Сводная статистика
- `GET /api/v1/analytics/trends` - Тренды во времени
- `GET /api/v1/analytics/by-category` - Расходы по категориям

## Развертывание

### Docker Compose

```bash
docker-compose up -d
```

Сервисы:
- **frontend**: http://localhost:3000
- **backend**: http://localhost:8000
- **database**: PostgreSQL на порту 5432
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

