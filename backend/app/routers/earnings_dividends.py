from fastapi import APIRouter
from app.services.earnings_dividends import EarningsDividendsService
from app.schemas.domain import EarningsDividendsResponse

router = APIRouter(prefix="/api/v1", tags=["Earnings & Dividends"])

@router.get("/earnings/{symbol}", response_model=EarningsDividendsResponse)
def get_earnings(symbol: str):
    data = EarningsDividendsService.get_earnings_and_dividends(symbol)
    return EarningsDividendsResponse(**data)

@router.get("/dividends/{symbol}", response_model=EarningsDividendsResponse)
def get_dividends(symbol: str):
    data = EarningsDividendsService.get_earnings_and_dividends(symbol)
    return EarningsDividendsResponse(**data)
