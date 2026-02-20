"""API маршруты для статуса фоновых задач"""

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.repositories.task_result import TaskResultRepository
from app.schemas.task import TaskStatusResponse, TaskStatus

router = APIRouter(prefix="/tasks", tags=["tasks"])


async def get_task_result_repo(
    session: Annotated[AsyncSession, Depends(get_session)]
) -> TaskResultRepository:
    return TaskResultRepository(session)


@router.get(
    "/{task_id}/status",
    response_model=TaskStatusResponse,
    summary="Статус задачи",
    description="Получить статус фоновой задачи по идентификатору",
)
async def get_task_status(
    task_id: str,
    repo: Annotated[TaskResultRepository, Depends(get_task_result_repo)],
):
    """Вернуть статус задачи (pending/running/completed/failed) и результат при наличии."""
    task_result = await repo.get_by_task_id(task_id)
    if task_result:
        return TaskStatusResponse(
            task_id=task_result.task_id,
            task_type=task_result.task_type,
            status=TaskStatus(task_result.status),
            result=task_result.result,
            error=task_result.error,
            created_at=task_result.created_at,
            updated_at=task_result.updated_at,
        )
    # Задача ещё не подхвачена воркером — возвращаем pending
    from datetime import datetime, timezone

    now = datetime.now(timezone.utc)
    return TaskStatusResponse(
        task_id=task_id,
        task_type="unknown",
        status=TaskStatus.PENDING,
        result=None,
        error=None,
        created_at=now,
        updated_at=now,
    )
