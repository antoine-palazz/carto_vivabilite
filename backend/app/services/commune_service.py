"""
Commune service - business logic for commune operations.

Uses DataRegistry to load commune data from shapefiles and compute
scores based on available datasets in the manifest.
"""

import time
from typing import Any

from app.models.commune import (
    CommuneDetail,
    CommuneSummary,
)
from app.models.requests import SearchRequest
from app.models.responses import PaginatedResponse, SearchResponse
from app.services.data_registry import get_data_registry


class CommuneService:
    """Service for commune-related operations."""

    def __init__(self) -> None:
        """Initialize service with data registry."""
        self.registry = get_data_registry()

    def _get_available_filters(self) -> list[str]:
        """Get list of available filter IDs."""
        return [f.id for f in self.registry.get_available_filters()]

    def _calculate_global_score(
        self,
        scores: dict[str, float],
        weights: dict[str, float],
    ) -> float:
        """
        Calculate weighted global score.

        Args:
            scores: Dict of filter_id -> score (0-100)
            weights: Dict of filter_id -> weight (0-100)

        Returns:
            Weighted average score (0-100)
        """
        total_weight = 0.0
        weighted_sum = 0.0

        for filter_id, weight in weights.items():
            if filter_id in scores and weight > 0:
                weighted_sum += scores[filter_id] * weight
                total_weight += weight

        if total_weight == 0:
            return 50.0  # Default neutral score

        return weighted_sum / total_weight

    def _get_default_weights(self) -> dict[str, float]:
        """Get default weights for all available filters."""
        filters = self.registry.get_available_filters()
        return {f.id: float(f.weight_default) for f in filters}

    async def list_communes(
        self,
        limit: int = 50,
        offset: int = 0,
        sort_by: str = "score_global",
        order: str = "desc",
    ) -> PaginatedResponse[CommuneSummary]:
        """
        List communes with pagination.

        Returns empty list if communes data is not yet available.
        """
        # Check if communes data is available
        if not self.registry.has_communes_data():
            return PaginatedResponse(
                data=[],
                total=0,
                limit=limit,
                offset=offset,
                has_more=False,
            )

        # TODO: Load communes from shapefile and compute scores
        # For now, return empty until communes shapefile is added
        return PaginatedResponse(
            data=[],
            total=0,
            limit=limit,
            offset=offset,
            has_more=False,
        )

    async def get_commune(self, code_insee: str) -> CommuneDetail | None:
        """
        Get detailed commune information.

        Returns None if communes data is not yet available.
        """
        if not self.registry.has_communes_data():
            return None

        # TODO: Load from shapefile and compute scores
        return None

    async def search_communes(self, request: SearchRequest) -> SearchResponse:
        """
        Search communes with custom weights and filters.

        Returns empty results if communes data is not yet available.
        """
        start_time = time.perf_counter()

        if not self.registry.has_communes_data():
            return SearchResponse(
                communes=[],
                total=0,
                execution_time_ms=round((time.perf_counter() - start_time) * 1000, 2),
            )

        # TODO: Load from shapefile, apply filters, compute scores
        execution_time = (time.perf_counter() - start_time) * 1000

        return SearchResponse(
            communes=[],
            total=0,
            execution_time_ms=round(execution_time, 2),
        )

    async def get_data_status(self) -> dict[str, Any]:
        """
        Get status of available data sources.

        Useful for frontend to show loading/waiting state.
        """
        manifest = self.registry.get_manifest()

        return {
            "communes_available": self.registry.has_communes_data(),
            "communes_file": manifest.communes.file,
            "datasets": [
                {
                    "id": ds.id,
                    "name": ds.name,
                    "enabled": ds.enabled,
                    "file_exists": (self.registry.data_dir / ds.file).exists(),
                    "filter_count": len(ds.filters),
                }
                for ds in manifest.datasets
            ],
            "filter_count": len(self.registry.get_available_filters()),
        }
