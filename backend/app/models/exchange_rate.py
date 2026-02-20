"""
Модель курса валюты на дату.
"""

from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import CheckConstraint, Date, ForeignKey, Numeric, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import DateTime, func
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, UUIDMixin


class ExchangeRate(Base, UUIDMixin):
    """
    Курс обмена между двумя валютами на определённую дату.
    """

    __tablename__ = "exchange_rates"

    from_currency: Mapped[str] = mapped_column(
        String(3),
        ForeignKey("currencies.code", ondelete="RESTRICT"),
        nullable=False,
    )
    to_currency: Mapped[str] = mapped_column(
        String(3),
        ForeignKey("currencies.code", ondelete="RESTRICT"),
        nullable=False,
    )
    rate: Mapped[Decimal] = mapped_column(Numeric(20, 10), nullable=False)
    date: Mapped[date] = mapped_column(Date, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    __table_args__ = (
        UniqueConstraint(
            "from_currency", "to_currency", "date", name="uq_exchange_rate_per_day"
        ),
        CheckConstraint("rate > 0", name="ck_exchange_rate_positive"),
    )

    def __repr__(self) -> str:
        return f"<ExchangeRate({self.from_currency}->{self.to_currency} {self.date}={self.rate})>"
