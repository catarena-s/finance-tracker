"""
Script to load seed data into the database
Executes SQL files in the correct order: categories → transactions → budgets
"""
import asyncio
import asyncpg
import os
from pathlib import Path


async def load_seed_file(conn: asyncpg.Connection, filepath: Path) -> None:
    """
    Load and execute a SQL seed file
    
    Args:
        conn: Database connection
        filepath: Path to SQL file
    """
    print(f"Loading {filepath.name}...")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        sql = f.read()
    
    try:
        await conn.execute(sql)
        print(f"✓ {filepath.name} loaded successfully")
    except Exception as e:
        print(f"✗ Error loading {filepath.name}: {e}")
        raise


async def main():
    """
    Main function to load all seed data
    """
    # Database connection parameters
    DATABASE_URL = os.getenv(
        'DATABASE_URL',
        'postgresql://postgres:postgres@localhost:5432/finance_tracker'
    )
    
    # Get the directory containing this script
    seeds_dir = Path(__file__).parent
    
    # Define seed files in order
    seed_files = [
        seeds_dir / 'seed_categories.sql',
        seeds_dir / 'seed_transactions.sql',
        seeds_dir / 'seed_budgets.sql',
    ]
    
    print("Starting seed data loading...")
    print(f"Database: {DATABASE_URL}")
    print("-" * 50)
    
    try:
        # Connect to database
        conn = await asyncpg.connect(DATABASE_URL)
        
        # Load each seed file
        for seed_file in seed_files:
            if seed_file.exists():
                await load_seed_file(conn, seed_file)
            else:
                print(f"⚠ Warning: {seed_file.name} not found, skipping...")
        
        # Close connection
        await conn.close()
        
        print("-" * 50)
        print("✓ All seed data loaded successfully!")
        
    except Exception as e:
        print(f"✗ Error: {e}")
        raise


if __name__ == '__main__':
    asyncio.run(main())
