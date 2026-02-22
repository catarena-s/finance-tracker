# Changelog

Все важные изменения в проекте будут документированы в этом файле.

Формат основан на [Keep a Changelog](https://keepachangelog.com/ru/1.0.0/).

## 0.0.7 - 2026-02-22

### Ключевые изменения (Документация, Seed данные, Рефакторинг)

- **Документация:** реорганизация структуры (все документы в `docs/`); добавлены новые документы (DATABASE_SCHEMA, IMPLEMENTATION_ANALYSIS, REFACTORING_REPORT, REQUIREMENTS_COMPLIANCE, VERIFICATION_REPORT, WARNINGS_ANALYSIS); актуализированы README, QUICKSTART, ARCHITECTURE.
- **Seed данные:** автоматическая загрузка через миграцию (190+ транзакций); динамическое получение ID категорий из БД; генератор реалистичных транзакций (220 шт за 6 месяцев).
- **Исправления:** позиционирование значка валюты в CurrencyInput; добавлено поле currency в seed_budgets; устранены дубликаты ключей в компонентах.
- **Рефакторинг:** удалён устаревший скрипт загрузки seed данных; упрощён docker-compose.yml; перемещены скрипты в `scripts/`; добавлена папка coverage в .gitignore.

## 0.0.6 - 2026-02-22

### Ключевые изменения (Dashboard, Валюты, Повторяющиеся транзакции, Настройки)

- **Dashboard:** исправлен график "Топ категории" (расчёт процентов, поддержка camelCase); добавлено управление периодом и отображение валют; базовая валюта изменена на RUB.
- **Повторяющиеся транзакции:** автоматическое создание шаблона при установке `is_recurring=true`; устранено дублирование при установке галочки на существующую транзакцию.
- **Backend:** добавлена таблица `app_settings` для хранения настроек; динамическое чтение времени запуска задач из БД при старте Celery Beat.
- **API:** новые эндпоинты для управления настройками (`GET/PUT /api/v1/settings`) и принудительного запуска задач (`POST /api/v1/admin/tasks/run-recurring`).
- **Документация:** создан ADMIN_GUIDE.md с инструкциями по настройке, мониторингу и управлению фоновыми задачами.
- **Тесты:** исправлена проблема удаления production таблиц.

## 0.0.5 - 2026-02-20

### Ключевые изменения ветки (E2E, CSV, тесты, Docker)

- **E2E:** стабильный прогон тестов Playwright для страницы повторяющихся транзакций (таймауты, загрузка страницы до ответа API).
- **Frontend:** правка CSV-импорта для совместимости с тестами; unit-тесты формы импорта CSV (моки papaparse и API).
- **Тесты backend:** исправление патча Celery в unit-тестах; приведение к Ruff и Black (property, миграции).
- **Docker и CI:** инициализация тестовой БД при старте контейнера; скрипт запуска интеграционных тестов (PowerShell).

## 0.0.4 - 2026-02-15

### Добавлено
- **Frontend:** управление состоянием через App Context (оптимистичные обновления, откат при ошибках, управление транзакциями/категориями/бюджетами/аналитикой).
- **Frontend:** общие UI компоненты (Button, Input, Select, DatePicker, CurrencyInput, Modal, Pagination).
- **Frontend:** компоненты транзакций (Card, List, Filters, Form с валидацией).
- **Frontend:** компоненты категорий (Card, List, Form с палитрой цветов).
- **Frontend:** компоненты бюджетов (Card, List, Form с валидацией).
- **Frontend:** Dashboard компоненты (SummaryCards, аналитика).
- **Frontend:** Layout компоненты (Header с навигацией, Footer).
- **Frontend:** страницы и роутинг (транзакции, категории, бюджеты, dashboard, главная).

### Исправлено
- Frontend: исправлен путь к globals.css в layout

## 0.0.3 - 2026-02-15

### Добавлено
- **Frontend:** утилиты форматирования и валидации (formatCurrency, formatDate, parseDate, валидаторы для сумм/дат/строк/цветов).
- **Frontend:** API клиенты для всех эндпоинтов (базовый HTTP клиент на Axios с обработкой ошибок и механизмом повтора; клиенты для Transaction, Category, Budget, Analytics).
- **Frontend:** TypeScript типы для всех API сущностей (Transaction, Category, Budget, API Response, Paginated Response, аналитика).

### Изменено
- Обновлен tsconfig.json для включения типов Node.js
- Backend: CORS origins и API_V1_PREFIX читаются из настроек

### Исправлено
- Backend: ошибка парсинга CORS_ORIGINS в Docker (изменен тип поля на Union[str, list[str]])
- Backend: Swagger доступен по адресу /docs
- Backend: добавлен python-multipart для поддержки загрузки файлов (CSV импорт)

## 0.0.2 - 2026-02-14

### Добавлено
- **Backend API:** полная реализация REST API (Routes → Services → Repositories → Database; Dependency Injection; OpenAPI документация).
- **Мультивалютность:** валидация ISO 4217 кодов (90+ валют); автоматическая конвертация в USD для аналитики.
- **Повторяющиеся транзакции:** поле `is_recurring` в модели Transaction; JSONB хранение паттерна повторения.
- **CSV:** импорт/экспорт транзакций.
- **Тесты:** property-based тесты с Hypothesis (6 тестов, 100+ итераций); unit тесты для Pydantic схем (9 тестов).
- **БД:** миграция для поля `is_recurring`.

### Изменено
- Обновлены Pydantic схемы для использования `condecimal` вместо `decimal_places`
- Добавлен `pytest-cov` в dev зависимости
- Исправлены все ошибки линтинга (ruff, black)

### Исправлено
- Синтаксические ошибки в API routes (порядок параметров с default значениями)
- Неиспользуемые импорты в 7 файлах
- Ошибки валидации Pydantic v2

## 0.0.1 - 2026-02-14

### Добавлено
- Создана архитектурная документация (ARCHITECTURE.md)
- Создан шаблон отчёта (REPORT.md)
- Настроен Docker Compose для frontend, backend и database
- Созданы Dockerfile для frontend (Next.js) и backend (FastAPI)
- Настроен CI/CD pipeline (GitHub Actions)
  - ci-feature.yml для линтинга в feature ветках
  - ci-pr.yml для тестов и сборки Docker образов в PR
- Инициализирован Next.js проект с TypeScript
- Настроен Tailwind CSS для frontend
- Создана структура директорий frontend (components, hooks, services, utils, types, styles)
- Инициализирован FastAPI проект
- Создана структура директорий backend (api/routes, services, models, schemas, repositories, core)
- Настроен SQLAlchemy с async поддержкой
- Настроен Alembic для миграций БД
- Созданы seed данные (12 категорий, транзакции, 3 бюджета)
- Создан скрипт загрузки seed данных (load_seeds.py)

## 0.0.0 - 2026-02-14

- Создан проект
- Добавлена базовая структура директорий (frontend, backend, database)
- Создана документация (README.md, CHANGELOG.md)
- Настроен .gitignore для Node.js, Python и Docker
