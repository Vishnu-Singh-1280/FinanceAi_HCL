import {
  MarketSummaryResponse,
  MarketMoversResponse,
  StockQuote,
  TechnicalAnalysisResponse,
  FundamentalAnalysisResponse,
  ForecastResponse,
  NewsSentimentResponse,
  PortfolioDetailResponse,
  PortfolioOptimizeResponse,
  BacktestResponse,
  ScreenerItem,
  PeerComparisonResponse,
  EarningsDividendsResponse,
  MacroSummaryResponse,
  ReportSummaryResponse,
  RAGQueryResponse,
  WatchlistItemResponse,
  AlertResponse,
  SettingsResponse
} from '../types';

const BASE_URL = '';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorText = await res.text();
    try {
      const parsed = JSON.parse(errorText);
      throw new Error(parsed.message || parsed.detail || `HTTP Error ${res.status}`);
    } catch {
      throw new Error(errorText || `HTTP Error ${res.status}`);
    }
  }
  const data = await res.json();
  return data as T;
}

export const api = {
  // Market
  getMarketSummary: (): Promise<MarketSummaryResponse> =>
    fetch(`${BASE_URL}/api/v1/market/summary`).then(res => handleResponse<MarketSummaryResponse>(res)),

  getMarketMovers: (): Promise<MarketMoversResponse> =>
    fetch(`${BASE_URL}/api/v1/market/movers`).then(res => handleResponse<MarketMoversResponse>(res)),

  // Stocks
  searchStocks: (q: string): Promise<Array<{ symbol: string; name: string; sector?: string; asset_type?: string }>> =>
    fetch(`${BASE_URL}/api/v1/stocks/search?q=${encodeURIComponent(q)}`).then(res => handleResponse<Array<{ symbol: string; name: string; sector?: string; asset_type?: string }>>(res)),

  getStockQuote: (symbol: string): Promise<StockQuote> =>
    fetch(`${BASE_URL}/api/v1/stocks/${encodeURIComponent(symbol)}`).then(res => handleResponse<StockQuote>(res)),

  getTechnicalAnalysis: (symbol: string): Promise<TechnicalAnalysisResponse> =>
    fetch(`${BASE_URL}/api/v1/technical/${encodeURIComponent(symbol)}`).then(res => handleResponse<TechnicalAnalysisResponse>(res)),

  getFundamentalAnalysis: (symbol: string): Promise<FundamentalAnalysisResponse> =>
    fetch(`${BASE_URL}/api/v1/fundamental/${encodeURIComponent(symbol)}`).then(res => handleResponse<FundamentalAnalysisResponse>(res)),

  // Forecasting
  getForecast: (symbol: string): Promise<ForecastResponse> =>
    fetch(`${BASE_URL}/api/v1/forecast/${encodeURIComponent(symbol)}`).then(res => handleResponse<ForecastResponse>(res)),

  // News
  getNews: (symbol?: string): Promise<NewsSentimentResponse> => {
    const url = symbol ? `${BASE_URL}/api/v1/news?symbol=${encodeURIComponent(symbol)}` : `${BASE_URL}/api/v1/news`;
    return fetch(url).then(res => handleResponse<NewsSentimentResponse>(res));
  },

  // AI Advisor
  chatWithAdvisor: (message: string, currentSymbol?: string, conversationId = 'default'): Promise<{ content: string; detected_symbols: string[] }> =>
    fetch(`${BASE_URL}/api/v1/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, current_symbol: currentSymbol, conversation_id: conversationId })
    }).then(res => handleResponse<{ content: string; detected_symbols: string[] }>(res)),

  // Portfolio
  getPortfolio: (): Promise<PortfolioDetailResponse> =>
    fetch(`${BASE_URL}/api/v1/portfolio`).then(res => handleResponse<PortfolioDetailResponse>(res)),

  addTransaction: (tx: { symbol: string; asset_type?: string; transaction_type: string; quantity: number; price: number; fees?: number; notes?: string }): Promise<any> =>
    fetch(`${BASE_URL}/api/v1/portfolio/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tx)
    }).then(res => handleResponse<any>(res)),

  optimizePortfolio: (symbols: string[], maxWeight = 0.50): Promise<PortfolioOptimizeResponse> =>
    fetch(`${BASE_URL}/api/v1/portfolio/optimize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbols, max_weight: maxWeight })
    }).then(res => handleResponse<PortfolioOptimizeResponse>(res)),

  // Backtest
  runBacktest: (params: { symbol: string; strategy: string; initial_capital?: number; fast_period?: number; slow_period?: number; rsi_oversold?: number; rsi_overbought?: number }): Promise<BacktestResponse> =>
    fetch(`${BASE_URL}/api/v1/backtest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    }).then(res => handleResponse<BacktestResponse>(res)),

  // Screener
  screen: (filters: { asset_type?: string; sector?: string; min_pe?: number; max_pe?: number; min_dividend?: number; min_market_cap?: number; min_rsi?: number; max_rsi?: number; search?: string }): Promise<ScreenerItem[]> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params.append(k, String(v));
    });
    return fetch(`${BASE_URL}/api/v1/screener?${params.toString()}`).then(res => handleResponse<ScreenerItem[]>(res));
  },

  // Peers
  getPeers: (symbol: string): Promise<PeerComparisonResponse> =>
    fetch(`${BASE_URL}/api/v1/peers/${encodeURIComponent(symbol)}`).then(res => handleResponse<PeerComparisonResponse>(res)),

  // Earnings & Dividends
  getEarningsDividends: (symbol: string): Promise<EarningsDividendsResponse> =>
    fetch(`${BASE_URL}/api/v1/earnings/${encodeURIComponent(symbol)}`).then(res => handleResponse<EarningsDividendsResponse>(res)),

  // Macro
  getMacroSummary: (): Promise<MacroSummaryResponse> =>
    fetch(`${BASE_URL}/api/v1/macro/summary`).then(res => handleResponse<MacroSummaryResponse>(res)),

  // Reports
  getReports: (): Promise<ReportSummaryResponse[]> =>
    fetch(`${BASE_URL}/api/v1/reports`).then(res => handleResponse<ReportSummaryResponse[]>(res)),

  generateReport: (symbol: string): Promise<ReportSummaryResponse> =>
    fetch(`${BASE_URL}/api/v1/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbol })
    }).then(res => handleResponse<ReportSummaryResponse>(res)),

  downloadReportPdfUrl: (id: number) => `${BASE_URL}/api/v1/reports/${id}/pdf`,
  downloadReportExcelUrl: (id: number) => `${BASE_URL}/api/v1/reports/${id}/excel`,

  // RAG Document Research
  uploadDocument: (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    return fetch(`${BASE_URL}/api/v1/rag/upload`, {
      method: 'POST',
      body: formData
    }).then(res => handleResponse<any>(res));
  },

  getRAGDocuments: (): Promise<Array<{ id: string; filename: string; uploaded_at: string; chunk_count: number; size_bytes: number }>> =>
    fetch(`${BASE_URL}/api/v1/rag/documents`).then(res => handleResponse<Array<{ id: string; filename: string; uploaded_at: string; chunk_count: number; size_bytes: number }>>(res)),

  deleteRAGDocument: (docId: string): Promise<any> =>
    fetch(`${BASE_URL}/api/v1/rag/documents/${docId}`, { method: 'DELETE' }).then(res => handleResponse<any>(res)),

  queryRAG: (query: string): Promise<RAGQueryResponse> =>
    fetch(`${BASE_URL}/api/v1/rag/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    }).then(res => handleResponse<RAGQueryResponse>(res)),

  // Watchlist & Alerts
  getWatchlist: (): Promise<WatchlistItemResponse[]> =>
    fetch(`${BASE_URL}/api/v1/watchlist`).then(res => handleResponse<WatchlistItemResponse[]>(res)),

  addToWatchlist: (symbol: string, notes?: string): Promise<WatchlistItemResponse> =>
    fetch(`${BASE_URL}/api/v1/watchlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbol, notes })
    }).then(res => handleResponse<WatchlistItemResponse>(res)),

  removeFromWatchlist: (symbol: string): Promise<any> =>
    fetch(`${BASE_URL}/api/v1/watchlist/${encodeURIComponent(symbol)}`, { method: 'DELETE' }).then(res => handleResponse<any>(res)),

  getAlerts: (): Promise<AlertResponse[]> =>
    fetch(`${BASE_URL}/api/v1/alerts`).then(res => handleResponse<AlertResponse[]>(res)),

  createAlert: (symbol: string, condition: string, target_value: number, message?: string): Promise<AlertResponse> =>
    fetch(`${BASE_URL}/api/v1/alerts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbol, condition, target_value, message })
    }).then(res => handleResponse<AlertResponse>(res)),

  deleteAlert: (alertId: number): Promise<any> =>
    fetch(`${BASE_URL}/api/v1/alerts/${alertId}`, { method: 'DELETE' }).then(res => handleResponse<any>(res)),

  // Settings
  getSettings: (): Promise<SettingsResponse> =>
    fetch(`${BASE_URL}/api/v1/settings`).then(res => handleResponse<SettingsResponse>(res)),

  updateSettings: (data: { ai_provider?: string; openai_api_key?: string; groq_api_key?: string; ollama_base_url?: string }): Promise<SettingsResponse> =>
    fetch(`${BASE_URL}/api/v1/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => handleResponse<SettingsResponse>(res)),

  // Authentication
  login: (email: string, password: string): Promise<{ token: string; user: any }> =>
    fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    }).then(res => handleResponse<{ token: string; user: any }>(res)),

  logout: (): Promise<any> =>
    fetch(`${BASE_URL}/api/v1/auth/logout`, { method: 'POST' }).then(res => handleResponse<any>(res)),

  // Administration
  getAdminMetrics: (): Promise<any> =>
    fetch(`${BASE_URL}/api/v1/admin/metrics`).then(res => handleResponse<any>(res)),

  getAdminUsers: (): Promise<any[]> =>
    fetch(`${BASE_URL}/api/v1/admin/users`).then(res => handleResponse<any[]>(res)),

  clearCache: (): Promise<{ status: string; cleared_items: number }> =>
    fetch(`${BASE_URL}/api/v1/admin/cache/clear`, { method: 'POST' }).then(res => handleResponse<{ status: string; cleared_items: number }>(res))
};
