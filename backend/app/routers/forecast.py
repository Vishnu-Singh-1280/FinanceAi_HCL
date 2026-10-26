from fastapi import APIRouter, HTTPException
from app.services.forecasting import ForecastingService
from app.schemas.domain import ForecastRequest, ForecastResponse

router = APIRouter(prefix="/api/v1", tags=["ML Forecasting"])

@router.post("/forecast", response_model=ForecastResponse)
def generate_forecast(req: ForecastRequest):
    try:
        data = ForecastingService.run_forecast(symbol=req.symbol, horizons=req.horizons)
        return ForecastResponse(**data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/forecast/{symbol}", response_model=ForecastResponse)
def get_forecast_for_symbol(symbol: str):
    try:
        data = ForecastingService.run_forecast(symbol=symbol)
        return ForecastResponse(**data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
