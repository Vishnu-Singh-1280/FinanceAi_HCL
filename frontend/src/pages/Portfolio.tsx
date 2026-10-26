import React, { useEffect, useState } from 'react';
import {
  Briefcase,
  TrendingUp,
  TrendingDown,
  PlusCircle,
  DollarSign,
  PieChart as PieIcon,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  X,
  Sliders
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { api } from '../api/client';
import { PortfolioDetailResponse } from '../types';
import { MetricCard } from '../components/MetricCard';

interface PortfolioProps {
  onSelectSymbol: (symbol: string) => void;
  onNavigatePage: (page: string) => void;
}

const SECTOR_COLORS = ['#2563EB', '#0D9488', '#F59E0B', '#64748B', '#8B5CF6', '#EC4899', '#10B981'];

export const Portfolio: React.FC<PortfolioProps> = ({ onSelectSymbol, onNavigatePage }) => {
  const [data, setData] = useState<PortfolioDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal form state
  const [showModal, setShowModal] = useState(false);
  const [formSymbol, setFormSymbol] = useState('');
  const [formType, setFormType] = useState('buy');
  const [formQty, setFormQty] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchPortfolio = () => {
    setLoading(true);
    setError(null);
    api.getPortfolio()
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load portfolio details');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSymbol || !formQty || !formPrice) return;

    setSubmitting(true);
    try {
      await api.addTransaction({
        symbol: formSymbol.trim().toUpperCase(),
        transaction_type: formType,
        quantity: parseFloat(formQty),
        price: parseFloat(formPrice),
        fees: 2.0,
        notes: formNotes || 'Manual transaction entry'
      });
      setShowModal(false);
      setFormSymbol('');
      setFormQty('');
      setFormPrice('');
      setFormNotes('');
      fetchPortfolio();
    } catch (err: any) {
      alert(`Transaction error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <RefreshCw className="w-6 h-6 text-[#2563EB] animate-spin" />
        <p className="text-sm font-medium text-[#667085]">Reconciling portfolio positions and computing cost-basis...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 bg-white border border-[#E5E7EB] rounded-xl text-center max-w-lg mx-auto my-12 shadow-xs">
        <div className="w-10 h-10 rounded-full bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center mx-auto mb-3">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <h3 className="text-base font-semibold text-[#172033]">Portfolio Telemetry Error</h3>
        <p className="text-xs text-[#667085] mt-1 mb-4">{error}</p>
        <button
          onClick={fetchPortfolio}
          className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg text-xs font-semibold cursor-pointer"
        >
          Retry Load
        </button>
      </div>
    );
  }

  const sectorPieData = Object.entries(data.sector_allocation).map(([sector, pct]) => ({
    name: sector,
    value: pct
  }));

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E7EB]">
        <div>
          <h1 className="text-2xl font-semibold text-[#172033] tracking-tight">
            Portfolio Management
          </h1>
          <p className="text-xs text-[#667085] mt-0.5">
            Real-time equity holdings, cost-basis accounting, and asset diversification.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => onNavigatePage('optimizer')}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-white border border-[#E5E7EB] hover:bg-[#F8FAFC] text-[#172033] transition-colors cursor-pointer shadow-xs flex items-center space-x-1.5"
          >
            <Sliders className="w-3.5 h-3.5 text-[#667085]" />
            <span>Markowitz Optimizer</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white transition-colors cursor-pointer shadow-xs flex items-center space-x-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Record Transaction</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Total Portfolio Value"
          value={`$${data.total_equity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<DollarSign className="w-4 h-4" />}
          subtitle={`Cash: $${data.cash_balance.toLocaleString()}`}
        />
        <MetricCard
          title="Unrealized Profit/Loss"
          value={`$${data.total_unrealized_pl.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          change={data.total_unrealized_pl_pct}
          subtitle={`Cost Basis: $${data.total_cost_basis.toLocaleString()}`}
        />
        <MetricCard
          title="Daily Movement"
          value={`$${data.daily_change.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          change={data.daily_change_pct}
          subtitle="Estimated 1-Day Change"
        />
        <MetricCard
          title="Diversification & Risk"
          value={data.concentration_risk}
          icon={<ShieldCheck className="w-4 h-4" />}
          subtitle={`${data.holdings.length} Active Positions`}
          isPositiveGood={!data.concentration_risk.includes('High')}
        />
      </div>

      {/* Main Grid: Holdings Table + Sector Allocation Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Holdings Table (2 Cols) */}
        <div className="lg:col-span-2 bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
            <h3 className="text-sm font-semibold text-[#172033]">Active Asset Holdings</h3>
            <span className="text-xs text-[#667085]">{data.holdings.length} securities tracked</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#F1F5F9] text-[#667085] font-medium">
                  <th className="py-2.5 px-3">Security</th>
                  <th className="py-2.5 px-3 text-right">Qty</th>
                  <th className="py-2.5 px-3 text-right">Avg Cost</th>
                  <th className="py-2.5 px-3 text-right">Price</th>
                  <th className="py-2.5 px-3 text-right">Market Value</th>
                  <th className="py-2.5 px-3 text-right">Unrealized P&L</th>
                  <th className="py-2.5 px-3 text-right">Weight</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {data.holdings.map((h) => {
                  const isUp = h.unrealized_pl >= 0;
                  return (
                    <tr
                      key={h.symbol}
                      onClick={() => onSelectSymbol(h.symbol)}
                      className="hover:bg-[#F8FAFC] transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-3 font-semibold text-[#172033] flex items-center space-x-1.5">
                        <span className="group-hover:text-[#2563EB] transition-colors font-mono">{h.symbol}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]">
                          {h.sector || 'Stock'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right text-[#475569] font-mono tabular-nums">{h.quantity}</td>
                      <td className="py-3 px-3 text-right text-[#667085] font-mono tabular-nums">${h.average_cost.toFixed(2)}</td>
                      <td className="py-3 px-3 text-right text-[#172033] font-mono tabular-nums font-medium">${h.current_price.toFixed(2)}</td>
                      <td className="py-3 px-3 text-right text-[#172033] font-mono tabular-nums font-semibold">${h.market_value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold">
                        <div className={isUp ? 'text-[#16A34A]' : 'text-[#DC2626]'}>
                          {isUp ? '+' : ''}${h.unrealized_pl.toFixed(2)}
                        </div>
                        <div className={`text-[10px] ${isUp ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
                          ({isUp ? '+' : ''}{h.unrealized_pl_pct.toFixed(2)}%)
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right text-[#2563EB] font-mono tabular-nums font-semibold">{h.weight_pct.toFixed(1)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sector Allocation Chart (1 Col) */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 pb-3 mb-3 border-b border-[#F1F5F9]">
              <PieIcon className="w-4 h-4 text-[#2563EB]" />
              <h3 className="text-sm font-semibold text-[#172033]">Sector Diversification</h3>
            </div>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sectorPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {sectorPieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={SECTOR_COLORS[index % SECTOR_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', borderRadius: '8px', fontSize: '11px', color: '#172033' }}
                    formatter={(val: any) => [`${Number(val).toFixed(1)}%`, 'Allocation']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-1.5 mt-2">
              {sectorPieData.map((item, idx) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block"
                      style={{ backgroundColor: SECTOR_COLORS[idx % SECTOR_COLORS.length] }}
                    ></span>
                    <span className="text-[#475569]">{item.name}</span>
                  </div>
                  <span className="text-[#172033] font-mono tabular-nums font-semibold">{item.value.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 max-w-md w-full shadow-lg">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#F1F5F9]">
              <h3 className="text-base font-semibold text-[#172033]">Record Portfolio Transaction</h3>
              <button onClick={() => setShowModal(false)} className="text-[#98A2B3] hover:text-[#172033] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTransaction} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#667085] uppercase tracking-wider mb-1 font-medium">Stock / ETF Ticker</label>
                <input
                  type="text"
                  placeholder="e.g. AAPL, NVDA, TSLA"
                  value={formSymbol}
                  onChange={(e) => setFormSymbol(e.target.value)}
                  required
                  className="w-full bg-[#F8FAFC] text-[#172033] px-3 py-2 rounded-lg border border-[#E5E7EB] focus:outline-none focus:bg-white focus:border-[#2563EB] uppercase font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#667085] uppercase tracking-wider mb-1 font-medium">Order Type</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="w-full bg-[#F8FAFC] text-[#172033] px-3 py-2 rounded-lg border border-[#E5E7EB] focus:outline-none focus:bg-white focus:border-[#2563EB]"
                  >
                    <option value="buy">BUY Order</option>
                    <option value="sell">SELL Order</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#667085] uppercase tracking-wider mb-1 font-medium">Shares Quantity</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 10"
                    value={formQty}
                    onChange={(e) => setFormQty(e.target.value)}
                    required
                    className="w-full bg-[#F8FAFC] text-[#172033] px-3 py-2 rounded-lg border border-[#E5E7EB] focus:outline-none focus:bg-white focus:border-[#2563EB] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#667085] uppercase tracking-wider mb-1 font-medium">Execution Price ($)</label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 235.50"
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  required
                  className="w-full bg-[#F8FAFC] text-[#172033] px-3 py-2 rounded-lg border border-[#E5E7EB] focus:outline-none focus:bg-white focus:border-[#2563EB] font-mono"
                />
              </div>

              <div>
                <label className="block text-[#667085] uppercase tracking-wider mb-1 font-medium">Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Quarterly allocation"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full bg-[#F8FAFC] text-[#172033] px-3 py-2 rounded-lg border border-[#E5E7EB] focus:outline-none focus:bg-white focus:border-[#2563EB]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2.5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3.5 py-2 rounded-lg border border-[#E5E7EB] text-[#667085] hover:text-[#172033] hover:bg-[#F8FAFC] font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Recording...' : 'Submit Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
