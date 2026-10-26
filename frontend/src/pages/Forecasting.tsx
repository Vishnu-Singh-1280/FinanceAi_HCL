import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  RefreshCw,
  Clock,
  Info,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Search,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { api } from '../api/client';
import { ForecastResponse } from '../types';

interface ForecastingProps {
  symbol: string;
}

export const Forecasting: React.FC<ForecastingProps> = ({ symbol }) => {
  const [currentTicker, setCurrentTicker] = useState(symbol);
  const [inputTicker, setInputTicker] = useState('');
  const [data, setData] = useState<ForecastResponse | null>(null);
  const [selectedHorizon, setSelectedHorizon] = useState<'30d' | '60d' | '90d'>('30d');
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const popularTickers = ['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'AMZN', 'TSLA', 'SPY'];

  const fetchForecast = (ticker: string) => {
    setLoading(true);
    setError(null);
    api.getForecast(ticker)
      .then((res) => {
        setData(res);
        setCurrentTicker(ticker);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || `Forecast generation failed for ${ticker}`);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchForecast(symbol);
  }, [symbol]);

  const handleTickerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputTicker.trim()) {
      fetchForecast(inputTicker.trim().toUpperCase());
      setInputTicker('');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <RefreshCw className="w-6 h-6 text-[#2563EB] animate-spin" />
        <p className="text-sm font-semibold text-[#172033]">Computing Predictive Model for {currentTicker}...</p>
        <p className="text-xs text-[#667085]">Training Gradient Boosting Regressor across historical lag returns & rolling volatility...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 bg-white border border-[#E5E7EB] rounded-xl text-center max-w-lg mx-auto my-12 shadow-xs">
        <div className="w-10 h-10 rounded-full bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center mx-auto mb-3">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <h3 className="text-base font-semibold text-[#172033]">Forecast Generation Failed</h3>
        <p className="text-xs text-[#667085] mt-1 mb-5">{error || `Unable to train model for ${currentTicker}`}</p>
        <div className="flex justify-center space-x-2">
          {popularTickers.slice(0, 4).map((t) => (
            <button
              key={t}
              onClick={() => fetchForecast(t)}
              className="px-3 py-1.5 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-xs font-semibold text-[#172033] rounded-md transition-colors cursor-pointer"
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Combine historical and future forecast points for seamless Recharts line
  const chartSeries: Array<{ date: string; historical?: number; predicted?: number; lower?: number; upper?: number }> = [];

  const histLen = data.historical_dates.length;
  const startHist = Math.max(0, histLen - 30);
  for (let i = startHist; i < histLen; i++) {
    chartSeries.push({
      date: data.historical_dates[i].slice(5),
      historical: data.historical_prices[i],
      predicted: i === histLen - 1 ? data.historical_prices[i] : undefined,
      lower: i === histLen - 1 ? data.historical_prices[i] : undefined,
      upper: i === histLen - 1 ? data.historical_prices[i] : undefined
    });
  }

  // Filter forecast points according to selected horizon
  const maxStep = selectedHorizon === '30d' ? 30 : selectedHorizon === '60d' ? 60 : 90;
  data.forecast_points.filter(pt => pt.step <= maxStep).forEach((pt) => {
    chartSeries.push({
      date: pt.date.slice(5),
      predicted: pt.predicted_price,
      lower: pt.lower_bound,
      upper: pt.upper_bound
    });
  });

  const selectedTargetPrice = selectedHorizon === '30d'
    ? data.estimate_30d
    : selectedHorizon === '60d'
    ? data.estimate_60d
    : data.estimate_90d;

  const selectedChangePct = selectedHorizon === '30d'
    ? data.pct_change_30d
    : selectedHorizon === '60d'
    ? data.pct_change_60d
    : data.pct_change_90d;

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#E5E7EB]">
        <div>
          <h1 className="text-2xl font-semibold text-[#172033] tracking-tight">
            Stock Price Prediction
          </h1>
          <p className="text-xs text-[#667085] mt-0.5">
            Machine-learning forward projections based on historical price features and volatility modeling.
          </p>
        </div>

        {/* Stock Search & Popular Chips */}
        <div className="flex items-center space-x-2">
          <div className="hidden sm:flex items-center space-x-1">
            {popularTickers.slice(0, 4).map((t) => (
              <button
                key={t}
                onClick={() => fetchForecast(t)}
                className={`px-2 py-1 text-xs font-mono font-medium rounded-md transition-colors cursor-pointer ${
                  currentTicker === t
                    ? 'bg-[#2563EB] text-white'
                    : 'bg-white border border-[#E5E7EB] text-[#667085] hover:text-[#172033]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <form onSubmit={handleTickerSubmit} className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#98A2B3]" />
            <input
              type="text"
              placeholder="Symbol..."
              value={inputTicker}
              onChange={(e) => setInputTicker(e.target.value)}
              className="w-32 sm:w-40 bg-white text-xs pl-8 pr-3 py-1.5 rounded-lg border border-[#E5E7EB] focus:outline-none focus:border-[#2563EB] font-mono text-[#172033]"
            />
          </form>

          <button
            onClick={() => fetchForecast(currentTicker)}
            className="p-1.5 bg-white border border-[#E5E7EB] hover:bg-[#F8FAFC] text-[#667085] hover:text-[#172033] rounded-lg transition-colors cursor-pointer"
            title="Re-run Forecast Model"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Primary KPI & Horizon Selector Bar */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-[#2563EB] px-2 py-0.5 bg-[#EFF6FF] rounded border border-[#DBEAFE] font-mono">
                {data.symbol}
              </span>
              <span className="text-xs text-[#667085]">Current Market Price:</span>
              <span className="text-base font-semibold text-[#172033] font-mono tabular-nums">
                ${data.current_price.toFixed(2)}
              </span>
            </div>

            <div className="flex items-baseline space-x-3 mt-2">
              <span className="text-xs text-[#667085]">Projected Target:</span>
              <span className="text-3xl font-semibold text-[#2563EB] font-mono tabular-nums">
                ${selectedTargetPrice.toFixed(2)}
              </span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold font-mono tabular-nums ${
                  selectedChangePct >= 0 ? 'bg-[#DCFCE7] text-[#16A34A]' : 'bg-[#FEE2E2] text-[#DC2626]'
                }`}
              >
                {selectedChangePct >= 0 ? '+' : ''}{selectedChangePct.toFixed(2)}%
              </span>
            </div>
          </div>

          {/* Horizon Selector */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-[#667085]">Horizon:</span>
            <div className="flex items-center bg-[#F1F5F9] p-0.5 rounded-lg border border-[#E2E8F0] text-xs">
              <button
                onClick={() => setSelectedHorizon('30d')}
                className={`px-3 py-1 font-medium rounded-md transition-colors cursor-pointer ${
                  selectedHorizon === '30d'
                    ? 'bg-white text-[#172033] shadow-xs font-semibold'
                    : 'text-[#667085] hover:text-[#172033]'
                }`}
              >
                30 Days
              </button>
              <button
                onClick={() => setSelectedHorizon('60d')}
                className={`px-3 py-1 font-medium rounded-md transition-colors cursor-pointer ${
                  selectedHorizon === '60d'
                    ? 'bg-white text-[#172033] shadow-xs font-semibold'
                    : 'text-[#667085] hover:text-[#172033]'
                }`}
              >
                60 Days
              </button>
              <button
                onClick={() => setSelectedHorizon('90d')}
                className={`px-3 py-1 font-medium rounded-md transition-colors cursor-pointer ${
                  selectedHorizon === '90d'
                    ? 'bg-white text-[#172033] shadow-xs font-semibold'
                    : 'text-[#667085] hover:text-[#172033]'
                }`}
              >
                90 Days
              </button>
            </div>
          </div>
        </div>

        {/* Plain-Language Explanation */}
        <div className="mt-4 pt-4 border-t border-[#F1F5F9] text-xs text-[#475569] leading-relaxed">
          <span className="font-semibold text-[#172033]">What this projection indicates: </span>
          Based on historical return autocorrelation and statistical feature vectors, the model projects a{' '}
          <span className={selectedChangePct >= 0 ? 'text-[#16A34A] font-semibold' : 'text-[#DC2626] font-semibold'}>
            {selectedChangePct >= 0 ? `growth of +${selectedChangePct.toFixed(2)}%` : `decline of ${selectedChangePct.toFixed(2)}%`}
          </span>{' '}
          toward ${selectedTargetPrice.toFixed(2)} over the next {selectedHorizon === '30d' ? '30' : selectedHorizon === '60d' ? '60' : '90'} trading days.
        </div>
      </div>

      {/* Visualization Chart */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#F1F5F9]">
          <h3 className="text-sm font-semibold text-[#172033]">
            Historical Price vs. Machine-Learning Projection
          </h3>
          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-0.5 bg-[#1E293B]"></span>
              <span className="text-[#667085]">Historical</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-0.5 bg-[#2563EB]"></span>
              <span className="text-[#2563EB] font-medium">Model Projection</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-2 bg-[#2563EB]/15 rounded-xs"></span>
              <span className="text-[#667085]">Confidence Band</span>
            </div>
          </div>
        </div>

        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartSeries} margin={{ top: 15, right: 15, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#94A3B8"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <YAxis
                stroke="#94A3B8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                domain={['auto', 'auto']}
                tickFormatter={(val) => `$${val}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E5E7EB',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  fontSize: '12px',
                  color: '#172033'
                }}
                formatter={(val: any, name: any) => [
                  `$${Number(val).toFixed(2)}`,
                  name === 'historical' ? 'Historical Close' : name === 'predicted' ? 'ML Projection' : name
                ]}
              />

              {/* Shaded Confidence Interval */}
              <Area
                type="monotone"
                dataKey="upper"
                stroke="transparent"
                fill="#2563EB"
                fillOpacity={0.08}
              />
              <Area
                type="monotone"
                dataKey="lower"
                stroke="transparent"
                fill="#FFFFFF"
                fillOpacity={1}
              />

              {/* Historical Line */}
              <Line
                type="monotone"
                dataKey="historical"
                stroke="#1E293B"
                strokeWidth={2}
                dot={false}
              />

              {/* Forecast Line */}
              <Line
                type="monotone"
                dataKey="predicted"
                stroke="#2563EB"
                strokeWidth={2.5}
                strokeDasharray="4 2"
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Expandable Advanced Model Validation Section */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-xs overflow-hidden">
        <button
          onClick={() => setShowAdvancedMetrics(!showAdvancedMetrics)}
          className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-[#F8FAFC] transition-colors cursor-pointer"
        >
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-[#172033] uppercase tracking-wider">
              Advanced Model Metrics & Validation Architecture
            </span>
            <span className="text-[11px] text-[#667085]">
              (Chronological 80/20 train/test evaluation)
            </span>
          </div>
          {showAdvancedMetrics ? <ChevronUp className="w-4 h-4 text-[#667085]" /> : <ChevronDown className="w-4 h-4 text-[#667085]" />}
        </button>

        {showAdvancedMetrics && (
          <div className="p-5 border-t border-[#F1F5F9] space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E5E7EB]">
                <span className="text-[#667085] block text-[11px]">Validation R² Score</span>
                <span className="text-base font-semibold text-[#172033] font-mono tabular-nums">
                  {data.metrics.validation_r2.toFixed(4)}
                </span>
              </div>
              <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E5E7EB]">
                <span className="text-[#667085] block text-[11px]">Validation MAE</span>
                <span className="text-base font-semibold text-[#172033] font-mono tabular-nums">
                  ${data.metrics.validation_mae.toFixed(2)}
                </span>
              </div>
              <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E5E7EB]">
                <span className="text-[#667085] block text-[11px]">Validation RMSE</span>
                <span className="text-base font-semibold text-[#172033] font-mono tabular-nums">
                  ${data.metrics.validation_rmse.toFixed(2)}
                </span>
              </div>
              <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E5E7EB]">
                <span className="text-[#667085] block text-[11px]">Engine Pipeline</span>
                <span className="text-base font-semibold text-[#172033] font-mono">
                  {data.metrics.methodology}
                </span>
              </div>
            </div>

            <div className="text-xs text-[#667085] leading-relaxed pt-2">
              <p>
                <strong>Split Strategy:</strong> {data.metrics.split_strategy} (no lookahead data leakage).
                Trained across {data.metrics.train_size} chronological bars and verified against {data.metrics.val_size} out-of-sample observations.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Compliance & Risk Notice */}
      <div className="p-4 bg-[#FEF2F2] border border-[#FEE2E2] rounded-xl text-xs text-[#991B1B] leading-relaxed flex items-start space-x-3">
        <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#DC2626]" />
        <div>
          <span className="font-semibold block mb-0.5">Statistical Estimation Notice & Risk Disclaimer</span>
          Stock price predictions generated by FinanceAI are strictly statistical estimates derived from historical price actions, lag features, and rolling standard deviations. Financial markets are subject to exogenous shocks, policy changes, and sudden macroeconomic shifts. These models are intended solely for educational and research purposes and do not constitute registered investment advice.
        </div>
      </div>
    </div>
  );
};
