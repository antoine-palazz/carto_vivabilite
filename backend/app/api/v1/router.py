"""
API v1 router - combines all endpoint routers.
"""

from fastapi import APIRouter

from app.api.v1.endpoints import communes, filters, geojson, health

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(
    health.router,
    prefix="/health",
    tags=["Santé"],
)

api_router.include_router(
    communes.router,
    prefix="/communes",
    tags=["Communes"],
)

api_router.include_router(
    filters.router,
    prefix="/filters",
    tags=["Filtres"],
)

api_router.include_router(
    geojson.router,
    prefix="/geojson",
    tags=["GeoJSON"],
)
