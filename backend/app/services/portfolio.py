from typing import Dict, Any, List
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.entities import Portfolio, Transaction
from app.services.market_data import MarketDataService

class PortfolioService:
    @staticmethod
    def get_or_create_portfolio(db: Session, portfolio_id: int = 1) -> Portfolio:
        port = db.query(Portfolio).filter(Portfolio.id == portfolio_id).first()
        if not port:
            port = Portfolio(id=portfolio_id, name="Primary Investment Portfolio", cash_balance=100000.0)
            db.add(port)
            db.commit()
            db.refresh(port)
            
            # Seed initial sample transactions if completely empty so the user immediately sees a live working portfolio
            sample_txs = [
                Transaction(portfolio_id=portfolio_id, symbol="AAPL", asset_type="stock", transaction_type="buy", quantity=50, price=180.0, fees=5.0, notes="Core Tech Allocation"),
                Transaction(portfolio_id=portfolio_id, symbol="MSFT", asset_type="stock", transaction_type="buy", quantity=30, price=395.0, fees=5.0, notes="Enterprise Cloud & AI"),
                Transaction(portfolio_id=portfolio_id, symbol="NVDA", asset_type="stock", transaction_type="buy", quantity=60, price=115.0, fees=5.0, notes="Accelerated Computing"),
                Transaction(portfolio_id=portfolio_id, symbol="SPY", asset_type="etf", transaction_type="buy", quantity=40, price=510.0, fees=0.0, notes="Broad Market Core")
            ]
            for tx in sample_txs:
                db.add(tx)
            db.commit()
            db.refresh(port)
        return port

    @staticmethod
    def add_transaction(db: Session, tx_data: Dict[str, Any]) -> Transaction:
        port_id = tx_data.get("portfolio_id") or 1
        port = PortfolioService.get_or_create_portfolio(db, port_id)
        
        tx = Transaction(
            portfolio_id=port_id,
            symbol=tx_data["symbol"].strip().upper(),
            asset_type=tx_data.get("asset_type", "stock"),
            transaction_type=tx_data["transaction_type"].lower(),
            quantity=float(tx_data["quantity"]),
            price=float(tx_data["price"]),
            fees=float(tx_data.get("fees", 0.0)),
            notes=tx_data.get("notes")
        )
        db.add(tx)
        
        # Adjust cash balance
        total_cost = (tx.quantity * tx.price) + tx.fees
        if tx.transaction_type == "buy":
            port.cash_balance -= total_cost
        elif tx.transaction_type == "sell":
            port.cash_balance += (tx.quantity * tx.price) - tx.fees

        db.commit()
        db.refresh(tx)
        return tx

    @staticmethod
    def get_portfolio_details(db: Session, portfolio_id: int = 1) -> Dict[str, Any]:
        port = PortfolioService.get_or_create_portfolio(db, portfolio_id)
        txs = db.query(Transaction).filter(Transaction.portfolio_id == portfolio_id).order_by(Transaction.transaction_date.asc()).all()

        holdings_map: Dict[str, Dict[str, Any]] = {}

        for tx in txs:
            sym = tx.symbol.upper()
            if sym not in holdings_map:
                holdings_map[sym] = {
                    "symbol": sym,
                    "asset_type": tx.asset_type,
                    "quantity": 0.0,
                    "total_cost": 0.0,
                    "buy_shares": 0.0
                }
            
            if tx.transaction_type == "buy":
                holdings_map[sym]["quantity"] += tx.quantity
                holdings_map[sym]["total_cost"] += (tx.quantity * tx.price) + tx.fees
                holdings_map[sym]["buy_shares"] += tx.quantity
            elif tx.transaction_type == "sell":
                # Average cost basis reduction
                if holdings_map[sym]["quantity"] > 0:
                    avg_cost_per_share = holdings_map[sym]["total_cost"] / holdings_map[sym]["quantity"]
                    cost_reduction = tx.quantity * avg_cost_per_share
                    holdings_map[sym]["total_cost"] = max(0.0, holdings_map[sym]["total_cost"] - cost_reduction)
                holdings_map[sym]["quantity"] = max(0.0, holdings_map[sym]["quantity"] - tx.quantity)

        # Remove zero quantity holdings
        active_holdings = {k: v for k, v in holdings_map.items() if v["quantity"] > 0.001}

        holdings_list = []
        total_market_value = 0.0
        total_cost_basis = 0.0
        sector_allocation: Dict[str, float] = {}

        for sym, h in active_holdings.items():
            qty = h["quantity"]
            tot_cost = h["total_cost"]
            avg_cost = tot_cost / qty if qty > 0 else 0.0

            quote = MarketDataService.get_stock_quote(sym)
            curr_price = float(quote.get("price", avg_cost))
            mkt_val = qty * curr_price
            unreal_pl = mkt_val - tot_cost
            unreal_pl_pct = (unreal_pl / tot_cost) * 100 if tot_cost > 0 else 0.0
            sec = quote.get("sector") or ("ETF" if h["asset_type"] == "etf" else "Technology")

            total_market_value += mkt_val
            total_cost_basis += tot_cost
            sector_allocation[sec] = sector_allocation.get(sec, 0.0) + mkt_val

            holdings_list.append({
                "symbol": sym,
                "asset_type": h["asset_type"],
                "quantity": round(qty, 2),
                "average_cost": round(avg_cost, 2),
                "total_cost": round(tot_cost, 2),
                "current_price": round(curr_price, 2),
                "market_value": round(mkt_val, 2),
                "unrealized_pl": round(unreal_pl, 2),
                "unrealized_pl_pct": round(unreal_pl_pct, 2),
                "weight_pct": 0.0,  # calculated below
                "sector": sec
            })

        # Calculate weights
        for h in holdings_list:
            h["weight_pct"] = round((h["market_value"] / total_market_value) * 100, 2) if total_market_value > 0 else 0.0

        # Sector weights
        for sec in sector_allocation:
            sector_allocation[sec] = round((sector_allocation[sec] / total_market_value) * 100, 2) if total_market_value > 0 else 0.0

        # Concentration check
        max_weight = max([h["weight_pct"] for h in holdings_list], default=0.0)
        if max_weight > 40:
            conc_risk = f"High ({max_weight:.1f}% single asset concentration)"
        elif max_weight > 25:
            conc_risk = f"Moderate ({max_weight:.1f}% top holding)"
        else:
            conc_risk = "Well Diversified (< 25% single holding)"

        total_equity = total_market_value + port.cash_balance
        total_unrealized_pl = total_market_value - total_cost_basis
        total_unrealized_pl_pct = (total_unrealized_pl / total_cost_basis) * 100 if total_cost_basis > 0 else 0.0

        # Daily change approximation
        daily_change = sum([h["market_value"] * (MarketDataService.get_stock_quote(h["symbol"]).get("change_percent", 0.0) / 100) for h in holdings_list])
        daily_change_pct = (daily_change / total_market_value) * 100 if total_market_value > 0 else 0.0

        return {
            "id": port.id,
            "name": port.name,
            "cash_balance": round(port.cash_balance, 2),
            "total_market_value": round(total_market_value, 2),
            "total_cost_basis": round(total_cost_basis, 2),
            "total_equity": round(total_equity, 2),
            "total_unrealized_pl": round(total_unrealized_pl, 2),
            "total_unrealized_pl_pct": round(total_unrealized_pl_pct, 2),
            "daily_change": round(daily_change, 2),
            "daily_change_pct": round(daily_change_pct, 2),
            "holdings": holdings_list,
            "sector_allocation": sector_allocation,
            "concentration_risk": conc_risk,
            "transactions_count": len(txs)
        }
