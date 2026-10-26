from typing import Dict, Any, List, Optional
from app.services.market_data import MarketDataService, POPULAR_UNIVERSE
from app.services.fundamental import FundamentalAnalysisService
from app.services.technical import TechnicalAnalysisService

SCREENER_UNIVERSE = [
    {"symbol": "AAPL", "name": "Apple Inc.", "asset_type": "stock", "sector": "Technology"},
    {"symbol": "MSFT", "name": "Microsoft Corporation", "asset_type": "stock", "sector": "Technology"},
    {"symbol": "NVDA", "name": "NVIDIA Corporation", "asset_type": "stock", "sector": "Technology"},
    {"symbol": "AMZN", "name": "Amazon.com Inc.", "asset_type": "stock", "sector": "Consumer Discretionary"},
    {"symbol": "GOOGL", "name": "Alphabet Inc.", "asset_type": "stock", "sector": "Communication Services"},
    {"symbol": "META", "name": "Meta Platforms Inc.", "asset_type": "stock", "sector": "Communication Services"},
    {"symbol": "TSLA", "name": "Tesla Inc.", "asset_type": "stock", "sector": "Consumer Discretionary"},
    {"symbol": "JPM", "name": "JPMorgan Chase & Co.", "asset_type": "stock", "sector": "Financials"},
    {"symbol": "V", "name": "Visa Inc.", "asset_type": "stock", "sector": "Financials"},
    {"symbol": "JNJ", "name": "Johnson & Johnson", "asset_type": "stock", "sector": "Healthcare"},
    {"symbol": "PG", "name": "Procter & Gamble", "asset_type": "stock", "sector": "Consumer Staples"},
    {"symbol": "XOM", "name": "Exxon Mobil Corp.", "asset_type": "stock", "sector": "Energy"},
    {"symbol": "SPY", "name": "SPDR S&P 500 ETF Trust", "asset_type": "etf", "sector": "Broad Market ETF", "expense_ratio": 0.0945},
    {"symbol": "QQQ", "name": "Invesco QQQ Trust", "asset_type": "etf", "sector": "Technology ETF", "expense_ratio": 0.20},
    {"symbol": "VTI", "name": "Vanguard Total Stock Market", "asset_type": "etf", "sector": "Total Market ETF", "expense_ratio": 0.03},
    {"symbol": "VOO", "name": "Vanguard S&P 500 ETF", "asset_type": "etf", "sector": "Large Cap ETF", "expense_ratio": 0.03},
    {"symbol": "XLK", "name": "Technology Select Sector SPDR", "asset_type": "etf", "sector": "Technology ETF", "expense_ratio": 0.09},
    {"symbol": "RELIANCE.NS", "name": "Reliance Industries Ltd", "asset_type": "stock", "sector": "Energy"},
    {"symbol": "TCS.NS", "name": "Tata Consultancy Services", "asset_type": "stock", "sector": "Technology"}
]

class ScreenerService:
    @staticmethod
    def screen(
        asset_type: str = "stock",
        sector: Optional[str] = None,
        min_pe: Optional[float] = None,
        max_pe: Optional[float] = None,
        min_dividend: Optional[float] = None,
        min_market_cap: Optional[float] = None,
        min_rsi: Optional[float] = None,
        max_rsi: Optional[float] = None,
        search: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        results = []
        filtered_universe = [item for item in SCREENER_UNIVERSE if item["asset_type"] == asset_type]

        if sector and sector != "All":
            filtered_universe = [item for item in filtered_universe if item["sector"] == sector]

        if search:
            s_clean = search.strip().upper()
            filtered_universe = [item for item in filtered_universe if s_clean in item["symbol"] or s_clean in item["name"].upper()]

        for item in filtered_universe:
            sym = item["symbol"]
            quote = MarketDataService.get_stock_quote(sym)
            fund = FundamentalAnalysisService.get_fundamentals(sym)
            tech = TechnicalAnalysisService.calculate_indicators(sym)

            price = quote["price"]
            change_pct = quote["change_percent"]
            volume = quote["volume"]
            market_cap = fund["market_cap"] or quote["market_cap"]
            pe = fund["trailing_pe"]
            div_yield = fund["dividend_yield"]
            rsi = tech["rsi_value"]

            # Filter checks
            if min_pe is not None and (pe is None or pe < min_pe):
                continue
            if max_pe is not None and (pe is None or pe > max_pe):
                continue
            if min_dividend is not None and (div_yield is None or div_yield < (min_dividend / 100.0)):
                continue
            if min_market_cap is not None and (market_cap is None or market_cap < min_market_cap):
                continue
            if min_rsi is not None and (rsi is None or rsi < min_rsi):
                continue
            if max_rsi is not None and (rsi is None or rsi > max_rsi):
                continue

            results.append({
                "symbol": sym,
                "name": item["name"],
                "asset_type": item["asset_type"],
                "price": price,
                "change_pct": change_pct,
                "volume": volume,
                "market_cap": market_cap,
                "pe_ratio": pe,
                "dividend_yield": div_yield,
                "rsi_14": rsi,
                "sector": item["sector"],
                "expense_ratio": item.get("expense_ratio")
            })

        return results
