import React, { useEffect, useState } from 'react';
import {
  Filter,
  Search,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Building,
  Check
} from 'lucide-react';
import { api } from '../api/client';
import { ScreenerItem } from '../types';

interface ScreenerProps {
  onSelectSymbol: (symbol: string) => void;
}

const SECTOR_OPTIONS = [
  'All',
  'Technology',
  'Consumer Discretionary',
  'Communication Services',
  'Financials',
  'Healthcare',
  'Energy',
  'Broad Market ETF'
];

export const Screener: React.FC<ScreenerProps> = ({ onSelectSymbol }) => {
  const [assetType, setAssetType] = useState<'stock' | 'etf'>('stock');
  const [sector, setSector] = useState('All');
  const [search, setSearch] = useState('');
  const [minPe, setMinPe] = useState<string>('');
  const [maxPe, setMaxPe] = useState<string>('');
  const [minDiv, setMinDiv] = useState<string>('');
  const [items, setItems] = useState<ScreenerItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchScreener = () => {
    setLoading(true);
    api.screen({
      asset_type: assetType,
      sector: sector !== 'All' ? sector : undefined,
      search: search || undefined,
      min_pe: minPe ? parseFloat(minPe) : undefined,
      max_pe: maxPe ? parseFloat(maxPe) : undefined,
      min_dividend: minDiv ? parseFloat(minDiv) : undefined
    })
      .then((res) => {
        setItems(res);
        setLoading(false);
      })
      .catch(() => {
        setItems([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchScreener();
  }, [assetType, sector]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="p-1.5 rounded-lg gradient-ai text-white">
                <Filter className="w-4 h-4" />
              </span>
              <h1 className="text-xl font-bold text-white tracking-tight">Institutional Stock & ETF Screener</h1>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Screen equities and exchange-traded funds by valuation multiples, dividend yields, technical RSI momentum, and sector classifications.
            </p>
          </div>

          {/* Asset Type Toggle */}
          <div className="flex items-center bg-[#0b0f19] p-1 rounded-xl border border-[#1f2937]">
            <button
              onClick={() => setAssetType('stock')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                assetType === 'stock'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Equities
            </button>
            <button
              onClick={() => setAssetType('etf')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                assetType === 'etf'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              ETFs & Funds
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 mt-6 pt-5 border-t border-[#1f2937] text-xs">
          {/* Keyword Search */}
          <div>
            <label className="block text-gray-400 uppercase text-[10px] font-semibold mb-1">Search Ticker / Name</label>
            <input
              type="text"
              placeholder="e.g. AAPL, Microsoft..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0b0f19] text-white px-3 py-2 rounded-lg border border-[#1f2937] focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Sector Filter */}
          <div>
            <label className="block text-gray-400 uppercase text-[10px] font-semibold mb-1">Sector</label>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="w-full bg-[#0b0f19] text-white px-3 py-2 rounded-lg border border-[#1f2937] focus:outline-none focus:border-indigo-500"
            >
              {SECTOR_OPTIONS.map((sec) => (
                <option key={sec} value={sec}>{sec}</option>
              ))}
            </select>
          </div>

          {/* Min PE */}
          <div>
            <label className="block text-gray-400 uppercase text-[10px] font-semibold mb-1">Min P/E</label>
            <input
              type="number"
              placeholder="e.g. 15"
              value={minPe}
              onChange={(e) => setMinPe(e.target.value)}
              className="w-full bg-[#0b0f19] text-white px-3 py-2 rounded-lg border border-[#1f2937] focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Max PE */}
          <div>
            <label className="block text-gray-400 uppercase text-[10px] font-semibold mb-1">Max P/E</label>
            <input
              type="number"
              placeholder="e.g. 40"
              value={maxPe}
              onChange={(e) => setMaxPe(e.target.value)}
              className="w-full bg-[#0b0f19] text-white px-3 py-2 rounded-lg border border-[#1f2937] focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Apply Button */}
          <div className="flex items-end">
            <button
              onClick={fetchScreener}
              className="w-full py-2 rounded-lg gradient-ai text-white font-semibold shadow-md shadow-indigo-500/20 text-xs flex items-center justify-center space-x-1 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Filter Results</span>
            </button>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Screened Universe</h3>
          <span className="text-xs text-gray-400">{items.length} matching securities</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 space-x-3">
            <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" />
            <span className="text-xs text-gray-400">Filtering database...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-xs">
            No securities match the selected screening criteria. Try relaxing your filter bounds.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1f2937] text-gray-400 uppercase text-[10px] tracking-wider">
                  <th className="pb-3">Ticker & Company</th>
                  <th className="pb-3 text-right">Price</th>
                  <th className="pb-3 text-right">Change %</th>
                  <th className="pb-3 text-right">Market Cap</th>
                  <th className="pb-3 text-right">P/E Ratio</th>
                  <th className="pb-3 text-right">Div Yield</th>
                  <th className="pb-3 text-right">RSI (14)</th>
                  <th className="pb-3 text-right">Sector</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f2937]/50">
                {items.map((item) => {
                  const isUp = item.change_pct >= 0;
                  return (
                    <tr
                      key={item.symbol}
                      onClick={() => onSelectSymbol(item.symbol)}
                      className="hover:bg-[#1f2937] transition-colors cursor-pointer group"
                    >
                      <td className="py-3">
                        <div className="font-bold text-white group-hover:text-indigo-400 transition-colors">
                          {item.symbol}
                        </div>
                        <div className="text-[11px] text-gray-400 truncate max-w-xs">{item.name}</div>
                      </td>
                      <td className="py-3 text-right font-mono font-medium text-white">${item.price.toFixed(2)}</td>
                      <td className="py-3 text-right font-mono font-bold">
                        <span className={isUp ? 'text-emerald-400' : 'text-rose-400'}>
                          {isUp ? '+' : ''}{item.change_pct.toFixed(2)}%
                        </span>
                      </td>
                      <td className="py-3 text-right font-mono text-gray-300">
                        {item.market_cap ? `$${(item.market_cap / 1e9).toFixed(1)}B` : 'N/A'}
                      </td>
                      <td className="py-3 text-right font-mono text-gray-300">
                        {item.pe_ratio ? `${item.pe_ratio.toFixed(1)}x` : (item.expense_ratio ? `Exp: ${(item.expense_ratio * 100).toFixed(2)}%` : 'N/A')}
                      </td>
                      <td className="py-3 text-right font-mono text-gray-300">
                        {item.dividend_yield ? `${(item.dividend_yield * 100).toFixed(2)}%` : '0.00%'}
                      </td>
                      <td className="py-3 text-right font-mono font-semibold">
                        <span
                          className={
                            (item.rsi_14 || 50) > 70
                              ? 'text-rose-400'
                              : (item.rsi_14 || 50) < 30
                              ? 'text-emerald-400'
                              : 'text-indigo-300'
                          }
                        >
                          {item.rsi_14 ? item.rsi_14.toFixed(1) : '50.0'}
                        </span>
                      </td>
                      <td className="py-3 text-right text-gray-400">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#1f2937] text-gray-300">
                          {item.sector || 'General'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
