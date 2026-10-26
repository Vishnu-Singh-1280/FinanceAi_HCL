import numpy as np
import pandas as pd
from typing import Dict, Any, List
from app.services.market_data import MarketDataService

class PortfolioOptimizerService:
    @staticmethod
    def optimize_portfolio(
        symbols: List[str],
        lookback_days: int = 365,
        risk_free_rate: float = 0.04,
        max_weight: float = 0.50
    ) -> Dict[str, Any]:
        clean_symbols = [s.strip().upper() for s in symbols if s.strip()]
        if len(clean_symbols) < 2:
            raise ValueError("Portfolio optimization requires at least 2 distinct assets")

        # Fetch historical prices for each symbol
        price_dict = {}
        for s in clean_symbols:
            df = MarketDataService.get_stock_history(s, period="1y")
            if not df.empty:
                df["Date"] = pd.to_datetime(df["Date"]).dt.date
                price_dict[s] = df.set_index("Date")["Close"]

        price_df = pd.DataFrame(price_dict).dropna()
        if len(price_df) < 30:
            raise ValueError("Insufficient overlapping price history for selected symbols")

        # Daily percentage returns
        returns_df = price_df.pct_change().dropna()

        # Annualized metrics (252 trading days)
        annual_returns = returns_df.mean() * 252
        cov_matrix = returns_df.cov() * 252
        corr_matrix = returns_df.corr()

        n_assets = len(clean_symbols)
        num_simulations = 1000
        sim_results = []
        frontier_points = []

        np.random.seed(42)
        best_sharpe = -999.0
        best_weights = None
        min_vol = 999.0
        min_vol_weights = None

        for _ in range(num_simulations):
            # Generate random Dirichlet / normalized weights with max_weight cap
            raw_weights = np.random.exponential(scale=1.0, size=n_assets)
            weights = raw_weights / np.sum(raw_weights)
            # Clip weights if above max_weight and renormalize
            weights = np.clip(weights, 0.0, max_weight)
            weights = weights / np.sum(weights)

            # Portfolio expected return & annualized volatility
            port_return = float(np.dot(weights, annual_returns))
            port_volatility = float(np.sqrt(np.dot(weights.T, np.dot(cov_matrix, weights))))
            sharpe = (port_return - risk_free_rate) / port_volatility if port_volatility > 0 else 0.0

            weights_dict = {sym: round(float(weights[i]), 4) for i, sym in enumerate(clean_symbols)}

            if sharpe > best_sharpe:
                best_sharpe = sharpe
                best_weights = weights_dict
                best_ret = port_return
                best_vol = port_volatility

            if port_volatility < min_vol:
                min_vol = port_volatility
                min_vol_weights = weights_dict
                min_vol_ret = port_return

            frontier_points.append({
                "volatility": round(port_volatility, 4),
                "return_rate": round(port_return, 4),
                "sharpe_ratio": round(sharpe, 4),
                "weights": weights_dict
            })

        # Sort frontier sample by volatility for clean chart plotting
        frontier_sorted = sorted(frontier_points, key=lambda x: x["volatility"])
        # Take representative 50 points across curve
        step = max(1, len(frontier_sorted) // 50)
        sampled_frontier = frontier_sorted[::step]

        # Value at Risk (VaR 95%) and CVaR 95% on Max Sharpe portfolio
        optimal_w = np.array([best_weights[s] for s in clean_symbols])
        port_daily_returns = returns_df.dot(optimal_w)
        
        # 95% historical Value at Risk (5th percentile)
        var_95 = float(np.percentile(port_daily_returns, 5))
        cvar_95 = float(port_daily_returns[port_daily_returns <= var_95].mean())
        
        # Sortino Ratio (Downside deviation only)
        downside_returns = port_daily_returns[port_daily_returns < 0]
        downside_std = float(downside_returns.std() * np.sqrt(252)) if len(downside_returns) > 0 else 0.001
        sortino = float((best_ret - risk_free_rate) / downside_std) if downside_std > 0 else 0.0

        # Correlation matrix formatted
        corr_dict = {}
        for col in corr_matrix.columns:
            corr_dict[col] = {row: round(float(corr_matrix.loc[row, col]), 3) for row in corr_matrix.index}

        # Actionable rebalance notes
        rebalance_notes = []
        highest_weight_sym = max(best_weights.items(), key=lambda x: x[1])
        lowest_weight_sym = min(best_weights.items(), key=lambda x: x[1])
        rebalance_notes.append(f"Max Sharpe portfolio allocates highest weight ({highest_weight_sym[1]*100:.1f}%) to {highest_weight_sym[0]} based on superior risk-adjusted return.")
        rebalance_notes.append(f"Lowest allocation ({lowest_weight_sym[1]*100:.1f}%) assigned to {lowest_weight_sym[0]} to minimize cross-asset volatility.")
        rebalance_notes.append(f"1-Day 95% Value at Risk (VaR) is estimated at {abs(var_95)*100:.2f}%, with Conditional VaR (Expected Shortfall) at {abs(cvar_95)*100:.2f}%.")
        rebalance_notes.append("Rebalancing is recommended quarterly or whenever weights drift > 5% from target allocations.")

        return {
            "symbols": clean_symbols,
            "historical_annual_returns": {s: round(float(annual_returns[s]), 4) for s in clean_symbols},
            "historical_volatilities": {s: round(float(np.sqrt(cov_matrix.loc[s, s])), 4) for s in clean_symbols},
            "correlation_matrix": corr_dict,
            "max_sharpe_allocation": best_weights or {},
            "max_sharpe_return": round(float(best_ret), 4),
            "max_sharpe_volatility": round(float(best_vol), 4),
            "max_sharpe_ratio": round(float(best_sharpe), 4),
            "min_volatility_allocation": min_vol_weights or {},
            "min_volatility_return": round(float(min_vol_ret), 4),
            "min_volatility_volatility": round(float(min_vol), 4),
            "min_volatility_sharpe": round(float((min_vol_ret - risk_free_rate) / min_vol), 4),
            "value_at_risk_95": round(abs(var_95), 4),
            "conditional_var_95": round(abs(cvar_95), 4),
            "sortino_ratio": round(sortino, 4),
            "frontier": sampled_frontier,
            "rebalance_notes": rebalance_notes
        }
