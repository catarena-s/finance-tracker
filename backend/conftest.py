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

from app.core.database import Base


# Test database URL - use environment variable if set (for CI), otherwise use local default
TEST_DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://postgres:postgres@localhost:5433/finance_tracker_test",
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
    from app.models.category import Category
    from app.models.transaction import Transaction  # noqa: F401
    from app.models.budget import Budget  # noqa: F401
    from app.schemas.category import CategoryType

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

    # Add default categories in a separate session
    async with async_session() as setup_session:
        default_categories = [
            # Expense categories
            Category(
                name="Продукты",
                icon="🛒",
                type=CategoryType.EXPENSE.value,
                color="#FF6B6B",
            ),
            Category(
                name="Транспорт",
                icon="🚗",
                type=CategoryType.EXPENSE.value,
                color="#4ECDC4",
            ),
            Category(
                name="Жильё",
                icon="🏠",
                type=CategoryType.EXPENSE.value,
                color="#45B7D1",
            ),
            Category(
                name="Здоровье",
                icon="💊",
                type=CategoryType.EXPENSE.value,
                color="#96CEB4",
            ),
            Category(
                name="Развлечения",
                icon="🎬",
                type=CategoryType.EXPENSE.value,
                color="#FFEAA7",
            ),
            Category(
                name="Одежда",
                icon="👕",
                type=CategoryType.EXPENSE.value,
                color="#DFE6E9",
            ),
            Category(
                name="Образование",
                icon="📚",
                type=CategoryType.EXPENSE.value,
                color="#74B9FF",
            ),
            Category(
                name="Связь",
                icon="📱",
                type=CategoryType.EXPENSE.value,
                color="#A29BFE",
            ),
            Category(
                name="Прочее",
                icon="📦",
                type=CategoryType.EXPENSE.value,
                color="#B2BEC3",
            ),
            # Income categories
            Category(
                name="Зарплата",
                icon="💰",
                type=CategoryType.INCOME.value,
                color="#00B894",
            ),
            Category(
                name="Фриланс",
                icon="💻",
                type=CategoryType.INCOME.value,
                color="#00CEC9",
            ),
            Category(
                name="Инвестиции",
                icon="📈",
                type=CategoryType.INCOME.value,
                color="#FDCB6E",
            ),
            Category(
                name="Подарки",
                icon="🎁",
                type=CategoryType.INCOME.value,
                color="#E17055",
            ),
            Category(
                name="Прочее",
                icon="💵",
                type=CategoryType.INCOME.value,
                color="#636E72",
            ),
        ]

        setup_session.add_all(default_categories)
        await setup_session.commit()

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
