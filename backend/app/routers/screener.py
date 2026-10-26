from fastapi import APIRouter, Query
from typing import List, Optional
from app.services.screener import ScreenerService
from app.schemas.domain import ScreenerItem

router = APIRouter(prefix="/api/v1", tags=["Screeners"])

@router.get("/screener", response_model=List[ScreenerItem])
def screen_assets(
    asset_type: str = Query("stock", enum=["stock", "etf"]),
    sector: Optional[str] = Query(None),
    min_pe: Optional[float] = Query(None),
    max_pe: Optional[float] = Query(None),
    min_dividend: Optional[float] = Query(None),
    min_market_cap: Optional[float] = Query(None),
    min_rsi: Optional[float] = Query(None),
    max_rsi: Optional[float] = Query(None),
    search: Optional[str] = Query(None)
):
    results = ScreenerService.screen(
        asset_type=asset_type,
        sector=sector,
        min_pe=min_pe,
        max_pe=max_pe,
        min_dividend=min_dividend,
        min_market_cap=min_market_cap,
        min_rsi=min_rsi,
        max_rsi=max_rsi,
        search=search
    )
    return [ScreenerItem(**r) for r in results]
