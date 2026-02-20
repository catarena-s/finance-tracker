"""
Application configuration
"""

from typing import Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables
    """

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)

    # Project
    PROJECT_NAME: str = "Finance Tracker API"
    API_V1_PREFIX: str = "/api/v1"

    # Database
    DATABASE_URL: str = (
        "postgresql+asyncpg://postgres:postgres@localhost:5432/finance_tracker"
    )

    # Celery / Redis
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"

    # API курсов валют (exchangerate-api.com)
    EXCHANGE_RATE_API_KEY: str = ""
    EXCHANGE_RATE_API_BASE: str = "https://api.exchangerate-api.com/v4/latest"

    # CORS - принимаем строку или список
    CORS_ORIGINS: Union[str, list[str]] = "http://localhost:3000"

    @field_validator("CORS_ORIGINS", mode="after")
    @classmethod
    def parse_cors_origins(cls, v):
        """Parse CORS_ORIGINS from string or list"""
        if isinstance(v, str):
            # Split by comma if it's a comma-separated string
            return [origin.strip() for origin in v.split(",")]
        return v


settings = Settings()
