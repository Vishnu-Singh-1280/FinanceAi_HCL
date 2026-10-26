import React, { useEffect, useState } from 'react';
import {
  Activity,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  LineChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine
} from 'recharts';
import { api } from '../api/client';
import { TechnicalAnalysisResponse } from '../types';

interface TechnicalAnalysisProps {
  symbol: string;
}

export const TechnicalAnalysis: React.FC<TechnicalAnalysisProps> = ({ symbol }) => {
  const [data, setData] = useState<TechnicalAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.getTechnicalAnalysis(symbol)
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || `Failed to calculate technical indicators for ${symbol}`);
        setLoading(false);
      });
  }, [symbol]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
        <p className="text-sm text-gray-400">Computing technical indicators (SMA, EMA, RSI, MACD, Bollinger Bands)...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 bg-rose-950/20 border border-rose-900/50 rounded-xl text-center max-w-lg mx-auto my-12">
        <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
        <h3 className="text-base font-bold text-white">Technical Analysis Error</h3>
        <p className="text-xs text-rose-300 mt-1 mb-4">{error}</p>
      </div>
    );
  }

  const chartData = data.chart_data.map((pt) => ({
    date: pt.date.slice(5),
    close: pt.close,
    sma_20: pt.sma_20,
    sma_50: pt.sma_50,
    bb_upper: pt.bb_upper,
    bb_lower: pt.bb_lower,
    rsi: pt.rsi_14,
    macd: pt.macd,
    macd_signal: pt.macd_signal,
    macd_hist: pt.macd_hist
  }));

  const isBuy = data.overall_signal.includes('Buy');

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#0d1219] border border-[#1a2332] rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="p-1.5 rounded-lg gradient-brand text-white">
                <Activity className="w-4 h-4" />
              </span>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Technical Analysis Suite: <span className="text-emerald-400 font-mono">{symbol}</span>
              </h1>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Multi-timeframe mathematical indicators, moving averages, trend filters, and dynamic pivot zones.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Overall Signal</div>
              <div className={`text-lg font-black ${isBuy ? 'text-emerald-400' : 'text-amber-400'}`}>
                {data.overall_signal}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Signals & Dynamic Pivots Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#0d1219] border border-[#1a2332] rounded-xl p-4">
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Primary Trend</div>
          <div className="text-base font-bold text-white mt-1">{data.trend}</div>
          <div className="text-[11px] text-gray-400 mt-1">{data.moving_average_signal}</div>
        </div>

        <div className="bg-[#0d1219] border border-[#1a2332] rounded-xl p-4">
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">14-Day RSI Momentum</div>
          <div className="text-base font-bold text-white mt-1 font-mono">{data.rsi_value.toFixed(1)}</div>
          <div className="text-[11px] text-emerald-400 mt-1 font-semibold">{data.rsi_signal}</div>
        </div>

        <div className="bg-[#0d1219] border border-[#1a2332] rounded-xl p-4">
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Support Pivots</div>
          <div className="text-base font-bold text-emerald-400 mt-1 font-mono">
            ${data.support_levels[0]?.toFixed(2)} - ${data.support_levels[1]?.toFixed(2)}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">Key demand reaction zone</div>
        </div>

        <div className="bg-[#0d1219] border border-[#1a2332] rounded-xl p-4">
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Resistance Overhead</div>
          <div className="text-base font-bold text-rose-400 mt-1 font-mono">
            ${data.resistance_levels[1]?.toFixed(2)} - ${data.resistance_levels[2]?.toFixed(2)}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">Supply ceiling zone</div>
        </div>
      </div>

      {/* Main Chart: Price + Moving Averages + Bollinger Bands */}
      <div className="bg-[#0d1219] border border-[#1a2332] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white">Price Action, SMA-20, SMA-50 & Bollinger Bands (20, 2)</h3>
            <p className="text-xs text-gray-400 mt-0.5">Mean reversion channel and trend alignment</p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <XAxis dataKey="date" stroke="#4b5563" fontSize={11} tickLine={false} />
              <YAxis domain={['auto', 'auto']} stroke="#4b5563" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#070a0e', borderColor: '#1a2332', borderRadius: '8px', fontSize: '12px', fontFamily: 'JetBrains Mono' }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Line type="monotone" dataKey="close" stroke="#f1f5f9" strokeWidth={2} dot={false} name="Close Price" />
              <Line type="monotone" dataKey="sma_20" stroke="#10b981" strokeWidth={1.5} dot={false} name="SMA 20" />
              <Line type="monotone" dataKey="sma_50" stroke="#f59e0b" strokeWidth={1.5} dot={false} name="SMA 50" />
              <Line type="monotone" dataKey="bb_upper" stroke="#06b6d4" strokeDasharray="3 3" dot={false} name="BB Upper" />
              <Line type="monotone" dataKey="bb_lower" stroke="#06b6d4" strokeDasharray="3 3" dot={false} name="BB Lower" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sub-Charts Grid: RSI & MACD */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* RSI 14 */}
        <div className="bg-[#0d1219] border border-[#1a2332] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Relative Strength Index (RSI 14)</h4>
            <span className="text-xs font-mono font-bold text-emerald-400">{data.rsi_value.toFixed(1)}</span>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="date" stroke="#4b5563" fontSize={10} tickLine={false} />
                <YAxis domain={[0, 100]} ticks={[30, 50, 70]} stroke="#4b5563" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#070a0e', borderColor: '#1a2332', borderRadius: '8px', fontSize: '11px', fontFamily: 'JetBrains Mono' }}
                />
                <ReferenceLine y={70} stroke="#f43f5e" strokeDasharray="3 3" label={{ value: '70 (Overbought)', fill: '#f43f5e', fontSize: 10 }} />
                <ReferenceLine y={30} stroke="#10b981" strokeDasharray="3 3" label={{ value: '30 (Oversold)', fill: '#10b981', fontSize: 10 }} />
                <Line type="monotone" dataKey="rsi" stroke="#10b981" strokeWidth={2} dot={false} name="RSI (14)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* MACD */}
        <div className="bg-[#0d1219] border border-[#1a2332] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">MACD (12, 26, 9)</h4>
            <span className="text-xs font-semibold text-emerald-400">{data.macd_signal}</span>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData}>
                <XAxis dataKey="date" stroke="#4b5563" fontSize={10} tickLine={false} />
                <YAxis domain={['auto', 'auto']} stroke="#4b5563" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#070a0e', borderColor: '#1a2332', borderRadius: '8px', fontSize: '11px', fontFamily: 'JetBrains Mono' }}
                />
                <Bar dataKey="macd_hist" fill="#10b981" name="Histogram" />
                <Line type="monotone" dataKey="macd" stroke="#f59e0b" strokeWidth={1.5} dot={false} name="MACD" />
                <Line type="monotone" dataKey="macd_signal" stroke="#f43f5e" strokeWidth={1.5} dot={false} name="Signal" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Observations */}
      <div className="bg-[#0d1219] border border-[#1a2332] rounded-2xl p-6">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
          Quantitative Observations
        </h4>
        <div className="space-y-2">
          {data.summary_observations.map((obs, i) => (
            <div key={i} className="flex items-start space-x-2 text-xs text-gray-300">
              <span className="text-emerald-400 font-bold">•</span>
              <span>{obs}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
