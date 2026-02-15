# Changelog

Все важные изменения в проекте будут документированы в этом файле.

Формат основан на [Keep a Changelog](https://keepachangelog.com/ru/1.0.0/).

## 0.0.4 - 2026-02-15

### Добавлено
- Frontend: управление состоянием через App Context
  - AppContext с полным управлением состоянием приложения
  - Оптимистичные обновления для всех операций (create, update, delete)
  - Автоматический откат при неудачных операциях
  - Управление транзакциями, категориями, бюджетами и аналитикой
  - Обработка ошибок и состояний загрузки
- Frontend: общие UI компоненты
  - Button с вариантами (primary, secondary, danger, ghost) и размерами
  - Input с поддержкой label, error и ARIA атрибутов
  - Select с выпадающим списком
  - DatePicker с валидацией диапазона дат
  - CurrencyInput с форматированием денежных сумм
  - Modal с focus trap и возвратом фокуса
  - Pagination с навигацией по страницам
- Frontend: компоненты транзакций
  - TransactionCard с цветовым кодированием (доходы/расходы)
  - TransactionList с пагинацией и скелетонами
  - TransactionFilters с фильтрацией по типу, категории и датам
  - TransactionForm с валидацией через React Hook Form
- Frontend: компоненты категорий
  - CategoryCard с отображением иконки, цвета и типа
  - CategoryList с группировкой по типу (доходы/расходы)
  - CategoryForm с палитрой цветов и выбором иконок
- Frontend: компоненты бюджетов
  - BudgetCard с прогресс-баром и цветовым кодированием
  - BudgetList с сеточным отображением
  - BudgetForm с валидацией сумм и диапазона дат
- Frontend: layout и главная страница
  - Корневой layout с AppProvider
  - Главная страница с навигацией и описанием возможностей
  - Адаптивный дизайн с градиентным фоном

## 0.0.3 - 2026-02-15

### Добавлено
- Frontend: утилиты форматирования и валидации
  - `formatCurrency` для форматирования денежных сумм с символом валюты
  - `formatDate` для консистентного форматирования дат (short, long, iso)
  - `parseDate` для парсинга дат с учетом часовых поясов
  - Валидаторы для сумм, дат, строк и hex цветов
  - Валидатор диапазона дат
- Frontend: API клиенты для всех эндпоинтов
  - Базовый HTTP клиент на Axios с перехватчиками
  - Обработка ошибок для различных HTTP статусов (400, 401, 403, 404, 422, 500)
  - Механизм повтора для неудавшихся запросов (exponential backoff)
  - Transaction API клиент с фильтрацией и пагинацией
  - Category API клиент с фильтрацией по типу
  - Budget API клиент
  - Analytics API клиент (summary, trends, top categories)
- Frontend: TypeScript типы для всех API сущностей
  - Transaction, Category, Budget типы
  - API Response и Paginated Response типы
  - Типы для аналитики (SummaryData, TrendData, CategorySpending)

### Изменено
- Обновлен tsconfig.json для включения типов Node.js
- Backend: CORS origins теперь читаются из настроек вместо хардкода
- Backend: API_V1_PREFIX используется из настроек

### Исправлено
- Backend: ошибка парсинга CORS_ORIGINS в Docker (изменен тип поля на Union[str, list[str]])
- Backend: Swagger теперь доступен по адресу /docs
- Backend: добавлен python-multipart для поддержки загрузки файлов (CSV импорт)

## 0.0.2 - 2026-02-14

### Добавлено
- Backend API: полная реализация REST API для трекера личных финансов
  - API Routes для категорий, транзакций, бюджетов и аналитики
  - Трёхслойная архитектура (Routes → Services → Repositories → Database)
  - Dependency Injection для всех сервисов
  - OpenAPI документация (Swagger UI и ReDoc)
- Поддержка мультивалютности
  - Валидация ISO 4217 кодов (90+ валют)
  - Автоматическая конвертация в USD для аналитики
- Поддержка повторяющихся транзакций
  - Поле `is_recurring` в модели Transaction
  - JSONB хранение паттерна повторения
- Импорт/экспорт транзакций в CSV формате
- Единый формат ошибок для всех типов исключений
- Property-based тесты с Hypothesis (6 тестов, 100+ итераций)
- Unit тесты для Pydantic схем (9 тестов)
- Миграция БД для поля `is_recurring`

### Изменено
- Обновлены Pydantic схемы для использования `condecimal` вместо `decimal_places` в Field
- Добавлен `pytest-cov` в dev зависимости для отчетов о покрытии кода
- Исправлены все ошибки линтинга (ruff, black)
- Добавлен TYPE_CHECKING для forward references в моделях

### Исправлено
- Синтаксические ошибки в API routes (порядок параметров с default значениями)
- Неиспользуемые импорты в 7 файлах
- Ошибки валидации Pydantic v2 (decimal_places constraint)

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
