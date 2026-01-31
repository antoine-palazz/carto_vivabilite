"""
Climate data integration service.

Provides high-level API for loading and processing Météo France climate data.
"""

from pathlib import Path
from typing import Any

import geopandas as gpd
import numpy as np
import pandas as pd

from app.data.loaders.point_grid import PointGridLoader
from app.data.processors.raster import RasterProcessor
from app.data.processors.vector import VectorProcessor


class ClimateService:
    """
    Service for loading and processing Météo France climate data.

    Provides:
    - Loading climate projections grid
    - Aggregating to commune polygons
    - Computing composite climate scores
    """

    # Climate indicators and their score mappings
    CLIMATE_INDICATORS = {
        # Extreme heat indicators (lower = better)
        "NORTX35D_yr": {
            "name": "Jours >= 35°C",
            "weight": 1.5,  # High weight for extreme heat
            "invert": True,
            "max_value": 30,  # Max expected days
        },
        "NORTX30D_yr": {
            "name": "Jours >= 30°C",
            "weight": 1.0,
            "invert": True,
            "max_value": 90,
        },
        "NORTR_yr": {
            "name": "Nuits tropicales",
            "weight": 1.0,
            "invert": True,
            "max_value": 100,
        },
        # Fire risk (lower = better)
        "NORIFM40_yr": {
            "name": "Jours risque incendie élevé",
            "weight": 1.5,
            "invert": True,
            "max_value": 60,
        },
        # Extreme precipitation (lower = better)
        "NORRx1d_yr": {
            "name": "Intensité précipitations max",
            "weight": 0.5,
            "invert": True,
            "max_value": 100,
        },
        "NORRRq99refD_yr": {
            "name": "Fréquence précipitations extrêmes",
            "weight": 0.5,
            "invert": True,
            "max_value": 10,
        },
        # Temperature change anomalies (lower = better for stability)
        "ATMm_yr": {
            "name": "Écart température moyenne",
            "weight": 0.5,
            "invert": True,
            "max_value": 4,
        },
    }

    def __init__(self) -> None:
        """Initialize the climate service."""
        self._climate_data: gpd.GeoDataFrame | None = None
        self._indicators = self.CLIMATE_INDICATORS.copy()

    def load_climate_projections(
        self,
        path: str | Path,
    ) -> gpd.GeoDataFrame:
        """
        Load Météo France climate projections grid.

        Args:
            path: Path to climate data file

        Returns:
            GeoDataFrame with climate indicators at each grid point
        """
        self._climate_data = PointGridLoader.load_meteo_france(path)
        return self._climate_data

    def get_climate_data(self) -> gpd.GeoDataFrame | None:
        """Get the loaded climate data."""
        return self._climate_data

    def aggregate_to_communes(
        self,
        communes_gdf: gpd.GeoDataFrame,
        climate_gdf: gpd.GeoDataFrame | None = None,
        indicators: list[str] | None = None,
        aggregation: str = "mean",
    ) -> gpd.GeoDataFrame:
        """
        Aggregate climate indicators to commune polygons.

        Each commune gets the mean/median of all climate grid points within it.

        Args:
            communes_gdf: Communes GeoDataFrame
            climate_gdf: Climate data (uses loaded data if None)
            indicators: Indicators to aggregate (all if None)
            aggregation: Aggregation method ('mean', 'median', 'max')

        Returns:
            Communes with aggregated climate indicators
        """
        if climate_gdf is None:
            climate_gdf = self._climate_data
        if climate_gdf is None:
            raise ValueError("No climate data loaded. Call load_climate_projections first.")

        # Default to all known indicators
        if indicators is None:
            indicators = [
                col for col in self._indicators.keys()
                if col in climate_gdf.columns
            ]

        # Validate indicators exist
        missing = [ind for ind in indicators if ind not in climate_gdf.columns]
        if missing:
            raise ValueError(f"Indicators not found in climate data: {missing}")

        # Aggregate points to communes
        result = VectorProcessor.aggregate_points_to_polygons(
            climate_gdf,
            communes_gdf,
            value_columns=indicators,
            agg_func=aggregation,
        )

        return result

    def compute_indicator_scores(
        self,
        communes_with_climate: gpd.GeoDataFrame,
        indicators: list[str] | None = None,
    ) -> gpd.GeoDataFrame:
        """
        Convert raw climate values to normalized scores (0-100).

        Args:
            communes_with_climate: Communes with aggregated climate data
            indicators: Indicators to score (all available if None)

        Returns:
            GeoDataFrame with score columns added
        """
        result = communes_with_climate.copy()

        if indicators is None:
            indicators = [
                ind for ind in self._indicators.keys()
                if ind in communes_with_climate.columns
            ]

        for indicator in indicators:
            if indicator not in result.columns:
                continue

            config = self._indicators.get(indicator, {})

            # Get values
            values = result[indicator].values

            # Convert to score
            scores = RasterProcessor.value_to_score(
                values,
                min_value=0,
                max_value=config.get("max_value"),
                invert=config.get("invert", False),
            )

            result[f"score_{indicator}"] = scores

        return result

    def compute_climate_score(
        self,
        communes_with_scores: gpd.GeoDataFrame,
        custom_weights: dict[str, float] | None = None,
    ) -> pd.Series:
        """
        Compute composite climate score from individual indicator scores.

        Args:
            communes_with_scores: Communes with individual indicator scores
            custom_weights: Optional custom weights (uses defaults if None)

        Returns:
            Series with composite climate scores (0-100)
        """
        # Find all score columns
        score_cols = [
            col for col in communes_with_scores.columns
            if col.startswith("score_") and col.replace("score_", "") in self._indicators
        ]

        if not score_cols:
            return pd.Series(
                [50.0] * len(communes_with_scores),
                index=communes_with_scores.index
            )

        # Get weights
        weights = []
        for col in score_cols:
            indicator = col.replace("score_", "")
            if custom_weights and indicator in custom_weights:
                weights.append(custom_weights[indicator])
            else:
                weights.append(self._indicators.get(indicator, {}).get("weight", 1.0))

        # Normalize weights
        total_weight = sum(weights)
        if total_weight == 0:
            normalized_weights = [1.0 / len(weights)] * len(weights)
        else:
            normalized_weights = [w / total_weight for w in weights]

        # Compute weighted average
        score_values = communes_with_scores[score_cols].values

        # Handle NaN values
        score_values = np.nan_to_num(score_values, nan=50.0)

        composite_score = np.average(score_values, axis=1, weights=normalized_weights)

        return pd.Series(composite_score, index=communes_with_scores.index)

    def process_full_pipeline(
        self,
        climate_path: str | Path,
        communes_gdf: gpd.GeoDataFrame,
    ) -> gpd.GeoDataFrame:
        """
        Run the complete climate processing pipeline.

        1. Load climate data
        2. Aggregate to communes
        3. Compute indicator scores
        4. Compute composite climate score

        Args:
            climate_path: Path to Météo France data file
            communes_gdf: Communes GeoDataFrame

        Returns:
            Communes with climate scores
        """
        # 1. Load climate data
        climate_gdf = self.load_climate_projections(climate_path)

        # 2. Aggregate to communes
        result = self.aggregate_to_communes(communes_gdf, climate_gdf)

        # 3. Compute individual scores
        result = self.compute_indicator_scores(result)

        # 4. Compute composite score
        result["score_climat"] = self.compute_climate_score(result)

        return result

    def get_indicator_info(self) -> dict[str, dict[str, Any]]:
        """
        Get information about available climate indicators.

        Returns:
            Dictionary with indicator metadata
        """
        return self._indicators.copy()
