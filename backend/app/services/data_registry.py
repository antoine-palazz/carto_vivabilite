"""
Data Registry Service - Central management of data sources.

Loads and manages datasets based on the manifest.json configuration.
Provides a single source of truth for available filters and data.
"""

import json
from pathlib import Path
from typing import Any

from pydantic import BaseModel


class FilterDefinition(BaseModel):
    """Definition of a filter from manifest."""

    id: str
    name: str
    description: str
    column: str
    invert: bool = False
    icon: str = "📊"
    unit: str | None = None
    weight_default: int = 50
    optimal_range: list[float] | None = None

    # Runtime fields
    dataset_id: str = ""


class DatasetDefinition(BaseModel):
    """Definition of a dataset from manifest."""

    id: str
    name: str
    description: str = ""
    file: str
    type: str  # "point_grid", "shapefile", "csv"
    format: str = "auto"  # "meteo_france", "auto"
    enabled: bool = True
    filters: list[FilterDefinition] = []


class CommunesConfig(BaseModel):
    """Configuration for communes data."""

    file: str | None = None
    layer: str | None = None  # Layer name for GeoPackage files
    id_column: str = "code_insee"
    name_column: str = "nom"
    population_column: str = "population"
    department_column: str = "departement"
    region_column: str = "region"


class ReferenceData(BaseModel):
    """Reference data configuration."""

    regions: list[dict[str, str]] = []
    departements_file: str | None = None


class Manifest(BaseModel):
    """Complete manifest structure."""

    version: str = "1.0"
    description: str = ""
    communes: CommunesConfig = CommunesConfig()
    datasets: list[DatasetDefinition] = []
    reference_data: ReferenceData = ReferenceData()


class DataRegistry:
    """
    Central registry for all data sources.

    Loads manifest.json and provides access to:
    - Available filter categories
    - Dataset configurations
    - Communes configuration
    - Loaded data (cached)
    """

    def __init__(self, data_dir: str | Path | None = None):
        """
        Initialize the registry.

        Args:
            data_dir: Path to data directory (defaults to backend/data/)
        """
        if data_dir is None:
            # Default to backend/data/ relative to this file
            self._data_dir = Path(__file__).parent.parent.parent / "data"
        else:
            self._data_dir = Path(data_dir)

        self._manifest: Manifest | None = None
        self._filters_cache: list[FilterDefinition] | None = None
        self._datasets_cache: dict[str, Any] = {}

    @property
    def data_dir(self) -> Path:
        """Get the data directory path."""
        return self._data_dir

    def _load_manifest(self) -> Manifest:
        """Load and parse the manifest.json file."""
        if self._manifest is not None:
            return self._manifest

        manifest_path = self._data_dir / "manifest.json"

        if not manifest_path.exists():
            # Return empty manifest if file doesn't exist
            self._manifest = Manifest()
            return self._manifest

        with open(manifest_path, encoding="utf-8") as f:
            data = json.load(f)

        # Parse datasets and attach dataset_id to filters
        datasets = []
        for ds_data in data.get("datasets", []):
            filters = []
            for f_data in ds_data.get("filters", []):
                filter_def = FilterDefinition(**f_data, dataset_id=ds_data["id"])
                filters.append(filter_def)
            ds_data["filters"] = filters
            datasets.append(DatasetDefinition(**ds_data))

        data["datasets"] = datasets
        self._manifest = Manifest(**data)
        return self._manifest

    def get_manifest(self) -> Manifest:
        """Get the loaded manifest."""
        return self._load_manifest()

    def get_available_filters(self) -> list[FilterDefinition]:
        """
        Get all available filter categories from enabled datasets.

        Returns:
            List of FilterDefinition objects
        """
        if self._filters_cache is not None:
            return self._filters_cache

        manifest = self._load_manifest()
        filters = []

        for dataset in manifest.datasets:
            if not dataset.enabled:
                continue

            # Check if file exists
            file_path = self._data_dir / dataset.file
            if not file_path.exists():
                continue

            filters.extend(dataset.filters)

        self._filters_cache = filters
        return filters

    def get_filter_by_id(self, filter_id: str) -> FilterDefinition | None:
        """Get a specific filter by ID."""
        for f in self.get_available_filters():
            if f.id == filter_id:
                return f
        return None

    def get_dataset(self, dataset_id: str) -> DatasetDefinition | None:
        """Get a dataset definition by ID."""
        manifest = self._load_manifest()
        for ds in manifest.datasets:
            if ds.id == dataset_id:
                return ds
        return None

    def get_enabled_datasets(self) -> list[DatasetDefinition]:
        """Get all enabled datasets with existing files."""
        manifest = self._load_manifest()
        result = []

        for dataset in manifest.datasets:
            if not dataset.enabled:
                continue

            file_path = self._data_dir / dataset.file
            if file_path.exists():
                result.append(dataset)

        return result

    def get_communes_config(self) -> CommunesConfig:
        """Get communes configuration."""
        return self._load_manifest().communes

    def has_communes_data(self) -> bool:
        """Check if communes shapefile is available."""
        config = self.get_communes_config()
        if config.file is None:
            return False

        file_path = self._data_dir / config.file
        return file_path.exists()

    def get_communes_file_path(self) -> Path | None:
        """Get the full path to the communes file."""
        config = self.get_communes_config()
        if config.file is None:
            return None
        return self._data_dir / config.file

    def load_communes_gdf(self) -> Any:
        """
        Load communes as a GeoDataFrame.

        Returns None if communes data is not available or geopandas is not installed.
        The GeoDataFrame is cached for performance.
        """
        if "communes_gdf" in self._datasets_cache:
            return self._datasets_cache["communes_gdf"]

        if not self.has_communes_data():
            return None

        try:
            import geopandas as gpd

            config = self.get_communes_config()
            file_path = self._data_dir / config.file

            # Load GeoPackage with layer name if specified
            if config.layer:
                gdf = gpd.read_file(file_path, layer=config.layer)
            else:
                gdf = gpd.read_file(file_path)

            self._datasets_cache["communes_gdf"] = gdf
            return gdf
        except ImportError:
            return None
        except Exception as e:
            print(f"Error loading communes: {e}")
            return None

    def get_regions(self) -> list[dict[str, str]]:
        """Get reference regions data."""
        return self._load_manifest().reference_data.regions

    def get_departements(self) -> list[dict[str, str]]:
        """
        Get reference departements data.

        TODO: Load from file if departements_file is specified.
        """
        # For now, return empty - will be loaded from communes shapefile
        return []

    def get_dataset_file_path(self, dataset_id: str) -> Path | None:
        """Get the full path to a dataset file."""
        dataset = self.get_dataset(dataset_id)
        if dataset is None:
            return None

        return self._data_dir / dataset.file

    def load_dataset_data(self, dataset_id: str) -> Any:
        """
        Load and cache dataset data.

        Returns DataFrame or GeoDataFrame depending on dataset type.
        """
        if dataset_id in self._datasets_cache:
            return self._datasets_cache[dataset_id]

        dataset = self.get_dataset(dataset_id)
        if dataset is None:
            return None

        file_path = self._data_dir / dataset.file
        if not file_path.exists():
            return None

        # Load based on type and format
        if dataset.type == "point_grid":
            if dataset.format == "meteo_france":
                from app.data.loaders.tabular import TabularLoader
                data = TabularLoader.load_meteo_france(file_path)
            else:
                from app.data.loaders.tabular import TabularLoader
                data = TabularLoader.load(file_path)
        elif dataset.type == "csv":
            from app.data.loaders.tabular import TabularLoader
            data = TabularLoader.load(file_path)
        else:
            # Shapefile or other - requires geospatial dependencies
            try:
                from app.data.loaders import ShapefileLoader
                data = ShapefileLoader.load(file_path)
            except ImportError:
                return None

        self._datasets_cache[dataset_id] = data
        return data

    def clear_cache(self) -> None:
        """Clear all cached data."""
        self._manifest = None
        self._filters_cache = None
        self._datasets_cache.clear()

    def get_filter_categories_for_api(self) -> list[dict[str, Any]]:
        """
        Get filter categories formatted for API response.

        Returns:
            List of dicts with id, name, description, icon, unit, weight_default
        """
        filters = self.get_available_filters()
        return [
            {
                "id": f.id,
                "name": f.name,
                "description": f.description,
                "icon": f.icon,
                "unit": f.unit,
                "weight_default": f.weight_default,
                "dataset_id": f.dataset_id,
            }
            for f in filters
        ]


# Global registry instance
_registry: DataRegistry | None = None


def get_data_registry() -> DataRegistry:
    """Get the global data registry (singleton)."""
    global _registry
    if _registry is None:
        _registry = DataRegistry()
    return _registry


def reset_data_registry() -> None:
    """Reset the global data registry."""
    global _registry
    if _registry is not None:
        _registry.clear_cache()
    _registry = None
