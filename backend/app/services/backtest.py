from typing import Dict, Any, List
from datetime import datetime, timezone
import numpy as np
import pandas as pd
from app.services.market_data import MarketDataService

class BacktestService:
    @staticmethod
    def run_backtest(
        symbol: str = "AAPL",
        strategy: str = "sma_crossover",
        lookback_days: int = 730,
        initial_capital: float = 10000.0,
        fast_period: int = 20,
        slow_period: int = 50,
        rsi_oversold: int = 30,
        rsi_overbought: int = 70,
        transaction_fee_pct: float = 0.001
    ) -> Dict[str, Any]:
        clean_symbol = symbol.strip().upper()
        df = MarketDataService.get_stock_history(clean_symbol, period="2y")
        if df.empty or len(df) < slow_period + 10:
            raise ValueError(f"Insufficient history to backtest {clean_symbol}")

        df = df.copy()
        close = df["Close"]

        # Strategy indicators
        if strategy == "sma_crossover":
            df["Fast_SMA"] = close.rolling(window=fast_period).mean()
            df["Slow_SMA"] = close.rolling(window=slow_period).mean()
        elif strategy == "rsi_mean_reversion":
            delta = close.diff()
            gain = delta.clip(lower=0).rolling(14).mean()
            loss = (-delta.clip(upper=0)).rolling(14).mean()
            rs = gain / loss.replace(0, np.nan)
            df["RSI"] = 100 - (100 / (1 + rs))

        start_idx = max(slow_period, 20)
        cash = initial_capital
        position_shares = 0.0
        equity_curve = []
        trades = []
        entry_price = 0.0
        entry_date = None

        benchmark_initial_shares = initial_capital / float(df.iloc[start_idx]["Close"])
        peak_equity = initial_capital

        for i in range(start_idx, len(df)):
            curr_row = df.iloc[i]
            curr_price = float(curr_row["Close"])
            curr_date = curr_row["Date"].strftime("%Y-%m-%d") if isinstance(curr_row["Date"], (datetime, pd.Timestamp)) else str(curr_row["Date"])[:10]

            # Signal logic based on previous day to prevent lookahead bias!
            prev_row = df.iloc[i - 1]
            buy_signal = False
            sell_signal = False

            if strategy == "sma_crossover":
                prev_fast = prev_row["Fast_SMA"]
                prev_slow = prev_row["Slow_SMA"]
                p2_row = df.iloc[i - 2]
                # Bullish golden cross
                if prev_fast > prev_slow and p2_row["Fast_SMA"] <= p2_row["Slow_SMA"]:
                    buy_signal = True
                # Bearish death cross
                elif prev_fast < prev_slow and p2_row["Fast_SMA"] >= p2_row["Slow_SMA"]:
                    sell_signal = True
            elif strategy == "rsi_mean_reversion":
                prev_rsi = prev_row["RSI"]
                if prev_rsi < rsi_oversold:
                    buy_signal = True
                elif prev_rsi > rsi_overbought:
                    sell_signal = True

            # Execution logic at current day close
            if buy_signal and position_shares == 0:
                # Buy full allocation
                investable = cash * (1.0 - transaction_fee_pct)
                position_shares = investable / curr_price
                cash = 0.0
                entry_price = curr_price
                entry_date = curr_date

            elif sell_signal and position_shares > 0:
                # Sell full position
                gross = position_shares * curr_price
                net = gross * (1.0 - transaction_fee_pct)
                profit_loss = net - (position_shares * entry_price)
                return_pct = (profit_loss / (position_shares * entry_price)) * 100

                trades.append({
                    "entry_date": entry_date or curr_date,
                    "exit_date": curr_date,
                    "type": "LONG",
                    "entry_price": round(entry_price, 2),
                    "exit_price": round(curr_price, 2),
                    "shares": round(position_shares, 2),
                    "profit_loss": round(profit_loss, 2),
                    "return_pct": round(return_pct, 2)
                })

                cash = net
                position_shares = 0.0
                entry_price = 0.0
                entry_date = None

            current_equity = cash + (position_shares * curr_price)
            if current_equity > peak_equity:
                peak_equity = current_equity
            drawdown_pct = ((current_equity - peak_equity) / peak_equity) * 100 if peak_equity > 0 else 0.0
            benchmark_equity = benchmark_initial_shares * curr_price

            equity_curve.append({
                "date": curr_date,
                "equity": round(current_equity, 2),
                "benchmark_equity": round(benchmark_equity, 2),
                "drawdown_pct": round(drawdown_pct, 2)
            })

        final_equity = equity_curve[-1]["equity"] if equity_curve else initial_capital
        benchmark_final = equity_curve[-1]["benchmark_equity"] if equity_curve else initial_capital

        total_return_pct = ((final_equity - initial_capital) / initial_capital) * 100
        benchmark_return_pct = ((benchmark_final - initial_capital) / initial_capital) * 100

        trading_years = len(equity_curve) / 252.0 if len(equity_curve) > 0 else 1.0
        annualized_return = (((final_equity / initial_capital) ** (1.0 / max(0.2, trading_years))) - 1.0) * 100

        max_dd = min([pt["drawdown_pct"] for pt in equity_curve], default=0.0)

        # Win rate & profit factor
        winning_trades = [t for t in trades if t["profit_loss"] > 0]
        losing_trades = [t for t in trades if t["profit_loss"] <= 0]
        win_rate = (len(winning_trades) / len(trades) * 100) if trades else 0.0

        gross_profit = sum([t["profit_loss"] for t in winning_trades])
        gross_loss = abs(sum([t["profit_loss"] for t in losing_trades]))
        profit_factor = (gross_profit / gross_loss) if gross_loss > 0 else (gross_profit if gross_profit > 0 else 1.0)

        # Sharpe ratio on strategy daily returns
        eq_series = pd.Series([pt["equity"] for pt in equity_curve])
        daily_ret = eq_series.pct_change().dropna()
        ann_std = daily_ret.std() * np.sqrt(252) if len(daily_ret) > 1 else 0.01
        sharpe = ((annualized_return / 100.0) - 0.04) / ann_std if ann_std > 0 else 0.0

        return {
            "symbol": clean_symbol,
            "strategy": strategy,
            "initial_capital": round(initial_capital, 2),
            "final_equity": round(final_equity, 2),
            "total_return_pct": round(total_return_pct, 2),
            "benchmark_return_pct": round(benchmark_return_pct, 2),
            "annualized_return_pct": round(annualized_return, 2),
            "sharpe_ratio": round(float(sharpe), 2),
            "max_drawdown_pct": round(abs(float(max_dd)), 2),
            "win_rate_pct": round(win_rate, 2),
            "total_trades": len(trades),
            "winning_trades": len(winning_trades),
            "losing_trades": len(losing_trades),
            "profit_factor": round(float(profit_factor), 2),
            "equity_curve": equity_curve,
            "trades": trades
        }
