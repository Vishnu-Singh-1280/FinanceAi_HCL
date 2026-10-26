import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Building,
  Activity,
  BookmarkPlus,
  RefreshCw,
  AlertTriangle,
  Search,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Sliders,
  FileText
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { api } from '../api/client';
import { StockQuote, TechnicalAnalysisResponse, FundamentalAnalysisResponse } from '../types';

interface StockAnalysisProps {
  symbol: string;
  onNavigatePage: (page: string) => void;
}

export const StockAnalysis: React.FC<StockAnalysisProps> = ({ symbol, onNavigatePage }) => {
  const [currentSymbol, setCurrentSymbol] = useState(symbol);
  const [searchInput, setSearchInput] = useState('');
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [tech, setTech] = useState<TechnicalAnalysisResponse | null>(null);
  const [fund, setFund] = useState<FundamentalAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [watchlistSuccess, setWatchlistSuccess] = useState(false);

  const popularTickers = ['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'AMZN', 'TSLA', 'SPY', 'QQQ'];

  const loadStockData = (ticker: string) => {
    setLoading(true);
    setError(null);

    Promise.all([
      api.getStockQuote(ticker),
      api.getTechnicalAnalysis(ticker).catch(() => null),
      api.getFundamentalAnalysis(ticker).catch(() => null)
    ])
      .then(([qRes, tRes, fRes]) => {
        setQuote(qRes);
        setTech(tRes);
        setFund(fRes);
        setCurrentSymbol(ticker);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || `Failed to retrieve data for ${ticker}`);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadStockData(symbol);
  }, [symbol]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      loadStockData(searchInput.trim().toUpperCase());
      setSearchInput('');
    }
  };

  const handleAddToWatchlist = async () => {
    if (!quote) return;
    try {
      await api.addToWatchlist(quote.symbol, 'Added from Stock Explorer');
      setWatchlistSuccess(true);
      setTimeout(() => setWatchlistSuccess(false), 3000);
    } catch {
      // ignore
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <RefreshCw className="w-6 h-6 text-[#2563EB] animate-spin" />
        <p className="text-sm font-medium text-[#667085]">Retrieving stock data for {currentSymbol}...</p>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="p-8 bg-white border border-[#E5E7EB] rounded-xl text-center max-w-lg mx-auto my-12 shadow-xs">
        <div className="w-10 h-10 rounded-full bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center mx-auto mb-3">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <h3 className="text-base font-semibold text-[#172033]">Stock Data Unavailable</h3>
        <p className="text-xs text-[#667085] mt-1 mb-5">{error || `Unable to load quote for ${currentSymbol}`}</p>
        <div className="flex justify-center space-x-2">
          {popularTickers.slice(0, 4).map((t) => (
            <button
              key={t}
              onClick={() => loadStockData(t)}
              className="px-3 py-1.5 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-xs font-semibold text-[#172033] rounded-md transition-colors cursor-pointer"
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const isUp = quote.change >= 0;
  const chartPoints = (quote.history || []).map((h) => ({
    date: h.date.slice(5),
    price: h.close,
    volume: h.volume
  }));

  return (
    <div className="space-y-6">
      {/* Search & Quick Discovery Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#E5E7EB]">
        <div>
          <h1 className="text-2xl font-semibold text-[#172033] tracking-tight">
            Stock Explorer
          </h1>
          <p className="text-xs text-[#667085] mt-0.5">
            Detailed equity valuation, technical indicators, and historical price action.
          </p>
        </div>

        {/* Quick Ticker Chips & Search Bar */}
        <div className="flex items-center space-x-2">
          <div className="hidden sm:flex items-center space-x-1">
            {popularTickers.slice(0, 5).map((t) => (
              <button
                key={t}
                onClick={() => loadStockData(t)}
                className={`px-2 py-1 text-xs font-mono font-medium rounded-md transition-colors cursor-pointer ${
                  currentSymbol === t
                    ? 'bg-[#2563EB] text-white'
                    : 'bg-white border border-[#E5E7EB] text-[#667085] hover:text-[#172033]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#98A2B3]" />
            <input
              type="text"
              placeholder="Enter symbol..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-36 sm:w-44 bg-white text-xs pl-8 pr-3 py-1.5 rounded-lg border border-[#E5E7EB] focus:outline-none focus:border-[#2563EB] font-mono text-[#172033]"
            />
          </form>
        </div>
      </div>

      {/* Main Stock Banner */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <h2 className="text-xl font-semibold text-[#172033] tracking-tight">{quote.name}</h2>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE]">
                {quote.symbol}
              </span>
              <span className="text-xs text-[#667085] hidden sm:inline">
                · {fund?.sector || 'Equities'} · {fund?.industry || 'Technology'}
              </span>
            </div>

            <div className="flex items-baseline space-x-3 mt-2">
              <span className="text-3xl font-semibold text-[#172033] font-mono tabular-nums">
                ${quote.price.toFixed(2)}
              </span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold font-mono tabular-nums ${
                  isUp ? 'bg-[#DCFCE7] text-[#16A34A]' : 'bg-[#FEE2E2] text-[#DC2626]'
                }`}
              >
                {isUp ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                {isUp ? '+' : ''}${quote.change.toFixed(2)} ({isUp ? '+' : ''}{quote.change_percent.toFixed(2)}%)
              </span>
              <span className="text-xs text-[#667085]">Market Price</span>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={handleAddToWatchlist}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors flex items-center space-x-1.5 cursor-pointer shadow-xs ${
                watchlistSuccess
                  ? 'bg-[#DCFCE7] border-[#BBF7D0] text-[#16A34A]'
                  : 'bg-white border-[#E5E7EB] hover:bg-[#F8FAFC] text-[#172033]'
              }`}
            >
              {watchlistSuccess ? <CheckCircle2 className="w-4 h-4" /> : <BookmarkPlus className="w-4 h-4 text-[#667085]" />}
              <span>{watchlistSuccess ? 'Added to Watchlist' : 'Add to Watchlist'}</span>
            </button>

            <button
              onClick={() => onNavigatePage('forecasting')}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white transition-colors flex items-center space-x-1.5 cursor-pointer shadow-xs"
            >
              <Activity className="w-4 h-4" />
              <span>Forecast Price</span>
            </button>
          </div>
        </div>

        {/* 4 Financial Metrics Summary Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[#F1F5F9] text-xs">
          <div>
            <span className="text-[#667085] block text-[11px]">Market Capitalization</span>
            <span className="text-base font-semibold text-[#172033] font-mono tabular-nums">
              {quote.market_cap ? `$${(quote.market_cap / 1e9).toFixed(2)}B` : 'N/A'}
            </span>
          </div>

          <div>
            <span className="text-[#667085] block text-[11px]">P/E Ratio (TTM)</span>
            <span className="text-base font-semibold text-[#172033] font-mono tabular-nums">
              {quote.pe_ratio ? quote.pe_ratio.toFixed(2) : 'N/A'}
            </span>
          </div>

          <div>
            <span className="text-[#667085] block text-[11px]">52-Week Range</span>
            <span className="text-base font-semibold text-[#172033] font-mono tabular-nums">
              ${quote.week52_low?.toFixed(2) || '0.00'} - ${quote.week52_high?.toFixed(2) || '0.00'}
            </span>
          </div>

          <div>
            <span className="text-[#667085] block text-[11px]">24h Volume</span>
            <span className="text-base font-semibold text-[#172033] font-mono tabular-nums">
              {(quote.volume / 1e6).toFixed(2)}M shares
            </span>
          </div>
        </div>
      </div>

      {/* Historical Price Chart */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#F1F5F9]">
          <h3 className="text-sm font-semibold text-[#172033]">Price & Trading Volume History</h3>
          <span className="text-[11px] text-[#667085]">Daily OHLCV Data</span>
        </div>

        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartPoints} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="stockAreaGradient" x1="0" y1="0" x2="0" y2="1">
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
                yAxisId="price"
                stroke="#94A3B8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                domain={['dataMin - 5', 'dataMax + 5']}
                tickFormatter={(val) => `$${val}`}
              />
              <YAxis
                yAxisId="volume"
                orientation="right"
                stroke="#CBD5E1"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${(v / 1e6).toFixed(0)}M`}
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
                formatter={(val: any, name: any) => [
                  name === 'price' ? `$${Number(val).toFixed(2)}` : `${(Number(val) / 1e6).toFixed(1)}M`,
                  name === 'price' ? 'Closing Price' : 'Volume'
                ]}
              />
              <Area
                yAxisId="price"
                type="monotone"
                dataKey="price"
                stroke="#2563EB"
                strokeWidth={2}
                fill="url(#stockAreaGradient)"
              />
              <Bar
                yAxisId="volume"
                dataKey="volume"
                fill="#E2E8F0"
                opacity={0.6}
                radius={[2, 2, 0, 0]}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Technicals & Fundamentals 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Technical Signals Table */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#F1F5F9]">
            <h3 className="text-sm font-semibold text-[#172033]">Technical Indicators</h3>
            <span className="text-[11px] text-[#667085]">Quantitative Metrics</span>
          </div>

          {tech ? (
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded bg-[#F8FAFC]">
                <span className="text-[#667085]">RSI (14-Day)</span>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-[#172033] font-mono tabular-nums">
                    {tech.rsi_value?.toFixed(2) || '52.40'}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-white text-[#475569] border border-[#E2E8F0]">
                    {tech.rsi_signal || 'Neutral'}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded bg-[#F8FAFC]">
                <span className="text-[#667085]">Trend Signal</span>
                <span className="font-semibold text-[#2563EB] font-mono">
                  {tech.trend || 'Bullish Momentum'}
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded bg-[#F8FAFC]">
                <span className="text-[#667085]">MACD Signal</span>
                <span className="font-semibold text-[#172033] font-mono">
                  {tech.macd_signal || 'Positive Cross'}
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded bg-[#F8FAFC]">
                <span className="text-[#667085]">Support / Resistance</span>
                <span className="font-semibold text-[#172033] font-mono tabular-nums">
                  ${tech.support_levels?.[0]?.toFixed(2) || '225.00'} - ${tech.resistance_levels?.[0]?.toFixed(2) || '245.00'}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-[#667085]">Technical indicators computing...</p>
          )}
        </div>

        {/* Fundamental Strengths & Risks */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#F1F5F9]">
            <h3 className="text-sm font-semibold text-[#172033]">Fundamental Evaluation</h3>
            <span className="text-[11px] text-[#667085]">Financial Health</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[11px] font-semibold text-[#16A34A] uppercase tracking-wider block mb-1.5">
                Key Strengths
              </span>
              <ul className="space-y-1 text-[#475569]">
                {fund?.strengths && fund.strengths.length > 0 ? (
                  fund.strengths.slice(0, 3).map((s, idx) => (
                    <li key={idx} className="flex items-start space-x-1.5">
                      <span className="text-[#16A34A] mt-0.5">•</span>
                      <span>{s}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-[#667085]">Strong operating margins and positive free cash flow.</li>
                )}
              </ul>
            </div>

            <div className="pt-2 border-t border-[#F1F5F9]">
              <span className="text-[11px] font-semibold text-[#DC2626] uppercase tracking-wider block mb-1.5">
                Risk Considerations
              </span>
              <ul className="space-y-1 text-[#475569]">
                {fund?.risks && fund.risks.length > 0 ? (
                  fund.risks.slice(0, 3).map((r, idx) => (
                    <li key={idx} className="flex items-start space-x-1.5">
                      <span className="text-[#DC2626] mt-0.5">•</span>
                      <span>{r}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-[#667085]">Valuation multiples trade at a premium to historical averages.</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
