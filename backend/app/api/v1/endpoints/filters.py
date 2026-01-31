"""
Filters endpoints - filter options and metadata.
"""

from typing import Any

from fastapi import APIRouter
from pydantic import BaseModel

from app.models.filters import FilterOptions
from app.services.commune_service import CommuneService
from app.services.filter_service import FilterService

router = APIRouter()

# Service instances
filter_service = FilterService()
commune_service = CommuneService()


class FilterCategory(BaseModel):
    """Filter category with metadata."""

    id: str
    name: str
    description: str
    icon: str
    unit: str | None = None
    weight_default: int = 50
    dataset_id: str


class FilterCategoriesResponse(BaseModel):
    """Response containing all available filter categories."""

    categories: list[FilterCategory]
    count: int


class DataStatusResponse(BaseModel):
    """Status of available data sources."""

    communes_available: bool
    communes_file: str | None
    datasets: list[dict[str, Any]]
    filter_count: int
    ready: bool


@router.get(
    "/options",
    response_model=FilterOptions,
    summary="Options de filtrage",
    description="Retourne les options disponibles pour le filtrage des communes.",
)
async def get_filter_options() -> FilterOptions:
    """
    Get available filter options.

    Returns ranges for numerical filters and lists for categorical filters.
    This data is used to populate the filter UI.
    """
    return await filter_service.get_filter_options()


@router.get(
    "/categories",
    response_model=FilterCategoriesResponse,
    summary="Catégories de filtres",
    description="Retourne les catégories de filtres disponibles avec leurs métadonnées.",
)
async def get_filter_categories() -> FilterCategoriesResponse:
    """
    Get available filter categories from datasets.

    Returns filter definitions with name, description, icon, and default weight.
    These are dynamically loaded from the manifest.json and available datasets.
    """
    categories = await filter_service.get_filter_categories()
    return FilterCategoriesResponse(
        categories=[FilterCategory(**c) for c in categories],
        count=len(categories),
    )


@router.get(
    "/defaults",
    summary="Poids par défaut",
    description="Retourne les poids par défaut pour tous les filtres.",
)
async def get_default_weights() -> dict[str, int]:
    """
    Get default weights for all available filters.

    Returns dict of filter_id -> default weight (0-100).
    """
    return await filter_service.get_default_weights()


@router.get(
    "/data-status",
    response_model=DataStatusResponse,
    summary="État des données",
    description="Retourne l'état de disponibilité des sources de données.",
)
async def get_data_status() -> DataStatusResponse:
    """
    Get status of available data sources.

    Shows which datasets are available and if the app is ready to display data.
    """
    status = await commune_service.get_data_status()
    return DataStatusResponse(
        communes_available=status["communes_available"],
        communes_file=status["communes_file"],
        datasets=status["datasets"],
        filter_count=status["filter_count"],
        ready=status["communes_available"] and status["filter_count"] > 0,
    )
