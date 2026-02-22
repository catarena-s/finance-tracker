# Схема базы данных

## Обзор

Проект использует PostgreSQL в качестве основной базы данных. Схема спроектирована для учёта личных финансов с поддержкой:
- Транзакций (доходы/расходы)
- Категорий
- Бюджетов
- Повторяющихся транзакций
- Мультивалютности
- Фоновых задач

## Диаграмма связей

```
┌─────────────────┐
│   currencies    │
└────────┬────────┘
         │
         ├──────────────────┐
         │                  │
┌────────▼────────┐  ┌──────▼──────────┐
│ exchange_rates  │  │  transactions   │
└─────────────────┘  └──────┬──────────┘
                            │
                     ┌──────┴──────┐
                     │             │
              ┌──────▼──────┐  ┌───▼────────────────────┐
              │ categories  │  │ recurring_transactions │
              └──────┬──────┘  └────────────────────────┘
                     │
              ┌──────▼──────┐
              │   budgets   │
              └─────────────┘

┌─────────────────┐
│  task_results   │  (независимая)
└─────────────────┘

┌─────────────────┐
│  app_settings   │  (независимая)
└─────────────────┘
```

## Таблицы

### 1. transactions (Транзакции)

Основная таблица для учёта всех финансовых операций.

| Поле | Тип | Ограничения | Описание |
|------|-----|-------------|----------|
| `id` | UUID | PK, NOT NULL | Уникальный идентификатор |
| `amount` | NUMERIC(10,2) | NOT NULL, > 0 | Сумма транзакции |
| `currency` | VARCHAR(3) | NOT NULL, default='USD' | Код валюты (ISO 4217) |
| `category_id` | UUID | FK, NOT NULL | Категория транзакции → `categories.id` |
| `description` | TEXT | NULL | Описание транзакции |
| `transaction_date` | DATE | NOT NULL | Дата транзакции |
| `type` | VARCHAR(10) | NOT NULL | Тип: 'income' или 'expense' |
| `is_recurring` | BOOLEAN | NOT NULL, default=false | Флаг повторяющейся транзакции |
| `recurring_pattern` | JSONB | NULL | Паттерн повторения (JSON) |
| `recurring_template_id` | UUID | FK, NULL | Ссылка на шаблон → `recurring_transactions.id` |
| `created_at` | TIMESTAMP | NOT NULL | Дата создания записи |
| `updated_at` | TIMESTAMP | NOT NULL | Дата последнего обновления |

**Ограничения:**
- `ck_transaction_amount_positive`: amount > 0
- `ck_transaction_type`: type IN ('income', 'expense')
- `ck_transaction_currency_iso4217`: currency ~ '^[A-Z]{3}$'

**Связи:**
- `category_id` → `categories.id` (RESTRICT)
- `recurring_template_id` → `recurring_transactions.id` (SET NULL)

---

### 2. categories (Категории)

Справочник категорий для классификации транзакций.

| Поле | Тип | Ограничения | Описание |
|------|-----|-------------|----------|
| `id` | UUID | PK, NOT NULL | Уникальный идентификатор |
| `name` | VARCHAR(100) | NOT NULL, UNIQUE(name, type) | Название категории |
| `icon` | VARCHAR(50) | NOT NULL | Иконка (emoji или название) |
| `color` | VARCHAR(7) | NOT NULL | Цвет в формате HEX (#RRGGBB) |
| `type` | VARCHAR(10) | NOT NULL | Тип: 'income' или 'expense' |
| `created_at` | TIMESTAMP | NOT NULL | Дата создания |
| `updated_at` | TIMESTAMP | NOT NULL | Дата обновления |

**Ограничения:**
- `uq_category_name_type`: UNIQUE(name, type) - уникальность имени в рамках типа
- `ck_category_type`: type IN ('income', 'expense')
- `ck_category_color_hex`: color ~ '^#[0-9A-Fa-f]{6}$'

**Связи:**
- Один ко многим с `transactions`
- Один ко многим с `budgets`
- Один ко многим с `recurring_transactions`

---

### 3. budgets (Бюджеты)

Лимиты расходов по категориям на определённый период.

| Поле | Тип | Ограничения | Описание |
|------|-----|-------------|----------|
| `id` | UUID | PK, NOT NULL | Уникальный идентификатор |
| `category_id` | UUID | FK, NOT NULL, UNIQUE(category_id, period, start_date) | Категория бюджета → `categories.id` |
| `amount` | NUMERIC(10,2) | NOT NULL, > 0 | Сумма бюджета |
| `currency` | VARCHAR(3) | NOT NULL, default='USD' | Валюта |
| `period` | VARCHAR(10) | NOT NULL | Период: 'monthly' или 'yearly' |
| `start_date` | DATE | NOT NULL | Дата начала периода |
| `end_date` | DATE | NOT NULL, > start_date | Дата окончания периода |
| `created_at` | TIMESTAMP | NOT NULL | Дата создания |
| `updated_at` | TIMESTAMP | NOT NULL | Дата обновления |

**Ограничения:**
- `ck_budget_amount_positive`: amount > 0
- `ck_budget_period`: period IN ('monthly', 'yearly')
- `ck_budget_date_range`: end_date > start_date
- `uq_budget_category_period`: UNIQUE(category_id, period, start_date)

**Связи:**
- `category_id` → `categories.id` (CASCADE)

---

### 4. recurring_transactions (Повторяющиеся транзакции)

Шаблоны для автоматического создания регулярных транзакций (подписки, зарплата и т.д.).

| Поле | Тип | Ограничения | Описание |
|------|-----|-------------|----------|
| `id` | UUID | PK, NOT NULL | Уникальный идентификатор |
| `name` | VARCHAR(200) | NOT NULL | Название шаблона |
| `amount` | NUMERIC(15,2) | NOT NULL, > 0 | Сумма транзакции |
| `currency` | VARCHAR(3) | NOT NULL, default='USD' | Валюта (ISO 4217) |
| `category_id` | UUID | FK, NOT NULL | Категория → `categories.id` |
| `description` | TEXT | NULL | Описание |
| `type` | VARCHAR(10) | NOT NULL | Тип: 'income' или 'expense' |
| `frequency` | VARCHAR(20) | NOT NULL | Частота: 'daily', 'weekly', 'monthly', 'yearly' |
| `interval` | INTEGER | NOT NULL, default=1, > 0 | Интервал повторения |
| `start_date` | DATE | NOT NULL | Дата начала |
| `end_date` | DATE | NULL | Дата окончания (NULL = бессрочно) |
| `next_occurrence` | DATE | NOT NULL | Дата следующего создания транзакции |
| `is_active` | BOOLEAN | NOT NULL, default=true | Активность шаблона |
| `created_at` | TIMESTAMP | NOT NULL | Дата создания |
| `updated_at` | TIMESTAMP | NOT NULL | Дата обновления |

**Ограничения:**
- `ck_recurring_amount_positive`: amount > 0
- `ck_recurring_type`: type IN ('income', 'expense')
- `ck_recurring_frequency`: frequency IN ('daily', 'weekly', 'monthly', 'yearly')
- `ck_recurring_interval_positive`: interval > 0
- `ck_recurring_currency_iso4217`: currency ~ '^[A-Z]{3}$'

**Связи:**
- `category_id` → `categories.id` (RESTRICT)
- Один ко многим с `transactions` (generated_transactions)

---

### 5. currencies (Валюты)

Справочник валют по стандарту ISO 4217.

| Поле | Тип | Ограничения | Описание |
|------|-----|-------------|----------|
| `code` | VARCHAR(3) | PK, NOT NULL | Код валюты (USD, EUR, RUB и т.д.) |
| `name` | VARCHAR(100) | NOT NULL | Полное название |
| `symbol` | VARCHAR(10) | NOT NULL | Символ валюты ($, €, ₽) |
| `is_active` | BOOLEAN | NOT NULL, default=true | Активность валюты |
| `created_at` | TIMESTAMP | NOT NULL | Дата добавления |

---

### 6. exchange_rates (Курсы валют)

Курсы обмена между валютами на конкретную дату.

| Поле | Тип | Ограничения | Описание |
|------|-----|-------------|----------|
| `id` | UUID | PK, NOT NULL | Уникальный идентификатор |
| `from_currency` | VARCHAR(3) | FK, NOT NULL, UNIQUE(from_currency, to_currency, date) | Исходная валюта → `currencies.code` |
| `to_currency` | VARCHAR(3) | FK, NOT NULL | Целевая валюта → `currencies.code` |
| `rate` | NUMERIC(20,10) | NOT NULL, > 0 | Курс обмена |
| `date` | DATE | NOT NULL | Дата курса |
| `created_at` | TIMESTAMP | NOT NULL | Дата создания записи |

**Ограничения:**
- `uq_exchange_rate_per_day`: UNIQUE(from_currency, to_currency, date)
- `ck_exchange_rate_positive`: rate > 0

**Связи:**
- `from_currency` → `currencies.code` (RESTRICT)
- `to_currency` → `currencies.code` (RESTRICT)

---

### 7. task_results (Результаты фоновых задач)

Хранение результатов выполнения асинхронных задач (импорт CSV, обновление курсов и т.д.).

| Поле | Тип | Ограничения | Описание |
|------|-----|-------------|----------|
| `id` | UUID | PK, NOT NULL | Уникальный идентификатор |
| `task_id` | VARCHAR(255) | UNIQUE, NOT NULL, INDEX | ID задачи Celery |
| `task_type` | VARCHAR(50) | NOT NULL, INDEX | Тип задачи (csv_import, currency_update и т.д.) |
| `status` | VARCHAR(20) | NOT NULL, INDEX | Статус: 'pending', 'running', 'success', 'failed' |
| `result` | JSONB | NULL | Результат выполнения (JSON) |
| `error` | TEXT | NULL | Текст ошибки (если есть) |
| `created_at` | TIMESTAMP | NOT NULL | Дата создания |
| `updated_at` | TIMESTAMP | NOT NULL | Дата обновления |

---

### 8. app_settings (Настройки приложения)

Хранение настроек приложения в формате ключ-значение.

| Поле | Тип | Ограничения | Описание |
|------|-----|-------------|----------|
| `key` | VARCHAR(100) | PK, NOT NULL, INDEX | Ключ настройки |
| `value` | TEXT | NOT NULL | Значение настройки |
| `description` | TEXT | NULL | Описание настройки |
| `created_at` | TIMESTAMP | NOT NULL | Дата создания |
| `updated_at` | TIMESTAMP | NOT NULL | Дата обновления |

---

## Типы данных

### UUID
Все основные сущности используют UUID v4 в качестве первичного ключа для:
- Глобальной уникальности
- Безопасности (невозможность предсказать ID)
- Распределённых систем

### NUMERIC
Для денежных сумм используется NUMERIC вместо FLOAT для:
- Точности вычислений
- Отсутствия ошибок округления
- Соответствия финансовым стандартам

### JSONB
Для гибких структур данных (recurring_pattern, task results) используется JSONB:
- Индексируемость
- Эффективность хранения
- Гибкость схемы

---

## Миксины (Mixins)

### UUIDMixin
Добавляет поле `id` типа UUID как первичный ключ.

### TimestampMixin
Добавляет поля:
- `created_at` - автоматически устанавливается при создании
- `updated_at` - автоматически обновляется при изменении

---

## Каскадные удаления

### RESTRICT (запрет удаления)
- `transactions.category_id` → `categories.id`
- `recurring_transactions.category_id` → `categories.id`
- `exchange_rates.from_currency` → `currencies.code`
- `exchange_rates.to_currency` → `currencies.code`

### CASCADE (каскадное удаление)
- `budgets.category_id` → `categories.id`
- При удалении категории удаляются все связанные бюджеты

### SET NULL (установка NULL)
- `transactions.recurring_template_id` → `recurring_transactions.id`
- При удалении шаблона транзакции остаются, но теряют связь

---

## Индексы и производительность

### Автоматические индексы
- Все PRIMARY KEY
- Все FOREIGN KEY
- Все UNIQUE constraints

### Дополнительные индексы
- `task_results.task_id` - для быстрого поиска задач
- `task_results.task_type` - для фильтрации по типу
- `task_results.status` - для фильтрации по статусу
- `app_settings.key` - для быстрого доступа к настройкам

---

## Примеры запросов

### Получить все расходы за месяц
```sql
SELECT t.*, c.name as category_name
FROM transactions t
JOIN categories c ON t.category_id = c.id
WHERE t.type = 'expense'
  AND t.transaction_date >= '2026-02-01'
  AND t.transaction_date < '2026-03-01'
ORDER BY t.transaction_date DESC;
```

### Проверить превышение бюджета
```sql
SELECT 
    b.id,
    c.name as category_name,
    b.amount as budget_amount,
    COALESCE(SUM(t.amount), 0) as spent_amount,
    b.amount - COALESCE(SUM(t.amount), 0) as remaining
FROM budgets b
JOIN categories c ON b.category_id = c.id
LEFT JOIN transactions t ON t.category_id = b.category_id
    AND t.type = 'expense'
    AND t.transaction_date BETWEEN b.start_date AND b.end_date
WHERE b.period = 'monthly'
GROUP BY b.id, c.name, b.amount;
```

### Получить активные повторяющиеся транзакции
```sql
SELECT rt.*, c.name as category_name
FROM recurring_transactions rt
JOIN categories c ON rt.category_id = c.id
WHERE rt.is_active = true
  AND rt.next_occurrence <= CURRENT_DATE
  AND (rt.end_date IS NULL OR rt.end_date >= CURRENT_DATE)
ORDER BY rt.next_occurrence;
```

### Конвертация валют
```sql
SELECT 
    t.amount,
    t.currency,
    t.amount * er.rate as amount_in_usd
FROM transactions t
LEFT JOIN exchange_rates er ON er.from_currency = t.currency
    AND er.to_currency = 'USD'
    AND er.date = t.transaction_date
WHERE t.transaction_date = '2026-02-22';
```

---

## Миграции

Проект использует Alembic для управления миграциями базы данных.

**Расположение:** `database/migrations/`

**Команды:**
```bash
# Создать новую миграцию
alembic revision --autogenerate -m "описание изменений"

# Применить миграции
alembic upgrade head

# Откатить последнюю миграцию
alembic downgrade -1

# Посмотреть историю
alembic history
```

---

## Seed данные

Начальные данные для разработки и тестирования находятся в `database/seeds/`.

Включают:
- Стандартные категории доходов и расходов
- Популярные валюты (USD, EUR, RUB и т.д.)
- Тестовые транзакции
- Примеры бюджетов

---

## Безопасность

### SQL Injection
Все запросы используют параметризованные запросы через SQLAlchemy ORM.

### Валидация данных
- Все ограничения (constraints) на уровне БД
- Дополнительная валидация через Pydantic схемы
- Проверка типов через SQLAlchemy

### Права доступа
- Приложение использует отдельного пользователя БД с ограниченными правами
- Нет прямого доступа к БД из frontend
- Все операции через REST API

---

## Резервное копирование

Рекомендуемая стратегия:
- Ежедневные полные бэкапы
- Хранение бэкапов минимум 30 дней
- Тестирование восстановления раз в месяц

**Команда для бэкапа:**
```bash
pg_dump -U postgres -d finance_tracker > backup_$(date +%Y%m%d).sql
```

**Команда для восстановления:**
```bash
psql -U postgres -d finance_tracker < backup_20260222.sql
```

---

## Мониторинг

Рекомендуется отслеживать:
- Размер таблиц (особенно transactions)
- Производительность индексов
- Медленные запросы (slow query log)
- Количество соединений

**Проверка размера таблиц:**
```sql
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## Версионирование схемы

Текущая версия схемы: **1.0**

История изменений документируется в `CHANGELOG.md`.
