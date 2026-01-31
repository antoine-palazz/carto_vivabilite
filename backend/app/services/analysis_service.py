"""
Spatial analysis service.

Provides high-level analysis operations combining multiple processors.
"""

from typing import Any

import geopandas as gpd
import pandas as pd

from app.data.layers import get_layer_registry
from app.data.processors import RasterProcessor, ScoreProcessor, VectorProcessor


class AnalysisService:
    """
    High-level spatial analysis service.

    Provides:
    - Distance calculations
    - Raster sampling
    - Score computation
    - Data export
    """

    def __init__(self) -> None:
        """Initialize with global layer registry."""
        self.registry = get_layer_registry()
        self.score_processor = ScoreProcessor(self.registry)

    def compute_sea_distances(
        self,
        communes_gdf: gpd.GeoDataFrame | None = None,
    ) -> pd.DataFrame:
        """
        Compute distance to sea for all communes.

        Args:
            communes_gdf: Communes GeoDataFrame (loaded from registry if None)

        Returns:
            DataFrame with code_insee and distance_mer columns
        """
        if communes_gdf is None:
            communes_layer = self.registry.get_communes()
            if communes_layer is None:
                raise ValueError("No communes layer registered")
            communes_gdf = communes_layer.load()

        coastline = self.registry.get_vector("coastline")
        if coastline is None:
            raise ValueError("Coastline layer not registered")

        coastline_gdf = coastline.load()

        distances = VectorProcessor.calculate_distances(
            communes_gdf, coastline_gdf
        )

        return pd.DataFrame({
            "code_insee": communes_gdf["code_insee"],
            "distance_mer": distances,
        })

    def compute_mountain_distances(
        self,
        communes_gdf: gpd.GeoDataFrame | None = None,
    ) -> pd.DataFrame:
        """
        Compute distance to mountains for all communes.

        Args:
            communes_gdf: Communes GeoDataFrame (loaded from registry if None)

        Returns:
            DataFrame with code_insee and distance_montagne columns
        """
        if communes_gdf is None:
            communes_layer = self.registry.get_communes()
            if communes_layer is None:
                raise ValueError("No communes layer registered")
            communes_gdf = communes_layer.load()

        # Try vector mountain zones first
        mountains = self.registry.get_vector("mountains")
        if mountains:
            mountains_gdf = mountains.load()
            distances = VectorProcessor.calculate_distances(
                communes_gdf, mountains_gdf
            )
            return pd.DataFrame({
                "code_insee": communes_gdf["code_insee"],
                "distance_montagne": distances,
            })

        # Fall back to elevation raster
        elevation = self.registry.get_raster("elevation")
        if elevation:
            result = RasterProcessor.sample_at_centroids(
                elevation.path,
                communes_gdf,
                column_name="elevation",
            )
            return pd.DataFrame({
                "code_insee": result["code_insee"],
                "elevation": result["elevation"],
            })

        raise ValueError("No mountain or elevation layer registered")

    def sample_raster_for_communes(
        self,
        raster_name: str,
        communes_gdf: gpd.GeoDataFrame | None = None,
        method: str = "centroid",
    ) -> pd.DataFrame:
        """
        Sample raster values for all communes.

        Args:
            raster_name: Name of registered raster layer
            communes_gdf: Communes GeoDataFrame (loaded from registry if None)
            method: Sampling method ('centroid' or 'zonal')

        Returns:
            DataFrame with code_insee and sampled values
        """
        if communes_gdf is None:
            communes_layer = self.registry.get_communes()
            if communes_layer is None:
                raise ValueError("No communes layer registered")
            communes_gdf = communes_layer.load()

        raster = self.registry.get_raster(raster_name)
        if raster is None:
            raise ValueError(f"Raster layer not found: {raster_name}")

        if method == "centroid":
            result = RasterProcessor.sample_at_centroids(
                raster.path,
                communes_gdf,
                column_name=raster_name,
            )
        elif method == "zonal":
            result = RasterProcessor.zonal_statistics(
                raster.path,
                communes_gdf,
                stats=["mean"],
            )
            result = result.rename(columns={"zonal_mean": raster_name})
        else:
            raise ValueError(f"Unknown method: {method}")

        return pd.DataFrame({
            "code_insee": result["code_insee"],
            raster_name: result[raster_name],
        })

    def compute_all_scores(
        self,
        weights: dict[str, float] | None = None,
    ) -> gpd.GeoDataFrame:
        """
        Compute all scores for all communes.

        Args:
            weights: Optional custom weights for global score

        Returns:
            GeoDataFrame with all score columns
        """
        result = self.score_processor.compute_all_scores()

        # Recompute global score with custom weights if provided
        if weights:
            result["score_global"] = self.score_processor.compute_weighted_global_score(
                result, weights
            )

        return result

    def export_scores_to_geojson(
        self,
        gdf: gpd.GeoDataFrame,
        simplify: float | None = 0.001,
        properties: list[str] | None = None,
    ) -> dict[str, Any]:
        """
        Export scores GeoDataFrame to GeoJSON format.

        Args:
            gdf: GeoDataFrame with scores
            simplify: Geometry simplification tolerance (None to disable)
            properties: Properties to include (None for all)

        Returns:
            GeoJSON dictionary
        """
        from app.data.loaders import ShapefileLoader

        # Default properties if not specified
        if properties is None:
            properties = [
                "code_insee", "nom", "population",
                "score_global",
            ] + [col for col in gdf.columns if col.startswith("score_")]

        return ShapefileLoader.to_geojson(
            gdf,
            properties=properties,
            simplify_tolerance=simplify,
        )

    def get_commune_detail(
        self,
        code_insee: str,
        scores_gdf: gpd.GeoDataFrame | None = None,
    ) -> dict[str, Any] | None:
        """
        Get detailed information for a single commune.

        Args:
            code_insee: INSEE code of the commune
            scores_gdf: Pre-computed scores (computed if None)

        Returns:
            Dictionary with commune info and scores
        """
        if scores_gdf is None:
            scores_gdf = self.compute_all_scores()

        commune = scores_gdf[scores_gdf["code_insee"] == code_insee]
        if len(commune) == 0:
            return None

        row = commune.iloc[0]

        # Extract score columns
        scores = {}
        for col in commune.columns:
            if col.startswith("score_") and col != "score_global":
                category = col.replace("score_", "")
                scores[category] = float(row[col])

        # Get centroid coordinates
        centroid = row.geometry.centroid

        return {
            "code_insee": row["code_insee"],
            "nom": row.get("nom", ""),
            "departement": row.get("departement", ""),
            "departement_code": row.get("departement_code", ""),
            "region": row.get("region", ""),
            "region_code": row.get("region_code", ""),
            "population": int(row.get("population", 0)),
            "coordinates": {
                "lat": centroid.y,
                "lng": centroid.x,
            },
            "scores": scores,
            "score_global": float(row["score_global"]),
        }
