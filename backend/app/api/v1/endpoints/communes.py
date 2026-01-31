"""
Communes endpoints - CRUD and search operations.
"""

from fastapi import APIRouter, HTTPException, Query

from app.models.commune import CommuneDetail, CommuneSummary
from app.models.requests import SearchRequest
from app.models.responses import PaginatedResponse, SearchResponse
from app.services.commune_service import CommuneService

router = APIRouter()

# Service instance (will be replaced with dependency injection when DB is ready)
commune_service = CommuneService()


@router.get(
    "",
    response_model=PaginatedResponse[CommuneSummary],
    summary="Liste des communes",
    description="Retourne la liste paginée des communes avec leurs scores.",
)
async def list_communes(
    limit: int = Query(default=50, ge=1, le=500, description="Nombre de résultats par page"),
    offset: int = Query(default=0, ge=0, description="Index de départ"),
    sort_by: str = Query(default="score_global", description="Champ de tri"),
    order: str = Query(default="desc", pattern="^(asc|desc)$", description="Ordre de tri"),
) -> PaginatedResponse[CommuneSummary]:
    """
    List all communes with pagination.

    Communes are returned with their summary information and global score.
    """
    result = await commune_service.list_communes(
        limit=limit,
        offset=offset,
        sort_by=sort_by,
        order=order,
    )
    return result


@router.get(
    "/{code_insee}",
    response_model=CommuneDetail,
    summary="Détail d'une commune",
    description="Retourne les informations détaillées d'une commune avec tous ses scores.",
)
async def get_commune(code_insee: str) -> CommuneDetail:
    """
    Get detailed information for a single commune.

    Returns all available data including individual category scores.
    """
    commune = await commune_service.get_commune(code_insee)

    if commune is None:
        raise HTTPException(
            status_code=404,
            detail=f"Commune avec le code INSEE {code_insee} non trouvée",
        )

    return commune


@router.post(
    "/search",
    response_model=SearchResponse,
    summary="Recherche de communes",
    description="Recherche de communes selon des critères multiples avec pondération personnalisée.",
)
async def search_communes(request: SearchRequest) -> SearchResponse:
    """
    Search communes with custom weights and filters.

    The global score is recalculated using the provided weights.
    Results can be filtered by location, population, and other criteria.
    """
    result = await commune_service.search_communes(request)
    return result
