import React, { useEffect, useState } from 'react';
import {
  PlaySquare,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  AlertTriangle,
  Award,
  Layers,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';
import { api } from '../api/client';
import { BacktestResponse } from '../types';
import { MetricCard } from '../components/MetricCard';

interface BacktestingProps {
  currentSymbol: string;
}

export const Backtesting: React.FC<BacktestingProps> = ({ currentSymbol }) => {
  const [strategy, setStrategy] = useState('sma_crossover');
  const [initialCapital, setInitialCapital] = useState(10000);
  const [fastPeriod, setFastPeriod] = useState(20);
  const [slowPeriod, setSlowPeriod] = useState(50);
  const [rsiOversold, setRsiOversold] = useState(30);
  const [rsiOverbought, setRsiOverbought] = useState(70);

  const [data, setData] = useState<BacktestResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runSimulation = () => {
    setLoading(true);
    setError(null);
    api.runBacktest({
      symbol: currentSymbol,
      strategy,
      initial_capital: initialCapital,
      fast_period: fastPeriod,
      slow_period: slowPeriod,
      rsi_oversold: rsiOversold,
      rsi_overbought: rsiOverbought
    })
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Backtest simulation failed');
        setLoading(false);
      });
  };

  useEffect(() => {
    runSimulation();
  }, [currentSymbol, strategy]);

  const equityChartData = data?.equity_curve.map((pt) => ({
    date: pt.date.slice(5),
    Strategy: pt.equity,
    Benchmark: pt.benchmark_equity,
    Drawdown: pt.drawdown_pct
  })) || [];

  return (
    <div className="space-y-6">
      {/* Header Banner & Parameters */}
      <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5 mb-1">
              <span className="p-1.5 rounded-lg gradient-ai text-white">
                <PlaySquare className="w-4 h-4" />
              </span>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Quantitative Trading Strategy Backtester: <span className="text-indigo-400">{currentSymbol}</span>
              </h1>
            </div>
            <p className="text-xs text-gray-400">
              Simulates realistic rule-based execution, transaction fees, and drawdown dynamics without look-ahead bias.
            </p>
          </div>

          <button
            onClick={runSimulation}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl gradient-ai text-white text-xs font-semibold shadow-lg shadow-indigo-500/20 disabled:opacity-50 transition-all cursor-pointer"
          >
            {loading ? 'Simulating...' : 'Run Simulation'}
          </button>
        </div>

        {/* Strategy Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-5 pt-4 border-t border-[#1f2937] text-xs">
          <div>
            <label className="block text-gray-400 uppercase text-[10px] font-semibold mb-1">Strategy Type</label>
            <select
              value={strategy}
              onChange={(e) => setStrategy(e.target.value)}
              className="w-full bg-[#0b0f19] text-white px-3 py-2 rounded-lg border border-[#1f2937] focus:outline-none focus:border-indigo-500"
            >
              <option value="sma_crossover">SMA Trend Crossover</option>
              <option value="rsi_mean_reversion">RSI Mean Reversion</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-400 uppercase text-[10px] font-semibold mb-1">Initial Capital ($)</label>
            <input
              type="number"
              value={initialCapital}
              onChange={(e) => setInitialCapital(parseFloat(e.target.value) || 10000)}
              className="w-full bg-[#0b0f19] text-white px-3 py-2 rounded-lg border border-[#1f2937] focus:outline-none focus:border-indigo-500"
            />
          </div>

          {strategy === 'sma_crossover' ? (
            <>
              <div>
                <label className="block text-gray-400 uppercase text-[10px] font-semibold mb-1">Fast SMA Period</label>
                <input
                  type="number"
                  value={fastPeriod}
                  onChange={(e) => setFastPeriod(parseInt(e.target.value) || 20)}
                  className="w-full bg-[#0b0f19] text-white px-3 py-2 rounded-lg border border-[#1f2937] focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-gray-400 uppercase text-[10px] font-semibold mb-1">Slow SMA Period</label>
                <input
                  type="number"
                  value={slowPeriod}
                  onChange={(e) => setSlowPeriod(parseInt(e.target.value) || 50)}
                  className="w-full bg-[#0b0f19] text-white px-3 py-2 rounded-lg border border-[#1f2937] focus:outline-none focus:border-indigo-500"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-gray-400 uppercase text-[10px] font-semibold mb-1">RSI Oversold (Buy)</label>
                <input
                  type="number"
                  value={rsiOversold}
                  onChange={(e) => setRsiOversold(parseInt(e.target.value) || 30)}
                  className="w-full bg-[#0b0f19] text-white px-3 py-2 rounded-lg border border-[#1f2937] focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-gray-400 uppercase text-[10px] font-semibold mb-1">RSI Overbought (Sell)</label>
                <input
                  type="number"
                  value={rsiOverbought}
                  onChange={(e) => setRsiOverbought(parseInt(e.target.value) || 70)}
                  className="w-full bg-[#0b0f19] text-white px-3 py-2 rounded-lg border border-[#1f2937] focus:outline-none focus:border-indigo-500"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-950/20 border border-rose-900/50 rounded-xl text-xs text-rose-300 flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-3">
          <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
          <p className="text-sm text-gray-400">Executing strategy historical backtest across 2-year OHLCV bars...</p>
        </div>
      )}

      {data && !loading && (
        <>
          {/* KPI Performance Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              title="Strategy Total Return"
              value={`$${data.final_equity.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
              change={data.total_return_pct}
              subtitle={`Benchmark: ${data.benchmark_return_pct > 0 ? '+' : ''}${data.benchmark_return_pct.toFixed(1)}%`}
              isPositiveGood={data.total_return_pct >= data.benchmark_return_pct}
            />
            <MetricCard
              title="Annualized Sharpe Ratio"
              value={data.sharpe_ratio.toFixed(2)}
              subtitle="Risk-Adjusted Return Measure"
              isPositiveGood={data.sharpe_ratio > 1.0}
            />
            <MetricCard
              title="Maximum Drawdown"
              value={`-${data.max_drawdown_pct.toFixed(2)}%`}
              subtitle="Peak to Trough Decline"
              isPositiveGood={data.max_drawdown_pct < 15}
            />
            <MetricCard
              title="Win Rate & Profit Factor"
              value={`${data.win_rate_pct.toFixed(1)}%`}
              subtitle={`Profit Factor: ${data.profit_factor.toFixed(2)} (${data.total_trades} trades)`}
              isPositiveGood={data.win_rate_pct > 50}
            />
          </div>

          {/* Equity Curve vs Benchmark Chart */}
          <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Strategy Equity Curve vs Buy & Hold Benchmark</h3>
                <p className="text-xs text-gray-400 mt-0.5">Capital accumulation curve net of 0.1% transaction friction</p>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={equityChartData}>
                  <XAxis dataKey="date" stroke="#4b5563" fontSize={11} tickLine={false} />
                  <YAxis domain={['auto', 'auto']} stroke="#4b5563" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                  />
                  <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', color: '#9ca3af' }} />
                  <Line type="monotone" dataKey="Strategy" stroke="#6366f1" strokeWidth={2.5} dot={false} name="Quantitative Strategy" />
                  <Line type="monotone" dataKey="Benchmark" stroke="#64748b" strokeWidth={1.5} dot={false} strokeDasharray="3 3" name="Buy & Hold Benchmark" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Trade Execution Log */}
          <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Simulated Trade History Log ({data.trades.length} completed cycles)
            </h3>

            {data.trades.length === 0 ? (
              <div className="text-xs text-gray-400 text-center py-6">
                No trades triggered with current threshold parameters during this timeframe.
              </div>
            ) : (
              <div className="overflow-x-auto max-h-72">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-[#111827]">
                    <tr className="border-b border-[#1f2937] text-gray-400 uppercase text-[10px] tracking-wider">
                      <th className="pb-2">Entry Date</th>
                      <th className="pb-2">Exit Date</th>
                      <th className="pb-2 text-right">Entry Price</th>
                      <th className="pb-2 text-right">Exit Price</th>
                      <th className="pb-2 text-right">Shares</th>
                      <th className="pb-2 text-right">Profit / Loss</th>
                      <th className="pb-2 text-right">Return %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1f2937]/50">
                    {data.trades.map((t, idx) => {
                      const isProfit = t.profit_loss >= 0;
                      return (
                        <tr key={idx} className="hover:bg-[#1f2937] transition-colors font-mono">
                          <td className="py-2.5 text-gray-300">{t.entry_date}</td>
                          <td className="py-2.5 text-gray-300">{t.exit_date}</td>
                          <td className="py-2.5 text-right text-gray-400">${t.entry_price.toFixed(2)}</td>
                          <td className="py-2.5 text-right text-white font-medium">${t.exit_price.toFixed(2)}</td>
                          <td className="py-2.5 text-right text-gray-300">{t.shares}</td>
                          <td className={`py-2.5 text-right font-bold ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isProfit ? '+' : ''}${t.profit_loss.toFixed(2)}
                          </td>
                          <td className={`py-2.5 text-right font-bold ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isProfit ? '+' : ''}{t.return_pct.toFixed(2)}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
