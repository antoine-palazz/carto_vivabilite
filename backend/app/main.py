"""
FastAPI application entry point.
"""

import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

from app.api.v1.router import api_router
from app.core.config import settings

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
    """
    Application lifespan handler.

    Initialize resources on startup and cleanup on shutdown.
    """
    # Startup: Pre-warm geometry cache
    logger.info("Starting up - pre-warming geometry cache...")
    try:
        from app.services.geojson_service import GeoJSONService

        service = GeoJSONService()
        # Trigger the simplification and caching at startup
        service._get_communes_geojson_base(simplified=True)
        logger.info("Geometry cache warmed successfully")
    except Exception as e:
        logger.warning(f"Failed to pre-warm geometry cache: {e}")

    yield
    # Shutdown: Close connections, cleanup resources
    logger.info("Shutting down...")


def create_application() -> FastAPI:
    """
    Create and configure the FastAPI application.
    """
    app = FastAPI(
        title=settings.PROJECT_NAME,
        description="""
        ## API de la Carte de Vivabilité

        Cette API permet de rechercher et analyser la vivabilité des communes françaises
        selon différents critères : proximité à la mer, aux montagnes, qualité de l'air,
        accès aux soins, transports, emploi, etc.

        ### Fonctionnalités

        - **Recherche de communes** : Filtrage par critères multiples
        - **Calcul de scores** : Score global personnalisé selon vos préférences
        - **Données géographiques** : Export GeoJSON pour l'affichage cartographique
        """,
        version=settings.VERSION,
        openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
        docs_url=f"{settings.API_V1_PREFIX}/docs",
        redoc_url=f"{settings.API_V1_PREFIX}/redoc",
        lifespan=lifespan,
    )

    # Configure GZip compression for large responses (especially GeoJSON)
    # Responses larger than 1KB will be compressed
    app.add_middleware(GZipMiddleware, minimum_size=1000)

    # Configure CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include API router
    app.include_router(api_router, prefix=settings.API_V1_PREFIX)

    return app


# Create application instance
app = create_application()


@app.get("/", tags=["Root"])
async def root() -> dict[str, str]:
    """
    Root endpoint - API information.
    """
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": f"{settings.API_V1_PREFIX}/docs",
    }
