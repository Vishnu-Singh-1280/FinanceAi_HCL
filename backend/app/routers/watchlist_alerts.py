from fastapi import APIRouter, Depends, HTTPException
from typing import List
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.entities import WatchlistItem, PriceAlert
from app.services.market_data import MarketDataService
from app.schemas.domain import (
    WatchlistCreate,
    WatchlistItemResponse,
    AlertCreate,
    AlertResponse
)

router = APIRouter(prefix="/api/v1", tags=["Watchlist & Alerts"])

@router.get("/watchlist", response_model=List[WatchlistItemResponse])
def get_watchlist(db: Session = Depends(get_db)):
    items = db.query(WatchlistItem).order_by(WatchlistItem.added_at.desc()).all()
    # Seed default watchlist if empty
    if not items:
        defaults = ["AAPL", "NVDA", "MSFT", "AMZN"]
        for s in defaults:
            w = WatchlistItem(symbol=s, name=f"{s} Corp")
            db.add(w)
        db.commit()
        items = db.query(WatchlistItem).all()

    resp = []
    for itm in items:
        quote = MarketDataService.get_stock_quote(itm.symbol)
        resp.append(WatchlistItemResponse(
            id=itm.id,
            symbol=itm.symbol,
            name=quote["name"],
            current_price=quote["price"],
            change_pct=quote["change_percent"],
            market_cap=quote["market_cap"],
            added_at=itm.added_at.isoformat()
        ))
    return resp

@router.post("/watchlist", response_model=WatchlistItemResponse)
def add_to_watchlist(req: WatchlistCreate, db: Session = Depends(get_db)):
    clean_sym = req.symbol.strip().upper()
    existing = db.query(WatchlistItem).filter(WatchlistItem.symbol == clean_sym).first()
    if existing:
        quote = MarketDataService.get_stock_quote(clean_sym)
        return WatchlistItemResponse(
            id=existing.id,
            symbol=existing.symbol,
            name=quote["name"],
            current_price=quote["price"],
            change_pct=quote["change_percent"],
            market_cap=quote["market_cap"],
            added_at=existing.added_at.isoformat()
        )

    quote = MarketDataService.get_stock_quote(clean_sym)
    new_item = WatchlistItem(symbol=clean_sym, name=quote["name"], notes=req.notes)
    db.add(new_item)
    db.commit()
    db.refresh(new_item)

    return WatchlistItemResponse(
        id=new_item.id,
        symbol=new_item.symbol,
        name=quote["name"],
        current_price=quote["price"],
        change_pct=quote["change_percent"],
        market_cap=quote["market_cap"],
        added_at=new_item.added_at.isoformat()
    )

@router.delete("/watchlist/{symbol}")
def delete_from_watchlist(symbol: str, db: Session = Depends(get_db)):
    clean_sym = symbol.strip().upper()
    itm = db.query(WatchlistItem).filter(WatchlistItem.symbol == clean_sym).first()
    if not itm:
        raise HTTPException(status_code=404, detail="Symbol not found in watchlist")
    db.delete(itm)
    db.commit()
    return {"status": "success", "removed": clean_sym}

@router.get("/alerts", response_model=List[AlertResponse])
def get_alerts(db: Session = Depends(get_db)):
    alerts = db.query(PriceAlert).order_by(PriceAlert.created_at.desc()).all()
    # Check trigger condition live against market data
    for a in alerts:
        if a.is_active and not a.is_triggered:
            quote = MarketDataService.get_stock_quote(a.symbol)
            curr = quote["price"]
            triggered = False
            if a.condition == "above" and curr >= a.target_value:
                triggered = True
            elif a.condition == "below" and curr <= a.target_value:
                triggered = True

            if triggered:
                a.is_triggered = True
                a.triggered_at = datetime.now(timezone.utc)
                db.commit()

    return [
        AlertResponse(
            id=a.id,
            symbol=a.symbol,
            condition=a.condition,
            target_value=a.target_value,
            is_active=a.is_active,
            is_triggered=a.is_triggered,
            triggered_at=a.triggered_at.isoformat() if a.triggered_at else None,
            message=a.message,
            created_at=a.created_at.isoformat()
        )
        for a in alerts
    ]

@router.post("/alerts", response_model=AlertResponse)
def create_alert(req: AlertCreate, db: Session = Depends(get_db)):
    clean_sym = req.symbol.strip().upper()
    alert = PriceAlert(
        symbol=clean_sym,
        condition=req.condition,
        target_value=float(req.target_value),
        message=req.message or f"Price alert triggered when {clean_sym} goes {req.condition} ${req.target_value:.2f}"
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)

    return AlertResponse(
        id=alert.id,
        symbol=alert.symbol,
        condition=alert.condition,
        target_value=alert.target_value,
        is_active=alert.is_active,
        is_triggered=alert.is_triggered,
        triggered_at=None,
        message=alert.message,
        created_at=alert.created_at.isoformat()
    )

@router.delete("/alerts/{alert_id}")
def delete_alert(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(PriceAlert).filter(PriceAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    db.delete(alert)
    db.commit()
    return {"status": "success", "deleted_id": alert_id}
