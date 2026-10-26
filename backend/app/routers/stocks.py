from fastapi import APIRouter, HTTPException, Query
from typing import List
from app.services.market_data import MarketDataService
from app.services.technical import TechnicalAnalysisService
from app.services.fundamental import FundamentalAnalysisService
from app.schemas.domain import StockSearchResult, StockQuote, TechnicalAnalysisResponse, FundamentalAnalysisResponse

router = APIRouter(prefix="/api/v1", tags=["Stocks & Analysis"])

@router.get("/stocks/search", response_model=List[StockSearchResult])
def search_stocks(q: str = Query(..., min_length=1)):
    results = MarketDataService.search_symbols(q)
    return [StockSearchResult(**r) for r in results]

@router.get("/stocks/{symbol}", response_model=StockQuote)
def get_stock_quote(symbol: str):
    data = MarketDataService.get_stock_quote(symbol)
    return StockQuote(**data)

@router.get("/technical/{symbol}", response_model=TechnicalAnalysisResponse)
def get_technical_analysis(symbol: str, period: str = "1y"):
    try:
        data = TechnicalAnalysisService.calculate_indicators(symbol, period=period)
        return TechnicalAnalysisResponse(**data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/fundamental/{symbol}", response_model=FundamentalAnalysisResponse)
def get_fundamental_analysis(symbol: str):
    try:
        data = FundamentalAnalysisService.get_fundamentals(symbol)
        return FundamentalAnalysisResponse(**data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
