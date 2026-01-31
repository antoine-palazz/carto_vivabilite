"""
Pydantic models for data validation and serialization.
"""

from app.models.commune import (
    CommuneBase,
    CommuneDetail,
    CommuneScores,
    CommuneSummary,
    Coordinates,
)
from app.models.filters import FilterOptions, ScoreWeight
from app.models.geojson import CommuneFeature, CommunesGeoJSON
from app.models.requests import SearchRequest, ViewportBounds
from app.models.responses import (
    HealthResponse,
    PaginatedResponse,
    SearchResponse,
)

__all__ = [
    # Commune models
    "Coordinates",
    "CommuneBase",
    "CommuneScores",
    "CommuneSummary",
    "CommuneDetail",
    # Filter models
    "FilterOptions",
    "ScoreWeight",
    # GeoJSON models
    "CommuneFeature",
    "CommunesGeoJSON",
    # Request models
    "SearchRequest",
    "ViewportBounds",
    # Response models
    "HealthResponse",
    "PaginatedResponse",
    "SearchResponse",
]
