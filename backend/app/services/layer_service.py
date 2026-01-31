"""
Layer management service.

Provides API interface for the layer registry and data loading.
"""

from typing import Any

from app.data.layers import (
    AttributeTable,
    RasterLayer,
    ScoreMethod,
    VectorLayer,
    get_layer_registry,
)


class LayerService:
    """
    Service for managing data layers.

    Provides high-level API for:
    - Registering and loading layers
    - Configuring score definitions
    - Managing the layer registry
    """

    def __init__(self) -> None:
        """Initialize with global layer registry."""
        self.registry = get_layer_registry()

    def register_communes_shapefile(
        self,
        path: str,
        code_column: str = "code_insee",
        name_column: str = "nom",
    ) -> VectorLayer:
        """
        Register the communes shapefile.

        This is the base layer for all commune operations.

        Args:
            path: Path to communes shapefile
            code_column: Column containing INSEE code
            name_column: Column containing commune name

        Returns:
            Registered VectorLayer
        """
        layer = self.registry.register_vector(
            name="communes",
            path=path,
            description="Communes de France",
            is_communes=True,
        )
        return layer

    def register_coastline(
        self,
        path: str,
        max_distance_km: float = 500,
    ) -> VectorLayer:
        """
        Register coastline shapefile for sea proximity calculation.

        Args:
            path: Path to coastline shapefile
            max_distance_km: Maximum distance for scoring (km)

        Returns:
            Registered VectorLayer
        """
        layer = self.registry.register_vector(
            name="coastline",
            path=path,
            description="Trait de côte français",
        )

        # Define score calculation
        self.registry.define_score(
            category="proximite_mer",
            layer_name="coastline",
            method=ScoreMethod.DISTANCE,
            max_value=max_distance_km * 1000,  # Convert to meters
            description="Proximité à la mer (distance au trait de côte)",
        )

        return layer

    def register_mountains(
        self,
        path: str | None = None,
        elevation_raster: str | None = None,
        max_distance_km: float = 100,
        alpine_threshold: float = 1500,
    ) -> VectorLayer | RasterLayer:
        """
        Register mountain data for mountain proximity calculation.

        Can use either:
        - A shapefile of mountain zones
        - An elevation raster (DEM)

        Args:
            path: Path to mountain zones shapefile
            elevation_raster: Path to elevation raster (alternative)
            max_distance_km: Maximum distance for scoring (km)
            alpine_threshold: Elevation threshold for mountains (m)

        Returns:
            Registered layer
        """
        if path:
            layer = self.registry.register_vector(
                name="mountains",
                path=path,
                description="Zones de montagne",
            )

            self.registry.define_score(
                category="proximite_montagnes",
                layer_name="mountains",
                method=ScoreMethod.DISTANCE,
                max_value=max_distance_km * 1000,
                description="Proximité aux montagnes",
            )

            return layer

        elif elevation_raster:
            layer = self.registry.register_raster(
                name="elevation",
                path=elevation_raster,
                description="Modèle numérique de terrain",
                unit="m",
            )

            self.registry.define_score(
                category="proximite_montagnes",
                layer_name="elevation",
                method=ScoreMethod.POINT_SAMPLE,
                max_value=alpine_threshold,
                description="Altitude (score plus élevé = plus montagneux)",
            )

            return layer

        else:
            raise ValueError("Either path or elevation_raster must be provided")

    def register_pollution_raster(
        self,
        path: str,
        good_threshold: float = 25,
        bad_threshold: float = 100,
    ) -> RasterLayer:
        """
        Register pollution/air quality raster.

        Args:
            path: Path to pollution raster
            good_threshold: Value for good air quality (score = 100)
            bad_threshold: Value for poor air quality (score = 0)

        Returns:
            Registered RasterLayer
        """
        layer = self.registry.register_raster(
            name="pollution",
            path=path,
            description="Indice de qualité de l'air",
        )

        self.registry.define_score(
            category="pollution",
            layer_name="pollution",
            method=ScoreMethod.POINT_SAMPLE,
            min_value=good_threshold,
            max_value=bad_threshold,
            invert=True,  # Lower pollution = higher score
            description="Qualité de l'air",
        )

        return layer

    def register_commune_table(
        self,
        name: str,
        path: str,
        score_columns: dict[str, dict[str, Any]] | None = None,
    ) -> AttributeTable:
        """
        Register a commune attribute table.

        Args:
            name: Table name
            path: Path to CSV/Parquet file
            score_columns: Dict of column -> score config
                Example: {"densite": {"invert": True, "max_value": 10000}}

        Returns:
            Registered AttributeTable
        """
        table = self.registry.register_table(
            name=name,
            path=path,
            description=f"Données communales: {name}",
        )

        # Register score definitions for specified columns
        if score_columns:
            for column, config in score_columns.items():
                self.registry.define_score(
                    category=column,
                    layer_name=name,
                    method=ScoreMethod.NORMALIZED,
                    column=column,
                    invert=config.get("invert", False),
                    min_value=config.get("min_value"),
                    max_value=config.get("max_value"),
                    description=config.get("description", ""),
                )

        return table

    def list_layers(self) -> dict[str, list[dict[str, str]]]:
        """
        List all registered layers with metadata.

        Returns:
            Dictionary with layer types and their info
        """
        layers = self.registry.list_layers()

        result = {
            "vector": [],
            "raster": [],
            "table": [],
        }

        for name in layers["vector"]:
            layer = self.registry.get_vector(name)
            if layer:
                result["vector"].append({
                    "name": name,
                    "path": layer.path,
                    "description": layer.description,
                    "loaded": layer.loaded,
                })

        for name in layers["raster"]:
            layer = self.registry.get_raster(name)
            if layer:
                result["raster"].append({
                    "name": name,
                    "path": layer.path,
                    "description": layer.description,
                    "unit": layer.unit,
                })

        for name in layers["table"]:
            table = self.registry.get_table(name)
            if table:
                result["table"].append({
                    "name": name,
                    "path": table.path,
                    "description": table.description,
                    "loaded": table.loaded,
                })

        return result

    def list_score_definitions(self) -> list[dict[str, Any]]:
        """
        List all score definitions.

        Returns:
            List of score definition info
        """
        result = []

        for category in self.registry.list_score_definitions():
            definition = self.registry.get_score_definition(category)
            if definition:
                result.append({
                    "category": definition.category,
                    "layer_name": definition.layer_name,
                    "method": definition.method.value,
                    "description": definition.description,
                })

        return result
