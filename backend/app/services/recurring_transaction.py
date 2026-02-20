"""Сервис для шаблонов повторяющихся транзакций"""

from datetime import date, timedelta
from decimal import Decimal
import uuid

from dateutil.relativedelta import relativedelta

from app.repositories.recurring_transaction import RecurringTransactionRepository
from app.schemas.recurring_transaction import (
    RecurringTransactionCreate,
    RecurringTransactionUpdate,
    RecurringTransaction as RecurringTransactionSchema,
)
from app.services.transaction import TransactionService
from app.repositories.category import CategoryRepository
from app.core.exceptions import NotFoundException
from app.schemas.transaction import TransactionCreate, TransactionType


class RecurringTransactionService:
    """Сервис управления шаблонами повторяющихся транзакций."""

    def __init__(
        self,
        recurring_repo: RecurringTransactionRepository,
        transaction_service: TransactionService,
        category_repo: CategoryRepository,
    ):
        self.recurring_repo = recurring_repo
        self.transaction_service = transaction_service
        self.category_repo = category_repo

    async def create(
        self, data: RecurringTransactionCreate
    ) -> RecurringTransactionSchema:
        """Создать шаблон повторяющейся транзакции."""
        category = await self.category_repo.get_by_id(data.category_id)
        if not category:
            raise NotFoundException("Категория не найдена")

        next_occurrence = data.start_date
        payload = data.model_dump()
        payload["next_occurrence"] = next_occurrence
        payload["type"] = data.type
        payload["frequency"] = data.frequency.value
        recurring = await self.recurring_repo.create(**payload)
        return RecurringTransactionSchema.model_validate(recurring)

    async def get_by_id(self, recurring_id: uuid.UUID) -> RecurringTransactionSchema:
        """Получить шаблон по ID."""
        recurring = await self.recurring_repo.get_by_id(recurring_id)
        if not recurring:
            raise NotFoundException("Шаблон повторяющейся транзакции не найден")
        return RecurringTransactionSchema.model_validate(recurring)

    async def list_all(
        self, skip: int = 0, limit: int = 100
    ) -> list[RecurringTransactionSchema]:
        """Список всех шаблонов (активных и неактивных)."""
        items = await self.recurring_repo.get_all(skip=skip, limit=limit)
        return [RecurringTransactionSchema.model_validate(x) for x in items]

    async def update(
        self, recurring_id: uuid.UUID, data: RecurringTransactionUpdate
    ) -> RecurringTransactionSchema:
        """Обновить шаблон (только будущие выполнения)."""
        existing = await self.recurring_repo.get_by_id(recurring_id)
        if not existing:
            raise NotFoundException("Шаблон не найден")

        if data.category_id is not None:
            cat = await self.category_repo.get_by_id(data.category_id)
            if not cat:
                raise NotFoundException("Категория не найдена")

        update_data = data.model_dump(exclude_unset=True)
        if "frequency" in update_data:
            update_data["frequency"] = update_data["frequency"].value
        if any(k in update_data for k in ("frequency", "interval", "start_date")):
            start = update_data.get("start_date", existing.start_date)
            freq = update_data.get("frequency", existing.frequency)
            interval = update_data.get("interval", existing.interval)
            update_data["next_occurrence"] = self._next_occurrence(
                start, freq, interval, date.today()
            )
        updated = await self.recurring_repo.update(recurring_id, **update_data)
        return RecurringTransactionSchema.model_validate(updated)

    async def delete(self, recurring_id: uuid.UUID) -> None:
        """Удалить шаблон (созданные транзакции сохраняются)."""
        deleted = await self.recurring_repo.delete(recurring_id)
        if not deleted:
            raise NotFoundException("Шаблон не найден")

    async def process_due(self, current_date: date) -> dict:
        """Создать транзакции по всем шаблонам, у которых next_occurrence <= current_date."""
        due = await self.recurring_repo.get_active_due_today(current_date)
        created_count = 0
        errors: list[dict] = []

        for recurring in due:
            try:
                tx_data = TransactionCreate(
                    amount=Decimal(str(recurring.amount)),
                    currency=recurring.currency,
                    category_id=recurring.category_id,
                    description=f"{recurring.name} (автоматически создано)",
                    transaction_date=recurring.next_occurrence,
                    type=(
                        TransactionType.INCOME
                        if recurring.type == "income"
                        else TransactionType.EXPENSE
                    ),
                    is_recurring=False,
                    recurring_pattern=None,
                )
                # Создаём транзакцию; recurring_template_id задаётся в репозитории/модели
                await self.transaction_service.create_transaction(
                    tx_data, recurring_template_id=recurring.id
                )
                created_count += 1

                next_date = self._next_occurrence(
                    recurring.next_occurrence,
                    recurring.frequency,
                    recurring.interval,
                    current_date,
                )
                await self.recurring_repo.update_next_occurrence(
                    recurring.id, next_date
                )
            except Exception as e:
                errors.append({"recurring_id": str(recurring.id), "error": str(e)})

        return {
            "created_count": created_count,
            "error_count": len(errors),
            "errors": errors,
        }

    def _next_occurrence(
        self,
        current: date,
        frequency: str,
        interval: int,
        reference: date,
    ) -> date:
        """Следующая дата выполнения по частоте и интервалу."""
        if frequency == "daily":
            return current + timedelta(days=interval)
        if frequency == "weekly":
            return current + timedelta(weeks=interval)
        if frequency == "monthly":
            return current + relativedelta(months=interval)
        if frequency == "yearly":
            return current + relativedelta(years=interval)
        raise ValueError(f"Недопустимая частота: {frequency}")
