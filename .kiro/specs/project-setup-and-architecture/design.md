# Design Document: Project Setup and Architecture

## Overview

Данный документ описывает архитектурное решение для Full-Stack приложения трекинга личных финансов. Проект использует современный технологический стек с чёткой трёхслойной архитектурой: React/Next.js frontend, Python REST API backend, и PostgreSQL база данных. Все компоненты контейнеризированы с помощью Docker и управляются через Docker Compose для упрощения разработки и развёртывания.

Ключевые архитектурные принципы:
- Разделение ответственности между слоями (presentation, business logic, data)
- RESTful API с OpenAPI документацией
- Контейнеризация всех сервисов
- Автоматизированное тестирование и CI/CD
- Миграции базы данных для версионирования схемы

## Архитектура

### Высокоуровневая архитектура

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  React/Next.js Frontend                                 │ │
│  │  - Components (UI)                                      │ │
│  │  - State Management (Context/Redux/Pinia)              │ │
│  │  - API Client (Axios/Fetch)                            │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/REST
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                        API Layer                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Python Backend (FastAPI/Flask/Django)                  │ │
│  │  - REST Endpoints                                       │ │
│  │  - Request Validation                                   │ │
│  │  - OpenAPI/Swagger Documentation                        │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Business Logic Layer                    │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Service Layer                                          │ │
│  │  - Transaction Service                                  │ │
│  │  - Category Service                                     │ │
│  │  - Budget Service                                       │ │
│  │  - Analytics Service                                    │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                        Data Layer                            │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Data Access Layer (ORM/Repository Pattern)             │ │
│  │  - Models                                               │ │
│  │  - Repositories                                         │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  PostgreSQL Database                                    │ │
│  │  - Tables                                               │ │
│  │  - Indexes                                              │ │
│  │  - Constraints                                          │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Технологический стек

#### Frontend
- **Framework**: Next.js 14+ (React-based)
  - Обоснование: Server-side rendering для лучшей производительности, встроенный роутинг, API routes для BFF паттерна
  - Альтернатива: Vue 3 + Nuxt 3 (если команда предпочитает Vue экосистему)
- **State Management**: React Context API + useReducer (для простых случаев) или Redux Toolkit (для сложной логики)
- **Styling**: Tailwind CSS + CSS Modules
  - Обоснование: Быстрая разработка, utility-first подход, отличная поддержка адаптивности
- **HTTP Client**: Axios
  - Обоснование: Interceptors для обработки ошибок, автоматическая трансформация JSON
- **Charts**: Chart.js + react-chartjs-2
  - Обоснование: Легковесная библиотека, поддержка всех необходимых типов графиков
- **Form Handling**: React Hook Form
  - Обоснование: Минимальные ре-рендеры, встроенная валидация
- **Testing**: Jest + React Testing Library + Playwright (E2E)

#### Backend
- **Framework**: FastAPI
  - Обоснование: Автоматическая генерация OpenAPI документации, встроенная валидация через Pydantic, высокая производительность (async/await), type hints
  - Альтернативы: Flask (проще, но меньше встроенных возможностей), Django (больше функций, но тяжелее)
- **ORM**: SQLAlchemy 2.0+
  - Обоснование: Мощный ORM с поддержкой async, миграции через Alembic
- **Validation**: Pydantic v2
  - Обоснование: Интеграция с FastAPI, type-safe валидация
- **Database Client**: asyncpg (для async операций)
- **Testing**: pytest + pytest-asyncio + httpx (для тестирования API)
- **Migrations**: Alembic
  - Обоснование: Стандарт для SQLAlchemy, поддержка автогенерации миграций

#### Database
- **RDBMS**: PostgreSQL 15+
  - Обоснование: ACID транзакции, JSON поддержка, мощные индексы, open-source
- **Connection Pooling**: pgBouncer (опционально для production)

#### DevOps
- **Контейнеризация**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Линтинг**: ESLint (frontend), Ruff (backend)
- **Форматирование**: Prettier (frontend), Black (backend)

### Структура проекта

```
finance-tracker/
├── .github/
│   └── workflows/
│       ├── ci-feature.yml          # Lint + format на feature branches
│       └── ci-pr.yml               # Full tests на PR в main
├── frontend/
│   ├── src/
│   │   ├── components/             # React компоненты
│   │   │   ├── common/             # Переиспользуемые компоненты
│   │   │   ├── transactions/       # Компоненты транзакций
│   │   │   ├── categories/         # Компоненты категорий
│   │   │   ├── budgets/            # Компоненты бюджетов
│   │   │   └── dashboard/          # Компоненты дашборда
│   │   ├── pages/                  # Next.js страницы/роуты
│   │   ├── hooks/                  # Custom React hooks
│   │   ├── services/               # API клиенты
│   │   ├── store/                  # State management
│   │   ├── utils/                  # Утилиты (formatCurrency, dateHelpers)
│   │   ├── types/                  # TypeScript типы
│   │   └── styles/                 # Глобальные стили
│   ├── public/                     # Статические файлы
│   ├── tests/                      # Тесты
│   │   ├── unit/
│   │   ├── integration/
│   │   └── e2e/
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── Dockerfile
├── backend/
│   ├── app/
│   │   ├── api/                    # API endpoints
│   │   │   ├── routes/             # Route handlers
│   │   │   └── dependencies.py     # FastAPI dependencies
│   │   ├── services/               # Business logic
│   │   │   ├── transaction_service.py
│   │   │   ├── category_service.py
│   │   │   ├── budget_service.py
│   │   │   └── analytics_service.py
│   │   ├── models/                 # SQLAlchemy models
│   │   │   ├── transaction.py
│   │   │   ├── category.py
│   │   │   ├── budget.py
│   │   │   └── base.py
│   │   ├── schemas/                # Pydantic schemas
│   │   │   ├── transaction.py
│   │   │   ├── category.py
│   │   │   └── budget.py
│   │   ├── repositories/           # Data access layer
│   │   │   ├── transaction_repository.py
│   │   │   ├── category_repository.py
│   │   │   └── budget_repository.py
│   │   ├── core/                   # Core configuration
│   │   │   ├── config.py           # Settings
│   │   │   └── database.py         # DB connection
│   │   └── main.py                 # FastAPI app entry point
│   ├── tests/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── conftest.py
│   ├── alembic/                    # Database migrations
│   │   ├── versions/
│   │   └── env.py
│   ├── requirements.txt
│   ├── requirements-dev.txt
│   ├── alembic.ini
│   └── Dockerfile
├── database/
│   ├── migrations/                 # SQL миграции (если не используем Alembic)
│   ├── seeds/                      # Seed данные
│   │   ├── seed_categories.sql
│   │   ├── seed_transactions.sql
│   │   ├── seed_budgets.sql
│   │   └── load_seeds.py           # Python скрипт для загрузки
│   └── init.sql                    # Начальная схема (опционально)
├── docker-compose.yml
├── .gitignore
├── README.md
├── ARCHITECTURE.md                 # Этот документ
└── REPORT.md                       # Журнал разработки
```

## Компоненты и интерфейсы

### Компоненты Frontend

#### Иерархия компонентов

```
App
├── Layout
│   ├── Header
│   │   └── Navigation
│   └── Footer
├── Dashboard
│   ├── SummaryCards
│   ├── ExpenseChart (Pie Chart)
│   ├── TrendChart (Line Chart - 6 months)
│   └── TopCategoriesWidget
├── TransactionsPage
│   ├── TransactionFilters
│   ├── TransactionList
│   │   └── TransactionCard
│   └── Pagination
├── CategoriesPage
│   ├── CategoryList
│   │   └── CategoryCard
│   └── CategoryForm (Modal)
├── BudgetsPage
│   ├── BudgetList
│   │   └── BudgetCard (with progress bar)
│   └── BudgetForm (Modal)
└── Common Components
    ├── Button
    ├── Input
    ├── Select
    ├── Modal
    ├── DatePicker
    └── CurrencyInput
```

#### Ключевые интерфейсы компонентов

**TransactionCard Props**:
```typescript
interface TransactionCardProps {
  id: string;
  amount: number;
  currency: string;
  category: Category;
  description: string;
  date: Date;
  type: 'income' | 'expense';
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}
```

**CategoryCard Props**:
```typescript
interface CategoryCardProps {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense';
  transactionCount: number;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}
```

**BudgetCard Props**:
```typescript
interface BudgetCardProps {
  id: string;
  category: Category;
  amount: number;
  spent: number;
  period: 'monthly' | 'yearly';
  startDate: Date;
  endDate: Date;
}
```

### API эндпоинты Backend

#### Эндпоинты транзакций

```
GET    /api/v1/transactions          # List transactions (with filters, pagination)
POST   /api/v1/transactions          # Create transaction
GET    /api/v1/transactions/{id}     # Get transaction by ID
PUT    /api/v1/transactions/{id}     # Update transaction
DELETE /api/v1/transactions/{id}     # Delete transaction
POST   /api/v1/transactions/import   # Import from CSV
GET    /api/v1/transactions/export   # Export to CSV
```

#### Эндпоинты категорий

```
GET    /api/v1/categories            # List categories
POST   /api/v1/categories            # Create category
GET    /api/v1/categories/{id}       # Get category by ID
PUT    /api/v1/categories/{id}       # Update category
DELETE /api/v1/categories/{id}       # Delete category
```

#### Эндпоинты бюджетов

```
GET    /api/v1/budgets               # List budgets
POST   /api/v1/budgets               # Create budget
GET    /api/v1/budgets/{id}          # Get budget by ID
PUT    /api/v1/budgets/{id}          # Update budget
DELETE /api/v1/budgets/{id}          # Delete budget
GET    /api/v1/budgets/{id}/progress # Get budget progress
```

#### Эндпоинты аналитики

```
GET    /api/v1/analytics/summary     # Get summary statistics
GET    /api/v1/analytics/trends      # Get trends over time
GET    /api/v1/analytics/by-category # Get spending by category
```

### Интерфейсы слоя сервисов

#### TransactionService

```python
class TransactionService:
    async def create_transaction(self, data: TransactionCreate) -> Transaction
    async def get_transaction(self, transaction_id: str) -> Transaction | None
    async def list_transactions(
        self, 
        filters: TransactionFilters, 
        pagination: Pagination
    ) -> tuple[list[Transaction], int]
    async def update_transaction(
        self, 
        transaction_id: str, 
        data: TransactionUpdate
    ) -> Transaction
    async def delete_transaction(self, transaction_id: str) -> bool
    async def import_from_csv(self, file: UploadFile) -> ImportResult
    async def export_to_csv(self, filters: TransactionFilters) -> bytes
```

#### BudgetService

```python
class BudgetService:
    async def create_budget(self, data: BudgetCreate) -> Budget
    async def get_budget(self, budget_id: str) -> Budget | None
    async def list_budgets(self) -> list[Budget]
    async def update_budget(self, budget_id: str, data: BudgetUpdate) -> Budget
    async def delete_budget(self, budget_id: str) -> bool
    async def calculate_progress(self, budget_id: str) -> BudgetProgress
    async def check_budget_alerts(self) -> list[BudgetAlert]
```

#### AnalyticsService

```python
class AnalyticsService:
    async def get_summary(
        self, 
        start_date: date, 
        end_date: date
    ) -> SummaryStats
    async def get_trends(
        self, 
        start_date: date, 
        end_date: date, 
        granularity: str
    ) -> list[TrendPoint]
    async def get_category_breakdown(
        self, 
        start_date: date, 
        end_date: date
    ) -> list[CategoryStats]
    async def get_top_categories(
        self, 
        start_date: date, 
        end_date: date, 
        limit: int
    ) -> list[CategoryStats]
```

## Модели данных

### Схема базы данных

#### Таблица Transactions

```sql
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    description TEXT,
    transaction_date DATE NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_pattern JSONB,  -- {frequency: 'monthly', day: 15}
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT positive_amount CHECK (amount > 0)
);

CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_category ON transactions(category_id);
CREATE INDEX idx_transactions_type ON transactions(type);
```

#### Таблица Categories

```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50) NOT NULL,  -- emoji or icon name
    color VARCHAR(7) NOT NULL,  -- hex color code
    type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_category_name UNIQUE (name, type)
);
```

#### Таблица Budgets

```sql
CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    amount DECIMAL(15, 2) NOT NULL,
    period VARCHAR(20) NOT NULL CHECK (period IN ('monthly', 'yearly')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT positive_budget_amount CHECK (amount > 0),
    CONSTRAINT valid_date_range CHECK (end_date > start_date),
    CONSTRAINT unique_budget_period UNIQUE (category_id, period, start_date)
);

CREATE INDEX idx_budgets_category ON budgets(category_id);
CREATE INDEX idx_budgets_dates ON budgets(start_date, end_date);
```

### Связи между сущностями

```
Categories (1) ──────< (N) Transactions
Categories (1) ──────< (N) Budgets
```

### Pydantic схемы

#### Схемы транзакций

```python
from pydantic import BaseModel, Field, validator
from datetime import date
from decimal import Decimal
from enum import Enum

class TransactionType(str, Enum):
    INCOME = "income"
    EXPENSE = "expense"

class TransactionBase(BaseModel):
    amount: Decimal = Field(gt=0, decimal_places=2)
    currency: str = Field(default="USD", max_length=3)
    category_id: str
    description: str | None = None
    transaction_date: date
    type: TransactionType

class TransactionCreate(TransactionBase):
    pass

class TransactionUpdate(BaseModel):
    amount: Decimal | None = Field(None, gt=0, decimal_places=2)
    category_id: str | None = None
    description: str | None = None
    transaction_date: date | None = None
    type: TransactionType | None = None

class Transaction(TransactionBase):
    id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
```

#### Схемы категорий

```python
class CategoryBase(BaseModel):
    name: str = Field(max_length=100)
    icon: str = Field(max_length=50)
    color: str = Field(regex=r'^#[0-9A-Fa-f]{6}$')
    type: TransactionType

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: str | None = Field(None, max_length=100)
    icon: str | None = Field(None, max_length=50)
    color: str | None = Field(None, regex=r'^#[0-9A-Fa-f]{6}$')

class Category(CategoryBase):
    id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
```

#### Схемы бюджетов

```python
class BudgetPeriod(str, Enum):
    MONTHLY = "monthly"
    YEARLY = "yearly"

class BudgetBase(BaseModel):
    category_id: str
    amount: Decimal = Field(gt=0, decimal_places=2)
    period: BudgetPeriod
    start_date: date
    end_date: date
    
    @validator('end_date')
    def validate_date_range(cls, v, values):
        if 'start_date' in values and v <= values['start_date']:
            raise ValueError('end_date must be after start_date')
        return v

class BudgetCreate(BudgetBase):
    pass

class BudgetUpdate(BaseModel):
    amount: Decimal | None = Field(None, gt=0, decimal_places=2)
    start_date: date | None = None
    end_date: date | None = None

class Budget(BudgetBase):
    id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class BudgetProgress(BaseModel):
    budget: Budget
    spent: Decimal
    remaining: Decimal
    percentage: float
    is_exceeded: bool
```


## Свойства корректности

*Свойство — это характеристика или поведение, которое должно выполняться во всех корректных выполнениях системы, по сути, формальное утверждение о том, что система должна делать. Свойства служат мостом между человекочитаемыми спецификациями и машинно-проверяемыми гарантиями корректности.*

### Рефлексия свойств

После анализа критериев приёмки выявлены следующие группы свойств:

**Naming Convention Properties (2.1-2.5)**: Все эти критерии проверяют соответствие имён файлов определённым паттернам. Можно объединить в одно свойство, которое проверяет соответствие имени файла его типу.

**Documentation Properties (3.1-3.3, 3.5)**: Все проверяют наличие документации в коде. Можно объединить в свойство, проверяющее наличие соответствующей документации для каждого типа кода.

**File Existence Properties**: Множество критериев проверяют существование файлов/директорий (1.2, 4.1, 6.1, 7.1-7.5, 8.1, 9.1, 10.1, 12.2, 13.1). Эти проверки являются примерами, а не свойствами.

**Document Content Properties**: Множество критериев проверяют содержимое документов (4.2-4.6, 5.1-5.8, 9.2-9.7, 10.2-10.3, 11.1-11.7). Эти проверки являются примерами.

**Migration Properties (12.3-12.4)**: Можно объединить в одно свойство о корректности миграций.

**Code Organization Properties (15.2-15.3)**: Можно объединить в одно свойство о правильном размещении файлов по слоям.

### Свойства

#### Свойство 1: Валидация формата сообщения коммита

*Для любого* сообщения коммита, созданного IDE агентом, сообщение должно соответствовать паттерну "[Этап: <stage_name>] Выполнен шаг: <description>", где stage_name и description не пусты.

**Валидирует: Требования 1.1**

#### Свойство 2: Валидация формата имени ветки

*Для любого* имени ветки, созданной для фич или багфиксов, имя должно соответствовать паттерну "feature/<feature-name>" или "bugfix/<bug-name>", где feature-name и bug-name содержат только строчные буквы, цифры и дефисы.

**Валидирует: Требования 1.3**

#### Свойство 3: Соответствие конвенциям именования файлов

*Для любого* файла, созданного в проекте, имя файла должно соответствовать конвенции именования для его типа:
- React/Vue компоненты: PascalCase (например, TransactionCard.jsx)
- Python модули: snake_case (например, transaction_service.py)
- JavaScript/TypeScript утилиты: camelCase (например, formatCurrency.js)
- CSS/SCSS файлы: kebab-case (например, transaction-card.scss)
- Миграции БД: префикс timestamp + snake_case (например, 20240101_create_transactions.sql)

**Валидирует: Требования 2.1, 2.2, 2.3, 2.4, 2.5**

#### Свойство 4: Полнота документации кода

*Для любой* функции или компонента в кодовой базе:
- JavaScript/TypeScript функции должны иметь JSDoc комментарии с тегами @param и @returns
- Python функции должны иметь docstrings с секциями Args и Returns
- React компоненты должны иметь PropTypes или TypeScript интерфейсы для props
- API эндпоинты должны иметь OpenAPI/Swagger аннотации

**Валидирует: Требования 3.1, 3.2, 3.3, 3.5**

#### Свойство 5: Сохранение пустых директорий

*Для любой* директории в структуре проекта, если директория должна существовать, но пуста, она должна содержать хотя бы один placeholder файл (например, .gitkeep) для отслеживания git.

**Валидирует: Требования 7.6**

#### Свойство 6: Полнота файлов миграций

*Для любого* файла миграции базы данных, файл должен содержать операции upgrade (up) и downgrade (down), а имя файла должно начинаться с timestamp в формате YYYYMMDD или YYYYMMDDHHMMSS.

**Валидирует: Требования 12.3, 12.4**

#### Свойство 7: Полнота документации схем API

*Для любого* REST API эндпоинта, определённого в backend, спецификация OpenAPI должна включать схемы запроса (для POST/PUT эндпоинтов) и ответа.

**Валидирует: Требования 14.5**

#### Свойство 8: Разделение слоёв в организации кода

*Для любого* файла кода в проекте:
- Backend обработчики API роутов должны быть в директории api/routes/
- Backend бизнес-логика должна быть в директории services/
- Backend доступ к данным должен быть в директориях repositories/ или models/
- Frontend UI компоненты должны быть в директории components/
- Frontend API клиенты должны быть в директории services/
- Frontend кастомные хуки должны быть в директории hooks/

**Валидирует: Требования 15.2, 15.3**

### Тесты на основе примеров

Следующие требования лучше валидировать через конкретные тесты-примеры, а не универсальные свойства:

**Валидация структуры проекта**:
- Проверить, что .gitignore существует и содержит исключения для Node.js, Python, Docker (Треб 1.2)
- Проверить, что README.md содержит инструкции по настройке git автора (Треб 1.5)
- Проверить, что ARCHITECTURE.md существует и содержит требуемые секции (Треб 4.1-4.6)
- Проверить, что секции плана разработки существуют в ARCHITECTURE.md (Треб 5.1-5.8)
- Проверить, что docker-compose.yml существует и определяет все сервисы (Треб 6.1-6.7)
- Проверить, что структура директорий существует (frontend/, backend/, database/) (Треб 7.1-7.5)
- Проверить, что файлы CI/CD workflow существуют (Треб 8.1-8.6)
- Проверить, что README.md содержит все требуемые секции (Треб 9.1-9.7)
- Проверить, что REPORT.md существует с правильной структурой (Треб 10.1-10.5)
- Проверить, что ARCHITECTURE.md указывает технологический стек (Треб 11.1-11.7)
- Проверить, что директории database/migrations/ и database/seeds/ существуют (Треб 12.2, 13.1)
- Проверить, что seed данные содержат требуемые записи (Треб 13.2-13.6)
- Проверить, что эндпоинт документации API существует (Треб 14.1-14.3)
- Проверить, что ARCHITECTURE.md определяет правила разделения слоёв (Треб 15.1, 15.4, 15.5)

## Обработка ошибок

### Обработка ошибок Frontend

**Ошибки коммуникации с API**:
- Сетевые ошибки: Показать понятное сообщение, предложить повтор
- 4xx ошибки: Показать ошибки валидации inline в формах
- 5xx ошибки: Показать общее сообщение об ошибке, залогировать в консоль
- Ошибки таймаута: Показать сообщение о таймауте, предложить повтор

**Ошибки валидации форм**:
- Клиентская валидация перед вызовом API
- Показывать ошибки inline рядом с полями формы
- Предотвращать отправку формы при наличии ошибок валидации
- Очищать ошибки когда пользователь исправляет ввод

**Ошибки управления состоянием**:
- Ловить ошибки в async действиях
- Устанавливать состояние ошибки для отображения компонентами
- Предоставлять error boundaries для React компонентов
- Логировать ошибки для отладки

### Обработка ошибок Backend

**Ошибки валидации запросов**:
- Возвращать 422 Unprocessable Entity с детальными ошибками валидации
- Использовать Pydantic валидацию для автоматических сообщений об ошибках
- Включать имена полей и описания ошибок в ответ

**Ошибки базы данных**:
- Ловить исключения SQLAlchemy
- Возвращать 500 Internal Server Error для неожиданных ошибок БД
- Возвращать 409 Conflict для нарушений уникальности
- Возвращать 404 Not Found для отсутствующих записей
- Логировать все ошибки БД со stack traces

**Ошибки бизнес-логики**:
- Определять кастомные классы исключений (например, BudgetExceededException)
- Возвращать соответствующие HTTP коды статуса (400, 403, 404, 409)
- Включать коды ошибок и сообщения в ответ
- Логировать ошибки бизнес-логики для мониторинга

**Ошибки обработки файлов**:
- Валидировать формат CSV файла перед обработкой
- Возвращать 400 Bad Request с конкретной ошибкой для невалидного CSV
- Обрабатывать ошибки кодировки gracefully
- Ограничивать размер файла для предотвращения проблем с памятью

### Формат ответа об ошибке

Все ошибки API должны следовать единому формату:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "amount",
        "message": "Amount must be greater than 0"
      }
    ]
  }
}
```

## Стратегия тестирования

### Двойной подход к тестированию

Этот проект требует как unit тестов, так и property-based тестов для полного покрытия:

**Unit тесты**: Проверяют конкретные примеры, граничные случаи и условия ошибок
- Конкретные примеры ввода/вывода
- Граничные случаи (пустые списки, null значения, граничные условия)
- Сценарии обработки ошибок
- Интеграция между компонентами

**Property тесты**: Проверяют универсальные свойства для всех входных данных
- Универсальные свойства корректности
- Инварианты, которые должны выполняться для всех валидных входных данных
- Полное покрытие входных данных через рандомизацию

Оба подхода к тестированию дополняют друг друга и необходимы. Unit тесты ловят конкретные баги со специфическими сценариями, в то время как property тесты проверяют общую корректность на широком диапазоне входных данных.

### Тестирование Frontend

**Фреймворк для unit тестирования**: Jest + React Testing Library

**Покрытие unit тестами**:
- Рендеринг компонентов с разными props
- Взаимодействия пользователя (клики, отправка форм)
- Обновления состояния и побочные эффекты
- Обработка ошибок API клиента
- Утилитарные функции (formatCurrency, date helpers)
- Логика валидации форм

**Фреймворк для property-based тестирования**: fast-check (библиотека property тестирования для JavaScript)

**Покрытие property тестами** (минимум 100 итераций на тест):
- **Свойство 3**: Конвенции именования файлов для сгенерированных файлов
- **Свойство 4**: Определения типов props компонентов
- Правила валидации форм для случайных входных данных
- Форматирование валюты для случайных сумм
- Форматирование дат для случайных дат

**Фреймворк для E2E тестирования**: Playwright

**Покрытие E2E тестами**:
- Полные пользовательские потоки (создание транзакции, просмотр дашборда)
- Навигация между страницами
- Отправка и валидация форм
- Сохранение данных между перезагрузками страниц

### Тестирование Backend

**Фреймворк для unit тестирования**: pytest + pytest-asyncio

**Покрытие unit тестами**:
- Ответы API эндпоинтов (коды статуса, формат ответа)
- Бизнес-логика слоя сервисов
- Операции с БД слоя репозиториев
- Валидация Pydantic схем
- Обработка ошибок для каждого слоя
- Функциональность импорта/экспорта CSV

**Фреймворк для property-based тестирования**: Hypothesis (библиотека property тестирования для Python)

**Покрытие property тестами** (минимум 100 итераций на тест):
- **Свойство 1**: Валидация формата сообщения коммита
- **Свойство 2**: Валидация формата имени ветки
- **Свойство 6**: Валидация структуры файла миграции
- **Свойство 7**: Полнота схемы API
- **Свойство 8**: Разделение слоёв организации кода
- Валидация транзакций для случайных входных данных
- Точность расчёта бюджета для случайных данных
- Консистентность назначения категорий

**Интеграционное тестирование**:
- Полные циклы запрос/ответ API с тестовой БД
- Миграции базы данных (up и down)
- Загрузка seed данных
- Запуск сервисов Docker Compose

### Тегирование property тестов

Каждый property-based тест должен включать комментарий-тег со ссылкой на документ проектирования:

```python
# Feature: project-setup-and-architecture, Property 1: Commit message format validation
@given(st.text(min_size=1), st.text(min_size=1))
def test_commit_message_format(stage_name: str, description: str):
    message = create_commit_message(stage_name, description)
    assert re.match(r'^\[Этап: .+\] Выполнен шаг: .+$', message)
```

```javascript
// Feature: project-setup-and-architecture, Property 3: File naming convention compliance
fc.assert(
  fc.property(fc.string(), (componentName) => {
    const filename = generateComponentFilename(componentName);
    return /^[A-Z][a-zA-Z0-9]*\.jsx$/.test(filename);
  }),
  { numRuns: 100 }
);
```

### Конфигурация тестов

**Минимальные требования к тестам**:
- Минимум 10 unit/integration тестов всего
- Каждое свойство корректности реализовано как property-based тест
- Каждый property тест выполняет минимум 100 итераций
- Все тесты должны проходить перед слиянием в main

**Интеграция с CI/CD**:
- Feature ветки: Запуск только линтинга и форматирования
- Pull requests в main: Запуск полного набора тестов (unit + property + integration)
- Провал тестов блокирует слияние PR

### Лучшие практики тестирования

**Баланс unit тестирования**:
- Фокусировать unit тесты на конкретных примерах и граничных случаях
- Избегать написания слишком большого количества unit тестов для сценариев, покрытых property тестами
- Использовать unit тесты для точек интеграции и условий ошибок
- Использовать property тесты для полного покрытия входных данных

**Фокус property тестирования**:
- Каждое свойство должно тестировать одно универсальное правило
- Генерировать разнообразные случайные входные данные для поиска граничных случаев
- Использовать shrinking для поиска минимальных провальных примеров
- Документировать тестируемое свойство в комментариях

**Управление тестовыми данными**:
- Использовать тестовую БД для интеграционных тестов
- Сбрасывать состояние БД между тестами
- Использовать фабрики или фикстуры для генерации тестовых данных
- Seed данные должны быть отдельными от тестовых данных

## План разработки

### Этап 1: Настройка инфраструктуры

**Цель**: Настроить структуру проекта, Docker окружение и CI/CD pipeline

**Задачи**:
1. Создать структуру директорий проекта (frontend/, backend/, database/)
2. Создать .gitignore с исключениями для Node.js, Python, Docker
3. Создать docker-compose.yml с сервисами для frontend, backend, PostgreSQL
4. Создать Dockerfiles для frontend и backend
5. Настроить GitHub Actions workflows (ci-feature.yml, ci-pr.yml)
6. Создать README.md с инструкциями по настройке
7. Создать ARCHITECTURE.md (этот документ)
8. Создать шаблон REPORT.md
9. Инициализировать git репозиторий и создать начальный коммит

**Результаты**:
- Рабочая настройка Docker Compose
- Настроенный CI/CD pipeline
- Созданные файлы документации

### Этап 2: Основа Backend API

**Цель**: Настроить Python backend с FastAPI, моделями БД и базовыми CRUD эндпоинтами

**Задачи**:
1. Инициализировать структуру проекта FastAPI
2. Настроить SQLAlchemy с подключением к PostgreSQL
3. Создать модели БД (Transaction, Category, Budget)
4. Настроить Alembic для миграций
5. Создать начальную миграцию для всех таблиц
6. Создать Pydantic схемы для валидации запросов/ответов
7. Реализовать слой репозиториев для доступа к данным
8. Создать базовые CRUD эндпоинты для транзакций, категорий, бюджетов
9. Настроить OpenAPI/Swagger документацию
10. Написать unit тесты для моделей и репозиториев

**Результаты**:
- Рабочий REST API с CRUD операциями
- Схема БД создана через миграции
- Документация API доступна по /docs
- Unit тесты проходят

### Этап 3: Основа Frontend

**Цель**: Настроить React/Next.js frontend с роутингом, управлением состоянием и интеграцией с API

**Задачи**:
1. Инициализировать проект Next.js с TypeScript
2. Настроить Tailwind CSS
3. Создать layout компоненты (Header, Footer, Navigation)
4. Настроить роутинг для основных страниц (Dashboard, Transactions, Categories, Budgets)
5. Создать сервис API клиента с Axios
6. Настроить управление состоянием (Context API или Redux Toolkit)
7. Создать общие UI компоненты (Button, Input, Select, Modal)
8. Реализовать обработку ошибок и состояния загрузки
9. Написать unit тесты для компонентов и утилит

**Результаты**:
- Рабочее frontend приложение
- Навигация между страницами
- Настроенный API клиент
- Библиотека общих компонентов
- Unit тесты проходят

### Этап 4: Реализация основных функций

**Цель**: Реализовать основные функции: транзакции, категории, бюджеты и дашборд

**Задачи**:

**Транзакции**:
1. Создать страницу списка транзакций с фильтрацией и пагинацией
2. Создать форму транзакции (создание/редактирование)
3. Реализовать удаление транзакции с подтверждением
4. Добавить валидацию транзакций (клиент и сервер)
5. Написать тесты для функций транзакций

**Категории**:
1. Создать страницу списка категорий
2. Создать форму категории с выбором иконки и цвета
3. Реализовать удаление категории с обработкой каскада
4. Добавить валидацию категорий
5. Написать тесты для функций категорий

**Бюджеты**:
1. Создать страницу списка бюджетов с прогресс-барами
2. Создать форму бюджета с выбором диапазона дат
3. Реализовать расчёт прогресса бюджета
4. Добавить алерты бюджета для превышенных бюджетов
5. Написать тесты для функций бюджетов

**Дашборд**:
1. Реализовать сводную статистику (общий доход, расходы, баланс)
2. Создать круговую диаграмму для разбивки расходов по категориям
3. Создать линейный график для тренда за 6 месяцев
4. Создать виджет топ-5 категорий
5. Добавить фильтр диапазона дат для дашборда
6. Написать тесты для расчётов аналитики

**Результаты**:
- Все основные функции работают end-to-end
- Дашборд с визуализациями
- Все CRUD операции функциональны
- Тесты проходят для всех функций

### Этап 5: Дополнительные функции

**Цель**: Реализовать продвинутые функции: импорт/экспорт CSV, повторяющиеся транзакции, мультивалютность

**Задачи**:

**Импорт/Экспорт CSV**:
1. Реализовать эндпоинт экспорта CSV с фильтрацией
2. Реализовать эндпоинт импорта CSV с валидацией
3. Создать frontend UI для импорта/экспорта
4. Обрабатывать ошибки парсинга CSV gracefully
5. Написать тесты для обработки CSV

**Повторяющиеся транзакции**:
1. Добавить паттерн повторения в модель транзакции
2. Реализовать логику создания повторяющихся транзакций
3. Создать UI для настройки повторяющихся транзакций
4. Добавить фоновую задачу для генерации повторяющихся транзакций
5. Написать тесты для логики повторения

**Мультивалютность**:
1. Добавить поле валюты в транзакции
2. Реализовать конвертацию валют (использовать фиксированные курсы или API)
3. Обновить дашборд для отображения мультивалютных итогов
4. Добавить селектор валюты в форму транзакции
5. Написать тесты для обработки валют

**Результаты**:
- Импорт/экспорт CSV работает
- Повторяющиеся транзакции функциональны
- Поддержка мультивалютности реализована
- Тесты проходят для всех функций

### Этап 6: Тестирование и документация

**Цель**: Достичь полного покрытия тестами и завершить документацию

**Задачи**:
1. Написать property-based тесты для всех свойств корректности
2. Достичь минимум 10 unit/integration тестов
3. Написать E2E тесты для критических пользовательских потоков
4. Обновить README.md с полными инструкциями по настройке
5. Обновить ARCHITECTURE.md с любыми изменениями в дизайне
6. Добавить inline документацию кода (JSDoc, docstrings)
7. Создать примеры документации API
8. Запустить полный набор тестов и исправить провалы

**Результаты**:
- Все тесты проходят (unit, property, integration, E2E)
- Полная документация
- Код правильно документирован

### Этап 7: Seed данные и финальная интеграция

**Цель**: Создать реалистичные seed данные и убедиться, что все компоненты работают вместе

**Задачи**:
1. Создать скрипты seed данных (200+ транзакций, 12 категорий, 3 бюджета)
2. Убедиться, что seed данные реалистичны и консистентны
3. Протестировать полный поток приложения с seed данными
4. Проверить, что Docker Compose корректно запускает все сервисы
5. Протестировать CI/CD pipeline end-to-end
6. Обновить REPORT.md с итоговым резюме
7. Создать финальный коммит с правильным форматом сообщения
8. Пометить версию релиза

**Результаты**:
- Seed данные загружены и работают
- Полное приложение протестировано end-to-end
- CI/CD pipeline проверен
- Проект готов к использованию

### Оценка временных рамок разработки

- Этап 1: 1-2 дня
- Этап 2: 3-4 дня
- Этап 3: 3-4 дня
- Этап 4: 5-7 дней
- Этап 5: 3-4 дня
- Этап 6: 2-3 дня
- Этап 7: 1-2 дня

**Всего**: 18-26 дней (примерно 3-4 недели)

### Критерии завершения этапа

Каждый этап считается завершённым когда:
1. Все задачи выполнены
2. Все тесты проходят
3. Код закоммичен с правильным форматом сообщения коммита
4. REPORT.md обновлён с завершением этапа
5. PR проверен и слит в main (если используется PR workflow)

