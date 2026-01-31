"""
GeoJSON service - generates geographic data for map rendering.

Loads commune boundaries from GeoPackage and returns as GeoJSON.
Uses topology-preserving simplification for performance.
"""

import logging
from typing import Any

from shapely.geometry import mapping

from app.models.geojson import (
    CommuneFeature,
    CommuneFeatureProperties,
    CommunesGeoJSON,
)
from app.models.requests import SearchRequest
from app.services.data_registry import get_data_registry

logger = logging.getLogger(__name__)


class GeoJSONService:
    """Service for GeoJSON generation with topology-preserving simplification."""

    # Simplification tolerance in meters (like QGIS "Simplify Geometries")
    # 200m provides good balance for France-wide view with 34k+ communes
    SIMPLIFY_TOLERANCE_METERS = 200.0

    def __init__(self) -> None:
        """Initialize service."""
        self.registry = get_data_registry()
        self._simplified_cache: dict[str, Any] = {}
        self._simplification_done = False

    def _simplify_geometries(self, gdf: Any) -> Any:
        """
        Simplify geometries for web rendering.

        Uses Shapely's Douglas-Peucker algorithm which is fast and effective.
        For 34k+ communes, this is much faster than topology-preserving methods.

        Topology issues (small gaps) are not noticeable at country-wide zoom.
        """
        logger.info(
            f"Simplifying {len(gdf)} geometries with {self.SIMPLIFY_TOLERANCE_METERS}m tolerance..."
        )

        # Project to Lambert-93 (France metric CRS) for accurate simplification
        gdf_projected = gdf.to_crs("EPSG:2154")

        # Simplify using Douglas-Peucker with topology preservation
        gdf_projected = gdf_projected.copy()
        gdf_projected["geometry"] = gdf_projected["geometry"].simplify(
            tolerance=self.SIMPLIFY_TOLERANCE_METERS,
            preserve_topology=True,  # Prevents self-intersections
        )

        # Calculate vertex reduction for logging
        original_vertices = sum(
            len(g.exterior.coords) if hasattr(g, "exterior") else 0
            for g in gdf.geometry
        )
        simplified_vertices = sum(
            len(g.exterior.coords) if hasattr(g, "exterior") else 0
            for g in gdf_projected.geometry
        )

        logger.info(
            f"Simplification complete: {original_vertices:,} -> {simplified_vertices:,} vertices "
            f"({100 * (1 - simplified_vertices / max(original_vertices, 1)):.1f}% reduction)"
        )

        # Reproject to WGS84 for web mapping
        return gdf_projected.to_crs("EPSG:4326")

    def _get_communes_geojson_base(self, simplified: bool = True) -> Any:
        """
        Get communes as a GeoDataFrame in WGS84, optionally simplified.

        Uses Douglas-Peucker simplification with 100m tolerance.
        Results are cached for performance.

        Returns None if data is not available.
        """
        cache_key = f"communes_wgs84_{'simplified' if simplified else 'full'}"
        if cache_key in self._simplified_cache:
            return self._simplified_cache[cache_key]

        gdf = self.registry.load_communes_gdf()
        if gdf is None:
            return None

        try:
            gdf_result = (
                self._simplify_geometries(gdf)
                if simplified
                else gdf.to_crs("EPSG:4326")
            )

            self._simplified_cache[cache_key] = gdf_result
            return gdf_result

        except Exception as e:
            logger.error(f"Error processing communes: {e}")
            return None

    async def get_communes_geojson(
        self,
        min_score: float = 0,
        simplified: bool = True,
    ) -> CommunesGeoJSON:
        """
        Get all communes as GeoJSON.

        Returns empty GeoJSON if communes data is not available.
        """
        gdf = self._get_communes_geojson_base(simplified)
        if gdf is None:
            return CommunesGeoJSON(features=[])

        config = self.registry.get_communes_config()
        features: list[CommuneFeature] = []

        for _, row in gdf.iterrows():
            # Get column values safely
            code_insee = str(row.get(config.id_column, ""))
            nom = str(row.get(config.name_column, ""))
            population = int(row.get(config.population_column, 0) or 0)

            # Default score of 50 (neutral) until we compute real scores
            score_global = 50.0

            if score_global < min_score:
                continue

            # Convert geometry to GeoJSON dict
            geom_dict = mapping(row.geometry)

            feature = CommuneFeature(
                properties=CommuneFeatureProperties(
                    code_insee=code_insee,
                    nom=nom,
                    score_global=score_global,
                    population=population,
                ),
                geometry=geom_dict,
            )
            features.append(feature)

        return CommunesGeoJSON(features=features)

    async def get_filtered_communes_geojson(
        self,
        request: SearchRequest,
        simplified: bool = True,
    ) -> CommunesGeoJSON:
        """
        Get filtered communes as GeoJSON.

        Returns empty GeoJSON if communes data is not available.
        """
        gdf = self._get_communes_geojson_base(simplified)
        if gdf is None:
            return CommunesGeoJSON(features=[])

        config = self.registry.get_communes_config()
        features: list[CommuneFeature] = []

        for _, row in gdf.iterrows():
            # Get column values safely
            code_insee = str(row.get(config.id_column, ""))
            nom = str(row.get(config.name_column, ""))
            population = int(row.get(config.population_column, 0) or 0)
            dept_code = str(row.get(config.department_column, ""))
            region_code = str(row.get(config.region_column, ""))

            # Apply filters
            if request.population_min is not None and population < request.population_min:
                continue
            if request.population_max is not None and population > request.population_max:
                continue

            if request.departements and dept_code not in request.departements:
                continue

            if request.regions and region_code not in request.regions:
                continue

            if request.search_query and request.search_query.lower() not in nom.lower():
                continue

            # Viewport bounds filter
            if request.bounds:
                centroid = row.geometry.centroid
                if not (
                    request.bounds.south <= centroid.y <= request.bounds.north
                    and request.bounds.west <= centroid.x <= request.bounds.east
                ):
                    continue

            # Default score of 50 (neutral)
            score_global = 50.0

            if score_global < request.min_score:
                continue

            # Convert geometry to GeoJSON dict
            geom_dict = mapping(row.geometry)

            feature = CommuneFeature(
                properties=CommuneFeatureProperties(
                    code_insee=code_insee,
                    nom=nom,
                    score_global=score_global,
                    population=population,
                ),
                geometry=geom_dict,
            )
            features.append(feature)

        return CommunesGeoJSON(features=features)
