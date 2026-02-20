"""Сервис экспорта транзакций в CSV"""

import csv
from io import StringIO
from datetime import date
import uuid

from app.repositories.transaction import TransactionRepository


class CSVExportService:
    """Сервис экспорта транзакций в CSV с выбором колонок и формата даты."""

    def __init__(self, transaction_repo: TransactionRepository):
        self.transaction_repo = transaction_repo

    async def export_csv(
        self,
        start_date: date | None,
        end_date: date | None,
        category_id: uuid.UUID | None,
        columns: list[str],
        date_format: str,
    ) -> str:
        """Экспорт в CSV с заданными колонками и форматом даты."""
        transactions, _ = await self.transaction_repo.get_filtered(
            start_date=start_date,
            end_date=end_date,
            category_id=category_id,
            limit=100_000,
        )

        output = StringIO()
        writer = csv.DictWriter(
            output,
            fieldnames=columns,
            quoting=csv.QUOTE_MINIMAL,
        )
        writer.writeheader()

        for t in transactions:
            row: dict[str, str] = {}
            if "amount" in columns:
                row["amount"] = str(t.amount)
            if "currency" in columns:
                row["currency"] = t.currency
            if "category_name" in columns:
                row["category_name"] = t.category.name if t.category else ""
            if "description" in columns:
                row["description"] = t.description or ""
            if "transaction_date" in columns:
                row["transaction_date"] = t.transaction_date.strftime(date_format)
            if "type" in columns:
                row["type"] = t.type
            writer.writerow(row)

        return output.getvalue()
