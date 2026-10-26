import React from 'react';
import { X, User, Shield, CreditCard, Activity, CheckCircle2, Key, LogOut } from 'lucide-react';

interface UserPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onLogout: () => void;
  onOpenAdmin?: () => void;
}

export const UserPanelModal: React.FC<UserPanelModalProps> = ({
  isOpen,
  onClose,
  user,
  onLogout,
  onOpenAdmin
}) => {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#E5E7EB] rounded-2xl max-w-lg w-full shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#F1F5F9] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center text-sm font-bold text-[#2563EB]">
              {user.name ? user.name.slice(0, 2).toUpperCase() : 'US'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-semibold text-[#172033] tracking-tight">{user.name}</h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE] uppercase">
                  {user.role}
                </span>
              </div>
              <p className="text-xs text-[#667085]">{user.email}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#98A2B3] hover:text-[#172033] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Details & Quotas */}
        <div className="p-6 space-y-5 text-xs">
          {/* Tier Banner */}
          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-semibold text-[#667085] uppercase tracking-wider block">
                Subscription License
              </span>
              <span className="text-sm font-semibold text-[#172033]">
                {user.tier || 'Institutional Professional Tier'}
              </span>
              <span className="text-[11px] text-[#16A34A] block flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3 inline mr-1" />
                <span>Active License · Unlimited Market Data</span>
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-[#667085] block">Title</span>
              <span className="text-xs font-semibold text-[#172033]">{user.title || 'Quantitative Analyst'}</span>
            </div>
          </div>

          {/* Usage Metrics */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-[#667085]">Monthly Quantitative API Quota</span>
              <span className="font-semibold text-[#172033] font-mono tabular-nums">1,482 / 10,000 queries</span>
            </div>
            <div className="w-full bg-[#E5E7EB] h-2 rounded-full overflow-hidden">
              <div className="bg-[#2563EB] h-full rounded-full" style={{ width: '15%' }}></div>
            </div>
          </div>

          {/* Account Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E5E7EB]">
              <span className="text-[#667085] block text-[11px]">Primary Currency</span>
              <span className="font-semibold text-[#172033]">USD ($) · Federal Reserve Reference</span>
            </div>
            <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E5E7EB]">
              <span className="text-[#667085] block text-[11px]">Security Clearance</span>
              <span className="font-semibold text-[#172033]">Multi-Factor Authenticated</span>
            </div>
          </div>

          {/* Role specific quick action */}
          {user.role === 'admin' && onOpenAdmin && (
            <button
              onClick={() => {
                onClose();
                onOpenAdmin();
              }}
              className="w-full py-2.5 px-3 bg-[#0F172A] hover:bg-[#1E293B] text-white font-semibold rounded-lg text-xs flex items-center justify-center space-x-2 transition-colors cursor-pointer shadow-xs"
            >
              <Shield className="w-4 h-4 text-[#3B82F6]" />
              <span>Launch Administrator Governance Console</span>
            </button>
          )}

          {/* Action Footer */}
          <div className="pt-2 flex items-center justify-between border-t border-[#F1F5F9]">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-[#E5E7EB] hover:bg-[#F8FAFC] text-[#667085] hover:text-[#172033] font-medium rounded-lg transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="px-4 py-2 bg-[#FEE2E2] hover:bg-[#FECACA] text-[#DC2626] font-semibold rounded-lg transition-colors flex items-center space-x-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
