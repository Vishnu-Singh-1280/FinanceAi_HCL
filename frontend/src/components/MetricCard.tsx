import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  subtitle?: string;
  badge?: string;
  isPositiveGood?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeLabel,
  icon,
  subtitle,
  badge,
  isPositiveGood = true
}) => {
  const hasChange = change !== undefined && change !== null;
  const isPositive = hasChange && change > 0;
  const isZero = hasChange && change === 0;
  const isGood = isPositiveGood ? isPositive : !isPositive;

  return (
    <div className="bg-white border border-[#E5E7EB] hover:border-[#D1D5DB] transition-all rounded-xl p-5 shadow-xs">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-[#667085] uppercase tracking-wider">{title}</span>
        {icon && (
          <div className="text-[#2563EB] p-2 bg-[#EFF6FF] rounded-lg">
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between mt-1">
        <div className="text-2xl font-semibold tracking-tight text-[#172033] tabular-nums font-mono">
          {value}
        </div>
        {badge && (
          <span className="text-xs px-2 py-0.5 rounded-md bg-[#EFF6FF] text-[#2563EB] font-medium border border-[#DBEAFE]">
            {badge}
          </span>
        )}
      </div>

      <div className="flex items-center mt-3 text-xs space-x-2">
        {hasChange && (
          <div
            className={`inline-flex items-center px-2 py-0.5 rounded font-medium tabular-nums ${
              isZero
                ? 'bg-[#F1F5F9] text-[#64748B]'
                : isGood
                ? 'bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0]'
                : 'bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA]'
            }`}
          >
            {isZero ? (
              <Minus className="w-3 h-3 mr-1" />
            ) : isPositive ? (
              <TrendingUp className="w-3 h-3 mr-1" />
            ) : (
              <TrendingDown className="w-3 h-3 mr-1" />
            )}
            <span>
              {isPositive ? '+' : ''}
              {change.toFixed(2)}%
            </span>
          </div>
        )}
        {(changeLabel || subtitle) && (
          <span className="text-[#667085] truncate text-xs font-normal">
            {changeLabel || subtitle}
          </span>
        )}
      </div>
    </div>
  );
};
