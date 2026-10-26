from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.portfolio import PortfolioService
from app.services.optimizer import PortfolioOptimizerService
from app.schemas.domain import (
    PortfolioDetailResponse,
    TransactionCreate,
    TransactionResponse,
    PortfolioOptimizeRequest,
    PortfolioOptimizeResponse
)

router = APIRouter(prefix="/api/v1/portfolio", tags=["Portfolio Management & Optimization"])

@router.get("", response_model=PortfolioDetailResponse)
def get_portfolio(db: Session = Depends(get_db)):
    data = PortfolioService.get_portfolio_details(db)
    return PortfolioDetailResponse(**data)

@router.post("/transactions", response_model=TransactionResponse)
def add_transaction(req: TransactionCreate, db: Session = Depends(get_db)):
    tx = PortfolioService.add_transaction(db, req.model_dump())
    return TransactionResponse(
        id=tx.id,
        portfolio_id=tx.portfolio_id,
        symbol=tx.symbol,
        asset_type=tx.asset_type,
        transaction_type=tx.transaction_type,
        quantity=tx.quantity,
        price=tx.price,
        fees=tx.fees,
        notes=tx.notes,
        transaction_date=tx.transaction_date.isoformat(),
        created_at=tx.created_at.isoformat()
    )

@router.post("/optimize", response_model=PortfolioOptimizeResponse)
def optimize_portfolio(req: PortfolioOptimizeRequest):
    try:
        data = PortfolioOptimizerService.optimize_portfolio(
            symbols=req.symbols,
            lookback_days=req.lookback_days,
            risk_free_rate=req.risk_free_rate,
            max_weight=req.max_weight
        )
        return PortfolioOptimizeResponse(**data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
