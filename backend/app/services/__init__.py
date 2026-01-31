"""
Business logic services.
"""

from app.services.commune_service import CommuneService
from app.services.data_registry import DataRegistry, get_data_registry, reset_data_registry
from app.services.filter_service import FilterService
from app.services.geojson_service import GeoJSONService
from app.services.scoring_service import ScoringService

__all__ = [
    "CommuneService",
    "DataRegistry",
    "FilterService",
    "GeoJSONService",
    "ScoringService",
    "get_data_registry",
    "reset_data_registry",
]

# Geospatial services are optional (require GDAL)
try:
    from app.services.analysis_service import AnalysisService  # noqa: F401
    from app.services.climate_service import ClimateService  # noqa: F401
    from app.services.layer_service import LayerService  # noqa: F401
    __all__.extend(["AnalysisService", "ClimateService", "LayerService"])
except ImportError:
    pass
