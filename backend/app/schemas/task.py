"""Pydantic схемы для фоновых задач"""

from datetime import datetime
from enum import Enum
from typing import Any

from pydantic import BaseModel


class TaskStatus(str, Enum):
    """Статус фоновой задачи"""

    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class TaskStatusResponse(BaseModel):
    """Ответ со статусом задачи"""

    task_id: str
    task_type: str
    status: TaskStatus
    result: dict[str, Any] | None = None
    error: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
