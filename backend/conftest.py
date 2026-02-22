"""
Pytest configuration and fixtures
"""

import os
from typing import AsyncGenerator

import pytest_asyncio
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.pool import NullPool

from app.models.base import Base


# Test database URL - always use test database
# Priority:
# 1. If TEST_DATABASE_URL is explicitly set - use it
# 2. If DATABASE_HOST=database (Docker) - create test DB name
# 3. If DATABASE_URL is set (CI/CD) - use it as is (should point to test DB)
# 4. Otherwise (local) - use localhost with port 5433
if "TEST_DATABASE_URL" in os.environ:
    # Explicitly set test database URL
    TEST_DATABASE_URL = os.getenv("TEST_DATABASE_URL", "")
elif os.getenv("DATABASE_HOST") == "database":
    # Running inside Docker - use test database on internal port
    # IMPORTANT: This should use a separate test database, not production!
    TEST_DATABASE_URL = (
        "postgresql+asyncpg://postgres:postgres@database:5432/finance_tracker_test"
    )
elif "DATABASE_URL" in os.environ:
    # CI/CD environment - DATABASE_URL should already point to test database
    TEST_DATABASE_URL = os.getenv("DATABASE_URL", "")
else:
    # Running locally - use exposed port 5433 with test database
    TEST_DATABASE_URL = (
        "postgresql+asyncpg://postgres:postgres@localhost:5433/finance_tracker_test"
    )


@pytest_asyncio.fixture(scope="function")
async def test_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Create a test database session for each test function
    """
    # Import all models to ensure they are registered with Base.metadata
    from app.models.category import Category  # noqa: F401
    from app.models.transaction import Transaction  # noqa: F401
    from app.models.budget import Budget  # noqa: F401
    from app.models.recurring_transaction import RecurringTransaction  # noqa: F401
    from app.models.currency import Currency  # noqa: F401
    from app.models.exchange_rate import ExchangeRate  # noqa: F401
    from app.models.task_result import TaskResult  # noqa: F401
    from app.models.app_setting import AppSetting  # noqa: F401

    # Create async engine for test database
    engine = create_async_engine(
        TEST_DATABASE_URL,
        echo=False,
        poolclass=NullPool,
    )

    # Create all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    # Create session factory
    async_session = async_sessionmaker(
        engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )

    # Create test session
    async with async_session() as session:
        yield session

    # Drop all tables after test
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

    await engine.dispose()


@pytest_asyncio.fixture(scope="function")
async def client(test_db: AsyncSession) -> AsyncGenerator:
    """
    Create a test client for integration tests
    """
    from httpx import AsyncClient, ASGITransport
    from app.main import app
    from app.core.database import get_db

    # Override get_db dependency
    async def override_get_db():
        yield test_db

    app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest_asyncio.fixture(scope="function")
async def sample_category(test_db: AsyncSession):
    """Создать тестовую категорию"""
    from app.models.category import Category

    category = Category(
        name="Test Category",
        icon="🧪",
        type="expense",
        color="#FF5733",
    )
    test_db.add(category)
    await test_db.commit()
    await test_db.refresh(category)
    return category


@pytest_asyncio.fixture(scope="function")
async def app_settings(test_db: AsyncSession):
    """Создать начальные настройки приложения"""
    from app.models.app_setting import AppSetting

    settings = [
        AppSetting(
            key="recurring_task_hour",
            value="0",
            description="Час запуска задачи создания повторяющихся транзакций (UTC, 0-23)",
        ),
        AppSetting(
            key="recurring_task_minute",
            value="0",
            description="Минута запуска задачи создания повторяющихся транзакций (0-59)",
        ),
    ]
    for setting in settings:
        test_db.add(setting)
    await test_db.commit()
    return settings
