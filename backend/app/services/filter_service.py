"""
Filter service - provides filter options and metadata.

Uses DataRegistry to dynamically load available filters from manifest.
"""

from app.models.filters import FilterOptions, RangeOption, SelectOption
from app.services.data_registry import get_data_registry


class FilterService:
    """Service for filter-related operations."""

    def __init__(self) -> None:
        """Initialize with data registry."""
        self.registry = get_data_registry()

    async def get_filter_options(self) -> FilterOptions:
        """
        Get available filter options.

        Returns filter categories from manifest and reference data.
        """
        # Get regions from manifest
        regions = self.registry.get_regions()

        # Get departements (from manifest or shapefile)
        departements = self.registry.get_departements()

        # Get score categories from available datasets
        score_categories = [f.id for f in self.registry.get_available_filters()]

        return FilterOptions(
            population_range=RangeOption(min=0, max=2200000),
            departements=[
                SelectOption(code=d["code"], nom=d["nom"])
                for d in departements
            ],
            regions=[
                SelectOption(code=r["code"], nom=r["nom"])
                for r in regions
            ],
            score_categories=score_categories,
        )

    async def get_filter_categories(self) -> list[dict]:
        """
        Get detailed filter categories with metadata.

        Returns list of filter definitions for the frontend.
        """
        return self.registry.get_filter_categories_for_api()

    async def get_default_weights(self) -> dict[str, int]:
        """
        Get default weights for all available filters.

        Returns dict of filter_id -> default weight (0-100).
        """
        filters = self.registry.get_available_filters()
        return {f.id: f.weight_default for f in filters}
