from fastapi import APIRouter
from datetime import datetime, timezone
from app.services.market_data import MarketDataService
from app.schemas.domain import MarketSummaryResponse, MarketMoversResponse, MarketIndex

router = APIRouter(prefix="/api/v1/market", tags=["Market"])

@router.get("/summary", response_model=MarketSummaryResponse)
def get_market_summary():
    indices_raw = MarketDataService.get_market_indices()
    indices = [MarketIndex(**item) for item in indices_raw]
    
    # Calculate top metrics
    sp500 = next((idx for idx in indices if idx.symbol == "^GSPC"), None)
    vix = next((idx for idx in indices if idx.symbol == "^VIX"), None)

    return MarketSummaryResponse(
        indices=indices,
        market_sentiment="Bullish Expansion" if (sp500 and sp500.change_percent >= 0) else "Consolidating Caution",
        volatility_index=vix.price if vix else 16.5,
        sp500_change_percent=sp500.change_percent if sp500 else 0.45,
        top_briefing="Broad US equity indices advance amid healthy corporate cashflows and stable Treasury yields.",
        updated_at=datetime.now(timezone.utc).isoformat()
    )

@router.get("/movers", response_model=MarketMoversResponse)
def get_market_movers():
    data = MarketDataService.get_market_movers()
    return MarketMoversResponse(**data)
