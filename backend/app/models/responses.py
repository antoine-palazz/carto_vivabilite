"""
Response models for API endpoints.
"""

from typing import Generic, Literal, TypeVar

from pydantic import BaseModel, Field

from app.models.commune import CommuneSummary

T = TypeVar("T")


class HealthResponse(BaseModel):
    """Health check response."""

    status: Literal["healthy", "degraded", "unhealthy"] = Field(
        ..., description="État de santé global"
    )
    version: str = Field(..., description="Version de l'API")
    timestamp: str = Field(..., description="Horodatage ISO 8601")
    services: dict[str, str] = Field(
        default_factory=dict,
        description="État des services individuels",
    )


class PaginatedResponse(BaseModel, Generic[T]):
    """Generic paginated response."""

    data: list[T] = Field(..., description="Liste des résultats")
    total: int = Field(..., ge=0, description="Nombre total de résultats")
    limit: int = Field(..., ge=1, description="Limite par page")
    offset: int = Field(..., ge=0, description="Index de départ")
    has_more: bool = Field(..., description="Indique s'il y a plus de résultats")


class SearchResponse(BaseModel):
    """Response for commune search."""

    communes: list[CommuneSummary] = Field(
        ..., description="Liste des communes correspondantes"
    )
    total: int = Field(..., ge=0, description="Nombre total de résultats")
    execution_time_ms: float = Field(
        ..., ge=0, description="Temps d'exécution en millisecondes"
    )
