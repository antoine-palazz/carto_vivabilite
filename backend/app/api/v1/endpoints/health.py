"""
Health check endpoint.
"""

from datetime import UTC, datetime

from fastapi import APIRouter

from app.core.config import settings
from app.models.responses import HealthResponse

router = APIRouter()


@router.get(
    "",
    response_model=HealthResponse,
    summary="Vérification de l'état de l'API",
    description="Retourne l'état de santé de l'API et des services connectés.",
)
async def health_check() -> HealthResponse:
    """
    Check API health status.

    Returns current health status, version, and timestamp.
    """
    # TODO: Add database health check
    # TODO: Add Redis health check

    return HealthResponse(
        status="healthy",
        version=settings.VERSION,
        timestamp=datetime.now(UTC).isoformat(),
        services={
            "api": "healthy",
            "database": "not_configured",
            "cache": "not_configured",
        },
    )
