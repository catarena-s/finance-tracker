"""Сервис для аналитики и статистики"""

from datetime import date
from decimal import Decimal
from collections import defaultdict
from typing import Dict, List, Optional

from app.repositories.transaction import TransactionRepository
from app.repositories.budget import BudgetRepository


# Упрощённые курсы валют к RUB (для демонстрации)
CURRENCY_RATES = {
    "RUB": Decimal("1.0"),
    "USD": Decimal("91.0"),  # 1 USD = 91 RUB
    "EUR": Decimal("100.0"),  # 1 EUR = 100 RUB
    "GBP": Decimal("115.0"),  # 1 GBP = 115 RUB
    "JPY": Decimal("0.61"),  # 1 JPY = 0.61 RUB
    "CNY": Decimal("12.5"),  # 1 CNY = 12.5 RUB
    "INR": Decimal("1.1"),  # 1 INR = 1.1 RUB
    "BRL": Decimal("18.0"),  # 1 BRL = 18 RUB
    "CAD": Decimal("67.0"),  # 1 CAD = 67 RUB
    "AUD": Decimal("60.0"),  # 1 AUD = 60 RUB
}


def convert_to_rub(amount: Decimal, currency: str) -> Decimal:
    """Конвертировать сумму в RUB"""
    rate = CURRENCY_RATES.get(currency, Decimal("1.0"))
    return amount * rate


def convert_from_rub(amount_rub: Decimal, to_currency: str) -> Decimal:
    """Конвертировать сумму из RUB в указанную валюту"""
    rate = CURRENCY_RATES.get(to_currency, Decimal("1.0"))
    if rate == 0:
        return amount_rub
    return amount_rub / rate


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

        total_income_rub = Decimal(0)
        total_expense_rub = Decimal(0)
        by_currency: Dict[str, Dict[str, Decimal]] = defaultdict(
            lambda: {"total_income": Decimal(0), "total_expense": Decimal(0)}
        )

        for t in transactions:
            amount_rub = convert_to_rub(t.amount, t.currency)
            if t.type == "income":
                total_income_rub += amount_rub
                by_currency[t.currency]["total_income"] += t.amount
            else:
                total_expense_rub += amount_rub
                by_currency[t.currency]["total_expense"] += t.amount

        balance_rub = total_income_rub - total_expense_rub

        by_currency_list: List[Dict] = [
            {
                "currency": cur,
                "total_income": data["total_income"],
                "total_expense": data["total_expense"],
                "balance": data["total_income"] - data["total_expense"],
            }
            for cur, data in sorted(by_currency.items())
        ]

        # Если все транзакции в одной валюте - показываем в ней, иначе в RUB
        if len(by_currency_list) == 1:
            single_currency = by_currency_list[0]["currency"]
            total_income = by_currency_list[0]["total_income"]
            total_expense = by_currency_list[0]["total_expense"]
            balance = by_currency_list[0]["balance"]
            display_currency = single_currency
        else:
            if currency:
                total_income = convert_from_rub(total_income_rub, currency)
                total_expense = convert_from_rub(total_expense_rub, currency)
                balance = convert_from_rub(balance_rub, currency)
                display_currency = currency
            else:
                total_income = total_income_rub
                total_expense = total_expense_rub
                balance = balance_rub
                display_currency = "RUB"

        return {
            "total_income": total_income,
            "total_expense": total_expense,
            "balance": balance,
            "display_currency": display_currency,
            "by_currency": by_currency_list,
            "currency_rates": {
                cur: float(rate) for cur, rate in CURRENCY_RATES.items()
            },
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
        bucket_data = defaultdict(lambda: {"income": Decimal(0), "expense": Decimal(0)})

        for t in transactions:
            key = self._period_key(t.transaction_date, period)
            amount_rub = convert_to_rub(t.amount, t.currency)
            amount = (
                convert_from_rub(amount_rub, currency)
                if currency and currency != "RUB"
                else amount_rub
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
                amount = convert_to_rub(t.amount, t.currency)
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
                    float(item["amount"] / total_amount * 100)
                    if total_amount > 0
                    else 0
                ),
            }
            for item in top
        ]

        return {"top_categories": top_with_percentage}
