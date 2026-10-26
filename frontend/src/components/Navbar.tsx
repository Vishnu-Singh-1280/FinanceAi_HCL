import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  TrendingUp,
  Bell,
  CheckCircle2,
  ChevronRight,
  User,
  Download,
  Shield,
  LogOut,
  LogIn,
  Sliders,
  ChevronDown
} from 'lucide-react';
import { api } from '../api/client';

interface NavbarProps {
  currentSymbol: string;
  onSelectSymbol: (symbol: string) => void;
  onNavigatePage: (page: string) => void;
  pageTitle?: string;
  currentUser: any;
  onOpenAuth: () => void;
  onOpenUserPanel: () => void;
  onOpenAdminPanel: () => void;
  onOpenDownloadApp: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentSymbol,
  onSelectSymbol,
  onNavigatePage,
  pageTitle = 'Dashboard',
  currentUser,
  onOpenAuth,
  onOpenUserPanel,
  onOpenAdminPanel,
  onOpenDownloadApp,
  onLogout
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Array<{ symbol: string; name: string; asset_type?: string }>>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [alertCount, setAlertCount] = useState(0);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.getAlerts()
      .then(alerts => {
        const triggered = alerts.filter(a => a.is_triggered).length;
        setAlertCount(triggered);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length >= 1) {
      api.searchStocks(searchQuery)
        .then(res => {
          setSuggestions(res.slice(0, 6));
          setIsOpen(true);
        })
        .catch(() => setSuggestions([]));
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (sym: string) => {
    onSelectSymbol(sym);
    setSearchQuery('');
    setIsOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-[#E5E7EB] px-4 lg:px-8 py-3">
      <div className="flex items-center justify-between">
        {/* Left: Breadcrumb & Active Ticker */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-xs text-[#667085]">
            <span
              onClick={() => onNavigatePage('dashboard')}
              className="font-medium text-[#172033] hover:text-[#2563EB] cursor-pointer transition-colors"
            >
              FinanceAI
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-[#98A2B3]" />
            <span className="font-semibold text-[#172033]">{pageTitle}</span>
          </div>

          {/* Active Target Ticker Tag */}
          <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-[#F1F5F9] border border-[#E2E8F0] text-xs">
            <span className="text-[#64748B] font-medium">Selected:</span>
            <span className="font-bold text-[#2563EB] font-mono tracking-wide">{currentSymbol}</span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#16A34A]"></span>
          </div>
        </div>

        {/* Center: Global Ticker Search Bar */}
        <div className="relative flex-1 max-w-md mx-4" ref={dropdownRef}>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#98A2B3]" />
            <input
              type="text"
              placeholder="Search ticker, company or ETF (e.g. AAPL, NVDA)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.trim() && setIsOpen(true)}
              className="w-full bg-[#F7F9FC] text-xs text-[#172033] placeholder-[#98A2B3] pl-10 pr-4 py-2 rounded-lg border border-[#E5E7EB] focus:outline-none focus:bg-white focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all font-medium"
            />
          </div>

          {/* Autocomplete Dropdown */}
          {isOpen && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 mt-1.5 bg-white border border-[#E5E7EB] rounded-lg shadow-lg overflow-hidden z-50">
              <div className="px-3.5 py-1.5 text-[11px] font-semibold text-[#667085] uppercase tracking-wider border-b border-[#F1F5F9] bg-[#F8FAFC]">
                Matching Securities
              </div>
              <div className="max-h-60 overflow-y-auto">
                {suggestions.map((item) => (
                  <button
                    key={item.symbol}
                    onClick={() => handleSelect(item.symbol)}
                    className="w-full px-3.5 py-2.5 text-left hover:bg-[#F8FAFC] flex items-center justify-between transition-colors border-b border-[#F1F5F9] last:border-b-0 cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-xs text-[#172033] font-mono">{item.symbol}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#F1F5F9] text-[#475569] font-medium border border-[#E2E8F0]">
                          {item.asset_type || 'Equity'}
                        </span>
                      </div>
                      <div className="text-xs text-[#667085] truncate max-w-xs">{item.name}</div>
                    </div>
                    <TrendingUp className="w-3.5 h-3.5 text-[#16A34A]" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Download App, Market Status, Alerts, User Profile */}
        <div className="flex items-center space-x-2.5">
          {/* Download as App Pill Button */}
          <button
            onClick={onOpenDownloadApp}
            className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#2563EB] border border-[#BFDBFE] text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            title="Download & Install FinanceAI App"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download App</span>
          </button>

          {/* Market Status */}
          <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-[#DCFCE7] border border-[#BBF7D0] text-[#16A34A] text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse"></span>
            <span>Markets Live</span>
          </div>

          {/* Alerts Bell */}
          <button
            onClick={() => onNavigatePage('watchlist')}
            className="relative p-2 rounded-lg border border-[#E5E7EB] hover:bg-[#F8FAFC] text-[#667085] hover:text-[#172033] transition-colors cursor-pointer"
            title="Watchlist & Price Alerts"
          >
            <Bell className="w-4 h-4" />
            {alertCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#DC2626] text-white text-[10px] font-bold flex items-center justify-center">
                {alertCount}
              </span>
            )}
          </button>

          {/* User Profile & Dropdown */}
          <div className="relative pl-1 border-l border-[#E5E7EB]" ref={profileMenuRef}>
            {currentUser ? (
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center space-x-2 p-1 rounded-lg hover:bg-[#F8FAFC] transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center text-xs font-bold text-[#2563EB]">
                  {currentUser.name ? currentUser.name.slice(0, 2).toUpperCase() : 'US'}
                </div>
                <div className="hidden xl:block text-left">
                  <div className="text-xs font-semibold text-[#172033] leading-tight flex items-center space-x-1">
                    <span>{currentUser.name}</span>
                    <ChevronDown className="w-3 h-3 text-[#98A2B3]" />
                  </div>
                  <div className="text-[11px] text-[#667085] leading-tight capitalize">
                    {currentUser.role} Tier
                  </div>
                </div>
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-3 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold flex items-center space-x-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            {/* Profile Dropdown Menu */}
            {profileDropdownOpen && currentUser && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-[#E5E7EB] rounded-xl shadow-lg py-1.5 z-50 text-xs">
                <div className="px-3.5 py-2 border-b border-[#F1F5F9]">
                  <div className="font-semibold text-[#172033]">{currentUser.name}</div>
                  <div className="text-[11px] text-[#667085] truncate">{currentUser.email}</div>
                  <span className="inline-block mt-1 text-[10px] font-semibold px-1.5 py-0.2 rounded bg-[#EFF6FF] text-[#2563EB] uppercase">
                    {currentUser.role}
                  </span>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onOpenUserPanel();
                    }}
                    className="w-full px-3.5 py-2 text-left hover:bg-[#F8FAFC] flex items-center space-x-2 text-[#475569] hover:text-[#172033] transition-colors cursor-pointer"
                  >
                    <User className="w-4 h-4 text-[#2563EB]" />
                    <span>User Profile Panel</span>
                  </button>

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onOpenAdminPanel();
                    }}
                    className="w-full px-3.5 py-2 text-left hover:bg-[#F8FAFC] flex items-center space-x-2 text-[#475569] hover:text-[#172033] transition-colors cursor-pointer"
                  >
                    <Shield className="w-4 h-4 text-[#D97706]" />
                    <span>Administrator Console</span>
                  </button>

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onOpenDownloadApp();
                    }}
                    className="w-full px-3.5 py-2 text-left hover:bg-[#F8FAFC] flex items-center space-x-2 text-[#475569] hover:text-[#172033] transition-colors cursor-pointer sm:hidden"
                  >
                    <Download className="w-4 h-4 text-[#2563EB]" />
                    <span>Download App</span>
                  </button>
                </div>

                <div className="pt-1 border-t border-[#F1F5F9]">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onLogout();
                    }}
                    className="w-full px-3.5 py-2 text-left hover:bg-[#FEE2E2] flex items-center space-x-2 text-[#DC2626] transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
