import React, { useEffect, useState } from 'react';
import {
  Globe,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  AlertTriangle,
  Info,
  Activity,
  Layers
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
import { MacroSummaryResponse, MacroIndicator } from '../types';

export const MacroEconomy: React.FC = () => {
  const [data, setData] = useState<MacroSummaryResponse | null>(null);
  const [selectedIndicator, setSelectedIndicator] = useState<MacroIndicator | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.getMacroSummary()
      .then((res) => {
        setData(res);
        if (res.indicators.length > 0) {
          setSelectedIndicator(res.indicators[0]);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load macroeconomic indicators');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <RefreshCw className="w-6 h-6 text-[#2563EB] animate-spin" />
        <p className="text-sm font-medium text-[#667085]">Fetching macroeconomic series, Treasury yields, and central bank prints...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 bg-white border border-[#E5E7EB] rounded-xl text-center max-w-lg mx-auto my-12 shadow-xs">
        <div className="w-10 h-10 rounded-full bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center mx-auto mb-3">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <h3 className="text-base font-semibold text-[#172033]">Macroeconomic Data Unavailable</h3>
        <p className="text-xs text-[#667085] mt-1 mb-4">{error}</p>
      </div>
    );
  }

  const chartPoints = selectedIndicator?.history?.map((h) => ({
    date: h.date.length > 5 ? h.date.slice(5) : h.date,
    value: h.value
  })) || [];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#E5E7EB]">
        <div>
          <h1 className="text-2xl font-semibold text-[#172033] tracking-tight">
            Market Overview & Global Macro
          </h1>
          <p className="text-xs text-[#667085] mt-0.5">
            Cost of capital, sovereign yields, inflation expectations, and liquidity conditions.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-[#667085]">Economic Regime:</span>
          <span className="font-semibold text-[#2563EB] px-2.5 py-1 rounded-md bg-[#EFF6FF] border border-[#DBEAFE]">
            {data.economic_regime}
          </span>
        </div>
      </div>

      {/* Macro Summary Note */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-xs space-y-2">
        <div className="text-xs font-semibold text-[#172033] uppercase tracking-wider">
          Macroeconomic Condition Assessment
        </div>
        <p className="text-xs text-[#475569] leading-relaxed">
          {data.summary_analysis}
        </p>
      </div>

      {/* Indicators Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {data.indicators.map((ind) => {
          const isSelected = selectedIndicator?.id === ind.id;
          const isUp = ind.change >= 0;
          return (
            <div
              key={ind.id}
              onClick={() => setSelectedIndicator(ind)}
              className={`p-4 rounded-xl border transition-all cursor-pointer shadow-xs ${
                isSelected
                  ? 'bg-white border-[#2563EB] ring-2 ring-[#2563EB]/10'
                  : 'bg-white border-[#E5E7EB] hover:border-[#D1D5DB]'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-[#667085] mb-1">
                <span className="font-medium truncate">{ind.name}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#F1F5F9] text-[#475569]">{ind.category}</span>
              </div>
              <div className="text-xl font-semibold text-[#172033] font-mono tabular-nums mt-1">
                {ind.latest_value.toFixed(2)} {ind.unit}
              </div>
              <div className="flex items-center space-x-1.5 mt-2 text-xs">
                <span
                  className={`inline-flex items-center px-1.5 py-0.2 rounded font-mono tabular-nums font-semibold ${
                    isUp ? 'bg-[#DCFCE7] text-[#16A34A]' : 'bg-[#FEE2E2] text-[#DC2626]'
                  }`}
                >
                  {isUp ? '+' : ''}{ind.change_pct.toFixed(1)}%
                </span>
                <span className="text-[#98A2B3] text-[11px]">vs prior</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Indicator Deep Dive Chart & Interpretation */}
      {selectedIndicator && (
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-[#F1F5F9]">
            <div>
              <h3 className="text-sm font-semibold text-[#172033]">
                {selectedIndicator.name} Historical Trend
              </h3>
              <p className="text-xs text-[#667085] mt-0.5">
                {selectedIndicator.interpretation} · Source: {selectedIndicator.source}
              </p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartPoints} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="macroFill" x1="0" y1="0" x2="0" y2="1">
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
                  domain={['auto', 'auto']}
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${v}${selectedIndicator.unit}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E5E7EB',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#172033'
                  }}
                  formatter={(v: any) => [`${v} ${selectedIndicator.unit}`, selectedIndicator.name]}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#2563EB"
                  strokeWidth={2}
                  fill="url(#macroFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
