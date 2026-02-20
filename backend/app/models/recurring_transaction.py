"""
Модель шаблона повторяющейся транзакции.
"""

from datetime import date
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Date,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.category import Category
    from app.models.transaction import Transaction


class RecurringTransaction(Base, UUIDMixin, TimestampMixin):
    """
    Шаблон повторяющейся транзакции (подписка, зарплата и т.д.).
    """

    __tablename__ = "recurring_transactions"

    name: Mapped[str] = mapped_column(String(200), nullable=False)
    amount: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), nullable=False, default="USD")
    category_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("categories.id", ondelete="RESTRICT"),
        nullable=False,
    )
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    type: Mapped[str] = mapped_column(String(10), nullable=False)

    frequency: Mapped[str] = mapped_column(String(20), nullable=False)
    interval: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    next_occurrence: Mapped[date] = mapped_column(Date, nullable=False)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    category: Mapped["Category"] = relationship(
        "Category", back_populates="recurring_templates"
    )
    generated_transactions: Mapped[list["Transaction"]] = relationship(
        "Transaction", back_populates="recurring_template"
    )

    __table_args__ = (
        CheckConstraint("amount > 0", name="ck_recurring_amount_positive"),
        CheckConstraint("type IN ('income', 'expense')", name="ck_recurring_type"),
        CheckConstraint(
            "frequency IN ('daily', 'weekly', 'monthly', 'yearly')",
            name="ck_recurring_frequency",
        ),
        CheckConstraint("interval > 0", name="ck_recurring_interval_positive"),
        CheckConstraint(
            "currency ~ '^[A-Z]{3}$'", name="ck_recurring_currency_iso4217"
        ),
    )

    def __repr__(self) -> str:
        return f"<RecurringTransaction(id={self.id}, name={self.name}, frequency={self.frequency})>"
