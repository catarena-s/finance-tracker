# Finance Tracker

Full-Stack приложение для управления личными финансами с поддержкой транзакций, категорий, бюджетов и визуализации данных.

## Описание проекта

Finance Tracker - это современное веб-приложение для трекинга личных финансов, которое позволяет:
- Управлять транзакциями (доходы и расходы)
- Организовывать категории с иконками и цветами
- Устанавливать и отслеживать бюджеты
- Визуализировать финансовые данные через дашборд с графиками
- Импортировать и экспортировать данные в CSV
- Работать с повторяющимися транзакциями
- Поддерживать мультивалютность

## Технологический стек

### Frontend
- Next.js 14+ (React)
- TypeScript
- Tailwind CSS
- Chart.js
- React Hook Form

### Backend
- FastAPI
- SQLAlchemy 2.0+ (async)
- PostgreSQL 15+
- Pydantic v2
- Alembic (миграции)

### DevOps
- Docker & Docker Compose
- GitHub Actions (CI/CD)
- Redis (для фоновых задач)
- Celery (фоновая обработка)

## Prerequisites

Для запуска проекта необходимо установить:

- **Node.js**: 18+ ([скачать](https://nodejs.org/))
- **Python**: 3.11+ ([скачать](https://www.python.org/))
- **Docker**: 24+ ([скачать](https://www.docker.com/))
- **Docker Compose**: 2.0+ (обычно идет с Docker Desktop)

## Установка и запуск

### Быстрый старт с Docker Compose

1. Клонируйте репозиторий:
```bash
git clone https://github.com/catarena-s/finance-tracker.git
cd finance-tracker
```

2. Запустите все сервисы:
```bash
docker-compose up -d
```

3. Приложение будет доступно по адресам:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Локальная разработка

#### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Запуск тестов

### Backend тесты
```bash
cd backend
pytest
```

### Frontend тесты
```bash
cd frontend
npm test
```

## Структура проекта

```
finance-tracker/
├── frontend/          # Next.js приложение
├── backend/           # FastAPI приложение
├── database/          # Миграции и seed данные
├── .github/           # GitHub Actions workflows
├── docker-compose.yml # Docker Compose конфигурация
├── ARCHITECTURE.md    # Документация архитектуры
├── CHANGELOG.md       # История изменений
└── README.md          # Этот файл
```

## Документация

- [Архитектура проекта](ARCHITECTURE.md)
- [История изменений](CHANGELOG.md)
- [API документация](http://localhost:8000/docs) (после запуска)

## Seed данные

Проект поставляется с демо-данными:
- 200+ транзакций за последние 6 месяцев
- 12 категорий с иконками и цветами
- 3 бюджета

Для загрузки seed данных:
```bash
cd database/seeds
python load_seeds.py
```

## Лицензия

MIT

## Автор

Katerina S. (catarena@gmail.com)
