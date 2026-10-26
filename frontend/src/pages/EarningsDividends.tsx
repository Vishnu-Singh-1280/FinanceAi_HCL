import React, { useEffect, useState } from 'react';
import {
  Calendar,
  DollarSign,
  TrendingUp,
  Percent,
  RefreshCw,
  AlertTriangle,
  Award
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';
import { api } from '../api/client';
import { EarningsDividendsResponse } from '../types';
import { MetricCard } from '../components/MetricCard';

interface EarningsDividendsProps {
  symbol: string;
}

export const EarningsDividends: React.FC<EarningsDividendsProps> = ({ symbol }) => {
  const [data, setData] = useState<EarningsDividendsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.getEarningsDividends(symbol)
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || `Failed to fetch earnings for ${symbol}`);
        setLoading(false);
      });
  }, [symbol]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
        <p className="text-sm text-gray-400">Loading historical earnings surprises and dividend schedules...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 bg-rose-950/20 border border-rose-900/50 rounded-xl text-center max-w-lg mx-auto my-12">
        <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
        <h3 className="text-base font-bold text-white">Earnings History Unavailable</h3>
        <p className="text-xs text-rose-300 mt-1 mb-4">{error}</p>
      </div>
    );
  }

  const epsChartData = data.quarterly_earnings.map((q) => ({
    quarter: q.quarter,
    actual: q.eps_actual,
    estimate: q.eps_estimate,
    surprise: q.eps_surprise_pct
  })).reverse();

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-6">
        <div className="flex items-center space-x-2.5 mb-1">
          <span className="p-1.5 rounded-lg gradient-ai text-white">
            <Calendar className="w-4 h-4" />
          </span>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Earnings Performance & Dividend Analysis: <span className="text-indigo-400">{symbol}</span>
          </h1>
        </div>
        <p className="text-xs text-gray-400">
          Track consensus EPS beats/misses, quarterly revenue deliveries, and cash distribution history.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Trailing 12M EPS"
          value={`$${data.trailing_eps?.toFixed(2) || 'N/A'}`}
          icon={<DollarSign className="w-4 h-4" />}
          subtitle={`Forward EPS: $${data.forward_eps?.toFixed(2) || 'N/A'}`}
        />
        <MetricCard
          title="Dividend Yield"
          value={data.dividend_yield ? `${(data.dividend_yield * 100).toFixed(2)}%` : '0.00%'}
          icon={<Percent className="w-4 h-4" />}
          subtitle={`Annualized Payout: $${data.annual_dividend?.toFixed(2) || '0.00'}`}
        />
        <MetricCard
          title="Dividend Payout Ratio"
          value={data.payout_ratio ? `${(data.payout_ratio * 100).toFixed(1)}%` : 'N/A'}
          icon={<Award className="w-4 h-4" />}
          subtitle="Proportion of net earnings distributed"
        />
        <MetricCard
          title="Next Ex-Dividend Date"
          value={data.ex_dividend_date || 'N/A'}
          icon={<Calendar className="w-4 h-4" />}
          subtitle="Cutoff for dividend entitlement"
        />
      </div>

      {/* Quarterly EPS Comparison Chart */}
      <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white">Quarterly Earnings Per Share (EPS): Actual vs Consensus</h3>
            <p className="text-xs text-gray-400 mt-0.5">Historical earnings surprises and analyst consensus beats</p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={epsChartData}>
              <XAxis dataKey="quarter" stroke="#4b5563" fontSize={11} tickLine={false} />
              <YAxis stroke="#4b5563" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', color: '#9ca3af' }} />
              <Bar dataKey="estimate" fill="#475569" name="Consensus Estimate" radius={[4, 4, 0, 0]} />
              <Bar dataKey="actual" fill="#6366f1" name="Reported Actual EPS" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Dividend Payment History Table */}
      <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
          Historical Cash Dividend Distributions
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1f2937] text-gray-400 uppercase text-[10px] tracking-wider">
                <th className="pb-3">Declaration / Payment Date</th>
                <th className="pb-3 text-right">Cash Amount</th>
                <th className="pb-3 text-right">Frequency</th>
                <th className="pb-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2937]/50">
              {data.dividend_history.map((d, i) => (
                <tr key={i} className="hover:bg-[#1f2937] transition-colors">
                  <td className="py-2.5 font-bold text-white font-mono">{d.date}</td>
                  <td className="py-2.5 text-right font-mono font-bold text-emerald-400">${d.dividend.toFixed(2)}</td>
                  <td className="py-2.5 text-right text-gray-400">Quarterly Regular</td>
                  <td className="py-2.5 text-right text-emerald-400 font-semibold">Distributed</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
