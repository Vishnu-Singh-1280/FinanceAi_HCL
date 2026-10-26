from fastapi import APIRouter, HTTPException
from app.services.backtest import BacktestService
from app.schemas.domain import BacktestRequest, BacktestResponse

router = APIRouter(prefix="/api/v1", tags=["Performance & Backtesting"])

@router.post("/backtest", response_model=BacktestResponse)
def run_backtest(req: BacktestRequest):
    try:
        data = BacktestService.run_backtest(
            symbol=req.symbol,
            strategy=req.strategy,
            lookback_days=req.lookback_days,
            initial_capital=req.initial_capital,
            fast_period=req.fast_period,
            slow_period=req.slow_period,
            rsi_oversold=req.rsi_oversold,
            rsi_overbought=req.rsi_overbought,
            transaction_fee_pct=req.transaction_fee_pct
        )
        return BacktestResponse(**data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
