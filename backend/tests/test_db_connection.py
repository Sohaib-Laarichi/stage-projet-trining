
import pytest
from sqlalchemy import text
from database import get_db

@pytest.mark.asyncio
async def test_database_connection():
    """
    Verifies that the application can connect to the database 
    and execute a simple query.
    """
    try:
        async for session in get_db():
            result = await session.execute(text("SELECT 1"))
            assert result.scalar() == 1
            print("\n✅ Database connection successful!")
            break
    except Exception as e:
        pytest.fail(f"❌ Database connection failed: {str(e)}")
