"""
GeoJSON endpoints - geographic data for map rendering.
"""

from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse

from app.models.geojson import CommunesGeoJSON
from app.models.requests import SearchRequest
from app.services.geojson_service import GeoJSONService

router = APIRouter()

# Service instance
geojson_service = GeoJSONService()


@router.get(
    "/communes",
    response_model=CommunesGeoJSON,
    summary="GeoJSON des communes",
    description="Retourne les données géographiques des communes au format GeoJSON.",
)
async def get_communes_geojson(
    min_score: float = Query(default=0, ge=0, le=100, description="Score minimum"),
    simplified: bool = Query(default=True, description="Géométries simplifiées pour performance"),
) -> JSONResponse:
    """
    Get communes as GeoJSON for map rendering.

    Returns a FeatureCollection with commune polygons and properties.
    Use simplified=true for better performance with many communes.
    """
    geojson = await geojson_service.get_communes_geojson(
        min_score=min_score,
        simplified=simplified,
    )

    return JSONResponse(
        content=geojson.model_dump(),
        media_type="application/geo+json",
    )


@router.post(
    "/communes/search",
    response_model=CommunesGeoJSON,
    summary="GeoJSON filtré des communes",
    description="Retourne les données géographiques des communes filtrées.",
)
async def get_filtered_communes_geojson(
    request: SearchRequest,
    simplified: bool = Query(default=True, description="Géométries simplifiées"),
) -> JSONResponse:
    """
    Get filtered communes as GeoJSON.

    Same as the regular search but returns GeoJSON format for direct map use.
    """
    geojson = await geojson_service.get_filtered_communes_geojson(
        request=request,
        simplified=simplified,
    )

    return JSONResponse(
        content=geojson.model_dump(),
        media_type="application/geo+json",
    )
