import React, { useEffect, useState } from 'react';
import {
  GitCompare,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  AlertTriangle,
  Building,
  Sparkles
} from 'lucide-react';
import { api } from '../api/client';
import { PeerComparisonResponse } from '../types';

interface PeerComparisonProps {
  currentSymbol: string;
  onSelectSymbol: (symbol: string) => void;
}

export const PeerComparison: React.FC<PeerComparisonProps> = ({ currentSymbol, onSelectSymbol }) => {
  const [data, setData] = useState<PeerComparisonResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.getPeers(currentSymbol)
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to compare peer group');
        setLoading(false);
      });
  }, [currentSymbol]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
        <p className="text-sm text-gray-400">Benchmarking cross-sectional peer valuations and performance...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 bg-rose-950/20 border border-rose-900/50 rounded-xl text-center max-w-lg mx-auto my-12">
        <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
        <h3 className="text-base font-bold text-white">Peer Benchmarking Error</h3>
        <p className="text-xs text-rose-300 mt-1 mb-4">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-6">
        <div className="flex items-center space-x-2.5 mb-2">
          <span className="p-1.5 rounded-lg gradient-ai text-white">
            <GitCompare className="w-4 h-4" />
          </span>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Cross-Sectional Peer Benchmarking & Relative Valuation
          </h1>
        </div>
        <p className="text-xs text-gray-400">
          Comparing {currentSymbol} against direct industry peers across valuation multiples, operational margins, and volatility.
        </p>

        {/* AI Comparative Summary */}
        <div className="mt-4 p-4 rounded-xl bg-indigo-950/30 border border-indigo-900/40 text-xs text-indigo-200 leading-relaxed flex items-start space-x-3">
          <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <div>{data.ai_summary}</div>
        </div>
      </div>

      {/* Comparison Matrix Table */}
      <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
          Financial Multiples & Performance Matrix
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1f2937] text-gray-400 uppercase text-[10px] tracking-wider">
                <th className="pb-3">Security</th>
                <th className="pb-3 text-right">Price</th>
                <th className="pb-3 text-right">1-Day Change</th>
                <th className="pb-3 text-right">1-Yr Return</th>
                <th className="pb-3 text-right">Market Cap</th>
                <th className="pb-3 text-right">Trailing P/E</th>
                <th className="pb-3 text-right">Profit Margin</th>
                <th className="pb-3 text-right">ROE</th>
                <th className="pb-3 text-right">Div Yield</th>
                <th className="pb-3 text-right">Volatility (σ)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2937]/50">
              {data.stocks.map((stock) => {
                const isCurrent = stock.symbol === currentSymbol;
                const isUp = stock.change_pct >= 0;
                return (
                  <tr
                    key={stock.symbol}
                    onClick={() => onSelectSymbol(stock.symbol)}
                    className={`hover:bg-[#1f2937] transition-colors cursor-pointer group ${
                      isCurrent ? 'bg-indigo-950/20' : ''
                    }`}
                  >
                    <td className="py-3 font-bold text-white">
                      <div className="flex items-center space-x-1.5">
                        <span className="group-hover:text-indigo-400 transition-colors">{stock.symbol}</span>
                        {isCurrent && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-600 text-white font-bold">
                            Current
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-gray-400 font-normal truncate max-w-[120px]">{stock.name}</div>
                    </td>
                    <td className="py-3 text-right font-mono font-medium text-white">${stock.price.toFixed(2)}</td>
                    <td className="py-3 text-right font-mono font-bold">
                      <span className={isUp ? 'text-emerald-400' : 'text-rose-400'}>
                        {isUp ? '+' : ''}{stock.change_pct.toFixed(2)}%
                      </span>
                    </td>
                    <td className="py-3 text-right font-mono font-bold text-indigo-300">
                      {stock.ytd_return_pct ? `${stock.ytd_return_pct > 0 ? '+' : ''}${stock.ytd_return_pct.toFixed(1)}%` : 'N/A'}
                    </td>
                    <td className="py-3 text-right font-mono text-gray-300">
                      {stock.market_cap ? `$${(stock.market_cap / 1e9).toFixed(1)}B` : 'N/A'}
                    </td>
                    <td className="py-3 text-right font-mono text-gray-300">
                      {stock.pe_ratio ? `${stock.pe_ratio.toFixed(1)}x` : 'N/A'}
                    </td>
                    <td className="py-3 text-right font-mono text-gray-300">
                      {stock.profit_margin ? `${(stock.profit_margin * 100).toFixed(1)}%` : 'N/A'}
                    </td>
                    <td className="py-3 text-right font-mono text-gray-300">
                      {stock.roe ? `${(stock.roe * 100).toFixed(1)}%` : 'N/A'}
                    </td>
                    <td className="py-3 text-right font-mono text-gray-300">
                      {stock.dividend_yield ? `${(stock.dividend_yield * 100).toFixed(2)}%` : '0.00%'}
                    </td>
                    <td className="py-3 text-right font-mono text-gray-300">
                      {stock.volatility ? `${(stock.volatility * 100).toFixed(1)}%` : 'N/A'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
