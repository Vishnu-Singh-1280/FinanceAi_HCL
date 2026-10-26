from fastapi import APIRouter
from datetime import datetime, timezone
from app.config import settings
from app.schemas.domain import SettingsResponse, SettingsUpdateRequest

router = APIRouter(prefix="/api/v1/settings", tags=["System Settings & Diagnostics"])

@router.get("", response_model=SettingsResponse)
def get_settings():
    return SettingsResponse(
        ai_provider=settings.AI_PROVIDER,
        available_providers=["local", "openai", "groq", "ollama"],
        openai_configured=bool(settings.OPENAI_API_KEY),
        groq_configured=bool(settings.GROQ_API_KEY),
        ollama_configured=bool(settings.OLLAMA_BASE_URL),
        database_type="SQLite (Local Persistent)" if "sqlite" in settings.DATABASE_URL else "PostgreSQL",
        market_data_provider="Yahoo Finance (yfinance) + Fallback Normalized Cache",
        version="FinanceAI v2.4-Production",
        timestamp=datetime.now(timezone.utc).isoformat()
    )

@router.post("", response_model=SettingsResponse)
def update_settings(req: SettingsUpdateRequest):
    if req.ai_provider:
        settings.AI_PROVIDER = req.ai_provider
    if req.openai_api_key is not None:
        settings.OPENAI_API_KEY = req.openai_api_key
    if req.groq_api_key is not None:
        settings.GROQ_API_KEY = req.groq_api_key
    if req.ollama_base_url is not None:
        settings.OLLAMA_BASE_URL = req.ollama_base_url

    return get_settings()
