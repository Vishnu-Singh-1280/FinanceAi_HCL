import React, { useEffect, useState } from 'react';
import {
  Sliders,
  TrendingUp,
  Shield,
  Percent,
  RefreshCw,
  AlertTriangle,
  Layers,
  ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';
import { api } from '../api/client';
import { PortfolioOptimizeResponse } from '../types';
import { MetricCard } from '../components/MetricCard';

export const PortfolioOptimizer: React.FC = () => {
  const [symbolsInput, setSymbolsInput] = useState('AAPL, MSFT, GOOGL, AMZN, NVDA');
  const [maxWeight, setMaxWeight] = useState(0.40);
  const [data, setData] = useState<PortfolioOptimizeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runOptimization = () => {
    const symbols = symbolsInput.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean);
    if (symbols.length < 2) {
      setError('Please specify at least 2 distinct tickers for portfolio optimization');
      return;
    }

    setLoading(true);
    setError(null);

    api.optimizePortfolio(symbols, maxWeight)
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Optimization failed');
        setLoading(false);
      });
  };

  useEffect(() => {
    runOptimization();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="p-1.5 rounded-lg gradient-ai text-white">
                <Sliders className="w-4 h-4" />
              </span>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Markowitz Mean-Variance Portfolio Optimizer
              </h1>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Computes Modern Portfolio Theory Efficient Frontier, Maximum Sharpe allocation, Minimum Volatility weights, and VaR/CVaR risk budgeting.
            </p>
          </div>
        </div>

        {/* Input Parameters Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5 pt-4 border-t border-[#1f2937]">
          <div className="md:col-span-2">
            <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Asset Universe (Comma Separated)
            </label>
            <input
              type="text"
              value={symbolsInput}
              onChange={(e) => setSymbolsInput(e.target.value)}
              placeholder="e.g. AAPL, MSFT, GOOGL, NVDA"
              className="w-full bg-[#0b0f19] text-xs text-white px-3 py-2 rounded-lg border border-[#1f2937] focus:outline-none focus:border-indigo-500 uppercase"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Max Allocation Per Asset: {(maxWeight * 100).toFixed(0)}%
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="0.2"
                max="0.8"
                step="0.05"
                value={maxWeight}
                onChange={(e) => setMaxWeight(parseFloat(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <button
                onClick={runOptimization}
                disabled={loading}
                className="px-4 py-2 rounded-lg gradient-ai text-white text-xs font-semibold shadow-md shadow-indigo-500/20 disabled:opacity-50 shrink-0 cursor-pointer"
              >
                {loading ? 'Optimizing...' : 'Recompute'}
              </button>
            </div>
          </div>
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
          <p className="text-sm text-gray-400">Running 1,000 Monte Carlo simulations along Markowitz Efficient Frontier...</p>
        </div>
      )}

      {data && !loading && (
        <>
          {/* Key Risk-Adjusted Return KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              title="Max Sharpe Ratio"
              value={data.max_sharpe_ratio.toFixed(2)}
              subtitle={`Ann. Return: ${(data.max_sharpe_return * 100).toFixed(1)}%`}
              isPositiveGood={true}
            />
            <MetricCard
              title="Optimal Volatility (σ)"
              value={`${(data.max_sharpe_volatility * 100).toFixed(1)}%`}
              subtitle="Annualized Portfolio Risk"
            />
            <MetricCard
              title="1-Day 95% Value at Risk"
              value={`${(data.value_at_risk_95 * 100).toFixed(2)}%`}
              subtitle="Historical 95th Percentile Loss"
            />
            <MetricCard
              title="Conditional VaR (CVaR)"
              value={`${(data.conditional_var_95 * 100).toFixed(2)}%`}
              subtitle="Expected Shortfall in Tail Risk"
            />
          </div>

          {/* Efficient Frontier Chart + Optimal Weights Table */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Frontier Scatter Chart */}
            <div className="lg:col-span-2 bg-[#111827] border border-[#1f2937] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-white">Efficient Frontier Risk-Return Profile</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Annualized Volatility (X) vs Expected Return (Y)</p>
                </div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                    <XAxis
                      type="number"
                      dataKey="volatility"
                      name="Volatility"
                      unit="%"
                      domain={['auto', 'auto']}
                      stroke="#4b5563"
                      fontSize={11}
                      tickFormatter={(v) => `${(v * 100).toFixed(1)}%`}
                    />
                    <YAxis
                      type="number"
                      dataKey="return_rate"
                      name="Return"
                      unit="%"
                      domain={['auto', 'auto']}
                      stroke="#4b5563"
                      fontSize={11}
                      tickFormatter={(v) => `${(v * 100).toFixed(1)}%`}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                      formatter={(val: any, name: any) => [`${(Number(val) * 100).toFixed(2)}%`, name]}
                    />
                    <Scatter name="Frontier Portfolios" data={data.frontier} fill="#6366f1" opacity={0.7} />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Optimal Allocations */}
            <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
                  Recommended Target Weights
                </h3>

                <div className="space-y-3">
                  {Object.entries(data.max_sharpe_allocation).map(([sym, weight]) => (
                    <div key={sym}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-white">{sym}</span>
                        <span className="font-mono text-indigo-400 font-semibold">{(weight * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-[#1f2937] h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${weight * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#1f2937] text-xs">
                <div className="flex items-center justify-between text-gray-400">
                  <span>Min Volatility Portfolio Return:</span>
                  <span className="text-white font-mono font-medium">{(data.min_volatility_return * 100).toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between text-gray-400 mt-1">
                  <span>Min Volatility σ:</span>
                  <span className="text-white font-mono font-medium">{(data.min_volatility_volatility * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Correlation Matrix & Rebalance Strategy */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Correlation Matrix */}
            <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-6">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                Asset Return Correlation Matrix
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-center text-xs">
                  <thead>
                    <tr className="border-b border-[#1f2937] text-gray-400 font-semibold">
                      <th className="py-2 text-left">Asset</th>
                      {data.symbols.map((s) => (
                        <th key={s} className="py-2">{s}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1f2937]/50">
                    {data.symbols.map((rowSym) => (
                      <tr key={rowSym}>
                        <td className="py-2.5 text-left font-bold text-white">{rowSym}</td>
                        {data.symbols.map((colSym) => {
                          const corr = data.correlation_matrix[rowSym]?.[colSym] ?? 1.0;
                          const isHigh = corr > 0.7 && rowSym !== colSym;
                          return (
                            <td
                              key={colSym}
                              className={`py-2.5 font-mono ${
                                rowSym === colSym
                                  ? 'text-gray-500'
                                  : isHigh
                                  ? 'text-amber-400 font-bold'
                                  : 'text-gray-300'
                              }`}
                            >
                              {corr.toFixed(2)}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Rebalance Observations */}
            <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-6">
              <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3">
                Actionable Optimization Insights
              </h4>
              <div className="space-y-2.5 text-xs text-gray-300">
                {data.rebalance_notes.map((note, i) => (
                  <div key={i} className="flex items-start space-x-2">
                    <ArrowRight className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{note}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
