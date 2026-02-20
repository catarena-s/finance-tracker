"""Сервис импорта транзакций из CSV"""

import base64
import csv
from decimal import Decimal, InvalidOperation
from io import StringIO
from datetime import datetime

from app.repositories.category import CategoryRepository
from app.schemas.csv_import import (
    CSVColumnMapping,
    CSVImportResult,
)
from app.schemas.transaction import TransactionCreate, TransactionType
from app.schemas.category import CategoryCreate, CategoryType
from app.services.transaction import TransactionService


# Поддерживаемые коды валют (требование 7.8)
VALID_CURRENCIES = {
    "USD",
    "EUR",
    "GBP",
    "JPY",
    "CNY",
    "RUB",
    "INR",
    "BRL",
    "CAD",
    "AUD",
}
MAX_DESCRIPTION_LENGTH = 500
MAX_CATEGORY_NAME_LENGTH = 100
CSV_BACKGROUND_THRESHOLD = 1000


class CSVImportService:
    """Сервис импорта транзакций из CSV с маппингом колонок и валидацией."""

    def __init__(
        self,
        transaction_service: TransactionService,
        category_repo: CategoryRepository,
    ):
        self.transaction_service = transaction_service
        self.category_repo = category_repo

    async def import_csv(
        self,
        file_content: str,
        mapping: CSVColumnMapping,
        date_format: str = "%Y-%m-%d",
    ) -> CSVImportResult:
        """
        Импорт CSV. При более чем 1000 строках возвращает task_id для фоновой задачи.
        Иначе обрабатывает синхронно и возвращает результат.
        """
        try:
            decoded = base64.b64decode(file_content).decode("utf-8")
        except Exception:
            return CSVImportResult(
                task_id="",
                status="failed",
                error_count=1,
                errors=[{"row": 0, "error": "Неверное Base64 или кодировка файла"}],
            )

        line_count = decoded.count("\n") + (1 if decoded.strip() else 0)
        if line_count > CSV_BACKGROUND_THRESHOLD:
            from app.tasks.csv_tasks import import_csv_task

            task = import_csv_task.delay(decoded, mapping.model_dump(), date_format)
            return CSVImportResult(task_id=task.id, status="pending")

        return await self._process_csv(decoded, mapping, date_format)

    async def _process_csv(
        self,
        csv_content: str,
        mapping: CSVColumnMapping,
        date_format: str,
    ) -> CSVImportResult:
        """Обработка CSV: валидация, нормализация, создание категорий и транзакций."""
        reader = csv.DictReader(StringIO(csv_content))
        created_count = 0
        errors: list[dict] = []

        for row_num, row in enumerate(reader, start=2):
            try:
                # Обязательные поля (требование 7.7)
                amount_raw = (row.get(mapping.amount) or "").strip()
                date_raw = (row.get(mapping.transaction_date) or "").strip()
                if not amount_raw or not date_raw:
                    errors.append(
                        {
                            "row": row_num,
                            "error": "Отсутствуют обязательные поля: сумма или дата",
                        }
                    )
                    continue

                # Сумма: число, > 0 (7.1, 7.2)
                try:
                    amount = Decimal(amount_raw.replace(",", "."))
                except (InvalidOperation, ValueError):
                    errors.append(
                        {"row": row_num, "error": "Некорректный формат суммы"}
                    )
                    continue
                if amount <= 0:
                    errors.append(
                        {"row": row_num, "error": "Сумма должна быть положительной"}
                    )
                    continue

                # Дата (7.3)
                try:
                    transaction_date = datetime.strptime(date_raw, date_format).date()
                except ValueError:
                    errors.append({"row": row_num, "error": "Некорректный формат даты"})
                    continue

                # Тип (income/expense)
                type_raw = (row.get(mapping.type) or "").strip().lower()
                if type_raw not in ("income", "expense"):
                    errors.append(
                        {
                            "row": row_num,
                            "error": f"Недопустимый тип транзакции: {type_raw}",
                        }
                    )
                    continue

                # Нормализация суммы по типу (7.5, 7.6)
                if type_raw == "income" and amount < 0:
                    amount = abs(amount)
                elif type_raw == "expense" and amount > 0:
                    amount = -amount
                # В модели amount хранится положительным, тип задаётся отдельно
                amount = abs(amount)

                # Валюта (7.8)
                currency_raw = (
                    (row.get(mapping.currency) or "USD").strip().upper()
                    if mapping.currency
                    else "USD"
                )
                if currency_raw and currency_raw not in VALID_CURRENCIES:
                    errors.append(
                        {
                            "row": row_num,
                            "error": f"Неизвестный код валюты: {currency_raw}",
                        }
                    )
                    continue
                currency = currency_raw or "USD"

                # Категория: обрезка (7.9), лимит длины (7.10)
                category_name = (row.get(mapping.category_name) or "").strip()[
                    :MAX_CATEGORY_NAME_LENGTH
                ]
                if not category_name:
                    category_name = "Без категории"

                description_raw = (
                    (row.get(mapping.description) or "").strip()
                    if mapping.description
                    else ""
                )
                description = (
                    description_raw[:MAX_DESCRIPTION_LENGTH]
                    if description_raw
                    else None
                )

                # Получить или создать категорию (требование 1.10)
                category = await self.category_repo.get_by_name_and_type(
                    category_name, type_raw
                )
                if not category:
                    create_data = CategoryCreate(
                        name=category_name,
                        icon="📁",
                        color="#808080",
                        type=(
                            CategoryType.INCOME
                            if type_raw == "income"
                            else CategoryType.EXPENSE
                        ),
                    )
                    category = await self.category_repo.create(
                        **create_data.model_dump()
                    )

                transaction_data = TransactionCreate(
                    amount=amount,
                    currency=currency,
                    category_id=category.id,
                    description=description,
                    transaction_date=transaction_date,
                    type=(
                        TransactionType.INCOME
                        if type_raw == "income"
                        else TransactionType.EXPENSE
                    ),
                    is_recurring=False,
                    recurring_pattern=None,
                )
                await self.transaction_service.create_transaction(transaction_data)
                created_count += 1

            except Exception as e:
                errors.append({"row": row_num, "error": str(e)})

        return CSVImportResult(
            task_id="sync",
            status="completed",
            created_count=created_count,
            error_count=len(errors),
            errors=errors,
        )
