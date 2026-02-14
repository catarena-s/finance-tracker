# Документ проектирования: Дополнительные функции

## Обзор

Этот документ описывает проектирование дополнительных функциональных возможностей для приложения управления личными финансами. Включает четыре основных модуля:

1. **Импорт/экспорт CSV**: Загрузка и выгрузка транзакций в формате CSV
2. **Повторяющиеся транзакции**: Автоматическое создание регулярных транзакций по расписанию
3. **Мультивалютность**: Поддержка транзакций в разных валютах с автоматической конвертацией
4. **Фоновые задачи**: Асинхронная обработка длительных операций

Технологический стек:
- Backend: FastAPI + SQLAlchemy + Celery (фоновые задачи) + Redis (брокер сообщений)
- Frontend: Next.js + TypeScript + React Hook Form
- CSV обработка: Python csv module + pandas
- Планировщик: Celery Beat
- API курсов валют: exchangerate-api.com

Ключевые архитектурные решения:
- Использование Celery для фоновой обработки импорта больших CSV файлов
- Кэширование курсов валют в Redis на 24 часа
- Хранение исторических курсов валют для точности отчетов
- Celery Beat для автоматического создания повторяющихся транзакций
- Валидация CSV данных с детальными отчетами об ошибках

## Архитектура

### Высокоуровневая архитектура

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend Layer                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Next.js Components                                     │ │
│  │  - CSVImportForm                                        │ │
│  │  - CSVExportDialog                                      │ │
│  │  - RecurringTransactionManager                          │ │
│  │  - CurrencySelector                                     │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/REST
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                        API Layer                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  FastAPI Endpoints                                      │ │
│  │  - POST /api/v1/transactions/import                     │ │
│  │  - GET  /api/v1/transactions/export                     │ │
│  │  - CRUD /api/v1/recurring-transactions                  │ │
│  │  - GET  /api/v1/currencies                              │ │
│  │  - GET  /api/v1/tasks/{task_id}/status                  │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Service Layer                           │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  - CSVImportService                                     │ │
│  │  - CSVExportService                                     │ │
│  │  - RecurringTransactionService                          │ │
│  │  - CurrencyService                                      │ │
│  │  - ExchangeRateService                                  │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Background Tasks Layer                    │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Celery Workers                                         │ │
│  │  - import_csv_task                                      │ │
│  │  - create_recurring_transactions_task                   │ │
│  │  - update_exchange_rates_task                           │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Celery Beat Scheduler                                  │ │
│  │  - Daily: create recurring transactions (00:00 UTC)     │ │
│  │  - Daily: update exchange rates (01:00 UTC)             │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                        Data Layer                            │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  PostgreSQL                                             │ │
│  │  - recurring_transactions table                         │ │
│  │  - exchange_rates table                                 │ │
│  │  - currencies table                                     │ │
│  │  - task_results table                                   │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Redis                                                  │ │
│  │  - Celery message broker                                │ │
│  │  - Exchange rate cache (TTL: 24h)                       │ │
│  │  - Task status cache                                    │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Структура проекта

```
backend/
├── app/
│   ├── models/
│   │   ├── recurring_transaction.py
│   │   ├── exchange_rate.py
│   │   ├── currency.py
│   │   └── task_result.py
│   ├── schemas/
│   │   ├── recurring_transaction.py
│   │   ├── exchange_rate.py
│   │   ├── currency.py
│   │   ├── csv_import.py
│   │   └── task.py
│   ├── repositories/
│   │   ├── recurring_transaction.py
│   │   ├── exchange_rate.py
│   │   └── currency.py
│   ├── services/
│   │   ├── csv_import.py
│   │   ├── csv_export.py
│   │   ├── recurring_transaction.py
│   │   ├── currency.py
│   │   └── exchange_rate.py
│   ├── tasks/
│   │   ├── __init__.py
│   │   ├── celery_app.py
│   │   ├── csv_tasks.py
│   │   ├── recurring_tasks.py
│   │   └── currency_tasks.py
│   ├── api/
│   │   └── routes/
│   │       ├── csv.py
│   │       ├── recurring_transactions.py
│   │       ├── currencies.py
│   │       └── tasks.py
│   └── core/
│       └── currency_api_client.py
├── alembic/
│   └── versions/
│       ├── YYYYMMDD_add_recurring_transactions.py
│       ├── YYYYMMDD_add_currencies.py
│       └── YYYYMMDD_add_exchange_rates.py
└── requirements.txt (добавить: celery, redis, pandas, httpx)

frontend/
├── src/
│   ├── components/
│   │   ├── csv/
│   │   │   ├── CSVImportForm.tsx
│   │   │   ├── CSVMappingDialog.tsx
│   │   │   ├── CSVPreview.tsx
│   │   │   └── CSVExportDialog.tsx
│   │   ├── recurring/
│   │   │   ├── RecurringTransactionList.tsx
│   │   │   ├── RecurringTransactionForm.tsx
│   │   │   └── RecurringTransactionCard.tsx
│   │   └── currency/
│   │       ├── CurrencySelector.tsx
│   │       └── CurrencyDisplay.tsx
│   ├── services/
│   │   ├── csvService.ts
│   │   ├── recurringTransactionService.ts
│   │   └── currencyService.ts
│   └── types/
│       ├── csv.ts
│       ├── recurring.ts
│       └── currency.ts
```

## Компоненты и интерфейсы

### 1. Модели данных (SQLAlchemy)

#### RecurringTransaction Model

```python
from sqlalchemy import Column, String, Numeric, Boolean, ForeignKey, Date, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

class RecurringTransaction(Base):
    __tablename__ = "recurring_transactions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False)
    amount = Column(Numeric(15, 2), nullable=False)
    currency = Column(String(3), nullable=False, default="USD")
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id"), nullable=False)
    description = Column(String, nullable=True)
    type = Column(String(10), nullable=False)
    
    # Расписание
    frequency = Column(String(20), nullable=False)  # daily, weekly, monthly, yearly
    interval = Column(Integer, nullable=False, default=1)  # каждые N дней/недель/месяцев
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    next_occurrence = Column(Date, nullable=False)
    
    # Статус
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    category = relationship("Category")
    
    __table_args__ = (
        CheckConstraint("amount > 0", name="check_positive_recurring_amount"),
        CheckConstraint("type IN ('income', 'expense')", name="check_valid_recurring_type"),
        CheckConstraint(
            "frequency IN ('daily', 'weekly', 'monthly', 'yearly')",
            name="check_valid_frequency"
        ),
        CheckConstraint("interval > 0", name="check_positive_interval"),
    )
```

#### Currency Model

```python
class Currency(Base):
    __tablename__ = "currencies"
    
    code = Column(String(3), primary_key=True)  # USD, EUR, RUB, etc.
    name = Column(String(100), nullable=False)
    symbol = Column(String(10), nullable=False)
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
```

#### ExchangeRate Model

```python
class ExchangeRate(Base):
    __tablename__ = "exchange_rates"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    from_currency = Column(String(3), ForeignKey("currencies.code"), nullable=False)
    to_currency = Column(String(3), ForeignKey("currencies.code"), nullable=False)
    rate = Column(Numeric(20, 10), nullable=False)
    date = Column(Date, nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    __table_args__ = (
        UniqueConstraint("from_currency", "to_currency", "date", name="unique_rate_per_day"),
        CheckConstraint("rate > 0", name="check_positive_rate"),
    )
```

#### TaskResult Model

```python
class TaskResult(Base):
    __tablename__ = "task_results"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    task_id = Column(String(255), unique=True, nullable=False)
    task_type = Column(String(50), nullable=False)  # csv_import, recurring_creation, etc.
    status = Column(String(20), nullable=False)  # pending, running, completed, failed
    result = Column(JSON, nullable=True)
    error = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
```

### 2. Pydantic схемы

#### RecurringTransaction Schemas

```python
from pydantic import BaseModel, Field, field_validator
from datetime import date
from decimal import Decimal
from enum import Enum
import uuid

class FrequencyType(str, Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    YEARLY = "yearly"

class RecurringTransactionBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    amount: Decimal = Field(..., gt=0, decimal_places=2)
    currency: str = Field(default="USD", min_length=3, max_length=3)
    category_id: uuid.UUID
    description: str | None = None
    type: str = Field(..., pattern="^(income|expense)$")
    frequency: FrequencyType
    interval: int = Field(..., gt=0)
    start_date: date
    end_date: date | None = None
    
    @field_validator("end_date")
    @classmethod
    def validate_end_date(cls, v, info):
        if v and "start_date" in info.data and v <= info.data["start_date"]:
            raise ValueError("end_date must be after start_date")
        return v

class RecurringTransactionCreate(RecurringTransactionBase):
    pass

class RecurringTransactionUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=200)
    amount: Decimal | None = Field(None, gt=0, decimal_places=2)
    currency: str | None = Field(None, min_length=3, max_length=3)
    category_id: uuid.UUID | None = None
    description: str | None = None
    type: str | None = Field(None, pattern="^(income|expense)$")
    frequency: FrequencyType | None = None
    interval: int | None = Field(None, gt=0)
    start_date: date | None = None
    end_date: date | None = None
    is_active: bool | None = None

class RecurringTransaction(RecurringTransactionBase):
    id: uuid.UUID
    next_occurrence: date
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    model_config = {"from_attributes": True}
```

#### CSV Import/Export Schemas

```python
class CSVColumnMapping(BaseModel):
    amount: str
    currency: str | None = None
    category_name: str
    description: str | None = None
    transaction_date: str
    type: str

class CSVImportRequest(BaseModel):
    file_content: str  # Base64 encoded CSV
    mapping: CSVColumnMapping
    date_format: str = "%Y-%m-%d"

class CSVImportResult(BaseModel):
    task_id: str
    status: str
    created_count: int = 0
    error_count: int = 0
    errors: list[dict] = []

class CSVExportRequest(BaseModel):
    start_date: date | None = None
    end_date: date | None = None
    category_id: uuid.UUID | None = None
    columns: list[str] = ["amount", "currency", "category_name", "description", "transaction_date", "type"]
    date_format: str = "%Y-%m-%d"
```

#### Currency Schemas

```python
class CurrencyBase(BaseModel):
    code: str = Field(..., min_length=3, max_length=3)
    name: str = Field(..., min_length=1, max_length=100)
    symbol: str = Field(..., min_length=1, max_length=10)

class Currency(CurrencyBase):
    is_active: bool
    created_at: datetime
    
    model_config = {"from_attributes": True}

class ExchangeRateBase(BaseModel):
    from_currency: str = Field(..., min_length=3, max_length=3)
    to_currency: str = Field(..., min_length=3, max_length=3)
    rate: Decimal = Field(..., gt=0, decimal_places=10)
    date: date

class ExchangeRate(ExchangeRateBase):
    id: uuid.UUID
    created_at: datetime
    
    model_config = {"from_attributes": True}
```

#### Task Schemas

```python
class TaskStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"

class TaskStatusResponse(BaseModel):
    task_id: str
    task_type: str
    status: TaskStatus
    result: dict | None = None
    error: str | None = None
    created_at: datetime
    updated_at: datetime
```

### 3. Repository слой

#### RecurringTransactionRepository

```python
from sqlalchemy import select, and_
from datetime import date

class RecurringTransactionRepository(BaseRepository[RecurringTransaction]):
    async def get_active_due_today(self, current_date: date) -> list[RecurringTransaction]:
        """Получить активные шаблоны, которые должны быть выполнены сегодня"""
        result = await self.session.execute(
            select(RecurringTransaction).where(
                and_(
                    RecurringTransaction.is_active == True,
                    RecurringTransaction.next_occurrence <= current_date,
                    or_(
                        RecurringTransaction.end_date.is_(None),
                        RecurringTransaction.end_date >= current_date
                    )
                )
            )
        )
        return list(result.scalars().all())
    
    async def update_next_occurrence(
        self, recurring_id: uuid.UUID, next_date: date
    ) -> None:
        """Обновить дату следующего выполнения"""
        await self.session.execute(
            update(RecurringTransaction)
            .where(RecurringTransaction.id == recurring_id)
            .values(next_occurrence=next_date)
        )
        await self.session.commit()
```

#### ExchangeRateRepository

```python
class ExchangeRateRepository(BaseRepository[ExchangeRate]):
    async def get_rate(
        self, from_currency: str, to_currency: str, date: date
    ) -> ExchangeRate | None:
        """Получить курс валюты на определенную дату"""
        result = await self.session.execute(
            select(ExchangeRate).where(
                and_(
                    ExchangeRate.from_currency == from_currency,
                    ExchangeRate.to_currency == to_currency,
                    ExchangeRate.date == date
                )
            )
        )
        return result.scalar_one_or_none()
    
    async def get_latest_rate(
        self, from_currency: str, to_currency: str
    ) -> ExchangeRate | None:
        """Получить последний известный курс"""
        result = await self.session.execute(
            select(ExchangeRate)
            .where(
                and_(
                    ExchangeRate.from_currency == from_currency,
                    ExchangeRate.to_currency == to_currency
                )
            )
            .order_by(ExchangeRate.date.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()
    
    async def bulk_create(self, rates: list[dict]) -> None:
        """Массовое создание курсов валют"""
        instances = [ExchangeRate(**rate) for rate in rates]
        self.session.add_all(instances)
        await self.session.commit()
```

#### CurrencyRepository

```python
class CurrencyRepository(BaseRepository[Currency]):
    async def get_by_code(self, code: str) -> Currency | None:
        """Получить валюту по коду"""
        result = await self.session.execute(
            select(Currency).where(Currency.code == code)
        )
        return result.scalar_one_or_none()
    
    async def get_active_currencies(self) -> list[Currency]:
        """Получить список активных валют"""
        result = await self.session.execute(
            select(Currency).where(Currency.is_active == True)
        )
        return list(result.scalars().all())
```

### 4. Service слой

#### CSVImportService

```python
import csv
from io import StringIO
import base64
from decimal import Decimal
from datetime import datetime

class CSVImportService:
    def __init__(
        self,
        transaction_service: TransactionService,
        category_repo: CategoryRepository
    ):
        self.transaction_service = transaction_service
        self.category_repo = category_repo
    
    async def import_csv(
        self, file_content: str, mapping: CSVColumnMapping, date_format: str
    ) -> CSVImportResult:
        """Импортировать транзакции из CSV"""
        # Декодировать base64
        csv_content = base64.b64decode(file_content).decode('utf-8')
        
        # Если файл большой (>1000 строк), запустить фоновую задачу
        line_count = csv_content.count('\n')
        if line_count > 1000:
            from app.tasks.csv_tasks import import_csv_task
            task = import_csv_task.delay(csv_content, mapping.model_dump(), date_format)
            return CSVImportResult(
                task_id=task.id,
                status="pending"
            )
        
        # Иначе обработать синхронно
        return await self._process_csv(csv_content, mapping, date_format)
    
    async def _process_csv(
        self, csv_content: str, mapping: CSVColumnMapping, date_format: str
    ) -> CSVImportResult:
        """Обработать CSV файл"""
        reader = csv.DictReader(StringIO(csv_content))
        created_count = 0
        errors = []
        
        for row_num, row in enumerate(reader, start=2):
            try:
                # Валидация обязательных полей
                if not row.get(mapping.amount) or not row.get(mapping.transaction_date):
                    errors.append({
                        "row": row_num,
                        "error": "Missing required fields: amount or transaction_date"
                    })
                    continue
                
                # Парсинг суммы
                try:
                    amount = Decimal(row[mapping.amount].strip())
                    if amount <= 0:
                        raise ValueError("Amount must be positive")
                except (ValueError, InvalidOperation) as e:
                    errors.append({
                        "row": row_num,
                        "error": f"Invalid amount: {str(e)}"
                    })
                    continue
                
                # Парсинг даты
                try:
                    transaction_date = datetime.strptime(
                        row[mapping.transaction_date].strip(), date_format
                    ).date()
                except ValueError as e:
                    errors.append({
                        "row": row_num,
                        "error": f"Invalid date format: {str(e)}"
                    })
                    continue
                
                # Получить или создать категорию
                category_name = row[mapping.category_name].strip()
                transaction_type = row[mapping.type].strip().lower()
                
                if transaction_type not in ['income', 'expense']:
                    errors.append({
                        "row": row_num,
                        "error": f"Invalid type: {transaction_type}"
                    })
                    continue
                
                category = await self.category_repo.get_by_name_and_type(
                    category_name, transaction_type
                )
                
                if not category:
                    # Создать новую категорию
                    from app.schemas.category import CategoryCreate
                    category_data = CategoryCreate(
                        name=category_name,
                        icon="📁",
                        color="#808080",
                        type=transaction_type
                    )
                    category = await self.category_repo.create(**category_data.model_dump())
                
                # Создать транзакцию
                from app.schemas.transaction import TransactionCreate
                transaction_data = TransactionCreate(
                    amount=amount,
                    currency=row.get(mapping.currency, "USD").strip().upper() if mapping.currency else "USD",
                    category_id=category.id,
                    description=row.get(mapping.description, "").strip() if mapping.description else None,
                    transaction_date=transaction_date,
                    type=transaction_type
                )
                
                await self.transaction_service.create_transaction(transaction_data)
                created_count += 1
                
            except Exception as e:
                errors.append({
                    "row": row_num,
                    "error": f"Unexpected error: {str(e)}"
                })
        
        return CSVImportResult(
            task_id="sync",
            status="completed",
            created_count=created_count,
            error_count=len(errors),
            errors=errors
        )
```

#### CSVExportService

```python
class CSVExportService:
    def __init__(self, transaction_repo: TransactionRepository):
        self.transaction_repo = transaction_repo
    
    async def export_csv(
        self,
        start_date: date | None,
        end_date: date | None,
        category_id: uuid.UUID | None,
        columns: list[str],
        date_format: str
    ) -> str:
        """Экспортировать транзакции в CSV"""
        # Получить транзакции
        transactions, _ = await self.transaction_repo.get_filtered(
            start_date=start_date,
            end_date=end_date,
            category_id=category_id,
            limit=100000
        )
        
        # Создать CSV
        output = StringIO()
        writer = csv.DictWriter(output, fieldnames=columns)
        writer.writeheader()
        
        for t in transactions:
            row = {}
            if "amount" in columns:
                row["amount"] = str(t.amount)
            if "currency" in columns:
                row["currency"] = t.currency
            if "category_name" in columns:
                row["category_name"] = t.category.name
            if "description" in columns:
                row["description"] = t.description or ""
            if "transaction_date" in columns:
                row["transaction_date"] = t.transaction_date.strftime(date_format)
            if "type" in columns:
                row["type"] = t.type
            
            writer.writerow(row)
        
        return output.getvalue()
```

#### RecurringTransactionService

```python
from datetime import timedelta
from dateutil.relativedelta import relativedelta

class RecurringTransactionService:
    def __init__(
        self,
        recurring_repo: RecurringTransactionRepository,
        transaction_service: TransactionService,
        category_repo: CategoryRepository
    ):
        self.recurring_repo = recurring_repo
        self.transaction_service = transaction_service
        self.category_repo = category_repo
    
    async def create_recurring_transaction(
        self, data: RecurringTransactionCreate
    ) -> RecurringTransaction:
        """Создать шаблон повторяющейся транзакции"""
        # Проверить категорию
        category = await self.category_repo.get_by_id(data.category_id)
        if not category:
            raise NotFoundException("Category not found")
        
        # Рассчитать первую дату выполнения
        next_occurrence = data.start_date
        
        # Создать шаблон
        recurring = await self.recurring_repo.create(
            **data.model_dump(),
            next_occurrence=next_occurrence
        )
        return RecurringTransaction.model_validate(recurring)
    
    async def update_recurring_transaction(
        self, recurring_id: uuid.UUID, data: RecurringTransactionUpdate
    ) -> RecurringTransaction:
        """Обновить шаблон"""
        existing = await self.recurring_repo.get_by_id(recurring_id)
        if not existing:
            raise NotFoundException("Recurring transaction not found")
        
        # Проверить категорию если обновляется
        if data.category_id:
            category = await self.category_repo.get_by_id(data.category_id)
            if not category:
                raise NotFoundException("Category not found")
        
        # Пересчитать next_occurrence если изменились параметры расписания
        update_data = data.model_dump(exclude_unset=True)
        if any(k in update_data for k in ['frequency', 'interval', 'start_date']):
            frequency = update_data.get('frequency', existing.frequency)
            interval = update_data.get('interval', existing.interval)
            start_date = update_data.get('start_date', existing.start_date)
            update_data['next_occurrence'] = self._calculate_next_occurrence(
                start_date, frequency, interval, date.today()
            )
        
        updated = await self.recurring_repo.update(recurring_id, **update_data)
        return RecurringTransaction.model_validate(updated)
    
    async def delete_recurring_transaction(self, recurring_id: uuid.UUID) -> None:
        """Удалить шаблон"""
        deleted = await self.recurring_repo.delete(recurring_id)
        if not deleted:
            raise NotFoundException("Recurring transaction not found")
    
    async def process_due_recurring_transactions(self, current_date: date) -> dict:
        """Обработать все шаблоны, которые должны быть выполнены"""
        recurring_transactions = await self.recurring_repo.get_active_due_today(current_date)
        
        created_count = 0
        errors = []
        
        for recurring in recurring_transactions:
            try:
                # Создать транзакцию
                from app.schemas.transaction import TransactionCreate
                transaction_data = TransactionCreate(
                    amount=recurring.amount,
                    currency=recurring.currency,
                    category_id=recurring.category_id,
                    description=f"{recurring.name} (автоматически создано)",
                    transaction_date=recurring.next_occurrence,
                    type=recurring.type
                )
                
                await self.transaction_service.create_transaction(transaction_data)
                created_count += 1
                
                # Рассчитать следующую дату выполнения
                next_date = self._calculate_next_occurrence(
                    recurring.next_occurrence,
                    recurring.frequency,
                    recurring.interval,
                    current_date
                )
                
                # Обновить next_occurrence
                await self.recurring_repo.update_next_occurrence(recurring.id, next_date)
                
            except Exception as e:
                errors.append({
                    "recurring_id": str(recurring.id),
                    "error": str(e)
                })
        
        return {
            "created_count": created_count,
            "error_count": len(errors),
            "errors": errors
        }
    
    def _calculate_next_occurrence(
        self, current_date: date, frequency: str, interval: int, reference_date: date
    ) -> date:
        """Рассчитать следующую дату выполнения"""
        if frequency == "daily":
            return current_date + timedelta(days=interval)
        elif frequency == "weekly":
            return current_date + timedelta(weeks=interval)
        elif frequency == "monthly":
            return current_date + relativedelta(months=interval)
        elif frequency == "yearly":
            return current_date + relativedelta(years=interval)
        else:
            raise ValueError(f"Invalid frequency: {frequency}")
```

#### CurrencyService

```python
class CurrencyService:
    def __init__(
        self,
        currency_repo: CurrencyRepository,
        exchange_rate_repo: ExchangeRateRepository
    ):
        self.currency_repo = currency_repo
        self.exchange_rate_repo = exchange_rate_repo
    
    async def get_currencies(self) -> list[Currency]:
        """Получить список активных валют"""
        currencies = await self.currency_repo.get_active_currencies()
        return [Currency.model_validate(c) for c in currencies]
    
    async def convert_amount(
        self,
        amount: Decimal,
        from_currency: str,
        to_currency: str,
        date: date
    ) -> Decimal:
        """Конвертировать сумму из одной валюты в другую"""
        if from_currency == to_currency:
            return amount
        
        # Получить курс на дату
        rate = await self.exchange_rate_repo.get_rate(from_currency, to_currency, date)
        
        if not rate:
            # Попробовать получить последний известный курс
            rate = await self.exchange_rate_repo.get_latest_rate(from_currency, to_currency)
            
            if not rate:
                raise NotFoundException(
                    f"Exchange rate not found for {from_currency} to {to_currency}"
                )
        
        return amount * rate.rate
```

#### ExchangeRateService

```python
import httpx
from app.core.currency_api_client import CurrencyAPIClient

class ExchangeRateService:
    def __init__(
        self,
        exchange_rate_repo: ExchangeRateRepository,
        currency_repo: CurrencyRepository,
        api_client: CurrencyAPIClient
    ):
        self.exchange_rate_repo = exchange_rate_repo
        self.currency_repo = currency_repo
        self.api_client = api_client
    
    async def update_exchange_rates(self, base_currency: str = "USD") -> dict:
        """Обновить курсы валют через внешний API"""
        try:
            # Получить курсы от API
            rates_data = await self.api_client.get_latest_rates(base_currency)
            
            # Получить список активных валют
            currencies = await self.currency_repo.get_active_currencies()
            currency_codes = [c.code for c in currencies]
            
            # Подготовить данные для сохранения
            today = date.today()
            rates_to_save = []
            
            for to_currency in currency_codes:
                if to_currency == base_currency:
                    continue
                
                if to_currency in rates_data:
                    rates_to_save.append({
                        "from_currency": base_currency,
                        "to_currency": to_currency,
                        "rate": Decimal(str(rates_data[to_currency])),
                        "date": today
                    })
            
            # Сохранить курсы
            await self.exchange_rate_repo.bulk_create(rates_to_save)
            
            return {
                "success": True,
                "updated_count": len(rates_to_save),
                "date": today
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    async def get_exchange_rate(
        self, from_currency: str, to_currency: str, date: date
    ) -> ExchangeRate:
        """Получить курс валюты на дату"""
        rate = await self.exchange_rate_repo.get_rate(from_currency, to_currency, date)
        
        if not rate:
            # Попробовать получить последний известный курс
            rate = await self.exchange_rate_repo.get_latest_rate(from_currency, to_currency)
            
            if not rate:
                raise NotFoundException(
                    f"Exchange rate not found for {from_currency} to {to_currency}"
                )
        
        return ExchangeRate.model_validate(rate)
```

### 5. Celery задачи

#### CSV Tasks

```python
from celery import Task
from app.tasks.celery_app import celery_app
from app.services.csv_import import CSVImportService
from app.models.task_result import TaskResult

@celery_app.task(bind=True)
def import_csv_task(
    self: Task,
    csv_content: str,
    mapping: dict,
    date_format: str
) -> dict:
    """Фоновая задача импорта CSV"""
    # Сохранить статус задачи
    task_result = TaskResult(
        task_id=self.request.id,
        task_type="csv_import",
        status="running"
    )
    db.add(task_result)
    db.commit()
    
    try:
        # Выполнить импорт
        from app.schemas.csv_import import CSVColumnMapping
        mapping_obj = CSVColumnMapping(**mapping)
        
        # Создать сервис
        service = CSVImportService(transaction_service, category_repo)
        result = await service._process_csv(csv_content, mapping_obj, date_format)
        
        # Обновить статус
        task_result.status = "completed"
        task_result.result = result.model_dump()
        db.commit()
        
        return result.model_dump()
        
    except Exception as e:
        # Обновить статус с ошибкой
        task_result.status = "failed"
        task_result.error = str(e)
        db.commit()
        raise
```

#### Recurring Tasks

```python
@celery_app.task
def create_recurring_transactions_task() -> dict:
    """Ежедневная задача создания повторяющихся транзакций"""
    from app.services.recurring_transaction import RecurringTransactionService
    
    service = RecurringTransactionService(
        recurring_repo, transaction_service, category_repo
    )
    
    result = await service.process_due_recurring_transactions(date.today())
    return result
```

#### Currency Tasks

```python
@celery_app.task
def update_exchange_rates_task() -> dict:
    """Ежедневная задача обновления курсов валют"""
    from app.services.exchange_rate import ExchangeRateService
    
    service = ExchangeRateService(
        exchange_rate_repo, currency_repo, api_client
    )
    
    result = await service.update_exchange_rates()
    return result
```

### 6. Celery конфигурация

#### celery_app.py

```python
from celery import Celery
from celery.schedules import crontab

celery_app = Celery(
    "finance_tracker",
    broker="redis://redis:6379/0",
    backend="redis://redis:6379/0"
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,  # 30 минут
    worker_max_tasks_per_child=1000,
)

# Расписание для Celery Beat
celery_app.conf.beat_schedule = {
    "create-recurring-transactions": {
        "task": "app.tasks.recurring_tasks.create_recurring_transactions_task",
        "schedule": crontab(hour=0, minute=0),  # Каждый день в 00:00 UTC
    },
    "update-exchange-rates": {
        "task": "app.tasks.currency_tasks.update_exchange_rates_task",
        "schedule": crontab(hour=1, minute=0),  # Каждый день в 01:00 UTC
    },
}
```

### 7. API эндпоинты

#### CSV Routes

```python
from fastapi import APIRouter, UploadFile, File, Depends
from fastapi.responses import StreamingResponse
from io import BytesIO

router = APIRouter(prefix="/api/v1/csv", tags=["csv"])

@router.post("/import", response_model=CSVImportResult)
async def import_csv(
    request: CSVImportRequest,
    csv_service: CSVImportService = Depends()
):
    """Импортировать транзакции из CSV"""
    result = await csv_service.import_csv(
        request.file_content,
        request.mapping,
        request.date_format
    )
    return result

@router.get("/export")
async def export_csv(
    request: CSVExportRequest = Depends(),
    csv_service: CSVExportService = Depends()
):
    """Экспортировать транзакции в CSV"""
    csv_content = await csv_service.export_csv(
        request.start_date,
        request.end_date,
        request.category_id,
        request.columns,
        request.date_format
    )
    
    # Вернуть как файл для скачивания
    return StreamingResponse(
        BytesIO(csv_content.encode()),
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=transactions_{date.today()}.csv"
        }
    )
```

#### Recurring Transaction Routes

```python
router = APIRouter(prefix="/api/v1/recurring-transactions", tags=["recurring"])

@router.post("", response_model=RecurringTransaction, status_code=201)
async def create_recurring_transaction(
    data: RecurringTransactionCreate,
    service: RecurringTransactionService = Depends()
):
    """Создать шаблон повторяющейся транзакции"""
    return await service.create_recurring_transaction(data)

@router.get("", response_model=list[RecurringTransaction])
async def list_recurring_transactions(
    service: RecurringTransactionService = Depends()
):
    """Получить список всех шаблонов"""
    return await service.list_recurring_transactions()

@router.get("/{recurring_id}", response_model=RecurringTransaction)
async def get_recurring_transaction(
    recurring_id: uuid.UUID,
    service: RecurringTransactionService = Depends()
):
    """Получить шаблон по ID"""
    return await service.get_recurring_transaction(recurring_id)

@router.put("/{recurring_id}", response_model=RecurringTransaction)
async def update_recurring_transaction(
    recurring_id: uuid.UUID,
    data: RecurringTransactionUpdate,
    service: RecurringTransactionService = Depends()
):
    """Обновить шаблон"""
    return await service.update_recurring_transaction(recurring_id, data)

@router.delete("/{recurring_id}", status_code=204)
async def delete_recurring_transaction(
    recurring_id: uuid.UUID,
    service: RecurringTransactionService = Depends()
):
    """Удалить шаблон"""
    await service.delete_recurring_transaction(recurring_id)
```

#### Currency Routes

```python
router = APIRouter(prefix="/api/v1/currencies", tags=["currencies"])

@router.get("", response_model=list[Currency])
async def list_currencies(
    service: CurrencyService = Depends()
):
    """Получить список активных валют"""
    return await service.get_currencies()

@router.get("/exchange-rate", response_model=ExchangeRate)
async def get_exchange_rate(
    from_currency: str,
    to_currency: str,
    date: date = date.today(),
    service: ExchangeRateService = Depends()
):
    """Получить курс валюты на дату"""
    return await service.get_exchange_rate(from_currency, to_currency, date)
```

#### Task Routes

```python
router = APIRouter(prefix="/api/v1/tasks", tags=["tasks"])

@router.get("/{task_id}/status", response_model=TaskStatusResponse)
async def get_task_status(
    task_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Получить статус фоновой задачи"""
    result = await db.execute(
        select(TaskResult).where(TaskResult.task_id == task_id)
    )
    task_result = result.scalar_one_or_none()
    
    if not task_result:
        raise NotFoundException("Task not found")
    
    return TaskStatusResponse.model_validate(task_result)
```

### 8. Currency API Client

```python
import httpx
from app.core.config import settings

class CurrencyAPIClient:
    def __init__(self):
        self.base_url = "https://api.exchangerate-api.com/v4/latest"
        self.timeout = 10.0
    
    async def get_latest_rates(self, base_currency: str = "USD") -> dict:
        """Получить последние курсы валют"""
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.get(f"{self.base_url}/{base_currency}")
            response.raise_for_status()
            data = response.json()
            return data["rates"]
```

## Модели данных

### Схема базы данных

#### Таблица recurring_transactions

```sql
CREATE TABLE recurring_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    description TEXT,
    type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
    
    frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
    interval INTEGER NOT NULL CHECK (interval > 0),
    start_date DATE NOT NULL,
    end_date DATE,
    next_occurrence DATE NOT NULL,
    
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT positive_recurring_amount CHECK (amount > 0)
);

CREATE INDEX idx_recurring_next_occurrence ON recurring_transactions(next_occurrence);
CREATE INDEX idx_recurring_active ON recurring_transactions(is_active);
```

#### Таблица currencies

```sql
CREATE TABLE currencies (
    code VARCHAR(3) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed данные
INSERT INTO currencies (code, name, symbol) VALUES
    ('USD', 'US Dollar', '$'),
    ('EUR', 'Euro', '€'),
    ('GBP', 'British Pound', '£'),
    ('JPY', 'Japanese Yen', '¥'),
    ('CNY', 'Chinese Yuan', '¥'),
    ('RUB', 'Russian Ruble', '₽'),
    ('INR', 'Indian Rupee', '₹'),
    ('BRL', 'Brazilian Real', 'R$'),
    ('CAD', 'Canadian Dollar', 'C$'),
    ('AUD', 'Australian Dollar', 'A$');
```

#### Таблица exchange_rates

```sql
CREATE TABLE exchange_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_currency VARCHAR(3) NOT NULL REFERENCES currencies(code),
    to_currency VARCHAR(3) NOT NULL REFERENCES currencies(code),
    rate DECIMAL(20, 10) NOT NULL CHECK (rate > 0),
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_rate_per_day UNIQUE (from_currency, to_currency, date)
);

CREATE INDEX idx_exchange_rates_currencies ON exchange_rates(from_currency, to_currency);
CREATE INDEX idx_exchange_rates_date ON exchange_rates(date);
```

#### Таблица task_results

```sql
CREATE TABLE task_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id VARCHAR(255) UNIQUE NOT NULL,
    task_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    result JSONB,
    error TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_task_results_task_id ON task_results(task_id);
CREATE INDEX idx_task_results_status ON task_results(status);
```

#### Обновление таблицы transactions для мультивалютности

```sql
-- Добавить поле для хранения курса на момент транзакции
ALTER TABLE transactions ADD COLUMN exchange_rate DECIMAL(20, 10);
ALTER TABLE transactions ADD COLUMN base_currency VARCHAR(3) DEFAULT 'USD';

-- Индекс для быстрого поиска по валюте
CREATE INDEX idx_transactions_currency ON transactions(currency);
```

## Свойства корректности

*Свойство — это характеристика или поведение, которое должно выполняться во всех корректных выполнениях системы, по сути, формальное утверждение о том, что система должна делать. Свойства служат мостом между человекочитаемыми спецификациями и машинно-проверяемыми гарантиями корректности.*

Перед написанием свойств корректности необходимо выполнить анализ критериев приемки:

### Рефлексия свойств

После анализа критериев приёмки выявлены следующие группы свойств для объединения:

**CSV Validation Properties (1.4, 1.5, 1.8, 1.9, 7.1-7.4, 7.7-7.8)**: Все эти критерии проверяют валидацию CSV данных. Можно объединить в одно свойство о том, что все строки проходят валидацию и невалидные строки попадают в отчет об ошибках.

**CSV Normalization Properties (7.5, 7.6, 7.9)**: Все проверяют нормализацию данных. Можно объединить в одно свойство о нормализации входных данных.

**Recurring Transaction Creation Properties (3.5, 3.6)**: Оба проверяют создание транзакций из шаблонов. Можно объединить в одно свойство.

**Recurring Transaction Lifecycle Properties (3.8, 3.9, 3.10, 3.11)**: Все проверяют независимость шаблонов и созданных транзакций. Можно объединить в одно свойство.

**Exchange Rate Fallback Properties (4.5, 5.5, 4.12)**: Все проверяют fallback поведение при недоступности курсов. Можно объединить в одно свойство.

**Task Status Properties (6.2, 6.3, 6.4)**: Все проверяют работу с фоновыми задачами. Можно объединить в одно свойство о жизненном цикле задач.

### Свойства

#### Свойство 1: Валидация и отчетность CSV импорта

*Для любого* CSV файла, при импорте каждая строка должна пройти валидацию, и все невалидные строки должны быть включены в отчет об ошибках с указанием номера строки и причины ошибки.

**Валидирует: Требования 1.4, 1.5, 1.8, 1.9, 7.1, 7.2, 7.3, 7.7, 7.8**

#### Свойство 2: Нормализация данных CSV импорта

*Для любой* строки CSV, система должна нормализовать данные: обрезать пробелы в текстовых полях, преобразовать отрицательные суммы для дохода в положительные, и преобразовать положительные суммы для расхода в отрицательные.

**Валидирует: Требования 7.5, 7.6, 7.9**

#### Свойство 3: Сохранение настроек маппинга CSV

*Для любых* настроек маппинга колонок CSV, после сохранения и последующего получения, настройки должны быть идентичны исходным (round-trip свойство).

**Валидирует: Требования 1.2**

#### Свойство 4: Полнота отчета импорта

*Для любого* результата импорта CSV, отчет должен содержать количество успешно импортированных строк, количество ошибок и список ошибок с деталями.

**Валидирует: Требования 1.7**

#### Свойство 5: Автоматическое создание категорий при импорте

*Для любого* имени категории в CSV, которое не существует в системе, категория должна быть автоматически создана с соответствующим типом (income/expense).

**Валидирует: Требования 1.10**

#### Свойство 6: Выборочный экспорт колонок CSV

*Для любого* набора выбранных колонок, экспортированный CSV файл должен содержать только эти колонки в заголовке и данных.

**Валидирует: Требования 2.2**

#### Свойство 7: Форматирование дат в CSV экспорте

*Для любого* формата даты, все даты в экспортированном CSV файле должны соответствовать указанному формату.

**Валидирует: Требования 2.3**

#### Свойство 8: Наличие заголовков в CSV экспорте

*Для любого* экспортированного CSV файла, первая строка должна содержать заголовки колонок, соответствующие выбранным полям.

**Валидирует: Требования 2.4**

#### Свойство 9: Экранирование специальных символов в CSV

*Для любой* транзакции с специальными символами (запятые, кавычки, переносы строк) в текстовых полях, эти символы должны быть корректно экранированы в экспортированном CSV файле.

**Валидирует: Требования 2.5**

#### Свойство 10: Формат имени файла экспорта

*Для любого* экспортированного CSV файла, имя файла должно содержать дату экспорта в формате YYYY-MM-DD.

**Валидирует: Требования 2.7**

#### Свойство 11: Сохранение параметров шаблона транзакции

*Для любого* шаблона повторяющейся транзакции, после создания и последующего получения, все параметры (сумма, категория, описание, расписание) должны быть идентичны исходным (round-trip свойство).

**Валидирует: Требования 3.1, 8.3**

#### Свойство 12: Поддержка частот расписания

*Для любого* шаблона транзакции, система должна принимать только валидные частоты (daily, weekly, monthly, yearly) и отклонять другие значения.

**Валидирует: Требования 3.2**

#### Свойство 13: Первая дата выполнения шаблона

*Для любого* шаблона транзакции, дата первого создания транзакции (next_occurrence) должна быть равна дате начала (start_date) при создании шаблона.

**Валидирует: Требования 3.3**

#### Свойство 14: Прекращение создания после даты окончания

*Для любого* шаблона транзакции с указанной датой окончания, транзакции не должны создаваться после этой даты.

**Валидирует: Требования 3.4**

#### Свойство 15: Автоматическое создание транзакций из шаблонов

*Для любого* активного шаблона транзакции, когда наступает дата next_occurrence, должна быть автоматически создана транзакция с параметрами из шаблона и отметкой о создании из шаблона.

**Валидирует: Требования 3.5, 3.6**

#### Свойство 16: Полнота списка шаблонов

*Для любого* запроса списка шаблонов, результат должен содержать все шаблоны независимо от их статуса (активные и неактивные).

**Валидирует: Требования 3.7**

#### Свойство 17: Независимость шаблонов и созданных транзакций

*Для любого* шаблона транзакции, изменения в шаблоне (редактирование, удаление, деактивация) не должны влиять на уже созданные транзакции, и изменения в отдельной транзакции не должны влиять на шаблон или другие транзакции.

**Валидирует: Требования 3.8, 3.9, 3.10, 3.11, 8.5**

#### Свойство 18: Возобновление создания транзакций при активации

*Для любого* деактивированного шаблона, после активации система должна возобновить создание транзакций по расписанию.

**Валидирует: Требования 8.6**

#### Свойство 19: Валидация обязательных полей шаблона

*Для любого* запроса создания шаблона транзакции, система должна отклонить запрос, если отсутствуют обязательные поля (name, amount, category_id, frequency, interval, start_date).

**Валидирует: Требования 8.2**

#### Свойство 20: Автоматическое получение курса валюты

*Для любой* транзакции, создаваемой в неосновной валюте, система должна автоматически получить и сохранить курс валюты на дату транзакции.

**Валидирует: Требования 4.3, 4.4**

#### Свойство 21: Fallback к последнему известному курсу

*Для любой* транзакции в неосновной валюте, если курс на дату транзакции недоступен, система должна использовать последний известный курс для этой пары валют.

**Валидирует: Требования 4.5, 4.12, 5.5**

#### Свойство 22: Конвертация в основную валюту для отчетов

*Для любого* набора транзакций в разных валютах, при генерации отчетов все суммы должны быть конвертированы в основную валюту с использованием курсов на даты транзакций.

**Валидирует: Требования 4.8**

#### Свойство 23: Пересчет отчетов при изменении основной валюты

*Для любого* изменения основной валюты, все отчеты должны быть пересчитаны с использованием новой основной валюты.

**Валидирует: Требования 4.10**

#### Свойство 24: Кэширование курсов валют

*Для любого* запроса курса валюты, если курс был получен менее 24 часов назад, система должна вернуть кэшированное значение без запроса к внешнему API.

**Валидирует: Требования 5.2**

#### Свойство 25: Обновление устаревшего кэша

*Для любого* запроса курса валюты, если кэш устарел (прошло более 24 часов), система должна запросить обновленный курс от внешнего API.

**Валидирует: Требования 5.3**

#### Свойство 26: Retry логика при ошибках API

*Для любого* запроса к внешнему API курсов валют, при получении ошибки система должна повторить запрос максимум 3 раза с экспоненциальной задержкой.

**Валидирует: Требования 5.4**

#### Свойство 27: Сохранение исторических курсов

*Для любого* курса валюты, полученного от API, курс должен быть сохранен в базе данных с датой для использования в исторических отчетах.

**Валидирует: Требования 5.6**

#### Свойство 28: Использование исторических курсов

*Для любой* транзакции с датой в прошлом, система должна использовать курс валюты на дату транзакции, а не текущий курс.

**Валидирует: Требования 5.7**

#### Свойство 29: Жизненный цикл фоновых задач

*Для любой* фоновой задачи, система должна: вернуть идентификатор задачи при создании, предоставить возможность запроса статуса по идентификатору, и сохранить результат после завершения для последующего просмотра.

**Валидирует: Требования 6.2, 6.3, 6.4**

#### Свойство 30: Логирование ошибок фоновых задач

*Для любой* фоновой задачи, завершившейся с ошибкой, детали ошибки должны быть залогированы и сохранены в результате задачи.

**Валидирует: Требования 6.7**

#### Свойство 31: Ограничение длины текстовых полей

*Для любой* строки CSV, текстовые поля должны быть ограничены по длине (описание - 500 символов, категория - 100 символов), и строки с превышением лимита должны быть отклонены.

**Валидирует: Требования 7.10**

## Обработка ошибок

### Обработка ошибок импорта CSV

**Ошибки валидации данных**:
- Невалидная сумма: Добавить в отчет об ошибках с указанием строки и причины
- Невалидная дата: Добавить в отчет об ошибках с указанием строки и причины
- Отсутствующие обязательные поля: Добавить в отчет об ошибках
- Неизвестная валюта: Добавить в отчет об ошибках
- Превышение лимита длины: Добавить в отчет об ошибках

**Ошибки обработки файла**:
- Невалидный формат CSV: Вернуть 400 Bad Request с описанием ошибки
- Ошибка декодирования: Вернуть 400 Bad Request
- Превышение размера файла: Вернуть 413 Payload Too Large

**Ошибки фоновых задач**:
- Ошибка при обработке: Сохранить в task_results с статусом "failed"
- Таймаут задачи: Отменить задачу и залогировать
- Ошибка БД: Откатить транзакцию, залогировать, сохранить в task_results

### Обработка ошибок повторяющихся транзакций

**Ошибки валидации шаблона**:
- Невалидная частота: Вернуть 422 Unprocessable Entity
- Невалидный интервал: Вернуть 422 Unprocessable Entity
- Дата окончания раньше даты начала: Вернуть 422 Unprocessable Entity
- Несуществующая категория: Вернуть 404 Not Found

**Ошибки создания транзакций**:
- Ошибка при автоматическом создании: Залогировать, добавить в отчет задачи
- Ошибка БД: Откатить транзакцию, залогировать, продолжить со следующим шаблоном

### Обработка ошибок мультивалютности

**Ошибки получения курсов**:
- API недоступен: Использовать последний кэшированный курс
- Все retry попытки неудачны: Использовать последний кэшированный курс
- Курс не найден в кэше: Вернуть 404 Not Found или запросить ручной ввод
- Невалидный код валюты: Вернуть 422 Unprocessable Entity

**Ошибки конвертации**:
- Отсутствует курс для конвертации: Вернуть 404 Not Found
- Ошибка расчета: Залогировать, вернуть 500 Internal Server Error

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

Для CSV импорта:

```json
{
  "task_id": "abc-123",
  "status": "completed",
  "created_count": 95,
  "error_count": 5,
  "errors": [
    {
      "row": 3,
      "error": "Invalid amount: not a number"
    },
    {
      "row": 7,
      "error": "Invalid date format"
    }
  ]
}
```

## Стратегия тестирования

### Двойной подход к тестированию

Этот проект требует как unit тестов, так и property-based тестов для полного покрытия:

**Unit тесты**: Проверяют конкретные примеры, граничные случаи и условия ошибок
- Конкретные примеры импорта CSV с известными данными
- Граничные случаи (пустые файлы, файлы с 1000 строк, файлы с 1001 строкой)
- Сценарии обработки ошибок (недоступный API, ошибки БД)
- Интеграция между компонентами (сервисы, репозитории, задачи)

**Property тесты**: Проверяют универсальные свойства для всех входных данных
- Универсальные свойства корректности
- Инварианты, которые должны выполняться для всех валидных входных данных
- Полное покрытие входных данных через рандомизацию

Оба подхода к тестированию дополняют друг друга и необходимы. Unit тесты ловят конкретные баги со специфическими сценариями, в то время как property тесты проверяют общую корректность на широком диапазоне входных данных.

### Тестирование Backend

**Фреймворк для unit тестирования**: pytest + pytest-asyncio + httpx

**Покрытие unit тестами**:
- API эндпоинты (коды статуса, формат ответа)
- Сервисы (бизнес-логика импорта, экспорта, повторяющихся транзакций)
- Репозитории (операции с БД)
- Celery задачи (выполнение, обработка ошибок)
- Валидация Pydantic схем
- Интеграция с внешним API курсов валют

**Фреймворк для property-based тестирования**: Hypothesis

**Покрытие property тестами** (минимум 100 итераций на тест):
- **Свойство 1**: Валидация и отчетность CSV импорта для случайных CSV файлов
- **Свойство 2**: Нормализация данных для случайных строк CSV
- **Свойство 3**: Round-trip сохранения настроек маппинга
- **Свойство 4**: Полнота отчета импорта для случайных результатов
- **Свойство 5**: Автоматическое создание категорий для случайных имен
- **Свойство 6**: Выборочный экспорт колонок для случайных наборов колонок
- **Свойство 7**: Форматирование дат для случайных форматов
- **Свойство 8**: Наличие заголовков для любого экспорта
- **Свойство 9**: Экранирование специальных символов для случайных строк
- **Свойство 10**: Формат имени файла для любой даты
- **Свойство 11**: Round-trip сохранения параметров шаблона
- **Свойство 12**: Валидация частот расписания
- **Свойство 13**: Первая дата выполнения для случайных дат начала
- **Свойство 14**: Прекращение создания после даты окончания
- **Свойство 15**: Автоматическое создание транзакций для случайных шаблонов
- **Свойство 16**: Полнота списка шаблонов
- **Свойство 17**: Независимость шаблонов и транзакций
- **Свойство 18**: Возобновление создания при активации
- **Свойство 19**: Валидация обязательных полей шаблона
- **Свойство 20**: Автоматическое получение курса для случайных валют
- **Свойство 21**: Fallback к последнему известному курсу
- **Свойство 22**: Конвертация в основную валюту для случайных наборов транзакций
- **Свойство 23**: Пересчет отчетов при изменении основной валюты
- **Свойство 24**: Кэширование курсов валют
- **Свойство 25**: Обновление устаревшего кэша
- **Свойство 26**: Retry логика при ошибках API
- **Свойство 27**: Сохранение исторических курсов
- **Свойство 28**: Использование исторических курсов для случайных дат
- **Свойство 29**: Жизненный цикл фоновых задач
- **Свойство 30**: Логирование ошибок фоновых задач
- **Свойство 31**: Ограничение длины текстовых полей

**Интеграционное тестирование**:
- Полные циклы импорта CSV с тестовой БД
- Создание повторяющихся транзакций через Celery задачи
- Обновление курсов валют через внешний API (с mock)
- Конвертация валют в отчетах

**Тестирование Celery задач**:
- Выполнение задач импорта CSV
- Выполнение задач создания повторяющихся транзакций
- Выполнение задач обновления курсов валют
- Обработка ошибок в задачах
- Сохранение результатов задач

### Тестирование Frontend

**Фреймворк для unit тестирования**: Jest + React Testing Library

**Покрытие unit тестами**:
- Рендеринг компонентов импорта/экспорта CSV
- Рендеринг компонентов управления повторяющимися транзакциями
- Рендеринг компонентов выбора валюты
- Взаимодействия пользователя (загрузка файла, настройка маппинга, выбор колонок)
- Обработка ошибок API клиента
- Отображение статуса фоновых задач

**Фреймворк для property-based тестирования**: fast-check

**Покрытие property тестами** (минимум 100 итераций на тест):
- Валидация форм для случайных входных данных
- Форматирование валют для случайных сумм и валют
- Форматирование дат для случайных дат и форматов

**Фреймворк для E2E тестирования**: Playwright

**Покрытие E2E тестами**:
- Полный поток импорта CSV (загрузка, маппинг, предпросмотр, импорт, просмотр результата)
- Полный поток экспорта CSV (выбор фильтров, выбор колонок, скачивание)
- Создание и управление повторяющимися транзакциями
- Выбор валюты и просмотр конвертированных сумм

### Конфигурация property тестов

Каждый property тест должен:
- Выполняться минимум 100 итераций
- Иметь комментарий с тегом: **Feature: additional-features, Property {number}: {property_text}**
- Ссылаться на соответствующее свойство в документе проектирования

Пример:

```python
from hypothesis import given, strategies as st

# Feature: additional-features, Property 1: Валидация и отчетность CSV импорта
@given(csv_content=st.text(), mapping=st.builds(CSVColumnMapping))
async def test_csv_validation_and_reporting(csv_content, mapping):
    result = await csv_service.import_csv(csv_content, mapping, "%Y-%m-%d")
    
    # Проверить, что все невалидные строки в отчете
    assert result.error_count == len(result.errors)
    assert all("row" in error and "error" in error for error in result.errors)
```

### Тестирование с внешними зависимостями

**Mock внешнего API курсов валют**:
- Использовать httpx mock для тестирования без реальных запросов
- Тестировать различные сценарии ответов (успех, ошибка, таймаут)
- Тестировать retry логику

**Тестирование Celery задач**:
- Использовать Celery в eager mode для синхронного выполнения в тестах
- Тестировать создание задач и получение результатов
- Тестировать обработку ошибок в задачах

**Тестирование Redis кэша**:
- Использовать fakeredis для тестирования без реального Redis
- Тестировать кэширование и истечение TTL
- Тестировать fallback при недоступности кэша

## Миграции базы данных

### Миграция 1: Добавление таблицы recurring_transactions

```python
"""add recurring transactions table

Revision ID: 001_recurring_transactions
Revises: previous_migration
Create Date: 2024-01-15 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '001_recurring_transactions'
down_revision = 'previous_migration'
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        'recurring_transactions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('name', sa.String(200), nullable=False),
        sa.Column('amount', sa.Numeric(15, 2), nullable=False),
        sa.Column('currency', sa.String(3), nullable=False, server_default='USD'),
        sa.Column('category_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('categories.id'), nullable=False),
        sa.Column('description', sa.Text, nullable=True),
        sa.Column('type', sa.String(10), nullable=False),
        sa.Column('frequency', sa.String(20), nullable=False),
        sa.Column('interval', sa.Integer, nullable=False),
        sa.Column('start_date', sa.Date, nullable=False),
        sa.Column('end_date', sa.Date, nullable=True),
        sa.Column('next_occurrence', sa.Date, nullable=False),
        sa.Column('is_active', sa.Boolean, server_default='true'),
        sa.Column('created_at', sa.DateTime, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime, server_default=sa.func.now(), onupdate=sa.func.now()),
        sa.CheckConstraint('amount > 0', name='check_positive_recurring_amount'),
        sa.CheckConstraint("type IN ('income', 'expense')", name='check_valid_recurring_type'),
        sa.CheckConstraint("frequency IN ('daily', 'weekly', 'monthly', 'yearly')", name='check_valid_frequency'),
        sa.CheckConstraint('interval > 0', name='check_positive_interval'),
    )
    
    op.create_index('idx_recurring_next_occurrence', 'recurring_transactions', ['next_occurrence'])
    op.create_index('idx_recurring_active', 'recurring_transactions', ['is_active'])

def downgrade():
    op.drop_index('idx_recurring_active', table_name='recurring_transactions')
    op.drop_index('idx_recurring_next_occurrence', table_name='recurring_transactions')
    op.drop_table('recurring_transactions')
```

### Миграция 2: Добавление таблиц currencies и exchange_rates

```python
"""add currencies and exchange rates tables

Revision ID: 002_currencies
Revises: 001_recurring_transactions
Create Date: 2024-01-15 11:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '002_currencies'
down_revision = '001_recurring_transactions'
branch_labels = None
depends_on = None

def upgrade():
    # Создать таблицу currencies
    op.create_table(
        'currencies',
        sa.Column('code', sa.String(3), primary_key=True),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('symbol', sa.String(10), nullable=False),
        sa.Column('is_active', sa.Boolean, server_default='true'),
        sa.Column('created_at', sa.DateTime, server_default=sa.func.now()),
    )
    
    # Создать таблицу exchange_rates
    op.create_table(
        'exchange_rates',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('from_currency', sa.String(3), sa.ForeignKey('currencies.code'), nullable=False),
        sa.Column('to_currency', sa.String(3), sa.ForeignKey('currencies.code'), nullable=False),
        sa.Column('rate', sa.Numeric(20, 10), nullable=False),
        sa.Column('date', sa.Date, nullable=False),
        sa.Column('created_at', sa.DateTime, server_default=sa.func.now()),
        sa.UniqueConstraint('from_currency', 'to_currency', 'date', name='unique_rate_per_day'),
        sa.CheckConstraint('rate > 0', name='check_positive_rate'),
    )
    
    op.create_index('idx_exchange_rates_currencies', 'exchange_rates', ['from_currency', 'to_currency'])
    op.create_index('idx_exchange_rates_date', 'exchange_rates', ['date'])
    
    # Добавить seed данные для валют
    op.execute("""
        INSERT INTO currencies (code, name, symbol) VALUES
        ('USD', 'US Dollar', '$'),
        ('EUR', 'Euro', '€'),
        ('GBP', 'British Pound', '£'),
        ('JPY', 'Japanese Yen', '¥'),
        ('CNY', 'Chinese Yuan', '¥'),
        ('RUB', 'Russian Ruble', '₽'),
        ('INR', 'Indian Rupee', '₹'),
        ('BRL', 'Brazilian Real', 'R$'),
        ('CAD', 'Canadian Dollar', 'C$'),
        ('AUD', 'Australian Dollar', 'A$')
    """)

def downgrade():
    op.drop_index('idx_exchange_rates_date', table_name='exchange_rates')
    op.drop_index('idx_exchange_rates_currencies', table_name='exchange_rates')
    op.drop_table('exchange_rates')
    op.drop_table('currencies')
```

### Миграция 3: Добавление таблицы task_results и обновление transactions

```python
"""add task results and update transactions for multi-currency

Revision ID: 003_tasks_and_multicurrency
Revises: 002_currencies
Create Date: 2024-01-15 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '003_tasks_and_multicurrency'
down_revision = '002_currencies'
branch_labels = None
depends_on = None

def upgrade():
    # Создать таблицу task_results
    op.create_table(
        'task_results',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('task_id', sa.String(255), unique=True, nullable=False),
        sa.Column('task_type', sa.String(50), nullable=False),
        sa.Column('status', sa.String(20), nullable=False),
        sa.Column('result', postgresql.JSONB, nullable=True),
        sa.Column('error', sa.Text, nullable=True),
        sa.Column('created_at', sa.DateTime, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime, server_default=sa.func.now(), onupdate=sa.func.now()),
        sa.CheckConstraint("status IN ('pending', 'running', 'completed', 'failed')", name='check_valid_status'),
    )
    
    op.create_index('idx_task_results_task_id', 'task_results', ['task_id'])
    op.create_index('idx_task_results_status', 'task_results', ['status'])
    
    # Обновить таблицу transactions для мультивалютности
    op.add_column('transactions', sa.Column('exchange_rate', sa.Numeric(20, 10), nullable=True))
    op.add_column('transactions', sa.Column('base_currency', sa.String(3), server_default='USD'))
    op.create_index('idx_transactions_currency', 'transactions', ['currency'])

def downgrade():
    op.drop_index('idx_transactions_currency', table_name='transactions')
    op.drop_column('transactions', 'base_currency')
    op.drop_column('transactions', 'exchange_rate')
    
    op.drop_index('idx_task_results_status', table_name='task_results')
    op.drop_index('idx_task_results_task_id', table_name='task_results')
    op.drop_table('task_results')
```

## Docker Compose обновления

Необходимо добавить Redis и Celery сервисы в docker-compose.yml:

```yaml
services:
  # ... существующие сервисы (postgres, backend, frontend)
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5
  
  celery_worker:
    build: ./backend
    command: celery -A app.tasks.celery_app worker --loglevel=info
    volumes:
      - ./backend:/app
    environment:
      - DATABASE_URL=postgresql+asyncpg://user:password@postgres:5432/finance_db
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - postgres
      - redis
  
  celery_beat:
    build: ./backend
    command: celery -A app.tasks.celery_app beat --loglevel=info
    volumes:
      - ./backend:/app
    environment:
      - DATABASE_URL=postgresql+asyncpg://user:password@postgres:5432/finance_db
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - postgres
      - redis

volumes:
  postgres_data:
  redis_data:
```

## Зависимости

Добавить в backend/requirements.txt:

```
# Существующие зависимости
fastapi
sqlalchemy[asyncio]
asyncpg
pydantic
alembic
pytest
pytest-asyncio
httpx

# Новые зависимости
celery[redis]==5.3.4
redis==5.0.1
pandas==2.1.4
python-dateutil==2.8.2
hypothesis==6.92.1  # для property-based тестирования
```

Добавить в frontend/package.json:

```json
{
  "dependencies": {
    "react-hook-form": "^7.49.0",
    "papaparse": "^5.4.1"
  },
  "devDependencies": {
    "fast-check": "^3.15.0"
  }
}
```
