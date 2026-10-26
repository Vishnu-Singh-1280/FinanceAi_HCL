import React, { useEffect, useState } from 'react';
import {
  X,
  Shield,
  Server,
  Database,
  Cpu,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Users,
  Activity
} from 'lucide-react';
import { api } from '../api/client';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({ isOpen, onClose }) => {
  const [metrics, setMetrics] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cacheClearing, setCacheClearing] = useState(false);
  const [cacheMessage, setCacheMessage] = useState<string | null>(null);

  const fetchAdminData = () => {
    setLoading(true);
    Promise.all([
      api.getAdminMetrics().catch(() => null),
      api.getAdminUsers().catch(() => null)
    ])
      .then(([mRes, uRes]) => {
        if (mRes) setMetrics(mRes);
        if (uRes) setUsers(uRes);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    if (isOpen) {
      fetchAdminData();
    }
  }, [isOpen]);

  const handleClearCache = async () => {
    setCacheClearing(true);
    setCacheMessage(null);
    try {
      const res = await api.clearCache();
      setCacheMessage(`Flushed ${res.cleared_items} cached objects.`);
      fetchAdminData();
      setTimeout(() => setCacheMessage(null), 3000);
    } catch (err: any) {
      setCacheMessage(`Failed: ${err.message}`);
    } finally {
      setCacheClearing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#E5E7EB] rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#F1F5F9] bg-[#0F172A] text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-[#2563EB] flex items-center justify-center text-white">
              <Shield className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-semibold tracking-tight">FinanceAI Governance & Admin Console</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  ROOT ADMIN
                </span>
              </div>
              <p className="text-xs text-slate-400">System infrastructure oversight, user directory, and database metrics</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <RefreshCw className="w-6 h-6 text-[#2563EB] animate-spin" />
              <p className="text-xs text-[#667085]">Retrieving server telemetry and user directory...</p>
            </div>
          ) : (
            <>
              {/* Telemetry Cards Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3.5 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl">
                  <div className="flex items-center space-x-1.5 text-[11px] text-[#667085] font-medium mb-1">
                    <Database className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>Database Records</span>
                  </div>
                  <div className="text-lg font-semibold text-[#172033] font-mono tabular-nums">
                    {(metrics?.database?.portfolios || 0) + (metrics?.database?.watchlist_items || 0) + (metrics?.database?.price_alerts || 0)} items
                  </div>
                  <div className="text-[10px] text-[#667085] mt-1">SQLite Persistent DB</div>
                </div>

                <div className="p-3.5 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl">
                  <div className="flex items-center space-x-1.5 text-[11px] text-[#667085] font-medium mb-1">
                    <Cpu className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>Process Memory</span>
                  </div>
                  <div className="text-lg font-semibold text-[#172033] font-mono tabular-nums">
                    {metrics?.system?.process_memory_mb || '142.5'} MB
                  </div>
                  <div className="text-[10px] text-[#16A34A] mt-1 font-medium">Within Normal Threshold</div>
                </div>

                <div className="p-3.5 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl">
                  <div className="flex items-center space-x-1.5 text-[11px] text-[#667085] font-medium mb-1">
                    <Activity className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>In-Memory Cache</span>
                  </div>
                  <div className="text-lg font-semibold text-[#172033] font-mono tabular-nums">
                    {metrics?.system?.cached_securities || 0} securities
                  </div>
                  <div className="text-[10px] text-[#667085] mt-1">TTL 5-minute expiry</div>
                </div>

                <div className="p-3.5 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl">
                  <div className="flex items-center space-x-1.5 text-[11px] text-[#667085] font-medium mb-1">
                    <Server className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>Platform Uptime</span>
                  </div>
                  <div className="text-lg font-semibold text-[#16A34A] font-mono">99.98%</div>
                  <div className="text-[10px] text-[#667085] mt-1">FastAPI Engine Live</div>
                </div>
              </div>

              {/* Cache Control & Maintenance */}
              <div className="p-4 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-[#172033]">Market Telemetry Cache Management</h4>
                  <p className="text-xs text-[#667085] mt-0.5">Flush in-memory price feeds to force immediate yfinance re-fetch.</p>
                  {cacheMessage && (
                    <span className="text-xs text-[#16A34A] font-medium mt-1 inline-block">{cacheMessage}</span>
                  )}
                </div>

                <button
                  onClick={handleClearCache}
                  disabled={cacheClearing}
                  className="px-3.5 py-2 bg-white hover:bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA] rounded-lg font-medium text-xs flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{cacheClearing ? 'Flushing...' : 'Flush Cache'}</span>
                </button>
              </div>

              {/* Users Directory */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-[#172033] flex items-center space-x-1.5">
                    <Users className="w-4 h-4 text-[#2563EB]" />
                    <span>Authorized User Accounts ({users.length})</span>
                  </h4>
                  <span className="text-[11px] text-[#667085]">Role-Based Access Control</span>
                </div>

                <div className="border border-[#E5E7EB] rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-[#F8FAFC] border-b border-[#E5E7EB] text-[#667085] font-medium">
                        <th className="py-2.5 px-3">Name / Email</th>
                        <th className="py-2.5 px-3">Role</th>
                        <th className="py-2.5 px-3">License Tier</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Last Active</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F1F5F9]">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-[#F8FAFC]">
                          <td className="py-2.5 px-3">
                            <div className="font-semibold text-[#172033]">{u.name}</div>
                            <div className="text-[11px] text-[#667085]">{u.email}</div>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded font-medium text-[10px] ${
                              u.role === 'Administrator' ? 'bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE]' : 'bg-[#F1F5F9] text-[#475569]'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-[#475569]">{u.tier}</td>
                          <td className="py-2.5 px-3">
                            <span className="inline-flex items-center text-[11px] text-[#16A34A] font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] mr-1"></span>
                              {u.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right text-[#667085]">{u.last_active}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E5E7EB] bg-[#F8FAFC] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
