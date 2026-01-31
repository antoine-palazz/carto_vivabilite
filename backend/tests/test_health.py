"""
Tests for health check endpoint.
"""

import pytest
from httpx import AsyncClient


@pytest.mark.anyio
async def test_health_check(client: AsyncClient) -> None:
    """Test health check returns healthy status."""
    response = await client.get("/api/v1/health")
    
    assert response.status_code == 200
    data = response.json()
    
    assert data["status"] == "healthy"
    assert "version" in data
    assert "timestamp" in data
    assert "services" in data


@pytest.mark.anyio
async def test_root_endpoint(client: AsyncClient) -> None:
    """Test root endpoint returns API info."""
    response = await client.get("/")
    
    assert response.status_code == 200
    data = response.json()
    
    assert "name" in data
    assert "version" in data
    assert "docs" in data
