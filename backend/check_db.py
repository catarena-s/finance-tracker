#!/usr/bin/env python3
"""Check if database tables exist and reset alembic if needed"""
import asyncio
import sys
from sqlalchemy import text
from app.core.database import engine


async def check_and_reset():
    """Check if core tables exist, reset alembic_version if they don't"""
    try:
        async with engine.begin() as conn:
            # Check if core tables exist
            result = await conn.execute(
                text(
                    "SELECT COUNT(*) FROM information_schema.tables "
                    "WHERE table_schema = 'public' "
                    "AND table_name IN ('categories', 'transactions', 'budgets')"
                )
            )
            count = result.scalar()

            if count == 0:
                # Core tables missing, reset alembic
                await conn.execute(text("DROP TABLE IF EXISTS alembic_version"))
                print("RESET", file=sys.stderr)
                return 0
            else:
                print(f"OK:{count}", file=sys.stderr)
                return count
    except Exception as e:
        print(f"ERROR:{e}", file=sys.stderr)
        return -1


if __name__ == "__main__":
    result = asyncio.run(check_and_reset())
    sys.exit(0 if result >= 0 else 1)
