import asyncio
from app.db.session import engine

async def test_connection():
    try:
        async with engine.connect() as conn:
            print("Successfully connected to PostgreSQL!")
    except Exception as e:
        print("Connection failed:", e)

if __name__ == "__main__":
    asyncio.run(test_connection())