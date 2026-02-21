"""
Pytest configuration and fixtures
"""

import asyncio
import os
from typing import AsyncGenerator

import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.pool import NullPool

from app.models.base import Base


# Test database URL - always use test database
# Priority:
# 1. If DATABASE_URL is set (CI/CD) - use it with test database name
# 2. If DATABASE_HOST=database (Docker) - use internal port 5432
# 3. Otherwise (local) - use localhost with port 5433
if "DATABASE_URL" in os.environ:
    # CI/CD environment - use provided DATABASE_URL but change database name
    base_url = os.getenv("DATABASE_URL", "")
    # Replace database name with test database
    if "finance_tracker" in base_url:
        TEST_DATABASE_URL = base_url.replace("finance_tracker", "finance_tracker_test")
    else:
        # Fallback for CI/CD
        TEST_DATABASE_URL = (
            "postgresql+asyncpg://postgres:postgres@localhost:5432/finance_tracker_test"
        )
elif os.getenv("DATABASE_HOST") == "database":
    # Running inside Docker - use internal port 5432
    TEST_DATABASE_URL = (
        "postgresql+asyncpg://postgres:postgres@database:5432/finance_tracker_test"
    )
else:
    # Running locally - use exposed port 5433
    TEST_DATABASE_URL = (
        "postgresql+asyncpg://postgres:postgres@localhost:5433/finance_tracker_test"
    )


@pytest.fixture(scope="session")
def event_loop():
    """
    Create an instance of the default event loop for the test session
    """
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


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
