import numpy as np
import pandas as pd
from datetime import datetime
from typing import Dict, Any, List
from app.services.market_data import MarketDataService

class TechnicalAnalysisService:
    @staticmethod
    def calculate_indicators(symbol: str, period: str = "1y") -> Dict[str, Any]:
        df = MarketDataService.get_stock_history(symbol, period=period)
        if df.empty or len(df) < 20:
            raise ValueError(f"Insufficient historical data for {symbol}")

        df = df.copy()
        close = df["Close"]
        high = df["High"]
        low = df["Low"]
        volume = df["Volume"]

        # Simple Moving Averages
        df["SMA_20"] = close.rolling(window=20).mean()
        df["SMA_50"] = close.rolling(window=50).mean()
        df["SMA_200"] = close.rolling(window=200).mean() if len(df) >= 200 else None

        # Exponential Moving Averages
        df["EMA_12"] = close.ewm(span=12, adjust=False).mean()
        df["EMA_26"] = close.ewm(span=26, adjust=False).mean()
        df["EMA_50"] = close.ewm(span=50, adjust=False).mean()

        # MACD (12, 26, 9)
        df["MACD"] = df["EMA_12"] - df["EMA_26"]
        df["MACD_Signal"] = df["MACD"].ewm(span=9, adjust=False).mean()
        df["MACD_Hist"] = df["MACD"] - df["MACD_Signal"]

        # RSI (14)
        delta = close.diff()
        gain = delta.clip(lower=0)
        loss = -delta.clip(upper=0)
        avg_gain = gain.rolling(window=14, min_periods=14).mean()
        avg_loss = loss.rolling(window=14, min_periods=14).mean()
        # Wilder's exponential smoothing
        for i in range(14, len(df)):
            avg_gain.iloc[i] = (avg_gain.iloc[i-1] * 13 + gain.iloc[i]) / 14
            avg_loss.iloc[i] = (avg_loss.iloc[i-1] * 13 + loss.iloc[i]) / 14
        rs = avg_gain / avg_loss.replace(0, np.nan)
        df["RSI_14"] = 100 - (100 / (1 + rs))

        # Bollinger Bands (20, 2)
        bb_std = close.rolling(window=20).std()
        df["BB_Middle"] = df["SMA_20"]
        df["BB_Upper"] = df["BB_Middle"] + (bb_std * 2)
        df["BB_Lower"] = df["BB_Middle"] - (bb_std * 2)

        # Average True Range (ATR 14)
        tr1 = high - low
        tr2 = (high - close.shift(1)).abs()
        tr3 = (low - close.shift(1)).abs()
        tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
        df["ATR_14"] = tr.rolling(window=14).mean()

        # Support & Resistance levels from 60-day rolling pivots
        recent_60 = df.tail(60)
        support_levels = sorted(list(set([
            round(float(recent_60["Low"].min()), 2),
            round(float(recent_60["Low"].quantile(0.25)), 2),
            round(float(recent_60["Close"].quantile(0.35)), 2)
        ])))
        resistance_levels = sorted(list(set([
            round(float(recent_60["Close"].quantile(0.65)), 2),
            round(float(recent_60["High"].quantile(0.75)), 2),
            round(float(recent_60["High"].max()), 2)
        ])))

        # Latest values
        latest = df.iloc[-1]
        prev = df.iloc[-2]
        latest_price = round(float(latest["Close"]), 2)
        rsi_val = round(float(latest["RSI_14"]), 2) if not pd.isna(latest["RSI_14"]) else 50.0
        macd_val = round(float(latest["MACD"]), 2) if not pd.isna(latest["MACD"]) else 0.0
        macd_sig = round(float(latest["MACD_Signal"]), 2) if not pd.isna(latest["MACD_Signal"]) else 0.0
        sma_20_val = round(float(latest["SMA_20"]), 2) if not pd.isna(latest["SMA_20"]) else latest_price
        sma_50_val = round(float(latest["SMA_50"]), 2) if not pd.isna(latest["SMA_50"]) else latest_price

        # Interpretations
        if rsi_val > 70:
            rsi_signal = "Overbought (Potential Bearish Pullback)"
        elif rsi_val < 30:
            rsi_signal = "Oversold (Potential Bullish Rebound)"
        else:
            rsi_signal = "Neutral Momentum (Balanced Range)"

        macd_signal = "Bullish Crossover" if macd_val > macd_sig else "Bearish Crossover"
        
        if latest_price > sma_20_val and sma_20_val > sma_50_val:
            trend = "Strong Uptrend"
            ma_signal = "Bullish Alignment (Price > SMA20 > SMA50)"
        elif latest_price < sma_20_val and sma_20_val < sma_50_val:
            trend = "Strong Downtrend"
            ma_signal = "Bearish Alignment (Price < SMA20 < SMA50)"
        else:
            trend = "Consolidating / Neutral"
            ma_signal = "Mixed Moving Averages"

        # Overall technical verdict
        bull_points = 0
        if rsi_val > 45 and rsi_val < 70: bull_points += 1
        if macd_val > macd_sig: bull_points += 1
        if latest_price > sma_20_val: bull_points += 1
        if latest_price > sma_50_val: bull_points += 1

        if bull_points >= 3:
            overall_signal = "Strong Buy / Bullish"
        elif bull_points == 2:
            overall_signal = "Neutral / Hold"
        else:
            overall_signal = "Cautious / Bearish"

        observations = [
            f"{symbol} is currently trading at ${latest_price:.2f}, positioned in a {trend.lower()}.",
            f"14-day RSI is at {rsi_val:.1f}, indicating {rsi_signal.lower()}.",
            f"MACD line ({macd_val:.2f}) versus Signal line ({macd_sig:.2f}) confirms a {macd_signal.lower()}.",
            f"Key dynamic support sits at ${support_levels[0]:.2f} with overhead resistance at ${resistance_levels[-1]:.2f}.",
            f"Bollinger Bands indicate upper band limit at ${float(latest['BB_Upper']):.2f} and lower band at ${float(latest['BB_Lower']):.2f}." if not pd.isna(latest["BB_Upper"]) else "Bollinger bands in normal range."
        ]

        chart_points = []
        for _, row in df.tail(90).iterrows():
            dt_str = row["Date"].strftime("%Y-%m-%d") if isinstance(row["Date"], (datetime, pd.Timestamp)) else str(row["Date"])[:10]
            chart_points.append({
                "date": dt_str,
                "close": round(float(row["Close"]), 2),
                "sma_20": round(float(row["SMA_20"]), 2) if not pd.isna(row["SMA_20"]) else None,
                "sma_50": round(float(row["SMA_50"]), 2) if not pd.isna(row["SMA_50"]) else None,
                "sma_200": round(float(row["SMA_200"]), 2) if "SMA_200" in row and not pd.isna(row["SMA_200"]) else None,
                "ema_12": round(float(row["EMA_12"]), 2) if not pd.isna(row["EMA_12"]) else None,
                "ema_26": round(float(row["EMA_26"]), 2) if not pd.isna(row["EMA_26"]) else None,
                "rsi_14": round(float(row["RSI_14"]), 2) if not pd.isna(row["RSI_14"]) else None,
                "macd": round(float(row["MACD"]), 2) if not pd.isna(row["MACD"]) else None,
                "macd_signal": round(float(row["MACD_Signal"]), 2) if not pd.isna(row["MACD_Signal"]) else None,
                "macd_hist": round(float(row["MACD_Hist"]), 2) if not pd.isna(row["MACD_Hist"]) else None,
                "bb_upper": round(float(row["BB_Upper"]), 2) if not pd.isna(row["BB_Upper"]) else None,
                "bb_middle": round(float(row["BB_Middle"]), 2) if not pd.isna(row["BB_Middle"]) else None,
                "bb_lower": round(float(row["BB_Lower"]), 2) if not pd.isna(row["BB_Lower"]) else None,
                "atr_14": round(float(row["ATR_14"]), 2) if not pd.isna(row["ATR_14"]) else None,
                "volume": int(row["Volume"])
            })

        return {
            "symbol": symbol.upper(),
            "latest_price": latest_price,
            "trend": trend,
            "support_levels": support_levels,
            "resistance_levels": resistance_levels,
            "rsi_value": rsi_val,
            "rsi_signal": rsi_signal,
            "macd_signal": macd_signal,
            "moving_average_signal": ma_signal,
            "overall_signal": overall_signal,
            "chart_data": chart_points,
            "summary_observations": observations
        }
