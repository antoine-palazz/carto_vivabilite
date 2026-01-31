"""
Commune data models.

Scores are now dynamic - keys are filter IDs from the manifest.
"""


from pydantic import BaseModel, ConfigDict, Field


class Coordinates(BaseModel):
    """Geographic coordinates."""

    lat: float = Field(..., ge=-90, le=90, description="Latitude")
    lng: float = Field(..., ge=-180, le=180, description="Longitude")


class CommuneBase(BaseModel):
    """Base commune information."""

    code_insee: str = Field(..., min_length=5, max_length=5, description="Code INSEE de la commune")
    nom: str = Field(..., min_length=1, description="Nom de la commune")
    departement: str = Field(..., description="Nom du département")
    departement_code: str = Field(..., min_length=2, max_length=3, description="Code du département")
    region: str = Field(..., description="Nom de la région")
    region_code: str = Field(..., min_length=2, max_length=3, description="Code de la région")
    population: int = Field(..., ge=0, description="Population de la commune")
    coordinates: Coordinates = Field(..., description="Coordonnées géographiques du centroïde")


# Dynamic scores - keys are filter IDs from manifest
CommuneScores = dict[str, float]


class CommuneSummary(BaseModel):
    """Summary view of a commune for lists."""

    code_insee: str = Field(..., description="Code INSEE")
    nom: str = Field(..., description="Nom de la commune")
    departement: str = Field(..., description="Nom du département")
    score_global: float = Field(..., ge=0, le=100, description="Score global (0-100)")
    coordinates: Coordinates = Field(..., description="Coordonnées")


class CommuneDetail(CommuneBase):
    """Detailed commune information with all scores."""

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "code_insee": "75056",
                "nom": "Paris",
                "departement": "Paris",
                "departement_code": "75",
                "region": "Île-de-France",
                "region_code": "11",
                "population": 2161000,
                "coordinates": {"lat": 48.8566, "lng": 2.3522},
                "scores": {
                    "climat_chaleur_extreme": 75.0,
                    "climat_incendie": 80.0,
                },
                "score_global": 77.5,
            }
        }
    )

    scores: dict[str, float] = Field(
        default_factory=dict,
        description="Scores par catégorie (filter_id -> score 0-100)"
    )
    score_global: float = Field(..., ge=0, le=100, description="Score global pondéré (0-100)")
