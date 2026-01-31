"""
Request models for API endpoints.

Weights are now dynamic - keys are filter IDs from manifest.
"""

from pydantic import BaseModel, ConfigDict, Field


class ViewportBounds(BaseModel):
    """Geographic viewport bounds for map-based filtering."""

    north: float = Field(..., ge=-90, le=90, description="Latitude nord")
    south: float = Field(..., ge=-90, le=90, description="Latitude sud")
    east: float = Field(..., ge=-180, le=180, description="Longitude est")
    west: float = Field(..., ge=-180, le=180, description="Longitude ouest")


class SearchRequest(BaseModel):
    """Request model for commune search."""

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "weights": {
                    "climat_chaleur_extreme": 80,
                    "climat_incendie": 70,
                    "climat_nuits_tropicales": 50,
                },
                "min_score": 50,
                "population_min": 5000,
                "population_max": 100000,
                "limit": 50,
                "offset": 0,
            }
        }
    )

    # Score weights - dynamic keys (filter IDs)
    weights: dict[str, float] = Field(
        default_factory=dict,
        description="Pondération des filtres (filter_id -> weight 0-100)",
    )

    # Filters
    min_score: float = Field(
        default=0,
        ge=0,
        le=100,
        description="Score global minimum",
    )
    population_min: int | None = Field(
        default=None,
        ge=0,
        description="Population minimum",
    )
    population_max: int | None = Field(
        default=None,
        ge=0,
        description="Population maximum",
    )
    departements: list[str] | None = Field(
        default=None,
        description="Codes des départements à inclure",
    )
    regions: list[str] | None = Field(
        default=None,
        description="Codes des régions à inclure",
    )
    search_query: str | None = Field(
        default=None,
        max_length=100,
        description="Recherche textuelle sur le nom de la commune",
    )

    # Viewport
    bounds: ViewportBounds | None = Field(
        default=None,
        description="Limites géographiques de la vue",
    )

    # Pagination
    limit: int = Field(
        default=50,
        ge=1,
        le=500,
        description="Nombre de résultats",
    )
    offset: int = Field(
        default=0,
        ge=0,
        description="Index de départ",
    )
