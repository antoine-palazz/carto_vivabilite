"""
Tests for communes endpoints.

Note: These tests work without actual commune data (shapefile).
The API returns empty results or 404 when no data is available.
"""

import pytest
from httpx import AsyncClient


@pytest.mark.anyio
async def test_list_communes(client: AsyncClient) -> None:
    """Test listing communes returns paginated results (empty without data)."""
    response = await client.get("/api/v1/communes")
    
    assert response.status_code == 200
    data = response.json()
    
    assert "data" in data
    assert "total" in data
    assert "limit" in data
    assert "offset" in data
    assert "has_more" in data
    
    # Without communes data, the list should be empty
    # This is expected behavior - no data until shapefile is added


@pytest.mark.anyio
async def test_list_communes_pagination(client: AsyncClient) -> None:
    """Test communes pagination parameters."""
    response = await client.get("/api/v1/communes?limit=5&offset=0")
    
    assert response.status_code == 200
    data = response.json()
    
    assert data["limit"] == 5
    assert data["offset"] == 0
    assert len(data["data"]) <= 5


@pytest.mark.anyio
async def test_get_commune_not_found(client: AsyncClient) -> None:
    """Test 404 for non-existent commune."""
    response = await client.get("/api/v1/communes/99999")
    
    assert response.status_code == 404


@pytest.mark.anyio
async def test_get_commune_not_found_without_data(client: AsyncClient) -> None:
    """Test 404 when communes data is not available."""
    # Without a communes shapefile, any commune lookup should return 404
    response = await client.get("/api/v1/communes/75056")
    
    assert response.status_code == 404


@pytest.mark.anyio
async def test_search_communes(client: AsyncClient) -> None:
    """Test searching communes with filters."""
    search_request = {
        "weights": {
            "climat_chaleur_extreme": 80,
            "climat_incendie": 70,
        },
        "min_score": 50,
        "limit": 10,
    }
    
    response = await client.post("/api/v1/communes/search", json=search_request)
    
    assert response.status_code == 200
    data = response.json()
    
    assert "communes" in data
    assert "total" in data
    assert "execution_time_ms" in data


@pytest.mark.anyio
async def test_search_communes_with_population_filter(client: AsyncClient) -> None:
    """Test searching communes with population filter."""
    search_request = {
        "population_min": 100000,
        "population_max": 500000,
        "limit": 50,
    }
    
    response = await client.post("/api/v1/communes/search", json=search_request)
    
    assert response.status_code == 200
    data = response.json()
    
    assert "communes" in data
