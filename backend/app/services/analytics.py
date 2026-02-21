"""Сервис для аналитики и статистики"""

from datetime import date
from decimal import Decimal
from collections import defaultdict
from typing import Dict, List, Optional

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


def convert_from_usd(amount_usd: Decimal, to_currency: str) -> Decimal:
    """Конвертировать сумму из USD в указанную валюту"""
    rate = CURRENCY_RATES.get(to_currency, Decimal("1.0"))
    if rate == 0:
        return amount_usd
    return amount_usd / rate


class AnalyticsService:
    """Сервис для расчета аналитики по финансам"""

    def __init__(
        self, transaction_repo: TransactionRepository, budget_repo: BudgetRepository
    ):
        self.transaction_repo = transaction_repo
        self.budget_repo = budget_repo

    async def get_summary(
        self,
        start_date: date,
        end_date: date,
        currency: Optional[str] = None,
    ) -> Dict:
        """Получить сводную статистику за период. По валютам и опционально в одной валюте."""
        transactions = await self.transaction_repo.get_by_date_range(
            start_date, end_date
        )

        total_income_usd = Decimal(0)
        total_expense_usd = Decimal(0)
        by_currency: Dict[str, Dict[str, Decimal]] = defaultdict(
            lambda: {"total_income": Decimal(0), "total_expense": Decimal(0)}
        )

        for t in transactions:
            amount_usd = convert_to_usd(t.amount, t.currency)
            if t.type == "income":
                total_income_usd += amount_usd
                by_currency[t.currency]["total_income"] += t.amount
            else:
                total_expense_usd += amount_usd
                by_currency[t.currency]["total_expense"] += t.amount

        balance_usd = total_income_usd - total_expense_usd

        by_currency_list: List[Dict] = [
            {
                "currency": cur,
                "total_income": data["total_income"],
                "total_expense": data["total_expense"],
                "balance": data["total_income"] - data["total_expense"],
            }
            for cur, data in sorted(by_currency.items())
        ]

        if currency:
            total_income = convert_from_usd(total_income_usd, currency)
            total_expense = convert_from_usd(total_expense_usd, currency)
            balance = convert_from_usd(balance_usd, currency)
        else:
            total_income = total_income_usd
            total_expense = total_expense_usd
            balance = balance_usd

        return {
            "total_income": total_income,
            "total_expense": total_expense,
            "balance": balance,
            "by_currency": by_currency_list,
            "start_date": start_date,
            "end_date": end_date,
        }

    @staticmethod
    def _period_key(d: date, period: str) -> str:
        """Ключ группировки по периоду: day, week, month, year."""
        if period == "day":
            return d.strftime("%Y-%m-%d")
        if period == "week":
            return d.strftime("%Y-W%W")
        if period == "year":
            return d.strftime("%Y")
        return d.strftime("%Y-%m")

    async def get_trends(
        self,
        start_date: date,
        end_date: date,
        period: str = "month",
        currency: Optional[str] = None,
    ) -> Dict:
        """Получить динамику доходов и расходов (day/week/month/year)."""
        transactions = await self.transaction_repo.get_by_date_range(
            start_date, end_date
        )

        period = period if period in ("day", "week", "month", "year") else "month"
        bucket_data = defaultdict(
            lambda: {"income": Decimal(0), "expense": Decimal(0)}
        )

        for t in transactions:
            key = self._period_key(t.transaction_date, period)
            amount_usd = convert_to_usd(t.amount, t.currency)
            amount = (
                convert_from_usd(amount_usd, currency)
                if currency and currency != "USD"
                else amount_usd
            )

            if t.type == "income":
                bucket_data[key]["income"] += amount
            else:
                bucket_data[key]["expense"] += amount

        trends = [
            {
                "month": key,
                "income": data["income"],
                "expense": data["expense"],
                "balance": data["income"] - data["expense"],
            }
            for key, data in sorted(bucket_data.items())
        ]

        return {"trends": trends}

    async def get_category_breakdown(self, start_date: date, end_date: date) -> Dict:
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
        sorted_breakdown = sorted(
            breakdown["breakdown"], key=lambda x: x["amount"], reverse=True
        )
        top = sorted_breakdown[:limit]

        # Вычислить общую сумму для процентов
        total_amount = sum(item["amount"] for item in sorted_breakdown)

        # Добавить процент к каждой категории
        top_with_percentage = [
            {
                "category": item["category"],
                "amount": item["amount"],
                "percentage": (
                    float(item["amount"] / total_amount * 100) if total_amount > 0 else 0
                ),
            }
            for item in top
        ]

        return {"top_categories": top_with_percentage}
