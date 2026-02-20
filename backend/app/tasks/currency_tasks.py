"""Ежедневная задача обновления курсов валют (01:00 UTC)."""

from app.tasks.celery_app import celery_app
from app.core.async_runner import run_async, get_session_factory


async def _run_update_rates():
    """Обновить курсы валют через API."""
    from app.repositories.exchange_rate import ExchangeRateRepository
    from app.repositories.currency import CurrencyRepository
    from app.services.exchange_rate import ExchangeRateService

    async with get_session_factory()() as session:
        exchange_repo = ExchangeRateRepository(session)
        currency_repo = CurrencyRepository(session)
        service = ExchangeRateService(exchange_repo, currency_repo)
        return await service.update_rates("USD")


@celery_app.task
def update_exchange_rates_task() -> dict:
    """Ежедневная задача обновления курсов валют."""
    return run_async(_run_update_rates())
