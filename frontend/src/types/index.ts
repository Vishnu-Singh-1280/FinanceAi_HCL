// TypeScript definitions for FinanceAI

export interface MarketIndex {
  symbol: string;
  name: string;
  price: number;
  change: number;
  change_percent: number;
  previous_close?: number;
  sparkline: number[];
  timestamp: string;
}

export interface MarketMover {
  symbol: string;
  name: string;
  price: number;
  change: number;
  change_percent: number;
  volume: number;
  sector?: string;
}

export interface MarketMoversResponse {
  gainers: MarketMover[];
  losers: MarketMover[];
  most_active: MarketMover[];
  market_coverage: string;
  updated_at: string;
}

export interface MarketSummaryResponse {
  indices: MarketIndex[];
  market_sentiment: string;
  volatility_index?: number;
  sp500_change_percent?: number;
  top_briefing: string;
  updated_at: string;
}

export interface HistoricalBar {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  change_percent: number;
  volume: number;
  avg_volume?: number;
  market_cap?: number;
  pe_ratio?: number;
  week52_high?: number;
  week52_low?: number;
  sector?: string;
  industry?: string;
  exchange?: string;
  currency?: string;
  history: HistoricalBar[];
  updated_at: string;
}

export interface TechnicalIndicatorPoint {
  date: string;
  close: number;
  sma_20?: number;
  sma_50?: number;
  sma_200?: number;
  ema_12?: number;
  ema_26?: number;
  rsi_14?: number;
  macd?: number;
  macd_signal?: number;
  macd_hist?: number;
  bb_upper?: number;
  bb_middle?: number;
  bb_lower?: number;
  atr_14?: number;
  volume: number;
}

export interface TechnicalAnalysisResponse {
  symbol: string;
  latest_price: number;
  trend: string;
  support_levels: number[];
  resistance_levels: number[];
  rsi_value: number;
  rsi_signal: string;
  macd_signal: string;
  moving_average_signal: string;
  overall_signal: string;
  chart_data: TechnicalIndicatorPoint[];
  summary_observations: string[];
}

export interface FundamentalAnalysisResponse {
  symbol: string;
  company_name: string;
  sector?: string;
  industry?: string;
  market_cap?: number;
  trailing_pe?: number;
  forward_pe?: number;
  price_to_book?: number;
  trailing_eps?: number;
  forward_eps?: number;
  profit_margin?: number;
  operating_margin?: number;
  return_on_equity?: number;
  debt_to_equity?: number;
  current_ratio?: number;
  dividend_yield?: number;
  revenue_growth?: number;
  free_cashflow?: number;
  description?: string;
  strengths: string[];
  weaknesses: string[];
  risks: string[];
}

export interface ForecastPoint {
  step: number;
  date: string;
  predicted_price: number;
  lower_bound: number;
  upper_bound: number;
}

export interface ForecastMetrics {
  validation_r2: number;
  validation_mae: number;
  validation_rmse: number;
  train_size: number;
  val_size: number;
  feature_count: number;
  methodology: string;
  split_strategy: string;
}

export interface ForecastResponse {
  symbol: string;
  current_price: number;
  historical_dates: string[];
  historical_prices: number[];
  forecast_points: ForecastPoint[];
  estimate_30d: number;
  estimate_60d: number;
  estimate_90d: number;
  pct_change_30d: number;
  pct_change_60d: number;
  pct_change_90d: number;
  metrics: ForecastMetrics;
  generated_at: string;
  disclaimer: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  publisher: string;
  link: string;
  published_at: string;
  sentiment: string;
  sentiment_score: number;
  summary?: string;
  related_symbols: string[];
  image_url?: string;
  category?: string;
  is_breaking?: boolean;
  is_upcoming?: boolean;
  time_ago?: string;
}

export interface UpcomingCatalyst {
  id: string;
  symbol: string;
  title: string;
  event_type: string;
  scheduled_date: string;
  impact_level: string;
  description: string;
}

export interface BreakingNewzzItem {
  id: string;
  symbol?: string;
  headline: string;
  category: string;
  timestamp: string;
  urgency: string;
}

export interface NewsSentimentResponse {
  symbol?: string;
  overall_sentiment: string;
  sentiment_score: number;
  bullish_percent: number;
  bearish_percent: number;
  neutral_percent: number;
  articles: NewsArticle[];
  breaking_newzz?: BreakingNewzzItem[];
  upcoming_catalysts?: UpcomingCatalyst[];
  generated_at: string;
}

export interface HoldingItem {
  symbol: string;
  asset_type: string;
  quantity: number;
  average_cost: number;
  total_cost: number;
  current_price: number;
  market_value: number;
  unrealized_pl: number;
  unrealized_pl_pct: number;
  weight_pct: number;
  sector?: string;
}

export interface PortfolioDetailResponse {
  id: number;
  name: string;
  cash_balance: number;
  total_market_value: number;
  total_cost_basis: number;
  total_equity: number;
  total_unrealized_pl: number;
  total_unrealized_pl_pct: number;
  daily_change: number;
  daily_change_pct: number;
  holdings: HoldingItem[];
  sector_allocation: Record<string, number>;
  concentration_risk: string;
  transactions_count: number;
}

export interface EfficientFrontierPoint {
  volatility: number;
  return_rate: number;
  sharpe_ratio: number;
  weights: Record<string, number>;
}

export interface PortfolioOptimizeResponse {
  symbols: string[];
  historical_annual_returns: Record<string, number>;
  historical_volatilities: Record<string, number>;
  correlation_matrix: Record<string, Record<string, number>>;
  max_sharpe_allocation: Record<string, number>;
  max_sharpe_return: number;
  max_sharpe_volatility: number;
  max_sharpe_ratio: number;
  min_volatility_allocation: Record<string, number>;
  min_volatility_return: number;
  min_volatility_volatility: number;
  min_volatility_sharpe: number;
  value_at_risk_95: number;
  conditional_var_95: number;
  sortino_ratio: number;
  frontier: EfficientFrontierPoint[];
  rebalance_notes: string[];
}

export interface TradeLogItem {
  entry_date: string;
  exit_date: string;
  type: string;
  entry_price: number;
  exit_price: number;
  shares: number;
  profit_loss: number;
  return_pct: number;
}

export interface EquityPoint {
  date: string;
  equity: number;
  benchmark_equity: number;
  drawdown_pct: number;
}

export interface BacktestResponse {
  symbol: string;
  strategy: string;
  initial_capital: number;
  final_equity: number;
  total_return_pct: number;
  benchmark_return_pct: number;
  annualized_return_pct: number;
  sharpe_ratio: number;
  max_drawdown_pct: number;
  win_rate_pct: number;
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  profit_factor: number;
  equity_curve: EquityPoint[];
  trades: TradeLogItem[];
}

export interface ScreenerItem {
  symbol: string;
  name: string;
  asset_type: string;
  price: number;
  change_pct: number;
  volume: number;
  market_cap?: number;
  pe_ratio?: number;
  dividend_yield?: number;
  rsi_14?: number;
  sector?: string;
  expense_ratio?: number;
}

export interface PeerStockMetric {
  symbol: string;
  name: string;
  price: number;
  change_pct: number;
  market_cap?: number;
  pe_ratio?: number;
  pb_ratio?: number;
  profit_margin?: number;
  roe?: number;
  dividend_yield?: number;
  beta?: number;
  volatility?: number;
  ytd_return_pct?: number;
}

export interface PeerComparisonResponse {
  stocks: PeerStockMetric[];
  ai_summary: string;
  correlation_matrix: Record<string, Record<string, number>>;
}

export interface EarningsQuarter {
  quarter: string;
  date: string;
  eps_actual?: number;
  eps_estimate?: number;
  eps_surprise_pct?: number;
  revenue?: number;
}

export interface DividendHistoryItem {
  date: string;
  dividend: number;
}

export interface EarningsDividendsResponse {
  symbol: string;
  company_name: string;
  trailing_eps?: number;
  forward_eps?: number;
  quarterly_earnings: EarningsQuarter[];
  dividend_yield?: number;
  annual_dividend?: number;
  payout_ratio?: number;
  ex_dividend_date?: string;
  dividend_history: DividendHistoryItem[];
}

export interface MacroIndicator {
  id: string;
  name: string;
  category: string;
  latest_value: number;
  previous_value: number;
  unit: string;
  change: number;
  change_pct: number;
  last_updated: string;
  history: Array<{ date: string; value: number }>;
  source: string;
  interpretation: string;
}

export interface MacroSummaryResponse {
  indicators: MacroIndicator[];
  economic_regime: string;
  summary_analysis: string;
  updated_at: string;
}

export interface ReportSummaryResponse {
  id: number;
  symbol: string;
  title: string;
  summary: string;
  created_at: string;
  pdf_available: boolean;
  excel_available: boolean;
}

export interface RAGCitation {
  source_filename: string;
  page_or_section: string;
  snippet: string;
  relevance_score: number;
}

export interface RAGQueryResponse {
  query: string;
  answer: string;
  citations: RAGCitation[];
  confidence: number;
}

export interface WatchlistItemResponse {
  id: number;
  symbol: string;
  name?: string;
  current_price?: number;
  change_pct?: number;
  market_cap?: number;
  added_at: string;
}

export interface AlertResponse {
  id: number;
  symbol: string;
  condition: string;
  target_value: number;
  is_active: boolean;
  is_triggered: boolean;
  triggered_at?: string;
  message?: string;
  created_at: string;
}

export interface SettingsResponse {
  ai_provider: string;
  available_providers: string[];
  openai_configured: boolean;
  groq_configured: boolean;
  ollama_configured: boolean;
  database_type: string;
  market_data_provider: string;
  version: string;
  timestamp: string;
}
