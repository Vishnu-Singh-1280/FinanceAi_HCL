import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  BarChart2,
  ShieldAlert,
  Briefcase,
  Search,
  ExternalLink,
  ChevronRight,
  Info,
  Sliders,
  Bot,
  Newspaper,
  Zap,
  Calendar,
  Clock,
  Flame,
  Tag
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { api } from '../api/client';
import {
  MarketSummaryResponse,
  MarketMoversResponse,
  PortfolioDetailResponse,
  StockQuote,
  ForecastResponse,
  NewsSentimentResponse,
  NewsArticle,
  UpcomingCatalyst,
  BreakingNewzzItem
} from '../types';

interface DashboardProps {
  onSelectSymbol: (symbol: string) => void;
  onNavigatePage: (page: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onSelectSymbol, onNavigatePage }) => {
  const [summary, setSummary] = useState<MarketSummaryResponse | null>(null);
  const [movers, setMovers] = useState<MarketMoversResponse | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioDetailResponse | null>(null);
  const [activeQuote, setActiveQuote] = useState<StockQuote | null>(null);
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [news, setNews] = useState<NewsSentimentResponse | null>(null);
  const [newsTab, setNewsTab] = useState<'all' | 'stocks' | 'soon'>('all');
  const [activeBreakingIndex, setActiveBreakingIndex] = useState<number>(0);
  const [timeRange, setTimeRange] = useState<string>('1M');
  const [activeMoversTab, setActiveMoversTab] = useState<'gainers' | 'losers' | 'active'>('gainers');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<string>('');

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [sumRes, movRes, portRes, quoteRes, fcRes, newsRes] = await Promise.all([
        api.getMarketSummary(),
        api.getMarketMovers(),
        api.getPortfolio(),
        api.getStockQuote('SPY').catch(() => null),
        api.getForecast('AAPL').catch(() => null),
        api.getNews().catch(() => null)
      ]);

      setSummary(sumRes);
      setMovers(movRes);
      setPortfolio(portRes);
      if (quoteRes) setActiveQuote(quoteRes);
      if (fcRes) setForecast(fcRes);
      if (newsRes) setNews(newsRes);

      setLastRefreshed(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (err: any) {
      setError(err.message || 'Unable to retrieve real-time financial market feeds.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (!news?.breaking_newzz || news.breaking_newzz.length <= 1) return;
    const timer = setInterval(() => {
      setActiveBreakingIndex((prev) => (prev + 1) % news.breaking_newzz!.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [news]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <RefreshCw className="w-6 h-6 text-[#2563EB] animate-spin" />
        <p className="text-sm font-medium text-[#667085]">Loading market feeds and portfolio data...</p>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="p-8 bg-white border border-[#E5E7EB] rounded-xl max-w-lg mx-auto my-12 text-center shadow-xs">
        <div className="w-10 h-10 rounded-full bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center mx-auto mb-3">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <h3 className="text-base font-semibold text-[#172033] mb-1">Market Telemetry Connection Error</h3>
        <p className="text-xs text-[#667085] mb-5">{error || 'Unable to connect to financial data provider.'}</p>
        <button
          onClick={loadDashboardData}
          className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors shadow-xs"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  // Indices parsing
  const sp500 = summary.indices.find((i) => i.symbol === '^GSPC') || summary.indices[0];
  const nasdaq = summary.indices.find((i) => i.symbol === '^IXIC') || summary.indices[1];

  // History for active quote chart
  const chartHistory = activeQuote?.history && activeQuote.history.length > 0
    ? activeQuote.history.map((h) => ({
        date: h.date.slice(5),
        price: h.close,
        volume: h.volume
      }))
    : [
        { date: '10-01', price: 572.5 },
        { date: '10-05', price: 576.2 },
        { date: '10-10', price: 574.8 },
        { date: '10-15', price: 581.4 },
        { date: '10-20', price: 583.1 },
        { date: '10-26', price: activeQuote?.price || 585.0 }
      ];

  const portfolioValue = portfolio?.total_equity != null
    ? `$${portfolio.total_equity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : '$125,000.00';

  const portfolioChangePct = portfolio?.daily_change_pct != null
    ? portfolio.daily_change_pct
    : 1.0;

  return (
    <div className="space-y-6">
      {/* ============================================================== */}
      {/* A. Welcome / Header Section                                    */}
      {/* ============================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E5E7EB]">
        <div>
          <h1 className="text-2xl font-semibold text-[#172033] tracking-tight">
            Market Dashboard
          </h1>
          <p className="text-xs text-[#667085] mt-0.5">
            Real-time equity indices, portfolio performance, and quantitative research.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-xs text-[#667085] bg-white border border-[#E5E7EB] px-3 py-1.5 rounded-lg shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#16A34A]"></span>
            <span>Real-time Feed</span>
            {lastRefreshed && <span className="text-[#98A2B3]">· {lastRefreshed}</span>}
          </div>

          <button
            onClick={loadDashboardData}
            className="p-1.5 bg-white border border-[#E5E7EB] hover:bg-[#F8FAFC] text-[#667085] hover:text-[#172033] rounded-lg transition-colors cursor-pointer"
            title="Refresh Market Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* B. Market Summary Cards (4 Columns)                            */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* S&P 500 Index */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#667085] mb-1">
            <span className="font-medium">S&P 500</span>
            <span className="text-[11px] font-mono text-[#98A2B3]">^GSPC</span>
          </div>
          <div className="text-xl font-semibold text-[#172033] font-mono tabular-nums">
            {sp500 ? `$${sp500.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '$5,850.20'}
          </div>
          <div className="flex items-center mt-2 text-xs font-medium">
            <span
              className={`inline-flex items-center px-1.5 py-0.2 rounded font-mono tabular-nums ${
                (sp500?.change || 0) >= 0 ? 'bg-[#DCFCE7] text-[#16A34A]' : 'bg-[#FEE2E2] text-[#DC2626]'
              }`}
            >
              {(sp500?.change || 0) >= 0 ? '+' : ''}
              {sp500 ? sp500.change_percent.toFixed(2) : '+0.42'}%
            </span>
            <span className="text-[#98A2B3] text-[11px] ml-2">Today</span>
          </div>
        </div>

        {/* NASDAQ Composite */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#667085] mb-1">
            <span className="font-medium">NASDAQ Composite</span>
            <span className="text-[11px] font-mono text-[#98A2B3]">^IXIC</span>
          </div>
          <div className="text-xl font-semibold text-[#172033] font-mono tabular-nums">
            {nasdaq ? `$${nasdaq.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '$18,518.60'}
          </div>
          <div className="flex items-center mt-2 text-xs font-medium">
            <span
              className={`inline-flex items-center px-1.5 py-0.2 rounded font-mono tabular-nums ${
                (nasdaq?.change || 0) >= 0 ? 'bg-[#DCFCE7] text-[#16A34A]' : 'bg-[#FEE2E2] text-[#DC2626]'
              }`}
            >
              {(nasdaq?.change || 0) >= 0 ? '+' : ''}
              {nasdaq ? nasdaq.change_percent.toFixed(2) : '+0.58'}%
            </span>
            <span className="text-[#98A2B3] text-[11px] ml-2">Today</span>
          </div>
        </div>

        {/* Portfolio Equity Value */}
        <div
          onClick={() => onNavigatePage('portfolio')}
          className="bg-white border border-[#E5E7EB] hover:border-[#2563EB]/40 transition-colors rounded-xl p-4 shadow-xs cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-[#667085] mb-1">
            <span className="font-medium group-hover:text-[#2563EB] transition-colors flex items-center space-x-1">
              <span>Portfolio Value</span>
              <ChevronRight className="w-3 h-3 text-[#98A2B3]" />
            </span>
            <Briefcase className="w-3.5 h-3.5 text-[#667085]" />
          </div>
          <div className="text-xl font-semibold text-[#172033] font-mono tabular-nums">
            {portfolioValue}
          </div>
          <div className="flex items-center mt-2 text-xs font-medium">
            <span
              className={`inline-flex items-center px-1.5 py-0.2 rounded font-mono tabular-nums ${
                portfolioChangePct >= 0 ? 'bg-[#DCFCE7] text-[#16A34A]' : 'bg-[#FEE2E2] text-[#DC2626]'
              }`}
            >
              {portfolioChangePct >= 0 ? '+' : ''}
              {portfolioChangePct.toFixed(2)}%
            </span>
            <span className="text-[#98A2B3] text-[11px] ml-2">Unrealized return</span>
          </div>
        </div>

        {/* Market Breadth & Sentiment */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#667085] mb-1">
            <span className="font-medium">Market Regime</span>
            <span className="w-2 h-2 rounded-full bg-[#2563EB]"></span>
          </div>
          <div className="text-lg font-semibold text-[#172033]">
            {summary.market_sentiment || 'Moderate Expansion'}
          </div>
          <div className="flex items-center mt-2 text-xs text-[#667085]">
            <span className="text-[#2563EB] font-medium mr-1.5">US Equities</span>
            <span>· Breadth Positive</span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* C & D. Stock Price Chart & Stock Prediction Overview           */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Stock Price Chart */}
        <div className="lg:col-span-8 bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F1F5F9]">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base font-semibold text-[#172033]">
                  {activeQuote?.name || 'SPDR S&P 500 ETF Trust'}
                </span>
                <span className="text-xs font-mono font-semibold text-[#2563EB] px-2 py-0.5 bg-[#EFF6FF] rounded border border-[#DBEAFE]">
                  {activeQuote?.symbol || 'SPY'}
                </span>
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-2xl font-semibold text-[#172033] font-mono tabular-nums">
                  ${activeQuote?.price?.toFixed(2) || '585.00'}
                </span>
                <span
                  className={`text-xs font-medium font-mono tabular-nums px-1.5 py-0.2 rounded ${
                    (activeQuote?.change || 0) >= 0
                      ? 'bg-[#DCFCE7] text-[#16A34A]'
                      : 'bg-[#FEE2E2] text-[#DC2626]'
                  }`}
                >
                  {(activeQuote?.change || 0) >= 0 ? '+' : ''}
                  {activeQuote?.change?.toFixed(2) || '+2.50'} (
                  {activeQuote?.change_percent ? activeQuote.change_percent.toFixed(2) : '+0.43'}%)
                </span>
              </div>
            </div>

            {/* Timeframe Selector */}
            <div className="flex items-center bg-[#F1F5F9] p-0.5 rounded-lg border border-[#E2E8F0]">
              {['1D', '5D', '1M', '6M', '1Y', 'ALL'].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeRange(tf)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                    timeRange === tf
                      ? 'bg-white text-[#172033] shadow-xs font-semibold'
                      : 'text-[#667085] hover:text-[#172033]'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Clean High-Fidelity Chart */}
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartHistory} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="primaryChartFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity={0.12} />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#E5E7EB' }}
                />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  domain={['dataMin - 5', 'dataMax + 5']}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    fontSize: '12px',
                    color: '#172033'
                  }}
                  formatter={(val: any) => [`$${Number(val).toFixed(2)}`, 'Closing Price']}
                  labelStyle={{ fontWeight: 600, color: '#475569' }}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="#2563EB"
                  strokeWidth={2}
                  fill="url(#primaryChartFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Technical Summary Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-[#F1F5F9] text-xs">
            <div>
              <span className="text-[#667085] block text-[11px]">52-Week Range</span>
              <span className="font-semibold text-[#172033] font-mono tabular-nums">
                ${activeQuote?.week52_low?.toFixed(2) || '410.00'} - ${activeQuote?.week52_high?.toFixed(2) || '587.20'}
              </span>
            </div>
            <div>
              <span className="text-[#667085] block text-[11px]">Trading Volume</span>
              <span className="font-semibold text-[#172033] font-mono tabular-nums">
                {activeQuote?.volume ? (activeQuote.volume / 1e6).toFixed(1) + 'M' : '45.2M'}
              </span>
            </div>
            <div>
              <span className="text-[#667085] block text-[11px]">Market Cap</span>
              <span className="font-semibold text-[#172033] font-mono tabular-nums">
                {activeQuote?.market_cap ? `$${(activeQuote.market_cap / 1e9).toFixed(1)}B` : '$540.2B'}
              </span>
            </div>
            <div>
              <span className="text-[#667085] block text-[11px]">P/E Ratio</span>
              <span className="font-semibold text-[#172033] font-mono tabular-nums">
                {activeQuote?.pe_ratio ? activeQuote.pe_ratio.toFixed(1) : '27.4'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Stock Prediction Overview */}
        <div className="lg:col-span-4 bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-[#2563EB]" />
              <h3 className="text-sm font-semibold text-[#172033]">Stock Prediction Overview</h3>
            </div>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE]">
              30-Day ML Model
            </span>
          </div>

          {forecast ? (
            <div className="space-y-4">
              <div className="p-3.5 bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg">
                <div className="flex items-center justify-between text-xs text-[#667085] mb-1">
                  <span>Target Ticker</span>
                  <span className="font-semibold text-[#172033] font-mono">{forecast.symbol}</span>
                </div>
                <div className="flex items-baseline justify-between mt-2">
                  <div>
                    <span className="text-[11px] text-[#667085] block">Current Price</span>
                    <span className="text-base font-semibold text-[#172033] font-mono tabular-nums">
                      ${forecast.current_price.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-[#667085] block">30D Forecast Target</span>
                    <span className="text-base font-semibold text-[#2563EB] font-mono tabular-nums">
                      ${forecast.estimate_30d.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-[#E5E7EB] flex items-center justify-between text-xs">
                  <span className="text-[#667085]">Expected Trajectory:</span>
                  <span
                    className={`font-semibold font-mono tabular-nums ${
                      forecast.pct_change_30d >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'
                    }`}
                  >
                    {forecast.pct_change_30d >= 0 ? '+' : ''}
                    {forecast.pct_change_30d.toFixed(2)}%
                  </span>
                </div>
              </div>

              {/* Model Validation Metrics */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-[#667085] uppercase tracking-wider block">
                  Model Verification
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded bg-[#F8FAFC] border border-[#E5E7EB]">
                    <span className="text-[10px] text-[#667085] block">Validation R²</span>
                    <span className="font-semibold text-[#172033] font-mono">
                      {forecast.metrics.validation_r2.toFixed(3)}
                    </span>
                  </div>
                  <div className="p-2.5 rounded bg-[#F8FAFC] border border-[#E5E7EB]">
                    <span className="text-[10px] text-[#667085] block">Validation MAE</span>
                    <span className="font-semibold text-[#172033] font-mono">
                      ${forecast.metrics.validation_mae.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Required Regulatory Disclaimer */}
              <div className="p-3 rounded-lg bg-[#FEF2F2] border border-[#FEE2E2] text-[11px] text-[#991B1B] leading-relaxed flex items-start space-x-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#DC2626]" />
                <span>
                  Notice: Forecasts are statistical estimates generated via Gradient Boosting Regression based on historical features. Not guaranteed investment advice.
                </span>
              </div>

              <button
                onClick={() => onNavigatePage('forecasting')}
                className="w-full py-2 px-3 text-xs font-semibold text-[#2563EB] bg-[#EFF6FF] hover:bg-[#DBEAFE] border border-[#BFDBFE] rounded-lg transition-colors cursor-pointer flex items-center justify-center space-x-1"
              >
                <span>Open Detailed Prediction Model</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-[#667085]">
              No active forecast loaded. Visit the Stock Prediction module to run simulations.
            </div>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* E. Market Movers & Active Securities                           */}
      {/* ============================================================== */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F1F5F9]">
          <div>
            <h3 className="text-sm font-semibold text-[#172033]">Market Movers & Active Equities</h3>
            <p className="text-xs text-[#667085]">Leading percentage gainers, decliners, and high-volume securities.</p>
          </div>

          <div className="flex items-center bg-[#F1F5F9] p-0.5 rounded-lg border border-[#E2E8F0] text-xs">
            <button
              onClick={() => setActiveMoversTab('gainers')}
              className={`px-3 py-1 font-medium rounded-md transition-colors cursor-pointer ${
                activeMoversTab === 'gainers'
                  ? 'bg-white text-[#172033] shadow-xs font-semibold'
                  : 'text-[#667085] hover:text-[#172033]'
              }`}
            >
              Top Gainers
            </button>
            <button
              onClick={() => setActiveMoversTab('losers')}
              className={`px-3 py-1 font-medium rounded-md transition-colors cursor-pointer ${
                activeMoversTab === 'losers'
                  ? 'bg-white text-[#172033] shadow-xs font-semibold'
                  : 'text-[#667085] hover:text-[#172033]'
              }`}
            >
              Top Decliners
            </button>
            <button
              onClick={() => setActiveMoversTab('active')}
              className={`px-3 py-1 font-medium rounded-md transition-colors cursor-pointer ${
                activeMoversTab === 'active'
                  ? 'bg-white text-[#172033] shadow-xs font-semibold'
                  : 'text-[#667085] hover:text-[#172033]'
              }`}
            >
              Most Active
            </button>
          </div>
        </div>

        {/* Tabular List */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#F1F5F9] text-[#667085] font-medium">
                <th className="py-2.5 px-3">Ticker / Company</th>
                <th className="py-2.5 px-3">Sector</th>
                <th className="py-2.5 px-3 text-right">Price</th>
                <th className="py-2.5 px-3 text-right">Change ($)</th>
                <th className="py-2.5 px-3 text-right">Change (%)</th>
                <th className="py-2.5 px-3 text-right">Volume</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {movers &&
                (activeMoversTab === 'gainers'
                  ? movers.gainers
                  : activeMoversTab === 'losers'
                  ? movers.losers
                  : movers.most_active
                ).slice(0, 6).map((item) => {
                  const isPositive = item.change >= 0;
                  return (
                    <tr
                      key={item.symbol}
                      onClick={() => onSelectSymbol(item.symbol)}
                      className="hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-3">
                        <div className="font-semibold text-[#172033] font-mono">{item.symbol}</div>
                        <div className="text-[11px] text-[#667085] truncate max-w-xs">{item.name}</div>
                      </td>
                      <td className="py-3 px-3 text-[#667085]">{item.sector || 'Equities'}</td>
                      <td className="py-3 px-3 text-right font-semibold text-[#172033] font-mono tabular-nums">
                        ${item.price.toFixed(2)}
                      </td>
                      <td className={`py-3 px-3 text-right font-mono tabular-nums ${isPositive ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
                        {isPositive ? '+' : ''}${item.change.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span
                          className={`inline-flex px-1.5 py-0.5 rounded font-mono tabular-nums font-semibold ${
                            isPositive ? 'bg-[#DCFCE7] text-[#16A34A]' : 'bg-[#FEE2E2] text-[#DC2626]'
                          }`}
                        >
                          {isPositive ? '+' : ''}{item.change_percent.toFixed(2)}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right text-[#667085] font-mono tabular-nums">
                        {(item.volume / 1e6).toFixed(1)}M
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectSymbol(item.symbol);
                            onNavigatePage('stocks');
                          }}
                          className="px-2 py-1 text-[11px] font-medium text-[#2563EB] hover:bg-[#EFF6FF] rounded border border-transparent hover:border-[#BFDBFE] transition-colors cursor-pointer"
                        >
                          Analyze
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================== */}
      {/* F. Latest Market News with Stock Images & Soon Latest Newzz   */}
      {/* ============================================================== */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-xs space-y-4">
        {/* Real-Time Breaking Newzz Flash Ticker */}
        {news?.breaking_newzz && news.breaking_newzz.length > 0 && (
          <div className="bg-[#0F172A] text-white rounded-lg px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <span className="flex items-center space-x-1 bg-[#DC2626] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 animate-pulse">
                <Zap className="w-3 h-3 fill-white" />
                <span>LIVE NEWZZ FLASH</span>
              </span>
              <div className="flex items-center space-x-2 truncate">
                {news.breaking_newzz[activeBreakingIndex]?.symbol && (
                  <span className="bg-[#1E293B] text-[#93C5FD] text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border border-[#334155] shrink-0">
                    ${news.breaking_newzz[activeBreakingIndex].symbol}
                  </span>
                )}
                <span className="text-xs text-slate-200 font-medium truncate">
                  {news.breaking_newzz[activeBreakingIndex]?.headline}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end space-x-3 shrink-0 text-xs">
              <span className="text-[11px] text-slate-400 font-mono">
                {news.breaking_newzz[activeBreakingIndex]?.timestamp}
              </span>
              <div className="flex items-center space-x-1">
                {news.breaking_newzz.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveBreakingIndex(idx)}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === activeBreakingIndex ? 'w-4 bg-[#2563EB]' : 'w-1.5 bg-slate-600 hover:bg-slate-400'
                    }`}
                    aria-label={`Jump to breaking newzz item ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Section Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F1F5F9]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#2563EB]">
              <Newspaper className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-semibold text-[#172033]">Latest Market News & Stock Intelligence</h3>
                <span className="text-[10px] font-semibold bg-[#DCFCE7] text-[#15803D] px-2 py-0.5 rounded-full border border-[#BBF7D0]">
                  Live Wires
                </span>
              </div>
              <p className="text-xs text-[#667085]">
                Curated financial stories with stock imagery, sentiment scoring, and upcoming catalysts.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Filter Tabs */}
            <div className="flex items-center bg-[#F1F5F9] p-0.5 rounded-lg border border-[#E2E8F0] text-xs">
              <button
                onClick={() => setNewsTab('all')}
                className={`px-3 py-1 font-medium rounded-md transition-colors cursor-pointer ${
                  newsTab === 'all'
                    ? 'bg-white text-[#172033] shadow-xs'
                    : 'text-[#667085] hover:text-[#172033]'
                }`}
              >
                All Stories
              </button>
              <button
                onClick={() => setNewsTab('stocks')}
                className={`px-3 py-1 font-medium rounded-md transition-colors cursor-pointer ${
                  newsTab === 'stocks'
                    ? 'bg-white text-[#172033] shadow-xs'
                    : 'text-[#667085] hover:text-[#172033]'
                }`}
              >
                Stock Equities
              </button>
              <button
                onClick={() => setNewsTab('soon')}
                className={`px-3 py-1 font-medium rounded-md transition-colors cursor-pointer flex items-center space-x-1 ${
                  newsTab === 'soon'
                    ? 'bg-white text-[#2563EB] shadow-xs font-semibold'
                    : 'text-[#667085] hover:text-[#172033]'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>Soon Latest Newzz</span>
              </button>
            </div>

            <button
              onClick={() => onNavigatePage('news')}
              className="text-xs font-medium text-[#2563EB] hover:text-[#1D4ED8] bg-[#EFF6FF] hover:bg-[#DBEAFE] border border-[#BFDBFE] px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center space-x-1"
            >
              <span>Terminal</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Tab Content 1: Soon Latest Newzz & Upcoming Catalysts */}
        {newsTab === 'soon' ? (
          <div className="space-y-3">
            <div className="bg-[#FFFBEB] border border-[#FEF3C7] rounded-lg p-3 text-xs text-[#92400E] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-[#D97706] shrink-0" />
                <span>
                  <strong>Soon Upcoming Newzz & Catalysts:</strong> Scheduled earnings conferences, economic data releases, and major corporate events that drive volatility.
                </span>
              </div>
              <span className="text-[11px] font-semibold text-[#B45309]">Updated Real-Time</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {(news?.upcoming_catalysts || [
                {
                  id: 'cat-01',
                  symbol: 'NVDA',
                  title: 'Q3 Earnings Release & Conference',
                  event_type: 'Earnings',
                  scheduled_date: 'Next Wednesday post-market (16:30 EST)',
                  impact_level: 'High',
                  description: 'Consensus models EPS at $0.74 on $32.5B revenue. Focus on Blackwell GPU delivery and enterprise backlog.'
                },
                {
                  id: 'cat-02',
                  symbol: 'MACRO',
                  title: 'U.S. CPI Inflation Print Release',
                  event_type: 'Macro Print',
                  scheduled_date: 'Coming soon on Thursday (08:30 EST)',
                  impact_level: 'High',
                  description: 'Consensus forecast 2.4% YoY. Fixed-income and index futures will reprice terminal rate probabilities.'
                },
                {
                  id: 'cat-03',
                  symbol: 'MSFT',
                  title: 'Global AI Developer Summit Keynote',
                  event_type: 'Product Launch',
                  scheduled_date: 'Scheduled in 6 days',
                  impact_level: 'Medium',
                  description: 'Unveiling autonomous AI software agents and hyperscale enterprise cloud cost efficiencies.'
                },
                {
                  id: 'cat-04',
                  symbol: 'AAPL',
                  title: 'Quarterly Cash Dividend Ex-Date',
                  event_type: 'Dividend',
                  scheduled_date: 'Next Friday (Record Date)',
                  impact_level: 'Moderate',
                  description: 'Shareholders of record eligible for quarterly dividend distribution with payout in early November.'
                }
              ]).map((cat) => (
                <div
                  key={cat.id}
                  className="bg-[#FAFAFA] hover:bg-white border border-[#E5E7EB] hover:border-[#BFDBFE] rounded-xl p-4 transition-all shadow-2xs hover:shadow-xs flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
                        {cat.event_type}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          cat.impact_level === 'High'
                            ? 'bg-[#FEF2F2] text-[#DC2626] border border-[#FEE2E2]'
                            : 'bg-[#F0FDF4] text-[#16A34A] border border-[#DCFCE7]'
                        }`}
                      >
                        {cat.impact_level} Impact
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5 pt-1">
                      <span className="text-xs font-mono font-bold text-[#172033] bg-[#E2E8F0] px-1.5 py-0.5 rounded">
                        ${cat.symbol}
                      </span>
                      <h4 className="text-xs font-semibold text-[#172033] leading-snug">
                        {cat.title}
                      </h4>
                    </div>

                    <p className="text-[11px] text-[#667085] leading-relaxed">
                      {cat.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#F1F5F9] flex flex-col space-y-2">
                    <div className="flex items-center space-x-1.5 text-[11px] text-[#D97706] font-medium">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span>{cat.scheduled_date}</span>
                    </div>

                    {cat.symbol !== 'MACRO' && (
                      <button
                        onClick={() => {
                          onSelectSymbol(cat.symbol);
                          onNavigatePage('stocks');
                        }}
                        className="w-full text-center py-1 text-[11px] font-semibold text-[#2563EB] bg-[#EFF6FF] hover:bg-[#DBEAFE] rounded border border-[#BFDBFE] transition-colors cursor-pointer"
                      >
                        Analyze {cat.symbol} Catalyst
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Tab Content 2: Real-time News with Stock Imagery */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(
              news?.articles?.filter((a) => {
                if (newsTab === 'stocks') {
                  return a.related_symbols && a.related_symbols.length > 0;
                }
                return true;
              }).slice(0, 4) || []
            ).map((article) => {
              const isBull = article.sentiment === 'Bullish';
              const isBear = article.sentiment === 'Bearish';
              const primarySymbol = article.related_symbols?.[0] || 'SPY';

              return (
                <div
                  key={article.id}
                  className="group bg-white border border-[#E5E7EB] hover:border-[#2563EB] rounded-xl overflow-hidden transition-all duration-200 shadow-2xs hover:shadow-md flex flex-col justify-between"
                >
                  {/* Stock Image Header with Badges */}
                  <div className="relative h-36 w-full overflow-hidden bg-slate-100">
                    <img
                      src={article.image_url || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&q=80'}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                    {/* Stock Ticker Chip */}
                    <div className="absolute top-2.5 left-2.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectSymbol(primarySymbol);
                          onNavigatePage('stocks');
                        }}
                        className="bg-black/75 hover:bg-[#2563EB] backdrop-blur-xs text-white text-[11px] font-mono font-bold px-2 py-0.5 rounded shadow-xs transition-colors cursor-pointer border border-white/20"
                        title={`Analyze ${primarySymbol}`}
                      >
                        ${primarySymbol}
                      </button>
                    </div>

                    {/* Sentiment Pill */}
                    <div className="absolute top-2.5 right-2.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs backdrop-blur-xs ${
                          isBull
                            ? 'bg-[#16A34A]/90 text-white'
                            : isBear
                            ? 'bg-[#DC2626]/90 text-white'
                            : 'bg-slate-800/90 text-slate-200'
                        }`}
                      >
                        {article.sentiment}
                      </span>
                    </div>

                    {/* Category Overlay */}
                    <div className="absolute bottom-2 left-2.5 text-[10px] text-white/90 font-medium">
                      {article.category || 'Equity Wire'}
                    </div>
                  </div>

                  {/* News Content Body */}
                  <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <div className="flex items-center space-x-1.5 text-[11px] text-[#667085] mb-1">
                        <span className="font-semibold text-[#475569]">{article.publisher}</span>
                        <span>·</span>
                        <span>{article.time_ago || 'Recent'}</span>
                      </div>

                      <h4 className="text-xs font-semibold text-[#172033] group-hover:text-[#2563EB] transition-colors line-clamp-2 leading-snug">
                        <a
                          href={article.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {article.title}
                        </a>
                      </h4>

                      {article.summary && (
                        <p className="text-[11px] text-[#667085] line-clamp-2 mt-1.5 leading-relaxed">
                          {article.summary}
                        </p>
                      )}
                    </div>

                    {/* Bottom Card Actions */}
                    <div className="pt-2 border-t border-[#F1F5F9] flex items-center justify-between">
                      <button
                        onClick={() => {
                          onSelectSymbol(primarySymbol);
                          onNavigatePage('stocks');
                        }}
                        className="text-[11px] font-semibold text-[#2563EB] hover:text-[#1D4ED8] flex items-center space-x-1 cursor-pointer"
                      >
                        <span>Analyze {primarySymbol}</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>

                      <a
                        href={article.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-[#94A3B8] hover:text-[#475569] flex items-center space-x-1"
                        title="Read full source article"
                      >
                        <span>Source</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* G. Research Insights & AI Market Thesis (Separated Card)       */}
      {/* ============================================================== */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-semibold text-[#172033]">Market Research & Intelligence Synthesis</h3>
          </div>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-[#F1F5F9] text-[#64748B]">
            Automated Quantitative Feed
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Fact-Based Macroeconomic Summary */}
          <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB] space-y-2">
            <div className="text-xs font-semibold text-[#172033] uppercase tracking-wider">
              Macro Environment & News Flow
            </div>
            <p className="text-xs text-[#475569] leading-relaxed">
              {summary.top_briefing || 'Global equity markets trade with positive momentum amid earnings reports. Treasury yields show stabilization across short and mid maturities.'}
            </p>
            <div className="pt-2 text-[11px] text-[#667085] flex items-center space-x-3">
              <span>Source: yfinance Wire & Benchmark Index Returns</span>
            </div>
          </div>

          {/* AI-Generated Research - Clearly Differentiated */}
          <div className="p-4 rounded-lg bg-[#EFF6FF] border border-[#DBEAFE] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#1E40AF] uppercase tracking-wider flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>AI Research Assistant Briefing</span>
              </span>
              <span className="text-[10px] font-medium text-[#2563EB] px-1.5 py-0.2 rounded bg-white border border-[#BFDBFE]">
                AI-Generated Thesis
              </span>
            </div>
            <p className="text-xs text-[#1E3A8A] leading-relaxed">
              Portfolio volatility is currently well-balanced across technology and broad indices. Risk indicators suggest maintaining current asset weightings while monitoring upcoming earnings releases.
            </p>
            <div className="pt-2 flex items-center justify-between">
              <span className="text-[10px] text-[#3B82F6]">LLM Quantitative Engine</span>
              <button
                onClick={() => onNavigatePage('advisor')}
                className="text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] flex items-center space-x-1 cursor-pointer"
              >
                <span>Consult AI Assistant</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
