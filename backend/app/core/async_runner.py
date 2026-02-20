"""Запуск async-кода из синхронного контекста (Celery worker)."""

import asyncio
from collections.abc import Coroutine
from typing import TypeVar

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

from app.core.config import settings

T = TypeVar("T")

_engine = None
_session_factory = None


def _get_engine():
    global _engine
    if _engine is None:
        _engine = create_async_engine(
            settings.DATABASE_URL,
            echo=False,
        )
    return _engine


def get_session_factory():
    """Фабрика сессий для использования в Celery-задачах."""
    global _session_factory
    if _session_factory is None:
        _session_factory = async_sessionmaker(
            _get_engine(),
            class_=AsyncSession,
            expire_on_commit=False,
            autocommit=False,
            autoflush=False,
        )
    return _session_factory


def run_async(coro: Coroutine[None, None, T]) -> T:
    """Выполнить корутину в новом event loop (для вызова из Celery)."""
    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
    if loop.is_running():
        raise RuntimeError("Cannot run_async from inside async context")
    return loop.run_until_complete(coro)


async def get_session_context():
    """Контекстный менеджер сессии БД для использования внутри run_async."""
    factory = get_session_factory()
    async with factory() as session:
        yield session
