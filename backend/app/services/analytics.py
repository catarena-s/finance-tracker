"""Сервис для аналитики и статистики"""
from datetime import date
from decimal import Decimal
from collections import defaultdict
from typing import Dict

from app.repositories.transaction import TransactionRepository
from app.repositories.budget import BudgetRepository


# Упрощённые курсы валют к USD (для демонстрации)
CURRENCY_RATES = {
    "USD": Decimal("1.0"),
    "EUR": Decimal("1.1"),
    "GBP": Decimal("1.3"),
    "JPY": Decimal("0.0067"),
    "CNY": Decimal("0.14"),
    "RUB": Decimal("0.011"),
    "INR": Decimal("0.012"),
    "BRL": Decimal("0.20"),
    "CAD": Decimal("0.74"),
    "AUD": Decimal("0.66"),
}


def convert_to_usd(amount: Decimal, currency: str) -> Decimal:
    """Конвертировать сумму в USD"""
    rate = CURRENCY_RATES.get(currency, Decimal("1.0"))
    return amount * rate


class AnalyticsService:
    """Сервис для расчета аналитики по финансам"""
    
    def __init__(
        self,
        transaction_repo: TransactionRepository,
        budget_repo: BudgetRepository
    ):
        self.transaction_repo = transaction_repo
        self.budget_repo = budget_repo
    
    async def get_summary(
        self, start_date: date, end_date: date
    ) -> Dict:
        """Получить сводную статистику за период"""
        transactions = await self.transaction_repo.get_by_date_range(
            start_date, end_date
        )
        
        total_income = Decimal(0)
        total_expense = Decimal(0)
        
        for t in transactions:
            # Конвертировать в USD
            amount = convert_to_usd(t.amount, t.currency)
            if t.type == "income":
                total_income += amount
            else:
                total_expense += amount
        
        balance = total_income - total_expense
        
        return {
            "total_income": total_income,
            "total_expense": total_expense,
            "balance": balance,
            "start_date": start_date,
            "end_date": end_date
        }
    
    async def get_trends(
        self, start_date: date, end_date: date
    ) -> Dict:
        """Получить динамику доходов и расходов по месяцам"""
        transactions = await self.transaction_repo.get_by_date_range(
            start_date, end_date
        )
        
        monthly_data = defaultdict(lambda: {"income": Decimal(0), "expense": Decimal(0)})
        
        for t in transactions:
            month_key = t.transaction_date.strftime("%Y-%m")
            amount = convert_to_usd(t.amount, t.currency)
            
            if t.type == "income":
                monthly_data[month_key]["income"] += amount
            else:
                monthly_data[month_key]["expense"] += amount
        
        # Преобразовать в список
        trends = [
            {
                "month": month,
                "income": data["income"],
                "expense": data["expense"],
                "balance": data["income"] - data["expense"]
            }
            for month, data in sorted(monthly_data.items())
        ]
        
        return {"trends": trends}
    
    async def get_category_breakdown(
        self, start_date: date, end_date: date
    ) -> Dict:
        """Получить распределение расходов по категориям"""
        transactions = await self.transaction_repo.get_by_date_range(
            start_date, end_date
        )
        
        category_totals = defaultdict(Decimal)
        
        for t in transactions:
            if t.type == "expense":
                amount = convert_to_usd(t.amount, t.currency)
                category_totals[t.category.name] += amount
        
        # Преобразовать в список
        breakdown = [
            {"category": category, "amount": amount}
            for category, amount in category_totals.items()
        ]
        
        return {"breakdown": breakdown}
    
    async def get_top_categories(
        self, start_date: date, end_date: date, limit: int = 5
    ) -> Dict:
        """Получить топ категорий по расходам"""
        breakdown = await self.get_category_breakdown(start_date, end_date)
        
        # Сортировать по сумме и взять топ
        top = sorted(
            breakdown["breakdown"],
            key=lambda x: x["amount"],
            reverse=True
        )[:limit]
        
        return {"top_categories": top}
