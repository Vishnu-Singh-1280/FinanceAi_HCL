import React, { useEffect, useState } from 'react';
import {
  Newspaper,
  TrendingUp,
  TrendingDown,
  Minus,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  Zap,
  Calendar,
  Clock,
  Flame,
  Search,
  Filter,
  ChevronRight,
  ArrowUpRight
} from 'lucide-react';
import { api } from '../api/client';
import { NewsSentimentResponse } from '../types';

interface NewsSentimentProps {
  symbol?: string;
  onSelectSymbol: (symbol: string) => void;
}

export const NewsSentiment: React.FC<NewsSentimentProps> = ({ symbol, onSelectSymbol }) => {
  const [data, setData] = useState<NewsSentimentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<'all' | 'stocks' | 'soon'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeBreakingIdx, setActiveBreakingIdx] = useState(0);

  const fetchNews = () => {
    setLoading(true);
    setError(null);
    api.getNews(symbol)
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch financial news and sentiment streams');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchNews();
  }, [symbol]);

  // Auto rotate breaking newzz flash
  useEffect(() => {
    if (!data?.breaking_newzz || data.breaking_newzz.length <= 1) return;
    const timer = setInterval(() => {
      setActiveBreakingIdx((prev) => (prev + 1) % data.breaking_newzz!.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [data]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[55vh] space-y-3">
        <RefreshCw className="w-6 h-6 text-[#2563EB] animate-spin" />
        <p className="text-sm font-medium text-[#667085]">Retrieving verified wire streams and sentiment polarity...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 bg-white border border-[#FEE2E2] rounded-xl text-center max-w-lg mx-auto my-12 shadow-xs">
        <AlertTriangle className="w-8 h-8 text-[#DC2626] mx-auto mb-2" />
        <h3 className="text-base font-semibold text-[#172033]">News Intelligence Feed Unavailable</h3>
        <p className="text-xs text-[#DC2626] mt-1 mb-4">{error}</p>
        <button
          onClick={fetchNews}
          className="px-4 py-2 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-lg transition-colors cursor-pointer"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const isPositive = data.sentiment_score > 0.1;
  const isNegative = data.sentiment_score < -0.1;

  const filteredArticles = (data.articles || []).filter((art) => {
    if (filterTab === 'stocks' && (!art.related_symbols || art.related_symbols.length === 0)) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = art.title.toLowerCase().includes(q);
      const matchSummary = (art.summary || '').toLowerCase().includes(q);
      const matchPublisher = art.publisher.toLowerCase().includes(q);
      const matchSymbol = art.related_symbols?.some((s) => s.toLowerCase().includes(q));
      return matchTitle || matchSummary || matchPublisher || matchSymbol;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Real-Time Breaking Newzz Flash Ticker */}
      {data.breaking_newzz && data.breaking_newzz.length > 0 && (
        <div className="bg-[#0F172A] text-white rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <span className="flex items-center space-x-1 bg-[#DC2626] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 animate-pulse">
              <Zap className="w-3 h-3 fill-white" />
              <span>LIVE NEWZZ FLASH</span>
            </span>
            <div className="flex items-center space-x-2 truncate">
              {data.breaking_newzz[activeBreakingIdx]?.symbol && (
                <span className="bg-[#1E293B] text-[#93C5FD] text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border border-[#334155] shrink-0">
                  ${data.breaking_newzz[activeBreakingIdx].symbol}
                </span>
              )}
              <span className="text-xs text-slate-200 font-medium truncate">
                {data.breaking_newzz[activeBreakingIdx]?.headline}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end space-x-3 shrink-0 text-xs">
            <span className="text-[11px] text-slate-400 font-mono">
              {data.breaking_newzz[activeBreakingIdx]?.timestamp}
            </span>
            <div className="flex items-center space-x-1">
              {data.breaking_newzz.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveBreakingIdx(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === activeBreakingIdx ? 'w-4 bg-[#2563EB]' : 'w-1.5 bg-slate-600 hover:bg-slate-400'
                  }`}
                  aria-label={`Jump to breaking newzz item ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#2563EB]">
                <Newspaper className="w-4 h-4" />
              </div>
              <h1 className="text-xl font-bold text-[#172033] tracking-tight">
                Financial News & Sentiment Intelligence {symbol ? `— ${symbol}` : '— Global Markets'}
              </h1>
            </div>
            <p className="text-xs text-[#667085] mt-1">
              Real-time wire sentiment polarity scoring, high-resolution stock photography, and upcoming volatility catalysts.
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <span className="text-[11px] text-[#667085] uppercase tracking-wider block font-medium">Overall Market Mood</span>
              <div
                className={`text-lg font-bold tabular-nums ${
                  isPositive ? 'text-[#16A34A]' : isNegative ? 'text-[#DC2626]' : 'text-[#172033]'
                }`}
              >
                {data.overall_sentiment}
              </div>
            </div>
            <button
              onClick={fetchNews}
              className="p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB] hover:bg-[#F1F5F9] text-[#475569] hover:text-[#172033] transition-colors cursor-pointer"
              title="Refresh News Stream"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Sentiment Gauge Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Polarity Score */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-xs">
          <div className="text-xs text-[#667085] uppercase tracking-wider font-medium">Net Polarity Score</div>
          <div className="text-2xl font-bold text-[#172033] mt-1 tabular-nums">
            {data.sentiment_score > 0 ? '+' : ''}
            {data.sentiment_score.toFixed(2)}
          </div>
          <div className="text-[11px] text-[#667085] mt-1">Scale: -1.0 (Bearish) to +1.0 (Bullish)</div>
        </div>

        {/* Bullish % */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-xs">
          <div className="text-xs text-[#16A34A] uppercase tracking-wider font-semibold flex items-center space-x-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Bullish Distribution</span>
          </div>
          <div className="text-2xl font-bold text-[#16A34A] mt-1 tabular-nums">{data.bullish_percent.toFixed(1)}%</div>
          <div className="w-full bg-[#F1F5F9] h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-[#16A34A] h-full rounded-full" style={{ width: `${data.bullish_percent}%` }}></div>
          </div>
        </div>

        {/* Neutral % */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-xs">
          <div className="text-xs text-[#667085] uppercase tracking-wider font-semibold flex items-center space-x-1">
            <Minus className="w-3.5 h-3.5" />
            <span>Neutral / Balanced</span>
          </div>
          <div className="text-2xl font-bold text-[#172033] mt-1 tabular-nums">{data.neutral_percent.toFixed(1)}%</div>
          <div className="w-full bg-[#F1F5F9] h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-slate-400 h-full rounded-full" style={{ width: `${data.neutral_percent}%` }}></div>
          </div>
        </div>

        {/* Bearish % */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-xs">
          <div className="text-xs text-[#DC2626] uppercase tracking-wider font-semibold flex items-center space-x-1">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Bearish Distribution</span>
          </div>
          <div className="text-2xl font-bold text-[#DC2626] mt-1 tabular-nums">{data.bearish_percent.toFixed(1)}%</div>
          <div className="w-full bg-[#F1F5F9] h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-[#DC2626] h-full rounded-full" style={{ width: `${data.bearish_percent}%` }}></div>
          </div>
        </div>
      </div>

      {/* Filter and Search Ribbon */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center bg-[#F1F5F9] p-0.5 rounded-lg border border-[#E2E8F0] text-xs">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors cursor-pointer ${
              filterTab === 'all'
                ? 'bg-white text-[#172033] shadow-xs font-semibold'
                : 'text-[#667085] hover:text-[#172033]'
            }`}
          >
            All Market Stories
          </button>
          <button
            onClick={() => setFilterTab('stocks')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors cursor-pointer ${
              filterTab === 'stocks'
                ? 'bg-white text-[#172033] shadow-xs font-semibold'
                : 'text-[#667085] hover:text-[#172033]'
            }`}
          >
            Stock Equities
          </button>
          <button
            onClick={() => setFilterTab('soon')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors cursor-pointer flex items-center space-x-1.5 ${
              filterTab === 'soon'
                ? 'bg-white text-[#2563EB] shadow-xs font-semibold'
                : 'text-[#667085] hover:text-[#172033]'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>Soon Latest Newzz & Catalysts</span>
          </button>
        </div>

        {filterTab !== 'soon' && (
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by headline, stock, or publisher..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg text-[#172033] placeholder-[#94A3B8] focus:bg-white focus:outline-none focus:border-[#2563EB]"
            />
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {filterTab === 'soon' ? (
        /* Soon Latest Newzz & Upcoming Catalysts */
        <div className="space-y-4">
          <div className="bg-[#FFFBEB] border border-[#FEF3C7] rounded-xl p-4 text-xs text-[#92400E] flex items-center justify-between shadow-xs">
            <div className="flex items-center space-x-2.5">
              <Calendar className="w-5 h-5 text-[#D97706] shrink-0" />
              <span>
                <strong>Upcoming Catalysts & Forward Volatility:</strong> Anticipated quarterly earnings announcements, Federal Reserve interest rate releases, product events, and dividend record dates expected soon.
              </span>
            </div>
            <span className="text-[11px] font-bold text-[#B45309] shrink-0">Updated Daily</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(data.upcoming_catalysts || []).map((cat) => (
              <div
                key={cat.id}
                className="bg-white border border-[#E5E7EB] hover:border-[#2563EB] rounded-xl p-5 transition-all shadow-xs flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
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

                  <div className="flex items-center space-x-2 pt-1">
                    <span className="text-xs font-mono font-bold text-[#172033] bg-[#E2E8F0] px-2 py-0.5 rounded">
                      ${cat.symbol}
                    </span>
                    <h4 className="text-sm font-semibold text-[#172033] leading-snug">
                      {cat.title}
                    </h4>
                  </div>

                  <p className="text-xs text-[#667085] leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#F1F5F9] space-y-2.5">
                  <div className="flex items-center space-x-1.5 text-xs text-[#D97706] font-medium">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span>{cat.scheduled_date}</span>
                  </div>

                  {cat.symbol !== 'MACRO' && (
                    <button
                      onClick={() => onSelectSymbol(cat.symbol)}
                      className="w-full text-center py-1.5 text-xs font-semibold text-[#2563EB] bg-[#EFF6FF] hover:bg-[#DBEAFE] rounded-lg border border-[#BFDBFE] transition-colors cursor-pointer"
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
        /* Real-Time Articles Stream with Stock Imagery */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredArticles.map((art) => {
            const isBull = art.sentiment === 'Bullish';
            const isBear = art.sentiment === 'Bearish';
            const primarySymbol = art.related_symbols?.[0] || 'SPY';

            return (
              <div
                key={art.id}
                className="group bg-white border border-[#E5E7EB] hover:border-[#2563EB] rounded-xl overflow-hidden transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between"
              >
                {/* Stock Image Header */}
                <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                  <img
                    src={art.image_url || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&q=80'}
                    alt={art.title}
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
                      {art.sentiment} ({art.sentiment_score > 0 ? '+' : ''}{art.sentiment_score.toFixed(2)})
                    </span>
                  </div>

                  {/* Category Pill */}
                  <div className="absolute bottom-2 left-2.5 text-[10px] text-white/90 font-medium">
                    {art.category || 'Market Intelligence'}
                  </div>
                </div>

                {/* Article Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center space-x-1.5 text-[11px] text-[#667085] mb-1.5">
                      <span className="font-semibold text-[#475569]">{art.publisher}</span>
                      <span>·</span>
                      <span>{art.published_at}</span>
                    </div>

                    <h4 className="text-sm font-semibold text-[#172033] group-hover:text-[#2563EB] transition-colors line-clamp-2 leading-snug">
                      <a
                        href={art.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {art.title}
                      </a>
                    </h4>

                    {art.summary && (
                      <p className="text-xs text-[#667085] line-clamp-3 mt-2 leading-relaxed">
                        {art.summary}
                      </p>
                    )}
                  </div>

                  {/* Footer Actions */}
                  <div className="pt-3 border-t border-[#F1F5F9] flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      {art.related_symbols?.map((sym) => (
                        <button
                          key={sym}
                          onClick={() => onSelectSymbol(sym)}
                          className="text-[10px] font-bold text-[#2563EB] bg-[#EFF6FF] hover:bg-[#DBEAFE] px-2 py-0.5 rounded border border-[#BFDBFE] transition-colors cursor-pointer"
                        >
                          ${sym}
                        </button>
                      ))}
                    </div>

                    <a
                      href={art.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-[#2563EB] hover:text-[#1D4ED8] flex items-center space-x-1"
                    >
                      <span>Read Full Story</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
