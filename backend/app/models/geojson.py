"""
GeoJSON models for map data.
"""

from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field


class CommuneFeatureProperties(BaseModel):
    """Properties for a commune GeoJSON feature."""

    code_insee: str = Field(..., description="Code INSEE")
    nom: str = Field(..., description="Nom de la commune")
    score_global: float = Field(..., description="Score global")
    population: int = Field(..., description="Population")


class CommuneFeature(BaseModel):
    """GeoJSON Feature for a commune."""

    type: Literal["Feature"] = "Feature"
    properties: CommuneFeatureProperties = Field(..., description="Propriétés de la commune")
    geometry: dict[str, Any] = Field(
        ...,
        description="Géométrie de la commune (Polygon ou MultiPolygon)",
    )


class CommunesGeoJSON(BaseModel):
    """GeoJSON FeatureCollection for communes."""

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "type": "FeatureCollection",
                "features": [
                    {
                        "type": "Feature",
                        "properties": {
                            "code_insee": "75056",
                            "nom": "Paris",
                            "score_global": 52.8,
                            "population": 2161000,
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [2.224, 48.902],
                                    [2.47, 48.902],
                                    [2.47, 48.816],
                                    [2.224, 48.816],
                                    [2.224, 48.902],
                                ]
                            ],
                        },
                    }
                ],
            }
        }
    )

    type: Literal["FeatureCollection"] = "FeatureCollection"
    features: list[CommuneFeature] = Field(
        default_factory=list,
        description="Liste des features communes",
    )
