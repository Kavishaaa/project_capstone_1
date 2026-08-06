"""Central application configuration.

All settings are read from environment variables (see .env.example at the repo
root). The presence/absence of LLM provider credentials determines whether
the app talks to a real model or falls back to the built-in Mock LLM
Simulator — see app/services/llm_router.py.
"""
from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Database
    database_url: str = "postgresql+psycopg2://exlsmartassist:exlsmartassist@localhost:5432/exlsmartassist"

    # Vector store
    vector_db_path: str = str(BASE_DIR / "data" / "chroma")
    embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2"

    # OpenAI-compatible provider
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"

    # Azure OpenAI provider
    azure_openai_api_key: str = ""
    azure_openai_endpoint: str = ""
    azure_openai_deployment: str = ""
    azure_openai_api_version: str = "2024-05-01-preview"

    # Backend
    cors_origins: str = "http://localhost:5173,http://localhost:3000"
    backend_port: int = 8000

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def has_openai_credentials(self) -> bool:
        return bool(self.openai_api_key)

    @property
    def has_azure_credentials(self) -> bool:
        return bool(
            self.azure_openai_api_key
            and self.azure_openai_endpoint
            and self.azure_openai_deployment
        )

    @property
    def has_live_llm(self) -> bool:
        return self.has_openai_credentials or self.has_azure_credentials


@lru_cache
def get_settings() -> Settings:
    return Settings()
