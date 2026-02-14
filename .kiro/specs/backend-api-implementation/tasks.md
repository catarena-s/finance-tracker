# План реализации: Backend API для трекера личных финансов

## Обзор

Реализация Backend API с трёхслойной архитектурой (API Routes → Services → Repositories → Database) на базе FastAPI, SQLAlchemy 2.0+ (async) и PostgreSQL. Каждая задача строится на предыдущих шагах, обеспечивая инкрементальный прогресс с ранней валидацией функциональности через тесты.

## Задачи

- [x] 1. Настройка базовой структуры проекта и конфигурации
  - Создать структуру директорий (app/models, app/schemas, app/repositories, app/services, app/api/routes, app/core)
  - Настроить app/core/config.py с конфигурацией БД и приложения
  - Настроить app/core/database.py с async engine и session factory
  - Создать app/main.py с базовым FastAPI приложением
  - Настроить pytest конфигурацию и conftest.py с фикстурами для тестовой БД
  - _Requirements: 9.10, 15.4, 15.8_

- [x] 2. Реализация SQLAlchemy моделей
  - [x] 2.1 Создать базовую модель и Category модель
    - Создать app/models/base.py с Base декларативной базой
    - Реализовать app/models/category.py с полями, relationships и constraints
    - _Requirements: 9.4, 9.5_
  
  - [ ]* 2.2 Написать property тест для Category модели
    - **Property 19: Валидация типа категории**
    - **Validates: Requirements 9.5, 10.5**
  
  - [x] 2.3 Создать Transaction модель
    - Реализовать app/models/transaction.py с полями, relationships и constraints
    - _Requirements: 9.1, 9.2, 9.3_
  
  - [ ]* 2.4 Написать property тест для Transaction constraints
    - **Property 2: Валидация положительной суммы транзакции**
    - **Validates: Requirements 9.1, 10.1**
  
  - [x] 2.5 Создать Budget модель
    - Реализовать app/models/budget.py с полями, relationships и constraints
    - _Requirements: 9.6, 9.7, 9.8, 9.9_
  
  - [ ]* 2.6 Написать property тесты для Budget constraints
    - **Property 21: Валидация диапазона дат бюджета**
    - **Property 22: Валидация положительной суммы бюджета**
    - **Validates: Requirements 9.6, 9.7, 10.6, 10.8**

- [x] 3. Реализация Pydantic схем валидации
  - [x] 3.1 Создать схемы для Category
    - Реализовать app/schemas/category.py с CategoryBase, CategoryCreate, CategoryUpdate, Category
    - Добавить валидаторы для color (hex формат) и type
    - _Requirements: 10.4, 10.5_
  
  - [ ]* 3.2 Написать property тест для валидации hex цвета
    - **Property 18: Валидация hex цвета**
    - **Validates: Requirements 4.8, 10.4**
  
  - [x] 3.3 Создать схемы для Transaction
    - Реал��зовать app/schemas/transaction.py с TransactionBase, TransactionCreate, TransactionUpdate, Transaction, RecurringPattern
    - Добавить валидаторы для amount, currency, type, recurring_pattern
    - _Requirements: 10.1, 10.2, 10.3_
  
  - [ ]* 3.4 Написать property тесты для валидации транзакций
    - **Property 37: Валидация кода валюты**
    - **Property 39: Обязательность recurring_pattern**
    - **Validates: Requirements 10.2, 13.3**
  
  - [x] 3.5 Создать схемы для Budget
    - Реализовать app/schemas/budget.py с BudgetBase, BudgetCreate, BudgetUpdate, Budget, BudgetProgress
    - Добавить валидаторы для amount, period, date range
    - _Requirements: 10.6, 10.7, 10.8_

- [x] 4. Checkpoint - Убедиться что модели и схемы работают
  - Убедиться что все тесты проходят, спросить пользователя если возникли вопросы.

- [x] 5. Реализация Repository слоя
  - [x] 5.1 Создать базовый Repository
    - Реализовать app/repositories/base.py с BaseRepository (create, get_by_id, get_all, update, delete)
    - _Requirements: 11.1_
  
  - [ ]* 5.2 Написать unit тесты для BaseRepository
    - Тестировать все CRUD операции
    - _Requirements: 15.1_
  
  - [x] 5.3 Создать CategoryRepository
    - Реализовать app/repositories/category.py с методами get_by_name_and_type, has_transactions
    - _Requirements: 11.1_
  
  - [ ]* 5.4 Написать property тест для уникальности категории
    - **Property 16: Уникальность категории**
    - **Validates: Requirements 4.6, 9.4**
  
  - [x] 5.5 Создать TransactionRepository
    - Реализовать app/repositories/transaction.py с методами get_filtered, get_by_date_range
    - _Requirements: 11.1_
  
  - [ ]* 5.6 Написать property тесты для фильтрации транзакций
    - **Property 5: Фильтрация транзакций по дате**
    - **Property 6: Фильтрация транзакций по категории**
    - **Property 7: Фильтрация транзакций по типу**
    - **Property 8: Фильтрация транзакций по сумме**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4**
  
  - [x] 5.7 Создать BudgetRepository
    - Реализовать app/repositories/budget.py с методами get_by_category_and_period, get_active_budgets
    - _Requirements: 11.1_

- [x] 6. Реализация кастомных исключений и обработчиков ошибок
  - Создать app/core/exceptions.py с AppException, NotFoundException, ConflictException, ValidationException
  - Реализовать exception handlers в app/main.py
  - Настроить логирование ошибок
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [x]* 6.1 Написать property тест для единого формата ошибок
  - **Property 32: Единый формат ошибок**
  - **Validates: Requirements 8.1, 8.2, 8.3, 8.5**

- [x] 7. Реализация Service слоя - CategoryService
  - [x] 7.1 Создать CategoryService
    - Реализовать app/services/category.py с методами create_category, get_category, list_categories, update_category, delete_category
    - Добавить проверки уникальности и наличия транзакций
    - _Requirements: 11.2_
  
  - [ ]* 7.2 Написать property тесты для CategoryService
    - **Property 14: CRUD операции категорий**
    - **Property 15: Защита от удаления категории с транзакциями**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5**
  
  - [ ]* 7.3 Написать unit тесты для CategoryService
    - Тестировать edge cases и обработку ошибок
    - _Requirements: 15.2_

- [x] 8. Реализация Service слоя - TransactionService
  - [x] 8.1 Создать TransactionService (базовые CRUD)
    - Реализовать app/services/transaction.py с методами create_transaction, get_transaction, list_transactions, update_transaction, delete_transaction
    - Добавить фильтрацию и пагинацию
    - _Requirements: 11.2_
  
  - [ ]* 8.2 Написать property тесты для TransactionService CRUD
    - **Property 1: CRUD операции транзакций**
    - **Property 9: Пагинация транзакций**
    - **Property 10: Комбинированная фильтрация**
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 2.5, 2.6**
  
  - [x] 8.3 Добавить импорт/экспорт CSV в TransactionService
    - Реализовать методы import_from_csv и export_to_csv
    - _Requirements: 11.2_
  
  - [ ]* 8.4 Написать property тесты для импорта/экспорта
    - **Property 11: Round-trip импорт/экспорт CSV**
    - **Property 12: Обработка невалидных CSV данных**
    - **Property 13: Экспорт с фильтрами**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6**

- [x] 9. Checkpoint - Убедиться что Services работают
  - Убедиться что все тесты проходят, спросить пользователя если возникли вопросы.

- [x] 10. Реализация Service слоя - BudgetService
  - [x] 10.1 Создать BudgetService
    - Реализовать app/services/budget.py с методами create_budget, get_budget, list_budgets, update_budget, delete_budget, get_budget_progress
    - Добавить расчёт прогресса бюджета
    - _Requirements: 11.2_
  
  - [ ]* 10.2 Написать property тесты для BudgetService
    - **Property 20: CRUD операции бюджетов**
    - **Property 23: Уникальность бюджета**
    - **Property 26: Расчёт прогресса бюджета**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.7, 6.1, 6.2, 6.3, 6.5, 6.6**

- [x] 11. Реализация Service слоя - AnalyticsService
  - [x] 11.1 Создать AnalyticsService
    - Реализовать app/services/analytics.py с методами get_summary, get_trends, get_category_breakdown, get_top_categories
    - _Requirements: 11.2_
  
  - [ ]* 11.2 Написать property тесты для AnalyticsService
    - **Property 27: Расчёт summary статистики**
    - **Property 28: Расчёт trends по месяцам**
    - **Property 29: Breakdown по категориям**
    - **Property 30: Top категории по расходам**
    - **Property 31: Фильтрация аналитики по датам**
    - **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5**

- [x] 12. Реализация API Routes - Categories
  - [x] 12.1 Создать category routes
    - Реализовать app/api/routes/categories.py с эндпоинтами POST /, GET /, GET /{id}, PUT /{id}, DELETE /{id}
    - Настроить dependency injection для CategoryService
    - _Requirements: 11.3_
  
  - [ ]* 12.2 Написать integration тесты для category routes
    - Тестировать все эндпоинты с разными HTTP кодами
    - _Requirements: 15.3_

- [x] 13. Реализация API Routes - Transactions
  - [x] 13.1 Создать transaction routes
    - Реализовать app/api/routes/transactions.py с эндпоинтами POST /, GET /, GET /{id}, PUT /{id}, DELETE /{id}, POST /import, GET /export
    - Настроить dependency injection для TransactionService
    - _Requirements: 11.3_
  
  - [ ]* 13.2 Написать integration тесты для transaction routes
    - Тестировать все эндпоинты включая импорт/экспорт
    - _Requirements: 15.3_

- [x] 14. Реализация API Routes - Budgets
  - [x] 14.1 Создать budget routes
    - Реализовать app/api/routes/budgets.py с эндпоинтами POST /, GET /, GET /{id}, PUT /{id}, DELETE /{id}, GET /{id}/progress
    - Настроить dependency injection для BudgetService
    - _Requirements: 11.3_
  
  - [ ]* 14.2 Написать integration тесты для budget routes
    - Тестировать все эндпоинты включая прогресс
    - _Requirements: 15.3_

- [ ] 15. Реализация API Routes - Analytics
  - [ ] 15.1 Создать analytics routes
    - Реализовать app/api/routes/analytics.py с эндпоинтами GET /summary, GET /trends, GET /by-category, GET /top-categories
    - Настроить dependency injection для AnalyticsService
    - _Requirements: 11.3_
  
  - [ ]* 15.2 Написать integration тесты для analytics routes
    - Тестировать все аналитические эндпоинты
    - _Requirements: 15.3_

- [ ] 16. Настройка OpenAPI документации
  - Настроить метаданные FastAPI (title, description, version)
  - Добавить описания и примеры для всех эндпоинтов
  - Добавить response_model и status_code для всех routes
  - Проверить доступность /docs и /redoc
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6_

- [ ] 17. Реализация поддержки мультивалютности
  - [ ] 17.1 Добавить валидацию и дефолтное значение валюты
    - Обновить TransactionCreate схему с дефолтом USD
    - Добавить валидацию ISO 4217 кодов
    - _Requirements: 12.1, 12.2, 12.4_
  
  - [ ]* 17.2 Написать property тесты для мультивалютности
    - **Property 34: Поддержка поля currency**
    - **Property 35: Дефолтная валюта USD**
    - **Validates: Requirements 12.1, 12.2, 12.4**
  
  - [ ] 17.3 Добавить конвертацию валют в AnalyticsService
    - Реализовать упрощённую конвертацию в USD для аналитики
    - _Requirements: 12.3, 7.6_
  
  - [ ]* 17.4 Написать property тест для конвертации валют
    - **Property 36: Конвертация валют в аналитике**
    - **Validates: Requirements 12.3, 7.6**

- [ ] 18. Реализация поддержки повторяющихся транзакций
  - Добавить валидацию recurring_pattern в TransactionCreate схему
  - Обновить Transaction модель для поддержки JSONB поля
  - _Requirements: 13.1, 13.2, 13.3, 13.4_

- [ ]* 18.1 Написать property тесты для повторяющихся транзакций
  - **Property 38: Поддержка полей повторяющихся транзакций**
  - **Property 40: Структура recurring_pattern**
  - **Validates: Requirements 13.1, 13.2, 13.4**

- [ ] 19. Финальная интеграция и проверка
  - [ ] 19.1 Зарегистрировать все routes в main.py
    - Подключить все роутеры к FastAPI приложению
    - Настроить CORS если необходимо
    - _Requirements: 11.3_
  
  - [ ]* 19.2 Написать end-to-end integration тесты
    - Тестировать полные сценарии использования API
    - _Requirements: 15.3_
  
  - [ ] 19.3 Проверить покрытие property-based тестами
    - Убедиться что все 42 correctness properties покрыты тестами
    - Проверить что каждый тест запускается минимум 100 итераций
    - _Requirements: 15.6, 15.7_

- [ ] 20. Финальный checkpoint - Убедиться что все тесты проходят
  - Убедиться что все тесты проходят, спросить пользователя если возникли вопросы.

## Примечания

- Задачи помеченные `*` являются опциональными и могут быть пропущены для быстрого MVP
- Каждая задача ссылается на конкретные требования для отслеживаемости
- Checkpoints обеспечивают инкрементальную валидацию
- Property тесты валидируют универсальные свойства корректности
- Unit тесты валидируют конкретные примеры и edge cases
- Integration тесты валидируют end-to-end потоки
