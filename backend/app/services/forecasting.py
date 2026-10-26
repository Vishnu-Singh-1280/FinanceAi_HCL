import logging
from typing import Dict, Any, List
from datetime import datetime, timedelta, timezone
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import r2_score, mean_absolute_error, root_mean_squared_error
from app.services.market_data import MarketDataService

logger = logging.getLogger(__name__)

class ForecastingService:
    @staticmethod
    def _engineer_features(df: pd.DataFrame) -> pd.DataFrame:
        data = df.copy()
        close = data["Close"]
        high = data["High"]
        low = data["Low"]
        volume = data["Volume"]

        # 1. Log returns over multiple time horizons
        data["log_ret_1"] = np.log(close / close.shift(1))
        data["log_ret_5"] = np.log(close / close.shift(5))
        data["log_ret_10"] = np.log(close / close.shift(10))
        data["log_ret_21"] = np.log(close / close.shift(21))

        # 2. Rolling volatility (annualized standard deviation of daily returns)
        data["vol_10"] = data["log_ret_1"].rolling(10).std() * np.sqrt(252)
        data["vol_30"] = data["log_ret_1"].rolling(30).std() * np.sqrt(252)

        # 3. Moving average ratios
        sma_10 = close.rolling(10).mean()
        sma_20 = close.rolling(20).mean()
        sma_50 = close.rolling(50).mean()
        data["ratio_sma_10"] = close / sma_10
        data["ratio_sma_20"] = close / sma_20
        data["ratio_sma_50"] = close / sma_50

        # 4. Momentum / RSI-14
        delta = close.diff()
        gain = delta.clip(lower=0).rolling(14).mean()
        loss = (-delta.clip(upper=0)).rolling(14).mean()
        rs = gain / loss.replace(0, np.nan)
        data["rsi_14"] = 100 - (100 / (1 + rs))

        # 5. Volume and Range features
        vol_mean_20 = volume.rolling(20).mean().replace(0, np.nan)
        data["norm_volume"] = volume / vol_mean_20
        data["norm_range"] = (high - low) / close

        # Target: Next-day return (chronological forecasting)
        data["target_return"] = data["log_ret_1"].shift(-1)

        # Drop NaNs produced by lag features
        clean_data = data.dropna().copy()
        return clean_data

    @staticmethod
    def run_forecast(symbol: str, horizons: List[int] = [30, 60, 90]) -> Dict[str, Any]:
        clean_symbol = symbol.strip().upper()
        # Fetch 2 years of daily data as specified in requirement
        raw_df = MarketDataService.get_stock_history(clean_symbol, period="2y")
        if raw_df.empty or len(raw_df) < 80:
            raise ValueError(f"Insufficient historical data ({len(raw_df)} bars) to train forecasting model for {clean_symbol}")

        feat_df = ForecastingService._engineer_features(raw_df)
        feature_cols = [
            "log_ret_1", "log_ret_5", "log_ret_10", "log_ret_21",
            "vol_10", "vol_30", "ratio_sma_10", "ratio_sma_20", "ratio_sma_50",
            "rsi_14", "norm_volume", "norm_range"
        ]

        X = feat_df[feature_cols].values
        y = feat_df["target_return"].values

        total_samples = len(X)
        # Strict 80/20 chronological time-ordered split (no shuffling)
        split_idx = int(total_samples * 0.80)
        X_train, X_val = X[:split_idx], X[split_idx:]
        y_train, y_val = y[:split_idx], y[split_idx:]

        # Train GradientBoostingRegressor
        model = GradientBoostingRegressor(
            n_estimators=100,
            learning_rate=0.05,
            max_depth=3,
            subsample=0.85,
            random_state=42
        )
        model.fit(X_train, y_train)

        # Evaluate on chronological validation set
        val_pred_returns = model.predict(X_val)
        val_r2 = float(r2_score(y_val, val_pred_returns))
        val_mae = float(mean_absolute_error(y_val, val_pred_returns))
        val_rmse = float(root_mean_squared_error(y_val, val_pred_returns))

        # Calculate residual volatility for statistical uncertainty intervals
        residuals = y_val - val_pred_returns
        residual_std = float(np.std(residuals)) if len(residuals) > 0 else 0.015

        # Current price and latest features for projection
        latest_price = float(raw_df["Close"].iloc[-1])
        latest_date = pd.to_datetime(raw_df["Date"].iloc[-1])

        # Multi-step projection across up to 90 business days
        max_horizon = max(horizons)
        simulated_prices = []
        current_p = latest_price
        recent_log_returns = list(feat_df["log_ret_1"].tail(21).values)

        # Baseline expected drift from recent market regime blended with model
        model_mean_ret = float(np.mean(val_pred_returns))
        decay_factor = 0.98

        forecast_points = []
        # Generate business days for future dates
        future_dates = pd.date_range(start=latest_date + timedelta(days=1), periods=max_horizon + 30, freq="B")[:max_horizon]

        step = 1
        for dt in future_dates:
            # Predict step return with dampening to avoid runaway extrapolation
            step_return = (model_mean_ret * (decay_factor ** step)) + (np.mean(recent_log_returns[-5:]) * 0.1 * (decay_factor ** step))
            # Clip step return to realistic bounds (-3% to +3% per day)
            step_return = max(-0.03, min(0.03, step_return))
            current_p = current_p * np.exp(step_return)
            
            # Statistical uncertainty band expands with sqrt(t) based on residual std
            uncertainty_margin = current_p * (residual_std * np.sqrt(step) * 1.96)
            lower_bound = max(0.0, current_p - uncertainty_margin)
            upper_bound = current_p + uncertainty_margin

            forecast_points.append({
                "step": step,
                "date": dt.strftime("%Y-%m-%d"),
                "predicted_price": round(float(current_p), 2),
                "lower_bound": round(float(lower_bound), 2),
                "upper_bound": round(float(upper_bound), 2)
            })
            step += 1

        # Extract horizon estimates (30, 60, 90)
        idx_30 = min(29, len(forecast_points) - 1)
        idx_60 = min(59, len(forecast_points) - 1)
        idx_90 = min(89, len(forecast_points) - 1)

        est_30 = forecast_points[idx_30]["predicted_price"]
        est_60 = forecast_points[idx_60]["predicted_price"]
        est_90 = forecast_points[idx_90]["predicted_price"]

        pct_30 = round(((est_30 - latest_price) / latest_price) * 100, 2)
        pct_60 = round(((est_60 - latest_price) / latest_price) * 100, 2)
        pct_90 = round(((est_90 - latest_price) / latest_price) * 100, 2)

        # Historical curve for chart
        hist_subset = raw_df.tail(90)
        hist_dates = [d.strftime("%Y-%m-%d") if isinstance(d, (datetime, pd.Timestamp)) else str(d)[:10] for d in hist_subset["Date"]]
        hist_prices = [round(float(p), 2) for p in hist_subset["Close"]]

        return {
            "symbol": clean_symbol,
            "current_price": round(latest_price, 2),
            "historical_dates": hist_dates,
            "historical_prices": hist_prices,
            "forecast_points": forecast_points,
            "estimate_30d": est_30,
            "estimate_60d": est_60,
            "estimate_90d": est_90,
            "pct_change_30d": pct_30,
            "pct_change_60d": pct_60,
            "pct_change_90d": pct_90,
            "metrics": {
                "validation_r2": round(val_r2, 4),
                "validation_mae": round(val_mae, 4),
                "validation_rmse": round(val_rmse, 4),
                "train_size": len(X_train),
                "val_size": len(X_val),
                "feature_count": len(feature_cols),
                "methodology": "GradientBoostingRegressor (100 estimators, max_depth=3) with return/volatility/momentum feature engineering",
                "split_strategy": "Chronological 80/20 train-validation split (no time leakage or random shuffle)"
            },
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "disclaimer": "Forecasts are statistical machine learning estimates generated for research purposes, not guaranteed future prices or investment advice. Model uses historical OHLCV features and time-ordered validation."
        }
