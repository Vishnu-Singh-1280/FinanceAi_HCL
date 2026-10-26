import React, { useEffect, useState } from 'react';
import {
  FileText,
  DollarSign,
  TrendingUp,
  Percent,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Building2,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { api } from '../api/client';
import { FundamentalAnalysisResponse } from '../types';
import { MetricCard } from '../components/MetricCard';

interface FundamentalAnalysisProps {
  symbol: string;
}

export const FundamentalAnalysis: React.FC<FundamentalAnalysisProps> = ({ symbol }) => {
  const [data, setData] = useState<FundamentalAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.getFundamentalAnalysis(symbol)
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || `Failed to fetch fundamental metrics for ${symbol}`);
        setLoading(false);
      });
  }, [symbol]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <RefreshCw className="w-6 h-6 text-[#2563EB] animate-spin" />
        <p className="text-sm font-medium text-[#667085]">Auditing balance sheet, earnings quality, and valuation ratios for {symbol}...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 bg-white border border-[#E5E7EB] rounded-xl text-center max-w-lg mx-auto my-12 shadow-xs">
        <div className="w-10 h-10 rounded-full bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center mx-auto mb-3">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <h3 className="text-base font-semibold text-[#172033]">Fundamental Data Unavailable</h3>
        <p className="text-xs text-[#667085] mt-1 mb-4">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E7EB]">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-semibold text-[#172033] tracking-tight">
              Financial Research & Valuation
            </h1>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE]">
              {symbol}
            </span>
          </div>
          <p className="text-xs text-[#667085] mt-0.5">
            {data.company_name} · {data.sector || 'Equities'} · {data.industry || 'General Industry'}
          </p>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-[11px] text-[#667085] block">Market Capitalization</span>
          <div className="text-xl font-semibold text-[#172033] font-mono tabular-nums">
            {data.market_cap ? `$${(data.market_cap / 1e9).toFixed(2)}B` : 'N/A'}
          </div>
        </div>
      </div>

      {/* Valuation Multiples Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-[#667085] uppercase tracking-wider">Valuation Multiples</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            title="Trailing P/E Ratio"
            value={data.trailing_pe ? `${data.trailing_pe.toFixed(1)}x` : 'N/A'}
            subtitle="Trailing 12-Month Multiple"
          />
          <MetricCard
            title="Forward P/E Ratio"
            value={data.forward_pe ? `${data.forward_pe.toFixed(1)}x` : 'N/A'}
            subtitle="Consensus 1-Year Forward"
          />
          <MetricCard
            title="Price to Book (P/B)"
            value={data.price_to_book ? `${data.price_to_book.toFixed(1)}x` : 'N/A'}
            subtitle="Net Asset Value Multiple"
          />
          <MetricCard
            title="Diluted EPS (TTM)"
            value={data.trailing_eps ? `$${data.trailing_eps.toFixed(2)}` : 'N/A'}
            subtitle={`Forward EPS: $${data.forward_eps ? data.forward_eps.toFixed(2) : 'N/A'}`}
          />
        </div>
      </div>

      {/* Operational Profitability & Balance Sheet Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-[#667085] uppercase tracking-wider">Profitability & Solvency</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            title="Net Profit Margin"
            value={data.profit_margin ? `${(data.profit_margin * 100).toFixed(1)}%` : 'N/A'}
            subtitle="Bottom-Line Net Margin"
          />
          <MetricCard
            title="Return on Equity (ROE)"
            value={data.return_on_equity ? `${(data.return_on_equity * 100).toFixed(1)}%` : 'N/A'}
            subtitle="Shareholder Capital Efficiency"
          />
          <MetricCard
            title="Debt to Equity"
            value={data.debt_to_equity ? `${data.debt_to_equity.toFixed(1)}%` : 'N/A'}
            subtitle="Balance Sheet Leverage"
          />
          <MetricCard
            title="Dividend Yield"
            value={data.dividend_yield ? `${(data.dividend_yield * 100).toFixed(2)}%` : '0.00%'}
            subtitle="Annualized Yield"
          />
        </div>
      </div>

      {/* Business Description */}
      {data.description && (
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-xs space-y-2">
          <h4 className="text-xs font-semibold text-[#172033] uppercase tracking-wider">Corporate Profile & Operations</h4>
          <p className="text-xs text-[#475569] leading-relaxed max-w-4xl">{data.description}</p>
        </div>
      )}

      {/* Strengths, Weaknesses, Risks Triad */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Strengths */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center space-x-2 pb-2 border-b border-[#F1F5F9]">
            <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
            <h4 className="text-xs font-semibold text-[#16A34A] uppercase tracking-wider">Fundamental Strengths</h4>
          </div>
          <div className="space-y-2 text-xs">
            {data.strengths.map((str, i) => (
              <div key={i} className="text-[#475569] flex items-start space-x-2">
                <span className="text-[#16A34A] mt-0.5">•</span>
                <span className="leading-relaxed">{str}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Weaknesses */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center space-x-2 pb-2 border-b border-[#F1F5F9]">
            <XCircle className="w-4 h-4 text-[#D97706]" />
            <h4 className="text-xs font-semibold text-[#D97706] uppercase tracking-wider">Valuation Considerations</h4>
          </div>
          <div className="space-y-2 text-xs">
            {data.weaknesses.map((w, i) => (
              <div key={i} className="text-[#475569] flex items-start space-x-2">
                <span className="text-[#D97706] mt-0.5">•</span>
                <span className="leading-relaxed">{w}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Risks */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center space-x-2 pb-2 border-b border-[#F1F5F9]">
            <AlertTriangle className="w-4 h-4 text-[#DC2626]" />
            <h4 className="text-xs font-semibold text-[#DC2626] uppercase tracking-wider">Principal Risks</h4>
          </div>
          <div className="space-y-2 text-xs">
            {data.risks.map((r, i) => (
              <div key={i} className="text-[#475569] flex items-start space-x-2">
                <span className="text-[#DC2626] mt-0.5">•</span>
                <span className="leading-relaxed">{r}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
