"""
Filter-related models.

Filter categories are now dynamic - loaded from manifest.
"""

from pydantic import BaseModel, ConfigDict, Field


class ScoreWeight(BaseModel):
    """Weight configuration for a score category."""

    id: str = Field(..., description="ID du filtre")
    weight: float = Field(
        default=50,
        ge=0,
        le=100,
        description="Poids du filtre (0-100)",
    )
    enabled: bool = Field(default=True, description="Filtre activé")


class RangeOption(BaseModel):
    """Range option for numerical filters."""

    min: float = Field(..., description="Valeur minimum")
    max: float = Field(..., description="Valeur maximum")


class SelectOption(BaseModel):
    """Option for select filters."""

    code: str = Field(..., description="Code de l'option")
    nom: str = Field(..., description="Libellé de l'option")


class FilterOptions(BaseModel):
    """Available filter options returned by the API."""

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "population_range": {"min": 0, "max": 2161000},
                "departements": [
                    {"code": "01", "nom": "Ain"},
                    {"code": "02", "nom": "Aisne"},
                ],
                "regions": [
                    {"code": "84", "nom": "Auvergne-Rhône-Alpes"},
                    {"code": "27", "nom": "Bourgogne-Franche-Comté"},
                ],
                "score_categories": [
                    "climat_chaleur_extreme",
                    "climat_incendie",
                ],
            }
        }
    )

    population_range: RangeOption = Field(
        ..., description="Plage de population disponible"
    )
    departements: list[SelectOption] = Field(
        ..., description="Liste des départements disponibles"
    )
    regions: list[SelectOption] = Field(
        ..., description="Liste des régions disponibles"
    )
    score_categories: list[str] = Field(
        ..., description="Liste des IDs de filtres disponibles"
    )
