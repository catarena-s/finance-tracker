# Документ дизайна: Backend API для трекера личных финансов

## Обзор

Backend API для Full-Stack приложения трекера личных финансов реализует REST API с трёхслойной архитектурой:
- **API Routes Layer**: Обработка HTTP запросов, валидация входных данных через Pydantic схемы
- **Service Layer**: Бизнес-логика, координация операций, преобразование данных
- **Repository Layer**: Инкапсуляция операций с БД через SQLAlchemy async

Технологический стек:
- FastAPI для REST API с автоматической OpenAPI документацией
- SQLAlchemy 2.0+ (async) для работы с PostgreSQL
- Pydantic v2 для валидации данных
- Alembic для миграций БД
- pytest + pytest-asyncio + httpx + Hypothesis для тестирования

Основные функции:
- CRUD операции для транзакций, категорий и бюджетов
- Фильтрация и пагинация данных
- Импорт/экспорт транзакций в CSV
- Аналитика: статистика, тренды, breakdown по категориям
- Расчёт прогресса бюджетов
- Поддержка мультивалютности и повторяющихся транзакций

## Архитектура

### Структура проекта

```
app/
├── models/              # SQLAlchemy модели
│   ├── __init__.py
│   ├── transaction.py
│   ├── category.py
│   └── budget.py
├── schemas/             # Pydantic схемы
│   ├── __init__.py
│   ├── transaction.py
│   ├── category.py
│   └── budget.py
├── repositories/        # Repository слой
│   ├── __init__.py
│   ├── base.py
│   ├── transaction.py
│   ├── category.py
│   └── budget.py
├── services/            # Service слой
│   ├── __init__.py
│   ├── transaction.py
│   ├── category.py
│   ├── budget.py
│   └── analytics.py
├── api/
│   └── routes/          # API эндпоинты
│       ├── __init__.py
│       ├── transactions.py
│       ├── categories.py
│       ├── budgets.py
│       └── analytics.py
├── core/                # Конфигурация и утилиты
│   ├── __init__.py
│   ├── config.py
│   ├── database.py
│   └── exceptions.py
└── main.py              # Точка входа FastAPI
```

### Диаграмма архитектуры

```mermaid
graph TB
    Client[HTTP Client]
    
    subgraph "API Layer"
        Routes[FastAPI Routes]
        Schemas[Pydantic Schemas]
    end
    
    subgraph "Service Layer"
        TransactionService[Transaction Service]
        CategoryService[Category Service]
        BudgetService[Budget Service]
        AnalyticsService[Analytics Service]
    end
    
    subgraph "Repository Layer"
        TransactionRepo[Transaction Repository]
        CategoryRepo[Category Repository]
        BudgetRepo[Budget Repository]
    end
    
    subgraph "Data Layer"
        Models[SQLAlchemy Models]
        DB[(PostgreSQL)]
    end
    
    Client --> Routes
    Routes --> Schemas
    Routes --> TransactionService
    Routes --> CategoryService
    Routes --> BudgetService
    Routes --> AnalyticsService
    
    TransactionService --> TransactionRepo
    CategoryService --> CategoryRepo
    BudgetService --> BudgetRepo
    AnalyticsService --> TransactionRepo
    AnalyticsService --> BudgetRepo
    
    TransactionRepo --> Models
    CategoryRepo --> Models
    BudgetRepo --> Models
    
    Models --> DB
```

### Поток данных

1. **Входящий запрос**: Client → API Routes
2. **Валидация**: Pydantic схемы валидируют входные данные
3. **Бизнес-логика**: Service слой обрабатывает запрос
4. **Доступ к данным**: Repository выполняет операции с БД
5. **Преобразование**: Service преобразует SQLAlchemy модели в Pydantic схемы
6. **Ответ**: API Routes возвращает JSON ответ клиенту

## Компоненты и интерфейсы

### 1. SQLAlchemy модели (app/models/)

#### Transaction Model

```python
from sqlalchemy import Column, String, Numeric, Date, Boolean, ForeignKey, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid

class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    amount = Column(Numeric(15, 2), nullable=False)
    currency = Column(String(3), nullable=False, default="USD")
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id"), nullable=False)
    description = Column(String, nullable=True)
    transaction_date = Column(Date, nullable=False)
    type = Column(String(10), nullable=False)
    is_recurring = Column(Boolean, default=False)
    recurring_pattern = Column(JSONB, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    category = relationship("Category", back_populates="transactions")
    
    # Constraints
    __table_args__ = (
        CheckConstraint("amount > 0", name="check_positive_amount"),
        CheckConstraint("type IN ('income', 'expense')", name="check_valid_type"),
    )
```

#### Category Model

```python
class Category(Base):
    __tablename__ = "categories"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    icon = Column(String(50), nullable=False)
    color = Column(String(7), nullable=False)
    type = Column(String(10), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    transactions = relationship("Transaction", back_populates="category")
    budgets = relationship("Budget", back_populates="category")
    
    # Constraints
    __table_args__ = (
        UniqueConstraint("name", "type", name="unique_category_name_type"),
        CheckConstraint("type IN ('income', 'expense')", name="check_valid_category_type"),
    )
```

#### Budget Model

```python
class Budget(Base):
    __tablename__ = "budgets"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id"), nullable=False)
    amount = Column(Numeric(15, 2), nullable=False)
    period = Column(String(20), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    category = relationship("Category", back_populates="budgets")
    
    # Constraints
    __table_args__ = (
        CheckConstraint("amount > 0", name="check_positive_budget_amount"),
        CheckConstraint("end_date > start_date", name="check_valid_date_range"),
        CheckConstraint("period IN ('monthly', 'yearly')", name="check_valid_period"),
        UniqueConstraint("category_id", "period", "start_date", name="unique_budget_period"),
    )
```

### 2. Pydantic схемы (app/schemas/)

#### Transaction Schemas

```python
from pydantic import BaseModel, Field, field_validator
from datetime import date
from decimal import Decimal
from enum import Enum
import uuid

class TransactionType(str, Enum):
    INCOME = "income"
    EXPENSE = "expense"

class RecurringPattern(BaseModel):
    frequency: str = Field(..., pattern="^(daily|weekly|monthly|yearly)$")
    interval: int = Field(..., gt=0)

class TransactionBase(BaseModel):
    amount: Decimal = Field(..., gt=0, decimal_places=2)
    currency: str = Field(default="USD", min_length=3, max_length=3)
    category_id: uuid.UUID
    description: str | None = None
    transaction_date: date
    type: TransactionType
    is_recurring: bool = False
    recurring_pattern: RecurringPattern | None = None
    
    @field_validator("currency")
    @classmethod
    def validate_currency(cls, v: str) -> str:
        return v.upper()
    
    @field_validator("recurring_pattern")
    @classmethod
    def validate_recurring_pattern(cls, v, info):
        if info.data.get("is_recurring") and v is None:
            raise ValueError("recurring_pattern required when is_recurring=True")
        return v

class TransactionCreate(TransactionBase):
    pass

class TransactionUpdate(BaseModel):
    amount: Decimal | None = Field(None, gt=0, decimal_places=2)
    currency: str | None = Field(None, min_length=3, max_length=3)
    category_id: uuid.UUID | None = None
    description: str | None = None
    transaction_date: date | None = None
    type: TransactionType | None = None
    is_recurring: bool | None = None
    recurring_pattern: RecurringPattern | None = None

class Transaction(TransactionBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    
    model_config = {"from_attributes": True}
```

#### Category Schemas

```python
class CategoryType(str, Enum):
    INCOME = "income"
    EXPENSE = "expense"

class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    icon: str = Field(..., min_length=1, max_length=50)
    color: str = Field(..., pattern="^#[0-9A-Fa-f]{6}$")
    type: CategoryType
    
    @field_validator("color")
    @classmethod
    def validate_color(cls, v: str) -> str:
        return v.upper()

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=100)
    icon: str | None = Field(None, min_length=1, max_length=50)
    color: str | None = Field(None, pattern="^#[0-9A-Fa-f]{6}$")
    type: CategoryType | None = None

class Category(CategoryBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    
    model_config = {"from_attributes": True}
```

#### Budget Schemas

```python
class BudgetPeriod(str, Enum):
    MONTHLY = "monthly"
    YEARLY = "yearly"

class BudgetBase(BaseModel):
    category_id: uuid.UUID
    amount: Decimal = Field(..., gt=0, decimal_places=2)
    period: BudgetPeriod
    start_date: date
    end_date: date
    
    @field_validator("end_date")
    @classmethod
    def validate_date_range(cls, v, info):
        if "start_date" in info.data and v <= info.data["start_date"]:
            raise ValueError("end_date must be after start_date")
        return v

class BudgetCreate(BudgetBase):
    pass

class BudgetUpdate(BaseModel):
    category_id: uuid.UUID | None = None
    amount: Decimal | None = Field(None, gt=0, decimal_places=2)
    period: BudgetPeriod | None = None
    start_date: date | None = None
    end_date: date | None = None

class Budget(BudgetBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    
    model_config = {"from_attributes": True}

class BudgetProgress(BaseModel):
    budget: Budget
    spent: Decimal
    remaining: Decimal
    percentage: Decimal
```

### 3. Repository слой (app/repositories/)

#### Base Repository

```python
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from typing import Generic, TypeVar, Type, List
import uuid

ModelType = TypeVar("ModelType")

class BaseRepository(Generic[ModelType]):
    def __init__(self, model: Type[ModelType], session: AsyncSession):
        self.model = model
        self.session = session
    
    async def create(self, **kwargs) -> ModelType:
        instance = self.model(**kwargs)
        self.session.add(instance)
        await self.session.commit()
        await self.session.refresh(instance)
        return instance
    
    async def get_by_id(self, id: uuid.UUID) -> ModelType | None:
        result = await self.session.execute(
            select(self.model).where(self.model.id == id)
        )
        return result.scalar_one_or_none()
    
    async def get_all(self, skip: int = 0, limit: int = 100) -> List[ModelType]:
        result = await self.session.execute(
            select(self.model).offset(skip).limit(limit)
        )
        return list(result.scalars().all())
    
    async def update(self, id: uuid.UUID, **kwargs) -> ModelType | None:
        instance = await self.get_by_id(id)
        if not instance:
            return None
        for key, value in kwargs.items():
            if value is not None:
                setattr(instance, key, value)
        await self.session.commit()
        await self.session.refresh(instance)
        return instance
    
    async def delete(self, id: uuid.UUID) -> bool:
        result = await self.session.execute(
            delete(self.model).where(self.model.id == id)
        )
        await self.session.commit()
        return result.rowcount > 0
```

#### Transaction Repository

```python
from sqlalchemy import and_, or_
from datetime import date
from decimal import Decimal

class TransactionRepository(BaseRepository[Transaction]):
    async def get_filtered(
        self,
        start_date: date | None = None,
        end_date: date | None = None,
        category_id: uuid.UUID | None = None,
        transaction_type: str | None = None,
        min_amount: Decimal | None = None,
        max_amount: Decimal | None = None,
        skip: int = 0,
        limit: int = 100
    ) -> tuple[List[Transaction], int]:
        """Получить отфильтрованные транзакции с пагинацией"""
        filters = []
        
        if start_date:
            filters.append(Transaction.transaction_date >= start_date)
        if end_date:
            filters.append(Transaction.transaction_date <= end_date)
        if category_id:
            filters.append(Transaction.category_id == category_id)
        if transaction_type:
            filters.append(Transaction.type == transaction_type)
        if min_amount:
            filters.append(Transaction.amount >= min_amount)
        if max_amount:
            filters.append(Transaction.amount <= max_amount)
        
        query = select(Transaction)
        if filters:
            query = query.where(and_(*filters))
        
        # Получить общее количество
        count_result = await self.session.execute(
            select(func.count()).select_from(query.subquery())
        )
        total = count_result.scalar()
        
        # Получить данные с пагинацией
        query = query.offset(skip).limit(limit).order_by(Transaction.transaction_date.desc())
        result = await self.session.execute(query)
        transactions = list(result.scalars().all())
        
        return transactions, total
    
    async def get_by_date_range(
        self, start_date: date, end_date: date
    ) -> List[Transaction]:
        """Получить транзакции за период"""
        result = await self.session.execute(
            select(Transaction).where(
                and_(
                    Transaction.transaction_date >= start_date,
                    Transaction.transaction_date <= end_date
                )
            )
        )
        return list(result.scalars().all())
```

#### Category Repository

```python
class CategoryRepository(BaseRepository[Category]):
    async def get_by_name_and_type(self, name: str, type: str) -> Category | None:
        """Проверить существование категории по имени и типу"""
        result = await self.session.execute(
            select(Category).where(
                and_(Category.name == name, Category.type == type)
            )
        )
        return result.scalar_one_or_none()
    
    async def has_transactions(self, category_id: uuid.UUID) -> bool:
        """Проверить наличие транзакций у категории"""
        result = await self.session.execute(
            select(func.count(Transaction.id)).where(
                Transaction.category_id == category_id
            )
        )
        count = result.scalar()
        return count > 0
```

#### Budget Repository

```python
class BudgetRepository(BaseRepository[Budget]):
    async def get_by_category_and_period(
        self, category_id: uuid.UUID, period: str, start_date: date
    ) -> Budget | None:
        """Проверить существование бюджета"""
        result = await self.session.execute(
            select(Budget).where(
                and_(
                    Budget.category_id == category_id,
                    Budget.period == period,
                    Budget.start_date == start_date
                )
            )
        )
        return result.scalar_one_or_none()
    
    async def get_active_budgets(self, current_date: date) -> List[Budget]:
        """Получить активные бюджеты на текущую дату"""
        result = await self.session.execute(
            select(Budget).where(
                and_(
                    Budget.start_date <= current_date,
                    Budget.end_date >= current_date
                )
            )
        )
        return list(result.scalars().all())
```

### 4. Service слой (app/services/)

#### Transaction Service

```python
from app.repositories.transaction import TransactionRepository
from app.repositories.category import CategoryRepository
from app.schemas.transaction import TransactionCreate, TransactionUpdate, Transaction
from app.core.exceptions import NotFoundException, ValidationException
import csv
from io import StringIO

class TransactionService:
    def __init__(
        self,
        transaction_repo: TransactionRepository,
        category_repo: CategoryRepository
    ):
        self.transaction_repo = transaction_repo
        self.category_repo = category_repo
    
    async def create_transaction(self, data: TransactionCreate) -> Transaction:
        """Создать транзакцию"""
        # Проверить существование категории
        category = await self.category_repo.get_by_id(data.category_id)
        if not category:
            raise NotFoundException("Category not found")
        
        # Создать транзакцию
        transaction = await self.transaction_repo.create(**data.model_dump())
        return Transaction.model_validate(transaction)
    
    async def get_transaction(self, transaction_id: uuid.UUID) -> Transaction:
        """Получить транзакцию по ID"""
        transaction = await self.transaction_repo.get_by_id(transaction_id)
        if not transaction:
            raise NotFoundException("Transaction not found")
        return Transaction.model_validate(transaction)
    
    async def list_transactions(
        self,
        start_date: date | None = None,
        end_date: date | None = None,
        category_id: uuid.UUID | None = None,
        transaction_type: str | None = None,
        min_amount: Decimal | None = None,
        max_amount: Decimal | None = None,
        page: int = 1,
        page_size: int = 50
    ) -> dict:
        """Получить список транзакций с фильтрацией и пагинацией"""
        skip = (page - 1) * page_size
        transactions, total = await self.transaction_repo.get_filtered(
            start_date=start_date,
            end_date=end_date,
            category_id=category_id,
            transaction_type=transaction_type,
            min_amount=min_amount,
            max_amount=max_amount,
            skip=skip,
            limit=page_size
        )
        
        return {
            "items": [Transaction.model_validate(t) for t in transactions],
            "total": total,
            "page": page,
            "page_size": page_size,
            "pages": (total + page_size - 1) // page_size
        }
    
    async def update_transaction(
        self, transaction_id: uuid.UUID, data: TransactionUpdate
    ) -> Transaction:
        """Обновить транзакцию"""
        # Проверить существование транзакции
        existing = await self.transaction_repo.get_by_id(transaction_id)
        if not existing:
            raise NotFoundException("Transaction not found")
        
        # Проверить категорию если она обновляется
        if data.category_id:
            category = await self.category_repo.get_by_id(data.category_id)
            if not category:
                raise NotFoundException("Category not found")
        
        # Обновить транзакцию
        updated = await self.transaction_repo.update(
            transaction_id, **data.model_dump(exclude_unset=True)
        )
        return Transaction.model_validate(updated)
    
    async def delete_transaction(self, transaction_id: uuid.UUID) -> None:
        """Удалить транзакцию"""
        deleted = await self.transaction_repo.delete(transaction_id)
        if not deleted:
            raise NotFoundException("Transaction not found")
    
    async def import_from_csv(self, csv_content: str) -> dict:
        """Импортировать транзакции из CSV"""
        reader = csv.DictReader(StringIO(csv_content))
        created = []
        errors = []
        
        for row_num, row in enumerate(reader, start=2):
            try:
                # Найти категорию по имени
                category = await self.category_repo.get_by_name_and_type(
                    row["category_name"], row["type"]
                )
                if not category:
                    errors.append({
                        "row": row_num,
                        "error": f"Category '{row['category_name']}' not found"
                    })
                    continue
                
                # Создать транзакцию
                transaction_data = TransactionCreate(
                    amount=Decimal(row["amount"]),
                    currency=row.get("currency", "USD"),
                    category_id=category.id,
                    description=row.get("description"),
                    transaction_date=date.fromisoformat(row["transaction_date"]),
                    type=row["type"],
                    is_recurring=False
                )
                transaction = await self.create_transaction(transaction_data)
                created.append(transaction)
            except Exception as e:
                errors.append({"row": row_num, "error": str(e)})
        
        return {"created": len(created), "errors": errors}
    
    async def export_to_csv(
        self,
        start_date: date | None = None,
        end_date: date | None = None,
        category_id: uuid.UUID | None = None
    ) -> str:
        """Экспортировать транзакции в CSV"""
        transactions, _ = await self.transaction_repo.get_filtered(
            start_date=start_date,
            end_date=end_date,
            category_id=category_id,
            limit=10000
        )
        
        output = StringIO()
        writer = csv.DictWriter(
            output,
            fieldnames=["amount", "currency", "category_name", "description", "transaction_date", "type"]
        )
        writer.writeheader()
        
        for t in transactions:
            writer.writerow({
                "amount": str(t.amount),
                "currency": t.currency,
                "category_name": t.category.name,
                "description": t.description or "",
                "transaction_date": t.transaction_date.isoformat(),
                "type": t.type
            })
        
        return output.getvalue()
```

#### Category Service

```python
from app.repositories.category import CategoryRepository
from app.schemas.category import CategoryCreate, CategoryUpdate, Category
from app.core.exceptions import NotFoundException, ConflictException

class CategoryService:
    def __init__(self, category_repo: CategoryRepository):
        self.category_repo = category_repo
    
    async def create_category(self, data: CategoryCreate) -> Category:
        """Создать категорию"""
        # Проверить уникальность
        existing = await self.category_repo.get_by_name_and_type(data.name, data.type)
        if existing:
            raise ConflictException(
                f"Category with name '{data.name}' and type '{data.type}' already exists"
            )
        
        category = await self.category_repo.create(**data.model_dump())
        return Category.model_validate(category)
    
    async def get_category(self, category_id: uuid.UUID) -> Category:
        """Получить категорию по ID"""
        category = await self.category_repo.get_by_id(category_id)
        if not category:
            raise NotFoundException("Category not found")
        return Category.model_validate(category)
    
    async def list_categories(self) -> List[Category]:
        """Получить список всех категорий"""
        categories = await self.category_repo.get_all(limit=1000)
        return [Category.model_validate(c) for c in categories]
    
    async def update_category(
        self, category_id: uuid.UUID, data: CategoryUpdate
    ) -> Category:
        """Обновить категорию"""
        existing = await self.category_repo.get_by_id(category_id)
        if not existing:
            raise NotFoundException("Category not found")
        
        # Проверить уникальность если имя или тип меняются
        if data.name or data.type:
            name = data.name or existing.name
            type_ = data.type or existing.type
            duplicate = await self.category_repo.get_by_name_and_type(name, type_)
            if duplicate and duplicate.id != category_id:
                raise ConflictException(
                    f"Category with name '{name}' and type '{type_}' already exists"
                )
        
        updated = await self.category_repo.update(
            category_id, **data.model_dump(exclude_unset=True)
        )
        return Category.model_validate(updated)
    
    async def delete_category(self, category_id: uuid.UUID) -> None:
        """Удалить категорию"""
        # Проверить наличие транзакций
        has_transactions = await self.category_repo.has_transactions(category_id)
        if has_transactions:
            raise ConflictException(
                "Cannot delete category with existing transactions"
            )
        
        deleted = await self.category_repo.delete(category_id)
        if not deleted:
            raise NotFoundException("Category not found")
```

#### Budget Service

```python
from app.repositories.budget import BudgetRepository
from app.repositories.category import CategoryRepository
from app.repositories.transaction import TransactionRepository
from app.schemas.budget import BudgetCreate, BudgetUpdate, Budget, BudgetProgress
from app.core.exceptions import NotFoundException, ConflictException

class BudgetService:
    def __init__(
        self,
        budget_repo: BudgetRepository,
        category_repo: CategoryRepository,
        transaction_repo: TransactionRepository
    ):
        self.budget_repo = budget_repo
        self.category_repo = category_repo
        self.transaction_repo = transaction_repo
    
    async def create_budget(self, data: BudgetCreate) -> Budget:
        """Создать бюджет"""
        # Проверить существование категории
        category = await self.category_repo.get_by_id(data.category_id)
        if not category:
            raise NotFoundException("Category not found")
        
        # Проверить уникальность
        existing = await self.budget_repo.get_by_category_and_period(
            data.category_id, data.period, data.start_date
        )
        if existing:
            raise ConflictException(
                f"Budget for this category, period and start date already exists"
            )
        
        budget = await self.budget_repo.create(**data.model_dump())
        return Budget.model_validate(budget)
    
    async def get_budget(self, budget_id: uuid.UUID) -> Budget:
        """Получить бюджет по ID"""
        budget = await self.budget_repo.get_by_id(budget_id)
        if not budget:
            raise NotFoundException("Budget not found")
        return Budget.model_validate(budget)
    
    async def list_budgets(self) -> List[Budget]:
        """Получить список всех бюджетов"""
        budgets = await self.budget_repo.get_all(limit=1000)
        return [Budget.model_validate(b) for b in budgets]
    
    async def update_budget(
        self, budget_id: uuid.UUID, data: BudgetUpdate
    ) -> Budget:
        """Обновить бюджет"""
        existing = await self.budget_repo.get_by_id(budget_id)
        if not existing:
            raise NotFoundException("Budget not found")
        
        # Проверить категорию если она обновляется
        if data.category_id:
            category = await self.category_repo.get_by_id(data.category_id)
            if not category:
                raise NotFoundException("Category not found")
        
        updated = await self.budget_repo.update(
            budget_id, **data.model_dump(exclude_unset=True)
        )
        return Budget.model_validate(updated)
    
    async def delete_budget(self, budget_id: uuid.UUID) -> None:
        """Удалить бюджет"""
        deleted = await self.budget_repo.delete(budget_id)
        if not deleted:
            raise NotFoundException("Budget not found")
    
    async def get_budget_progress(self, budget_id: uuid.UUID) -> BudgetProgress:
        """Получить прогресс выполнения бюджета"""
        budget = await self.budget_repo.get_by_id(budget_id)
        if not budget:
            raise NotFoundException("Budget not found")
        
        # Получить транзакции за период бюджета
        transactions = await self.transaction_repo.get_by_date_range(
            budget.start_date, budget.end_date
        )
        
        # Рассчитать сумму расходов по категории
        spent = Decimal(0)
        for t in transactions:
            if t.category_id == budget.category_id and t.type == "expense":
                # Конвертировать в USD если нужно (упрощённо)
                spent += t.amount
        
        # Рассчитать остаток и процент
        remaining = budget.amount - spent
        percentage = (spent / budget.amount * 100) if budget.amount > 0 else Decimal(0)
        
        return BudgetProgress(
            budget=Budget.model_validate(budget),
            spent=spent,
            remaining=remaining,
            percentage=percentage
        )
```

#### Analytics Service

```python
from app.repositories.transaction import TransactionRepository
from app.repositories.budget import BudgetRepository
from datetime import date
from decimal import Decimal
from collections import defaultdict

class AnalyticsService:
    def __init__(
        self,
        transaction_repo: TransactionRepository,
        budget_repo: BudgetRepository
    ):
        self.transaction_repo = transaction_repo
        self.budget_repo = budget_repo
    
    async def get_summary(
        self, start_date: date, end_date: date
    ) -> dict:
        """Получить сводную статистику за период"""
        transactions = await self.transaction_repo.get_by_date_range(
            start_date, end_date
        )
        
        total_income = Decimal(0)
        total_expense = Decimal(0)
        
        for t in transactions:
            # Конвертировать в USD (упрощённо)
            amount = t.amount
            if t.type == "income":
                total_income += amount
            else:
                total_expense += amount
        
        balance = total_income - total_expense
        
        return {
            "total_income": total_income,
            "total_expense": total_expense,
            "balance": balance,
            "start_date": start_date,
            "end_date": end_date
        }
    
    async def get_trends(
        self, start_date: date, end_date: date
    ) -> dict:
        """Получить динамику доходов и расходов по месяцам"""
        transactions = await self.transaction_repo.get_by_date_range(
            start_date, end_date
        )
        
        monthly_data = defaultdict(lambda: {"income": Decimal(0), "expense": Decimal(0)})
        
        for t in transactions:
            month_key = t.transaction_date.strftime("%Y-%m")
            amount = t.amount  # Конвертировать в USD (упрощённо)
            
            if t.type == "income":
                monthly_data[month_key]["income"] += amount
            else:
                monthly_data[month_key]["expense"] += amount
        
        # Преобразовать в список
        trends = [
            {
                "month": month,
                "income": data["income"],
                "expense": data["expense"],
                "balance": data["income"] - data["expense"]
            }
            for month, data in sorted(monthly_data.items())
        ]
        
        return {"trends": trends}
    
    async def get_category_breakdown(
        self, start_date: date, end_date: date
    ) -> dict:
        """Получить распределение расходов по категориям"""
        transactions = await self.transaction_repo.get_by_date_range(
            start_date, end_date
        )
        
        category_totals = defaultdict(Decimal)
        
        for t in transactions:
            if t.type == "expense":
                amount = t.amount  # Конвертировать в USD (упрощённо)
                category_totals[t.category.name] += amount
        
        # Преобразовать в список
        breakdown = [
            {"category": category, "amount": amount}
            for category, amount in category_totals.items()
        ]
        
        return {"breakdown": breakdown}
    
    async def get_top_categories(
        self, start_date: date, end_date: date, limit: int = 5
    ) -> dict:
        """Получить топ категорий по расходам"""
        breakdown = await self.get_category_breakdown(start_date, end_date)
        
        # Сортировать по сумме и взять топ
        top = sorted(
            breakdown["breakdown"],
            key=lambda x: x["amount"],
            reverse=True
        )[:limit]
        
        return {"top_categories": top}
```

### 5. API Routes (app/api/routes/)

#### Transaction Routes

```python
from fastapi import APIRouter, Depends, Query, UploadFile, File
from fastapi.responses import StreamingResponse
from app.services.transaction import TransactionService
from app.schemas.transaction import TransactionCreate, TransactionUpdate, Transaction
from typing import List
import uuid
from datetime import date
from decimal import Decimal

router = APIRouter(prefix="/api/v1/transactions", tags=["transactions"])

@router.post("/", response_model=Transaction, status_code=201)
async def create_transaction(
    data: TransactionCreate,
    service: TransactionService = Depends()
):
    """Создать новую транзакцию"""
    return await service.create_transaction(data)

@router.get("/", response_model=dict)
async def list_transactions(
    start_date: date | None = Query(None),
    end_date: date | None = Query(None),
    category_id: uuid.UUID | None = Query(None),
    transaction_type: str | None = Query(None),
    min_amount: Decimal | None = Query(None),
    max_amount: Decimal | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    service: TransactionService = Depends()
):
    """Получить список транзакций с фильтрацией и пагинацией"""
    return await service.list_transactions(
        start_date=start_date,
        end_date=end_date,
        category_id=category_id,
        transaction_type=transaction_type,
        min_amount=min_amount,
        max_amount=max_amount,
        page=page,
        page_size=page_size
    )

@router.get("/{transaction_id}", response_model=Transaction)
async def get_transaction(
    transaction_id: uuid.UUID,
    service: TransactionService = Depends()
):
    """Получить транзакцию по ID"""
    return await service.get_transaction(transaction_id)

@router.put("/{transaction_id}", response_model=Transaction)
async def update_transaction(
    transaction_id: uuid.UUID,
    data: TransactionUpdate,
    service: TransactionService = Depends()
):
    """Обновить транзакцию"""
    return await service.update_transaction(transaction_id, data)

@router.delete("/{transaction_id}", status_code=204)
async def delete_transaction(
    transaction_id: uuid.UUID,
    service: TransactionService = Depends()
):
    """Удалить транзакцию"""
    await service.delete_transaction(transaction_id)

@router.post("/import")
async def import_transactions(
    file: UploadFile = File(...),
    service: TransactionService = Depends()
):
    """Импортировать транзакции из CSV"""
    content = await file.read()
    csv_content = content.decode("utf-8")
    return await service.import_from_csv(csv_content)

@router.get("/export")
async def export_transactions(
    start_date: date | None = Query(None),
    end_date: date | None = Query(None),
    category_id: uuid.UUID | None = Query(None),
    service: TransactionService = Depends()
):
    """Экспортировать транзакции в CSV"""
    csv_content = await service.export_to_csv(
        start_date=start_date,
        end_date=end_date,
        category_id=category_id
    )
    return StreamingResponse(
        iter([csv_content]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=transactions.csv"}
    )
```

#### Category Routes

```python
from fastapi import APIRouter, Depends
from app.services.category import CategoryService
from app.schemas.category import CategoryCreate, CategoryUpdate, Category
from typing import List
import uuid

router = APIRouter(prefix="/api/v1/categories", tags=["categories"])

@router.post("/", response_model=Category, status_code=201)
async def create_category(
    data: CategoryCreate,
    service: CategoryService = Depends()
):
    """Создать новую категорию"""
    return await service.create_category(data)

@router.get("/", response_model=List[Category])
async def list_categories(
    service: CategoryService = Depends()
):
    """Получить список всех категорий"""
    return await service.list_categories()

@router.get("/{category_id}", response_model=Category)
async def get_category(
    category_id: uuid.UUID,
    service: CategoryService = Depends()
):
    """Получить категорию по ID"""
    return await service.get_category(category_id)

@router.put("/{category_id}", response_model=Category)
async def update_category(
    category_id: uuid.UUID,
    data: CategoryUpdate,
    service: CategoryService = Depends()
):
    """Обновить категорию"""
    return await service.update_category(category_id, data)

@router.delete("/{category_id}", status_code=204)
async def delete_category(
    category_id: uuid.UUID,
    service: CategoryService = Depends()
):
    """Удалить категорию"""
    await service.delete_category(category_id)
```

#### Budget Routes

```python
from fastapi import APIRouter, Depends
from app.services.budget import BudgetService
from app.schemas.budget import BudgetCreate, BudgetUpdate, Budget, BudgetProgress
from typing import List
import uuid

router = APIRouter(prefix="/api/v1/budgets", tags=["budgets"])

@router.post("/", response_model=Budget, status_code=201)
async def create_budget(
    data: BudgetCreate,
    service: BudgetService = Depends()
):
    """Создать новый бюджет"""
    return await service.create_budget(data)

@router.get("/", response_model=List[Budget])
async def list_budgets(
    service: BudgetService = Depends()
):
    """Получить список всех бюджетов"""
    return await service.list_budgets()

@router.get("/{budget_id}", response_model=Budget)
async def get_budget(
    budget_id: uuid.UUID,
    service: BudgetService = Depends()
):
    """Получить бюджет по ID"""
    return await service.get_budget(budget_id)

@router.put("/{budget_id}", response_model=Budget)
async def update_budget(
    budget_id: uuid.UUID,
    data: BudgetUpdate,
    service: BudgetService = Depends()
):
    """Обновить бюджет"""
    return await service.update_budget(budget_id, data)

@router.delete("/{budget_id}", status_code=204)
async def delete_budget(
    budget_id: uuid.UUID,
    service: BudgetService = Depends()
):
    """Удалить бюджет"""
    await service.delete_budget(budget_id)

@router.get("/{budget_id}/progress", response_model=BudgetProgress)
async def get_budget_progress(
    budget_id: uuid.UUID,
    service: BudgetService = Depends()
):
    """Получить прогресс выполнения бюджета"""
    return await service.get_budget_progress(budget_id)
```

#### Analytics Routes

```python
from fastapi import APIRouter, Depends, Query
from app.services.analytics import AnalyticsService
from datetime import date

router = APIRouter(prefix="/api/v1/analytics", tags=["analytics"])

@router.get("/summary")
async def get_summary(
    start_date: date = Query(...),
    end_date: date = Query(...),
    service: AnalyticsService = Depends()
):
    """Получить сводную статистику за период"""
    return await service.get_summary(start_date, end_date)

@router.get("/trends")
async def get_trends(
    start_date: date = Query(...),
    end_date: date = Query(...),
    service: AnalyticsService = Depends()
):
    """Получить динамику доходов и расходов по месяцам"""
    return await service.get_trends(start_date, end_date)

@router.get("/by-category")
async def get_category_breakdown(
    start_date: date = Query(...),
    end_date: date = Query(...),
    service: AnalyticsService = Depends()
):
    """Получить распределение расходов по категориям"""
    return await service.get_category_breakdown(start_date, end_date)

@router.get("/top-categories")
async def get_top_categories(
    start_date: date = Query(...),
    end_date: date = Query(...),
    limit: int = Query(5, ge=1, le=20),
    service: AnalyticsService = Depends()
):
    """Получить топ категорий по расходам"""
    return await service.get_top_categories(start_date, end_date, limit)
```

## Модели данных

### Database Schema

Схема базы данных реализована через SQLAlchemy модели с constraints:

**Transactions**:
- Primary Key: UUID
- Foreign Key: category_id → categories.id
- Constraints: amount > 0, type IN ('income', 'expense')
- Indexes: transaction_date, category_id, type

**Categories**:
- Primary Key: UUID
- Unique Constraint: (name, type)
- Constraint: type IN ('income', 'expense')

**Budgets**:
- Primary Key: UUID
- Foreign Key: category_id → categories.id
- Constraints: amount > 0, end_date > start_date, period IN ('monthly', 'yearly')
- Unique Constraint: (category_id, period, start_date)

### Relationships

```mermaid
erDiagram
    CATEGORIES ||--o{ TRANSACTIONS : has
    CATEGORIES ||--o{ BUDGETS : has
    
    CATEGORIES {
        uuid id PK
        string name
        string icon
        string color
        string type
        timestamp created_at
        timestamp updated_at
    }
    
    TRANSACTIONS {
        uuid id PK
        decimal amount
        string currency
        uuid category_id FK
        string description
        date transaction_date
        string type
        boolean is_recurring
        jsonb recurring_pattern
        timestamp created_at
        timestamp updated_at
    }
    
    BUDGETS {
        uuid id PK
        uuid category_id FK
        decimal amount
        string period
        date start_date
        date end_date
        timestamp created_at
        timestamp updated_at
    }
```

## Correctness Properties

Свойство (property) — это характеристика или поведение, которое должно выполняться для всех валидных выполнений системы. По сути, это формальное утверждение о том, что система должна делать. Свойства служат мостом между человекочитаемыми спецификациями и машинно-проверяемыми гарантиями корректности.

### Property Reflection

После анализа всех критериев приёмки выявлены следующие группы избыточности:

**Группа 1: CRUD операции**
- Свойства 1.1-1.5 (создание, чтение, обновление, удаление транзакций) можно объединить в одно комплексное свойство round-trip для CRUD операций
- Аналогично для категорий (4.1-4.4) и бюджетов (5.1-5.4)

**Группа 2: Валидация структуры данных**
- Свойства 1.8, 4.7, 5.8 проверяют наличие всех полей - можно объединить в одно свойство для каждой сущности
- Свойства 9.1-9.9 и 10.1-10.8 проверяют одни и те же constraints на разных уровнях (DB и Pydantic) - достаточно одного property-based теста

**Группа 3: Фильтрация**
- Свойства 2.1-2.4 проверяют разные фильтры - можно объединить в одно свойство с комбинацией фильтров (2.6 уже покрывает это)

**Группа 4: HTTP коды ошибок**
- Свойства 8.1-8.3 проверяют разные коды ошибок - можно объединить в одно свойство формата ошибок (8.5 уже покрывает это)

**Группа 5: Аналитика**
- Свойства 6.1-6.3 проверяют разные аспекты прогресса бюджета - можно объединить в одно комплексное свойство

После устранения избыточности остаются следующие уникальные свойства:

### Транзакции

**Property 1: CRUD операции транзакций**
*Для любой* валидной транзакции, создание, чтение по ID, обновление и удаление должны работать корректно: созданная транзакция должна быть доступна для чтения, обновлённая транзакция должна содержать новые данные, удалённая транзакция не должна быть доступна для чтения.
**Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5**

**Property 2: Валидация положительной суммы транзакции**
*Для любой* транзакции с отрицательной или нулевой суммой, API должен вернуть ошибку валидации с HTTP 422.
**Validates: Requirements 1.6, 9.1, 10.1**

**Property 3: Обработка несуществующих транзакций**
*Для любого* несуществующего UUID транзакции, API должен вернуть HTTP 404.
**Validates: Requirements 1.7, 8.2**

**Property 4: Структура данных транзакции**
*Для любой* созданной транзакции, объект должен содержать все обязательные поля: id, amount, currency, category_id, description, transaction_date, type, is_recurring, recurring_pattern, created_at, updated_at.
**Validates: Requirements 1.8**

**Property 5: Фильтрация транзакций по дате**
*Для любого* диапазона дат и набора транзакций, API должен вернуть только транзакции в указанном диапазоне.
**Validates: Requirements 2.1**

**Property 6: Фильтрация транзакций по категории**
*Для любой* категории и набора транзакций, API должен вернуть только транзакции указанной категории.
**Validates: Requirements 2.2**

**Property 7: Фильтрация транзакций по типу**
*Для любого* типа (income/expense) и набора транзакций, API должен вернуть только транзакции указанного типа.
**Validates: Requirements 2.3**

**Property 8: Фильтрация транзакций по сумме**
*Для любого* диапазона сумм и набора транзакций, API должен вернуть только транзакции в указанном диапазоне сумм.
**Validates: Requirements 2.4**

**Property 9: Пагинация транзакций**
*Для любых* параметров пагинации (page, page_size) и набора транзакций, API должен вернуть корректную страницу с метаданными (total, pages, page, page_size), где количество элементов <= page_size.
**Validates: Requirements 2.5**

**Property 10: Комбинированная фильтрация**
*Для любой* комбинации фильтров (дата, категория, тип, сумма), API должен применить все фильтры одновременно, и результат должен удовлетворять всем условиям.
**Validates: Requirements 2.6**

### Импорт/Экспорт

**Property 11: Round-trip импорт/экспорт CSV**
*Для любого* набора транзакций, экспорт в CSV затем импорт из CSV должен вернуть эквивалентный набор транзакций (с теми же amount, currency, category, description, date, type).
**Validates: Requirements 3.1, 3.3, 3.5, 3.6**

**Property 12: Обработка невалидных CSV данных**
*Для любого* CSV файла с невалидными данными (отрицательные суммы, несуществующие категории, невалидные даты), импорт должен вернуть список ошибок с номерами проблемных строк.
**Validates: Requirements 3.2**

**Property 13: Экспорт с фильтрами**
*Для любых* фильтров (дата, категория), экспорт должен содержать только транзакции, удовлетворяющие фильтрам.
**Validates: Requirements 3.4**

### Категории

**Property 14: CRUD операции категорий**
*Для любой* валидной категории, создание, чтение, обновление и удаление (без связанных транзакций) должны работать корректно.
**Validates: Requirements 4.1, 4.2, 4.3, 4.4**

**Property 15: Защита от удаления категории с транзакциями**
*Для любой* категории со связанными транзакциями, попытка удаления должна вернуть HTTP 409.
**Validates: Requirements 4.5**

**Property 16: Уникальность категории**
*Для любой* категории с дублирующимся именем и типом, создание должно вернуть HTTP 409.
**Validates: Requirements 4.6, 9.4**

**Property 17: Структура данных категории**
*Для любой* созданной категории, объект должен содержать все обязательные поля: id, name, icon, color, type, created_at, updated_at.
**Validates: Requirements 4.7**

**Property 18: Валидация hex цвета**
*Для любого* невалидного hex цвета (не формата #RRGGBB), создание категории должно вернуть ошибку валидации с HTTP 422.
**Validates: Requirements 4.8, 10.4**

**Property 19: Валидация типа категории**
*Для любого* невалидного типа категории (не 'income' или 'expense'), создание должно вернуть ошибку валидации с HTTP 422.
**Validates: Requirements 9.5, 10.5**

### Бюджеты

**Property 20: CRUD операции бюджетов**
*Для любого* валидного бюджета, создание, чтение, обновление и удаление должны работать корректно.
**Validates: Requirements 5.1, 5.2, 5.3, 5.4**

**Property 21: Валидация диапазона дат бюджета**
*Для любого* бюджета с end_date <= start_date, создание должно вернуть ошибку валидации с HTTP 422.
**Validates: Requirements 5.5, 9.7, 10.8**

**Property 22: Валидация положительной суммы бюджета**
*Для любого* бюджета с отрицательной или нулевой суммой, создание должно вернуть ошибку валидации с HTTP 422.
**Validates: Requirements 5.6, 9.6, 10.6**

**Property 23: Уникальность бюджета**
*Для любого* бюджета с дублирующимся (category_id, period, start_date), создание должно вернуть HTTP 409.
**Validates: Requirements 5.7, 9.8**

**Property 24: Структура данных бюджета**
*Для любого* созданного бюджета, объект должен содержать все обязательные поля: id, category_id, amount, period, start_date, end_date, created_at, updated_at.
**Validates: Requirements 5.8**

**Property 25: Валидация периода бюджета**
*Для любого* невалидного периода бюджета (не 'monthly' или 'yearly'), создание должно вернуть ошибку валидации с HTTP 422.
**Validates: Requirements 10.7**

### Прогресс бюджета

**Property 26: Расчёт прогресса бюджета**
*Для любого* бюджета и набора транзакций, прогресс должен корректно рассчитывать: spent (сумма expense транзакций категории за период), remaining (amount - spent), percentage (spent / amount * 100), и учитывать только транзакции типа expense в диапазоне дат бюджета.
**Validates: Requirements 6.1, 6.2, 6.3, 6.5, 6.6**

### Аналитика

**Property 27: Расчёт summary статистики**
*Для любого* периода и набора транзакций, summary должен корректно рассчитывать: total_income (сумма income транзакций), total_expense (сумма expense транзакций), balance (total_income - total_expense).
**Validates: Requirements 7.1**

**Property 28: Расчёт trends по месяцам**
*Для любого* периода и набора транзакций, trends должен группировать транзакции по месяцам и рассчитывать income, expense и balance для каждого месяца.
**Validates: Requirements 7.2**

**Property 29: Breakdown по категориям**
*Для любого* периода и набора транзакций, breakdown должен группировать expense транзакции по категориям и рассчитывать сумму для каждой категории.
**Validates: Requirements 7.3**

**Property 30: Top категории по расходам**
*Для любого* периода и набора транзакций, top categories должен вернуть категории отсортированные по убыванию суммы расходов, ограниченные указанным лимитом.
**Validates: Requirements 7.4**

**Property 31: Фильтрация аналитики по датам**
*Для любого* диапазона дат, все аналитические функции (summary, trends, breakdown, top) должны учитывать только транзакции в указанном диапазоне.
**Validates: Requirements 7.5**

### Обработка ошибок

**Property 32: Единый формат ошибок**
*Для любой* ошибки (валидация, not found, conflict, internal), API должен возвращать JSON в едином формате с полями error, detail и status_code.
**Validates: Requirements 8.1, 8.2, 8.3, 8.5**

**Property 33: Логирование ошибок**
*Для любой* ошибки с уровнем ERROR или выше, система должна залогировать детали ошибки.
**Validates: Requirements 8.6**

### Мультивалютность

**Property 34: Поддержка поля currency**
*Для любой* транзакции, поле currency должно присутствовать и содержать 3-буквенный код валюты в верхнем регистре.
**Validates: Requirements 12.1, 12.4**

**Property 35: Дефолтная валюта USD**
*Для любой* транзакции без указания валюты, API должен использовать USD по умолчанию.
**Validates: Requirements 12.2**

**Property 36: Конвертация валют в аналитике**
*Для любого* набора транзакций в разных валютах, аналитика должна конвертировать все суммы в единую валюту (USD) для расчёта статистики.
**Validates: Requirements 12.3, 7.6**

**Property 37: Валидация кода валюты**
*Для любого* невалидного кода валюты (не 3 буквы или не ISO 4217), создание транзакции должно вернуть ошибку валидации с HTTP 422.
**Validates: Requirements 10.2**

### Повторяющиеся транзакции

**Property 38: Поддержка полей повторяющихся транзакций**
*Для любой* транзакции, поля is_recurring и recurring_pattern должны присутствовать.
**Validates: Requirements 13.1, 13.2**

**Property 39: Обязательность recurring_pattern**
*Для любой* транзакции с is_recurring=true, поле recurring_pattern должно быть обязательным, иначе API должен вернуть ошибку валидации.
**Validates: Requirements 13.3**

**Property 40: Структура recurring_pattern**
*Для любого* recurring_pattern, он должен содержать поля frequency (daily/weekly/monthly/yearly) и interval (положительное целое число).
**Validates: Requirements 13.4**

### Foreign Key Constraints

**Property 41: Валидация foreign key транзакции**
*Для любой* транзакции с несуществующим category_id, создание должно вернуть ошибку с HTTP 404 или 422.
**Validates: Requirements 9.3**

**Property 42: Валидация foreign key бюджета**
*Для любого* бюджета с несуществующим category_id, создание должно вернуть ошибку с HTTP 404 или 422.
**Validates: Requirements 9.9**

## Обработка ошибок

### Кастомные исключения (app/core/exceptions.py)

```python
class AppException(Exception):
    """Базовое исключение приложения"""
    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)

class NotFoundException(AppException):
    """Ресурс не найден"""
    def __init__(self, message: str = "Resource not found"):
        super().__init__(message, status_code=404)

class ConflictException(AppException):
    """Конфликт данных (duplicate, foreign key)"""
    def __init__(self, message: str):
        super().__init__(message, status_code=409)

class ValidationException(AppException):
    """Ошибка валидации"""
    def __init__(self, message: str):
        super().__init__(message, status_code=422)
```

### Exception Handler

```python
from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
import logging

logger = logging.getLogger(__name__)

async def app_exception_handler(request: Request, exc: AppException):
    """Обработчик кастомных исключений"""
    logger.error(f"AppException: {exc.message}", exc_info=True)
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.__class__.__name__,
            "detail": exc.message,
            "status_code": exc.status_code
        }
    )

async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Обработчик ошибок валидации Pydantic"""
    logger.error(f"ValidationError: {exc.errors()}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "ValidationError",
            "detail": exc.errors(),
            "status_code": 422
        }
    )

async def generic_exception_handler(request: Request, exc: Exception):
    """Обработчик всех остальных исключений"""
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "InternalServerError",
            "detail": "An unexpected error occurred",
            "status_code": 500
        }
    )
```

### Регистрация обработчиков в FastAPI

```python
from fastapi import FastAPI
from app.core.exceptions import AppException

app = FastAPI()

app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)
```

### HTTP коды ответов

- **200 OK**: Успешное получение данных (GET)
- **201 Created**: Успешное создание ресурса (POST)
- **204 No Content**: Успешное удаление ресурса (DELETE)
- **400 Bad Request**: Некорректный запрос
- **404 Not Found**: Ресурс не найден
- **409 Conflict**: Конфликт данных (duplicate, foreign key violation)
- **422 Unprocessable Entity**: Ошибка валидации данных
- **500 Internal Server Error**: Внутренняя ошибка сервера

## Стратегия тестирования

### Двойной подход к тестированию

Система использует комбинацию unit тестов и property-based тестов для комплексного покрытия:

**Unit тесты**:
- Проверяют конкретные примеры и сценарии
- Тестируют edge cases и граничные условия
- Проверяют интеграцию между компонентами
- Используются для специфичных бизнес-сценариев

**Property-based тесты**:
- Проверяют универсальные свойства на множестве входных данных
- Генерируют случайные валидные и невалидные данные
- Находят edge cases, которые могли быть упущены
- Обеспечивают широкое покрытие входных данных

Оба подхода дополняют друг друга: unit тесты ловят конкретные баги, property-based тесты проверяют общую корректность.

### Технологический стек тестирования

- **pytest**: Основной фреймворк для тестирования
- **pytest-asyncio**: Поддержка async/await тестов
- **httpx**: HTTP клиент для тестирования API эндпоинтов
- **Hypothesis**: Property-based testing библиотека
- **pytest-cov**: Измерение покрытия кода тестами

### Структура тестов

```
tests/
├── conftest.py              # Фикстуры и конфигурация
├── unit/
│   ├── repositories/
│   │   ├── test_transaction_repository.py
│   │   ├── test_category_repository.py
│   │   └── test_budget_repository.py
│   └── services/
│       ├── test_transaction_service.py
│       ├── test_category_service.py
│       ├── test_budget_service.py
│       └── test_analytics_service.py
├── integration/
│   ├── test_transaction_routes.py
│   ├── test_category_routes.py
│   ├── test_budget_routes.py
│   └── test_analytics_routes.py
└── property/
    ├── test_transaction_properties.py
    ├── test_category_properties.py
    ├── test_budget_properties.py
    └── test_analytics_properties.py
```

### Property-Based Testing конфигурация

Каждый property-based тест должен:
- Запускаться минимум 100 итераций (настройка Hypothesis)
- Иметь комментарий с тегом, ссылающимся на property из дизайна
- Использовать стратегии Hypothesis для генерации данных

Пример:

```python
from hypothesis import given, strategies as st
import pytest

# Feature: backend-api-implementation, Property 2: Валидация положительной суммы транзакции
@given(amount=st.decimals(min_value=-1000, max_value=0, places=2))
@pytest.mark.asyncio
async def test_negative_amount_rejected(amount, transaction_service):
    """Property 2: Для любой транзакции с отрицательной суммой, API должен вернуть ошибку"""
    transaction_data = TransactionCreate(
        amount=amount,
        currency="USD",
        category_id=uuid.uuid4(),
        transaction_date=date.today(),
        type="expense"
    )
    
    with pytest.raises(ValidationException):
        await transaction_service.create_transaction(transaction_data)
```

### Тестовая база данных

- Использовать отдельную PostgreSQL базу для тестов
- Создавать и очищать схему перед каждым тестом
- Использовать транзакции для изоляции тестов
- Конфигурация через pytest fixtures

```python
# conftest.py
import pytest
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from app.core.database import Base

@pytest.fixture
async def test_db():
    """Создать тестовую БД"""
    engine = create_async_engine("postgresql+asyncpg://test:test@localhost/test_db")
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    yield engine
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    
    await engine.dispose()

@pytest.fixture
async def session(test_db):
    """Создать async session"""
    async with AsyncSession(test_db) as session:
        yield session
        await session.rollback()
```

### Покрытие тестами

**Repository слой**:
- Unit тесты для всех CRUD операций
- Unit тесты для фильтрации и пагинации
- Property-based тесты для валидации constraints

**Service слой**:
- Unit тесты для бизнес-логики
- Unit тесты для обработки ошибок
- Property-based тесты для комплексных операций

**API Routes**:
- Integration тесты для всех эндпоинтов
- Тесты для всех HTTP кодов ответов
- Property-based тесты для валидации входных данных

**Минимальные требования**:
- Минимум 10 property-based тестов для критичной логики
- Покрытие всех correctness properties из дизайна
- Integration тесты для всех API эндпоинтов

### Hypothesis стратегии для генерации данных

```python
from hypothesis import strategies as st
from decimal import Decimal
import uuid

# Стратегии для транзакций
valid_amounts = st.decimals(min_value=0.01, max_value=999999.99, places=2)
invalid_amounts = st.decimals(max_value=0, places=2)
currencies = st.text(min_size=3, max_size=3, alphabet=st.characters(whitelist_categories=("Lu",)))
transaction_types = st.sampled_from(["income", "expense"])
dates = st.dates(min_value=date(2020, 1, 1), max_value=date(2030, 12, 31))

# Стратегии для категорий
category_names = st.text(min_size=1, max_size=100)
hex_colors = st.from_regex(r"^#[0-9A-F]{6}$", fullmatch=True)
invalid_hex_colors = st.text(min_size=1, max_size=10).filter(
    lambda x: not re.match(r"^#[0-9A-F]{6}$", x)
)

# Стратегии для бюджетов
budget_periods = st.sampled_from(["monthly", "yearly"])
date_ranges = st.tuples(dates, dates).filter(lambda x: x[1] > x[0])
```

### Примеры тестов

**Unit тест для Repository**:
```python
@pytest.mark.asyncio
async def test_create_transaction(transaction_repo, category):
    """Unit тест: создание транзакции"""
    transaction = await transaction_repo.create(
        amount=Decimal("100.50"),
        currency="USD",
        category_id=category.id,
        transaction_date=date.today(),
        type="expense"
    )
    
    assert transaction.id is not None
    assert transaction.amount == Decimal("100.50")
    assert transaction.currency == "USD"
```

**Integration тест для API**:
```python
@pytest.mark.asyncio
async def test_create_transaction_endpoint(client, category):
    """Integration тест: POST /api/v1/transactions"""
    response = await client.post(
        "/api/v1/transactions",
        json={
            "amount": 100.50,
            "currency": "USD",
            "category_id": str(category.id),
            "transaction_date": "2024-01-15",
            "type": "expense"
        }
    )
    
    assert response.status_code == 201
    data = response.json()
    assert data["amount"] == "100.50"
    assert data["currency"] == "USD"
```

**Property-based тест**:
```python
# Feature: backend-api-implementation, Property 11: Round-trip импорт/экспорт CSV
@given(transactions=st.lists(
    st.builds(
        TransactionCreate,
        amount=valid_amounts,
        currency=currencies,
        category_id=st.just(uuid.uuid4()),
        transaction_date=dates,
        type=transaction_types
    ),
    min_size=1,
    max_size=50
))
@pytest.mark.asyncio
async def test_csv_roundtrip(transactions, transaction_service):
    """Property 11: Экспорт затем импорт должен вернуть эквивалентные данные"""
    # Создать транзакции
    for t in transactions:
        await transaction_service.create_transaction(t)
    
    # Экспортировать
    csv_content = await transaction_service.export_to_csv()
    
    # Очистить БД
    # ...
    
    # Импортировать
    result = await transaction_service.import_from_csv(csv_content)
    
    # Проверить эквивалентность
    assert result["created"] == len(transactions)
    assert len(result["errors"]) == 0
```
