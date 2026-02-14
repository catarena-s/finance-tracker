"""
Budget model
"""

from datetime import date
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import (
    CheckConstraint,
    Date,
    ForeignKey,
    Numeric,
    String,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from app.models.category import Category

from app.models.base import Base, TimestampMixin, UUIDMixin


class Budget(Base, UUIDMixin, TimestampMixin):
    """
    Budget model for tracking spending limits by category
    """

    __tablename__ = "budgets"

    category_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("categories.id", ondelete="CASCADE"),
        nullable=False,
    )
    amount: Mapped[Decimal] = mapped_column(
        Numeric(precision=10, scale=2), nullable=False
    )
    period: Mapped[str] = mapped_column(String(10), nullable=False)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)

    # Relationships
    category: Mapped["Category"] = relationship("Category", back_populates="budgets")

    # Constraints
    __table_args__ = (
        CheckConstraint("amount > 0", name="ck_budget_amount_positive"),
        CheckConstraint("period IN ('monthly', 'yearly')", name="ck_budget_period"),
        CheckConstraint("end_date > start_date", name="ck_budget_date_range"),
        UniqueConstraint(
            "category_id", "period", "start_date", name="uq_budget_category_period"
        ),
    )

    def __repr__(self) -> str:
        return f"<Budget(id={self.id}, category_id={self.category_id}, amount={self.amount})>"
