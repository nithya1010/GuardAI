"""Application configuration for GuardAI.

Environment values are loaded from a local .env file when present so the
application can be configured safely across environments.
"""

from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Typed application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    project_name: str = Field(default="GuardAI")
    api_title: str = Field(default="GuardAI API")
    api_description: str = Field(default="AI Powered Data Center Guardian Backend")
    version: str = Field(default="1.0.0")
    api_prefix: str = Field(default="")
    cors_origins: list[str] = Field(default_factory=lambda: ["*"])
    cors_methods: list[str] = Field(default_factory=lambda: ["*"])
    cors_headers: list[str] = Field(default_factory=lambda: ["*"])
    log_level: str = Field(default="INFO")


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return a cached settings object for the current process."""

    return Settings()
