"""
Pytest configuration and fixtures.
"""

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.fixture
def anyio_backend() -> str:
    """Use asyncio backend for async tests."""
    return "asyncio"


@pytest.fixture
async def client() -> AsyncClient:
    """Create async HTTP client for testing."""
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as ac:
        yield ac
