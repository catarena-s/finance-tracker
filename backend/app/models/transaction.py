"""
Transaction model
"""

from datetime import date
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, Date, ForeignKey, Numeric, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.category import Category


class Transaction(Base, UUIDMixin, TimestampMixin):
    """
    Transaction model for income and expense tracking
    """

    __tablename__ = "transactions"

    amount: Mapped[Decimal] = mapped_column(
        Numeric(precision=10, scale=2), nullable=False
    )
    currency: Mapped[str] = mapped_column(String(3), nullable=False, default="USD")
    category_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("categories.id", ondelete="RESTRICT"),
        nullable=False,
    )
    description: Mapped[str] = mapped_column(Text, nullable=True)
    transaction_date: Mapped[date] = mapped_column(Date, nullable=False)
    type: Mapped[str] = mapped_column(String(10), nullable=False)
    is_recurring: Mapped[bool] = mapped_column(nullable=False, default=False)
    recurring_pattern: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    # Relationships
    category: Mapped["Category"] = relationship(
        "Category", back_populates="transactions"
    )

    # Constraints
    __table_args__ = (
        CheckConstraint("amount > 0", name="ck_transaction_amount_positive"),
        CheckConstraint("type IN ('income', 'expense')", name="ck_transaction_type"),
        CheckConstraint(
            "currency ~ '^[A-Z]{3}$'", name="ck_transaction_currency_iso4217"
        ),
    )

    def __repr__(self) -> str:
        return f"<Transaction(id={self.id}, amount={self.amount}, type={self.type})>"
