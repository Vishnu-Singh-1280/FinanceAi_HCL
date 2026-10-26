from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

# Market Overview Schemas
class MarketIndex(BaseModel):
    symbol: str
    name: str
    price: float
    change: float
    change_percent: float
    previous_close: Optional[float] = None
    sparkline: List[float] = []
    timestamp: str

class MarketMover(BaseModel):
    symbol: str
    name: str
    price: float
    change: float
    change_percent: float
    volume: int
    sector: Optional[str] = None

class MarketMoversResponse(BaseModel):
    gainers: List[MarketMover]
    losers: List[MarketMover]
    most_active: List[MarketMover]
    market_coverage: str
    updated_at: str

class MarketSummaryResponse(BaseModel):
    indices: List[MarketIndex]
    market_sentiment: str
    volatility_index: Optional[float] = None
    sp500_change_percent: Optional[float] = None
    top_briefing: str
    updated_at: str

# Stock & Technical Schemas
class StockSearchResult(BaseModel):
    symbol: str
    name: str
    exchange: Optional[str] = None
    asset_type: Optional[str] = "stock"

class HistoricalBar(BaseModel):
    date: str
    open: float
    high: float
    low: float
    close: float
    volume: int

class StockQuote(BaseModel):
    symbol: str
    name: str
    price: float
    change: float
    change_percent: float
    volume: int
    avg_volume: Optional[int] = None
    market_cap: Optional[float] = None
    pe_ratio: Optional[float] = None
    week52_high: Optional[float] = None
    week52_low: Optional[float] = None
    sector: Optional[str] = None
    industry: Optional[str] = None
    exchange: Optional[str] = None
    currency: Optional[str] = "USD"
    history: List[HistoricalBar] = []
    updated_at: str

class TechnicalIndicatorPoint(BaseModel):
    date: str
    close: float
    sma_20: Optional[float] = None
    sma_50: Optional[float] = None
    sma_200: Optional[float] = None
    ema_12: Optional[float] = None
    ema_26: Optional[float] = None
    rsi_14: Optional[float] = None
    macd: Optional[float] = None
    macd_signal: Optional[float] = None
    macd_hist: Optional[float] = None
    bb_upper: Optional[float] = None
    bb_middle: Optional[float] = None
    bb_lower: Optional[float] = None
    atr_14: Optional[float] = None
    volume: int

class TechnicalAnalysisResponse(BaseModel):
    symbol: str
    latest_price: float
    trend: str
    support_levels: List[float]
    resistance_levels: List[float]
    rsi_value: float
    rsi_signal: str
    macd_signal: str
    moving_average_signal: str
    overall_signal: str
    chart_data: List[TechnicalIndicatorPoint]
    summary_observations: List[str]

# Fundamental Schemas
class FundamentalAnalysisResponse(BaseModel):
    symbol: str
    company_name: str
    sector: Optional[str]
    industry: Optional[str]
    market_cap: Optional[float]
    trailing_pe: Optional[float]
    forward_pe: Optional[float]
    price_to_book: Optional[float]
    trailing_eps: Optional[float]
    forward_eps: Optional[float]
    profit_margin: Optional[float]
    operating_margin: Optional[float]
    return_on_equity: Optional[float]
    debt_to_equity: Optional[float]
    current_ratio: Optional[float]
    dividend_yield: Optional[float]
    revenue_growth: Optional[float]
    free_cashflow: Optional[float]
    description: Optional[str]
    strengths: List[str]
    weaknesses: List[str]
    risks: List[str]

# Forecasting Schemas
class ForecastPoint(BaseModel):
    step: int
    date: str
    predicted_price: float
    lower_bound: float
    upper_bound: float

class ForecastMetrics(BaseModel):
    validation_r2: float
    validation_mae: float
    validation_rmse: float
    train_size: int
    val_size: int
    feature_count: int
    methodology: str
    split_strategy: str

class ForecastRequest(BaseModel):
    symbol: str = "AAPL"
    horizons: List[int] = [30, 60, 90]

class ForecastResponse(BaseModel):
    symbol: str
    current_price: float
    historical_dates: List[str]
    historical_prices: List[float]
    forecast_points: List[ForecastPoint]
    estimate_30d: float
    estimate_60d: float
    estimate_90d: float
    pct_change_30d: float
    pct_change_60d: float
    pct_change_90d: float
    metrics: ForecastMetrics
    generated_at: str
    disclaimer: str

# News & Sentiment Schemas
class NewsArticle(BaseModel):
    id: str
    title: str
    publisher: str
    link: str
    published_at: str
    sentiment: str  # Bullish, Bearish, Neutral
    sentiment_score: float  # -1.0 to 1.0
    summary: Optional[str] = None
    related_symbols: List[str] = []
    image_url: Optional[str] = None
    category: Optional[str] = "Market Intelligence"
    is_breaking: Optional[bool] = False
    is_upcoming: Optional[bool] = False
    time_ago: Optional[str] = None

class UpcomingCatalyst(BaseModel):
    id: str
    symbol: str
    title: str
    event_type: str  # Earnings, Macro Print, Product Launch, Fed Decision, Dividend
    scheduled_date: str
    impact_level: str  # High, Medium, Moderate
    description: str

class BreakingNewzzItem(BaseModel):
    id: str
    symbol: Optional[str] = None
    headline: str
    category: str
    timestamp: str
    urgency: str  # Breaking, Flash, Developing

class NewsSentimentResponse(BaseModel):
    symbol: Optional[str] = None
    overall_sentiment: str
    sentiment_score: float
    bullish_percent: float
    bearish_percent: float
    neutral_percent: float
    articles: List[NewsArticle]
    breaking_newzz: List[BreakingNewzzItem] = []
    upcoming_catalysts: List[UpcomingCatalyst] = []
    generated_at: str

# Portfolio Schemas
class TransactionCreate(BaseModel):
    portfolio_id: Optional[int] = 1
    symbol: str
    asset_type: str = "stock"
    transaction_type: str  # buy, sell
    quantity: float
    price: float
    fees: float = 0.0
    notes: Optional[str] = None
    transaction_date: Optional[str] = None

class TransactionResponse(BaseModel):
    id: int
    portfolio_id: int
    symbol: str
    asset_type: str
    transaction_type: str
    quantity: float
    price: float
    fees: float
    notes: Optional[str]
    transaction_date: str
    created_at: str

class HoldingItem(BaseModel):
    symbol: str
    asset_type: str
    quantity: float
    average_cost: float
    total_cost: float
    current_price: float
    market_value: float
    unrealized_pl: float
    unrealized_pl_pct: float
    weight_pct: float
    sector: Optional[str] = "General"

class PortfolioDetailResponse(BaseModel):
    id: int
    name: str
    cash_balance: float
    total_market_value: float
    total_cost_basis: float
    total_equity: float
    total_unrealized_pl: float
    total_unrealized_pl_pct: float
    daily_change: float
    daily_change_pct: float
    holdings: List[HoldingItem]
    sector_allocation: Dict[str, float]
    concentration_risk: str
    transactions_count: int

# Portfolio Optimizer Schemas
class PortfolioOptimizeRequest(BaseModel):
    symbols: List[str] = ["AAPL", "MSFT", "GOOGL", "AMZN"]
    lookback_days: int = 365
    risk_free_rate: float = 0.04
    max_weight: float = 0.50

class EfficientFrontierPoint(BaseModel):
    volatility: float
    return_rate: float
    sharpe_ratio: float
    weights: Dict[str, float]

class PortfolioOptimizeResponse(BaseModel):
    symbols: List[str]
    historical_annual_returns: Dict[str, float]
    historical_volatilities: Dict[str, float]
    correlation_matrix: Dict[str, Dict[str, float]]
    max_sharpe_allocation: Dict[str, float]
    max_sharpe_return: float
    max_sharpe_volatility: float
    max_sharpe_ratio: float
    min_volatility_allocation: Dict[str, float]
    min_volatility_return: float
    min_volatility_volatility: float
    min_volatility_sharpe: float
    value_at_risk_95: float
    conditional_var_95: float
    sortino_ratio: float
    frontier: List[EfficientFrontierPoint]
    rebalance_notes: List[str]

# Backtesting Schemas
class BacktestRequest(BaseModel):
    symbol: str = "AAPL"
    strategy: str = "sma_crossover"  # sma_crossover | rsi_mean_reversion
    lookback_days: int = 730
    initial_capital: float = 10000.0
    fast_period: int = 20
    slow_period: int = 50
    rsi_oversold: int = 30
    rsi_overbought: int = 70
    transaction_fee_pct: float = 0.001

class TradeLogItem(BaseModel):
    entry_date: str
    exit_date: str
    type: str
    entry_price: float
    exit_price: float
    shares: float
    profit_loss: float
    return_pct: float

class EquityPoint(BaseModel):
    date: str
    equity: float
    benchmark_equity: float
    drawdown_pct: float

class BacktestResponse(BaseModel):
    symbol: str
    strategy: str
    initial_capital: float
    final_equity: float
    total_return_pct: float
    benchmark_return_pct: float
    annualized_return_pct: float
    sharpe_ratio: float
    max_drawdown_pct: float
    win_rate_pct: float
    total_trades: int
    winning_trades: int
    losing_trades: int
    profit_factor: float
    equity_curve: List[EquityPoint]
    trades: List[TradeLogItem]

# Screener Schemas
class ScreenerFilterRequest(BaseModel):
    asset_type: str = "stock"  # stock | etf
    sector: Optional[str] = None
    min_pe: Optional[float] = None
    max_pe: Optional[float] = None
    min_dividend: Optional[float] = None
    min_market_cap: Optional[float] = None
    min_rsi: Optional[float] = None
    max_rsi: Optional[float] = None
    search: Optional[str] = None

class ScreenerItem(BaseModel):
    symbol: str
    name: str
    asset_type: str
    price: float
    change_pct: float
    volume: int
    market_cap: Optional[float] = None
    pe_ratio: Optional[float] = None
    dividend_yield: Optional[float] = None
    rsi_14: Optional[float] = None
    sector: Optional[str] = None
    expense_ratio: Optional[float] = None  # for ETFs

# Peer Comparison Schemas
class PeerComparisonRequest(BaseModel):
    symbols: List[str] = ["AAPL", "MSFT", "GOOGL"]

class PeerStockMetric(BaseModel):
    symbol: str
    name: str
    price: float
    change_pct: float
    market_cap: Optional[float]
    pe_ratio: Optional[float]
    pb_ratio: Optional[float]
    profit_margin: Optional[float]
    roe: Optional[float]
    dividend_yield: Optional[float]
    beta: Optional[float]
    volatility: Optional[float]
    ytd_return_pct: Optional[float]

class PeerComparisonResponse(BaseModel):
    stocks: List[PeerStockMetric]
    ai_summary: str
    correlation_matrix: Dict[str, Dict[str, float]]

# Earnings & Dividends Schemas
class EarningsQuarter(BaseModel):
    quarter: str
    date: str
    eps_actual: Optional[float] = None
    eps_estimate: Optional[float] = None
    eps_surprise_pct: Optional[float] = None
    revenue: Optional[float] = None

class DividendHistoryItem(BaseModel):
    date: str
    dividend: float

class EarningsDividendsResponse(BaseModel):
    symbol: str
    company_name: str
    trailing_eps: Optional[float]
    forward_eps: Optional[float]
    quarterly_earnings: List[EarningsQuarter]
    dividend_yield: Optional[float]
    annual_dividend: Optional[float]
    payout_ratio: Optional[float]
    ex_dividend_date: Optional[str]
    dividend_history: List[DividendHistoryItem]

# Macroeconomic Schemas
class MacroIndicator(BaseModel):
    id: str
    name: str
    category: str
    latest_value: float
    previous_value: float
    unit: str
    change: float
    change_pct: float
    last_updated: str
    history: List[Dict[str, Any]]
    source: str
    interpretation: str

class MacroSummaryResponse(BaseModel):
    indicators: List[MacroIndicator]
    economic_regime: str
    summary_analysis: str
    updated_at: str

# Research Report Schemas
class ReportGenerateRequest(BaseModel):
    symbol: str
    include_technicals: bool = True
    include_fundamentals: bool = True
    include_forecasts: bool = True
    include_news: bool = True

class ReportSummaryResponse(BaseModel):
    id: int
    symbol: str
    title: str
    summary: str
    created_at: str
    pdf_available: bool
    excel_available: bool

# RAG Schemas
class RAGCitation(BaseModel):
    source_filename: str
    page_or_section: str
    snippet: str
    relevance_score: float

class RAGQueryRequest(BaseModel):
    query: str
    document_ids: Optional[List[str]] = None

class RAGQueryResponse(BaseModel):
    query: str
    answer: str
    citations: List[RAGCitation]
    confidence: float

# Chat Schemas
class ChatRequest(BaseModel):
    message: str
    conversation_id: str = "default"
    current_symbol: Optional[str] = None

class ChatResponse(BaseModel):
    conversation_id: str
    role: str = "assistant"
    content: str
    detected_symbols: List[str] = []
    created_at: str

# Watchlist & Alerts Schemas
class WatchlistCreate(BaseModel):
    symbol: str
    notes: Optional[str] = None

class WatchlistItemResponse(BaseModel):
    id: int
    symbol: str
    name: Optional[str]
    current_price: Optional[float]
    change_pct: Optional[float]
    market_cap: Optional[float]
    added_at: str

class AlertCreate(BaseModel):
    symbol: str
    condition: str  # above, below, pct_gain, pct_loss
    target_value: float
    message: Optional[str] = None

class AlertResponse(BaseModel):
    id: int
    symbol: str
    condition: str
    target_value: float
    is_active: bool
    is_triggered: bool
    triggered_at: Optional[str]
    message: Optional[str]
    created_at: str

# Settings Schemas
class SettingsResponse(BaseModel):
    ai_provider: str
    available_providers: List[str]
    openai_configured: bool
    groq_configured: bool
    ollama_configured: bool
    database_type: str
    market_data_provider: str
    version: str
    timestamp: str

class SettingsUpdateRequest(BaseModel):
    ai_provider: Optional[str] = None
    openai_api_key: Optional[str] = None
    groq_api_key: Optional[str] = None
    ollama_base_url: Optional[str] = None
