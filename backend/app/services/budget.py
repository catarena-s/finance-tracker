"""Сервис для работы с бюджетами"""

from typing import List
from decimal import Decimal
import uuid

from app.repositories.budget import BudgetRepository
from app.repositories.category import CategoryRepository
from app.repositories.transaction import TransactionRepository
from app.schemas.budget import BudgetCreate, BudgetUpdate, Budget, BudgetProgress
from app.core.exceptions import NotFoundException, ConflictException


class BudgetService:
    """Сервис для управления бюджетами"""

    def __init__(
        self,
        budget_repo: BudgetRepository,
        category_repo: CategoryRepository,
        transaction_repo: TransactionRepository,
    ):
        self.budget_repo = budget_repo
        self.category_repo = category_repo
        self.transaction_repo = transaction_repo

    async def create_budget(self, data: BudgetCreate) -> Budget:
        """Создать бюджет"""
        # Проверить существование категории
        category = await self.category_repo.get_by_id(data.category_id)
        if not category:
            raise NotFoundException("Category not found")

        # Проверить уникальность
        existing = await self.budget_repo.get_by_category_and_period(
            data.category_id, data.period, data.start_date
        )
        if existing:
            raise ConflictException(
                "Budget for this category, period and start date already exists"
            )

        # Создать бюджет
        budget_data = {
            'category_id': data.category_id,
            'amount': data.amount,
            'period': data.period.value,  # Преобразуем Enum в строку
            'start_date': data.start_date,
            'end_date': data.end_date
        }
        
        budget = await self.budget_repo.create(**budget_data)
        return Budget.model_validate(budget)

    async def get_budget(self, budget_id: uuid.UUID) -> Budget:
        """Получить бюджет по ID"""
        budget = await self.budget_repo.get_by_id(budget_id)
        if not budget:
            raise NotFoundException("Budget not found")
        return Budget.model_validate(budget)

    async def list_budgets(self) -> List[Budget]:
        """Получить список всех бюджетов"""
        budgets = await self.budget_repo.get_all(limit=1000)
        return [Budget.model_validate(b) for b in budgets]

    async def update_budget(self, budget_id: uuid.UUID, data: BudgetUpdate) -> Budget:
        """Обновить бюджет"""
        existing = await self.budget_repo.get_by_id(budget_id)
        if not existing:
            raise NotFoundException("Budget not found")

        # Проверить категорию если она обновляется
        if data.category_id:
            category = await self.category_repo.get_by_id(data.category_id)
            if not category:
                raise NotFoundException("Category not found")

        updated = await self.budget_repo.update(
            budget_id, **data.model_dump(exclude_unset=True)
        )
        return Budget.model_validate(updated)

    async def delete_budget(self, budget_id: uuid.UUID) -> None:
        """Удалить бюджет"""
        deleted = await self.budget_repo.delete(budget_id)
        if not deleted:
            raise NotFoundException("Budget not found")

    async def get_budget_progress(self, budget_id: uuid.UUID) -> BudgetProgress:
        """Получить прогресс выполнения бюджета"""
        budget = await self.budget_repo.get_by_id(budget_id)
        if not budget:
            raise NotFoundException("Budget not found")

        # Получить транзакции за период бюджета
        transactions = await self.transaction_repo.get_by_date_range(
            budget.start_date, budget.end_date
        )

        # Рассчитать сумму расходов по категории
        spent = Decimal(0)
        for t in transactions:
            if t.category_id == budget.category_id and t.type == "expense":
                # Конвертировать в USD если нужно (упрощённо)
                spent += t.amount

        # Рассчитать остаток и процент
        remaining = budget.amount - spent
        percentage = (spent / budget.amount * 100) if budget.amount > 0 else Decimal(0)

        return BudgetProgress(
            budget=Budget.model_validate(budget),
            spent=spent,
            remaining=remaining,
            percentage=percentage,
        )
