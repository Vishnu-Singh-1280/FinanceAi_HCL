import React, { useEffect, useState } from 'react';
import {
  Bookmark,
  Bell,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { api } from '../api/client';
import { WatchlistItemResponse, AlertResponse } from '../types';

interface WatchlistAlertsProps {
  onSelectSymbol: (symbol: string) => void;
}

export const WatchlistAlerts: React.FC<WatchlistAlertsProps> = ({ onSelectSymbol }) => {
  const [watchlist, setWatchlist] = useState<WatchlistItemResponse[]>([]);
  const [alerts, setAlerts] = useState<AlertResponse[]>([]);
  const [newSymbol, setNewSymbol] = useState('');

  // Alert form
  const [alertSymbol, setAlertSymbol] = useState('');
  const [alertCondition, setAlertCondition] = useState('above');
  const [alertTarget, setAlertTarget] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const loadAll = () => {
    setLoading(true);
    Promise.all([api.getWatchlist(), api.getAlerts()])
      .then(([wRes, aRes]) => {
        setWatchlist(wRes);
        setAlerts(aRes);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleAddWatchlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSymbol.trim()) return;
    try {
      await api.addToWatchlist(newSymbol.trim().toUpperCase());
      setNewSymbol('');
      api.getWatchlist().then(setWatchlist);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleRemoveWatchlist = async (symbol: string) => {
    try {
      await api.removeFromWatchlist(symbol);
      api.getWatchlist().then(setWatchlist);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertSymbol.trim() || !alertTarget) return;

    try {
      await api.createAlert(
        alertSymbol.trim().toUpperCase(),
        alertCondition,
        parseFloat(alertTarget),
        alertMessage || undefined
      );
      setAlertSymbol('');
      setAlertTarget('');
      setAlertMessage('');
      api.getAlerts().then(setAlerts);
    } catch (err: any) {
      alert(`Alert creation failed: ${err.message}`);
    }
  };

  const handleDeleteAlert = async (alertId: number) => {
    try {
      await api.deleteAlert(alertId);
      api.getAlerts().then(setAlerts);
    } catch (err: any) {
      alert(`Delete alert failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E7EB]">
        <div>
          <h1 className="text-2xl font-semibold text-[#172033] tracking-tight">
            Watchlist & Price Alerts
          </h1>
          <p className="text-xs text-[#667085] mt-0.5">
            Monitor target securities, track price action, and configure threshold notifications.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Watchlist */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
            <h3 className="text-sm font-semibold text-[#172033] flex items-center space-x-2">
              <Bookmark className="w-4 h-4 text-[#2563EB]" />
              <span>Target Watchlist</span>
            </h3>
            <span className="text-xs text-[#667085]">{watchlist.length} securities</span>
          </div>

          {/* Add to Watchlist Bar */}
          <form onSubmit={handleAddWatchlist} className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Add ticker (e.g. MSFT, NVDA)..."
              value={newSymbol}
              onChange={(e) => setNewSymbol(e.target.value)}
              className="flex-1 bg-[#F8FAFC] text-xs text-[#172033] px-3 py-2 rounded-lg border border-[#E5E7EB] focus:outline-none focus:bg-white focus:border-[#2563EB] uppercase font-semibold font-mono"
            />
            <button
              type="submit"
              className="px-3.5 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold flex items-center space-x-1 cursor-pointer shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </form>

          {/* Watchlist Items */}
          <div className="space-y-2 max-h-[420px] overflow-y-auto">
            {watchlist.map((item) => {
              const isUp = (item.change_pct ?? 0) >= 0;
              return (
                <div
                  key={item.symbol}
                  className="bg-[#F8FAFC] border border-[#E5E7EB] hover:border-[#D1D5DB] rounded-lg p-3 flex items-center justify-between transition-colors"
                >
                  <div
                    onClick={() => onSelectSymbol(item.symbol)}
                    className="cursor-pointer group flex-1"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-[#172033] text-sm group-hover:text-[#2563EB] transition-colors font-mono">
                        {item.symbol}
                      </span>
                      <span className="text-xs text-[#667085] truncate max-w-[150px]">{item.name}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm font-mono font-semibold text-[#172033] tabular-nums">
                        ${item.current_price ? item.current_price.toFixed(2) : '---'}
                      </div>
                      <div className={`text-xs font-mono tabular-nums font-semibold ${isUp ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
                        {item.change_pct !== undefined ? `${isUp ? '+' : ''}${item.change_pct.toFixed(2)}%` : ''}
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveWatchlist(item.symbol)}
                      className="p-1.5 rounded hover:bg-[#FEE2E2] text-[#98A2B3] hover:text-[#DC2626] transition-colors cursor-pointer"
                      title="Remove from Watchlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Price Alerts */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
            <h3 className="text-sm font-semibold text-[#172033] flex items-center space-x-2">
              <Bell className="w-4 h-4 text-[#2563EB]" />
              <span>Threshold Price Alerts</span>
            </h3>
            <span className="text-xs text-[#667085]">{alerts.length} configured</span>
          </div>

          {/* New Alert Form */}
          <form onSubmit={handleCreateAlert} className="space-y-3 p-4 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB] text-xs">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] text-[#667085] uppercase font-medium mb-1">Ticker</label>
                <input
                  type="text"
                  placeholder="e.g. AAPL"
                  value={alertSymbol}
                  onChange={(e) => setAlertSymbol(e.target.value)}
                  required
                  className="w-full bg-white text-[#172033] px-2.5 py-1.5 rounded-lg border border-[#E5E7EB] focus:outline-none focus:border-[#2563EB] uppercase font-mono font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#667085] uppercase font-medium mb-1">Condition</label>
                <select
                  value={alertCondition}
                  onChange={(e) => setAlertCondition(e.target.value)}
                  className="w-full bg-white text-[#172033] px-2.5 py-1.5 rounded-lg border border-[#E5E7EB] focus:outline-none focus:border-[#2563EB]"
                >
                  <option value="above">Price Above ($)</option>
                  <option value="below">Price Below ($)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-[#667085] uppercase font-medium mb-1">Target ($)</label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 250.00"
                  value={alertTarget}
                  onChange={(e) => setAlertTarget(e.target.value)}
                  required
                  className="w-full bg-white text-[#172033] px-2.5 py-1.5 rounded-lg border border-[#E5E7EB] focus:outline-none focus:border-[#2563EB] font-mono tabular-nums"
                />
              </div>
            </div>

            <div>
              <input
                type="text"
                placeholder="Alert note (optional)..."
                value={alertMessage}
                onChange={(e) => setAlertMessage(e.target.value)}
                className="w-full bg-white text-[#172033] px-2.5 py-1.5 rounded-lg border border-[#E5E7EB] focus:outline-none focus:border-[#2563EB] text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs flex items-center justify-center space-x-1 cursor-pointer shadow-xs transition-colors"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Set Alert Trigger</span>
            </button>
          </form>

          {/* Active Alerts List */}
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {alerts.map((al) => (
              <div
                key={al.id}
                className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg p-3 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-[#172033] font-mono">{al.symbol}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        al.is_triggered
                          ? 'bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA]'
                          : 'bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE]'
                      }`}
                    >
                      {al.is_triggered ? 'Triggered' : 'Monitoring'}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#667085] mt-0.5">
                    Trigger when {al.condition} ${al.target_value.toFixed(2)}
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteAlert(al.id)}
                  className="p-1.5 rounded hover:bg-[#FEE2E2] text-[#98A2B3] hover:text-[#DC2626] transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
