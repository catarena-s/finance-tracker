"""Pydantic схемы для импорта и экспорта CSV"""

from datetime import date
from typing import Any

import uuid
from pydantic import BaseModel, Field


class CSVColumnMapping(BaseModel):
    """Маппинг колонок CSV на поля транзакции"""

    amount: str = Field(..., description="Имя колонки с суммой")
    currency: str | None = Field(None, description="Имя колонки с валютой")
    category_name: str = Field(..., description="Имя колонки с категорией")
    description: str | None = Field(None, description="Имя колонки с описанием")
    transaction_date: str = Field(..., description="Имя колонки с датой")
    type: str = Field(..., description="Имя колонки с типом (income/expense)")


class CSVImportRequest(BaseModel):
    """Запрос на импорт CSV"""

    file_content: str = Field(..., description="Содержимое CSV в Base64")
    mapping: CSVColumnMapping
    date_format: str = Field(default="%Y-%m-%d", description="Формат даты в файле")


class CSVImportResult(BaseModel):
    """Результат импорта CSV"""

    task_id: str
    status: str
    created_count: int = 0
    error_count: int = 0
    errors: list[dict[str, Any]] = Field(default_factory=list)


class CSVExportRequest(BaseModel):
    """Параметры экспорта в CSV"""

    start_date: date | None = None
    end_date: date | None = None
    category_id: uuid.UUID | None = None
    columns: list[str] = Field(
        default_factory=lambda: [
            "amount",
            "currency",
            "category_name",
            "description",
            "transaction_date",
            "type",
        ]
    )
    date_format: str = "%Y-%m-%d"
