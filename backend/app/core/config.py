"""
Application configuration using Pydantic Settings.
"""

from functools import lru_cache
from typing import Annotated

from pydantic import BeforeValidator
from pydantic_settings import BaseSettings, SettingsConfigDict


def parse_cors_origins(v: str | list[str]) -> list[str]:
    """Parse CORS origins from string or list."""
    if isinstance(v, str):
        return [origin.strip() for origin in v.split(",") if origin.strip()]
    return v


class Settings(BaseSettings):
    """
    Application settings.

    Values are loaded from environment variables or .env file.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # Project info
    PROJECT_NAME: str = "Carte de Vivabilité API"
    VERSION: str = "0.1.0"
    DEBUG: bool = False

    # API configuration
    API_V1_PREFIX: str = "/api/v1"

    # CORS configuration
    CORS_ORIGINS: Annotated[list[str], BeforeValidator(parse_cors_origins)] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    # Server configuration
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    WORKERS: int = 1

    # Database configuration (placeholder)
    # DATABASE_URL: str = "postgresql+asyncpg://user:password@localhost:5432/carto_vivabilite"

    # Redis configuration (placeholder)
    # REDIS_URL: str = "redis://localhost:6379/0"

    # Pagination defaults
    DEFAULT_PAGE_SIZE: int = 50
    MAX_PAGE_SIZE: int = 500


@lru_cache
def get_settings() -> Settings:
    """
    Get cached settings instance.

    Using lru_cache ensures settings are only loaded once.
    """
    return Settings()


# Global settings instance
settings = get_settings()
