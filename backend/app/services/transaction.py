"""Сервис для работы с транзакциями"""

from typing import Dict
from datetime import date
from decimal import Decimal
import uuid
import csv
from io import StringIO

from app.repositories.transaction import TransactionRepository
from app.repositories.category import CategoryRepository
from app.schemas.transaction import TransactionCreate, TransactionUpdate, Transaction
from app.core.exceptions import NotFoundException


class TransactionService:
    """Сервис для управления транзакциями"""

    def __init__(
        self, transaction_repo: TransactionRepository, category_repo: CategoryRepository
    ):
        self.transaction_repo = transaction_repo
        self.category_repo = category_repo

    async def create_transaction(
        self, data: TransactionCreate, recurring_template_id: uuid.UUID | None = None
    ) -> Transaction:
        """Создать транзакцию (опционально — из шаблона повторяющейся транзакции)."""
        try:
            # Проверить существование категории
            category = await self.category_repo.get_by_id(data.category_id)
            if not category:
                raise NotFoundException("Category not found")

            # Создать транзакцию
            transaction_data = {
                "amount": data.amount,
                "currency": data.currency,
                "category_id": data.category_id,
                "description": data.description,
                "transaction_date": data.transaction_date,
                "type": data.type.value,
                "is_recurring": data.is_recurring,
                "recurring_pattern": (
                    data.recurring_pattern.model_dump()
                    if data.recurring_pattern
                    else None
                ),
            }
            if recurring_template_id is not None:
                transaction_data["recurring_template_id"] = recurring_template_id

            transaction = await self.transaction_repo.create(**transaction_data)
            return Transaction.model_validate(transaction)
        except Exception as e:
            import logging

            logger = logging.getLogger(__name__)
            logger.error(
                f"Error creating transaction: {type(e).__name__}: {str(e)}",
                exc_info=True,
            )
            raise

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
        page_size: int = 50,
    ) -> Dict:
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
            limit=page_size,
        )

        return {
            "items": [Transaction.model_validate(t) for t in transactions],
            "total": total,
            "page": page,
            "page_size": page_size,
            "pages": (total + page_size - 1) // page_size,
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

    async def import_from_csv(self, csv_content: str) -> Dict:
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
                    errors.append(
                        {
                            "row": row_num,
                            "error": f"Category '{row['category_name']}' not found",
                        }
                    )
                    continue

                # Создать транзакцию
                transaction_data = TransactionCreate(
                    amount=Decimal(row["amount"]),
                    currency=row.get("currency", "USD"),
                    category_id=category.id,
                    description=row.get("description"),
                    transaction_date=date.fromisoformat(row["transaction_date"]),
                    type=row["type"],
                    is_recurring=False,
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
        category_id: uuid.UUID | None = None,
    ) -> str:
        """Экспортировать транзакции в CSV"""
        transactions, _ = await self.transaction_repo.get_filtered(
            start_date=start_date,
            end_date=end_date,
            category_id=category_id,
            limit=10000,
        )

        output = StringIO()
        writer = csv.DictWriter(
            output,
            fieldnames=[
                "amount",
                "currency",
                "category_name",
                "description",
                "transaction_date",
                "type",
            ],
        )
        writer.writeheader()

        for t in transactions:
            writer.writerow(
                {
                    "amount": str(t.amount),
                    "currency": t.currency,
                    "category_name": t.category.name,
                    "description": t.description or "",
                    "transaction_date": t.transaction_date.isoformat(),
                    "type": t.type,
                }
            )

        return output.getvalue()
