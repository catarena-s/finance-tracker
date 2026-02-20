"""Репозиторий для результатов фоновых задач"""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.task_result import TaskResult
from app.repositories.base import BaseRepository


class TaskResultRepository(BaseRepository[TaskResult]):
    """Репозиторий для результатов фоновых задач."""

    def __init__(self, session: AsyncSession):
        super().__init__(TaskResult, session)

    async def get_by_task_id(self, task_id: str) -> TaskResult | None:
        """Получить результат по идентификатору задачи."""
        result = await self.session.execute(
            select(TaskResult).where(TaskResult.task_id == task_id)
        )
        return result.scalar_one_or_none()
