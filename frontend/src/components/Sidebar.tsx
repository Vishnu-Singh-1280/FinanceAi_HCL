import React from 'react';
import {
  LayoutDashboard,
  LineChart,
  Bot,
  TrendingUp,
  Activity,
  FileText,
  Briefcase,
  Globe,
  Bookmark,
  Newspaper,
  Settings as SettingsIcon,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  Layers
} from 'lucide-react';

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

interface NavItem {
  id: string;
  label: string;
  sublabel?: string;
  icon: React.ReactNode;
  badge?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onNavigate,
  collapsed,
  onToggleCollapse
}) => {
  const mainNavItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      sublabel: 'Overview Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />
    },
    {
      id: 'macro',
      label: 'Market Overview',
      sublabel: 'Global Macro & Indices',
      icon: <Globe className="w-4 h-4" />
    },
    {
      id: 'stocks',
      label: 'Stock Explorer',
      sublabel: 'Technical Analysis',
      icon: <LineChart className="w-4 h-4" />
    },
    {
      id: 'forecasting',
      label: 'Stock Prediction',
      sublabel: 'ML Price Forecasting',
      icon: <TrendingUp className="w-4 h-4" />
    },
    {
      id: 'portfolio',
      label: 'Portfolio',
      sublabel: 'Portfolio Management',
      icon: <Briefcase className="w-4 h-4" />
    },
    {
      id: 'fundamentals',
      label: 'Financial Research',
      sublabel: 'Fundamental Analysis',
      icon: <FileText className="w-4 h-4" />
    },
    {
      id: 'advisor',
      label: 'AI Research Assistant',
      sublabel: 'AI Advisor',
      icon: <Bot className="w-4 h-4" />
    },
    {
      id: 'watchlist',
      label: 'Watchlist',
      sublabel: 'Price Alerts',
      icon: <Bookmark className="w-4 h-4" />
    },
    {
      id: 'news',
      label: 'News & Newzz',
      sublabel: 'Financial News',
      icon: <Newspaper className="w-4 h-4" />
    },
    {
      id: 'settings',
      label: 'Settings',
      sublabel: 'System Settings',
      icon: <SettingsIcon className="w-4 h-4" />
    }
  ];

  return (
    <aside
      className={`relative flex flex-col bg-[#0F172A] border-r border-[#1E293B] text-slate-300 transition-all duration-200 select-none ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[#1E293B]">
        {!collapsed && (
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center text-white shadow-xs">
              <Activity className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-semibold text-base tracking-tight text-white">
                  Finance<span className="text-[#3B82F6]">AI</span>
                </span>
                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-[#1E293B] text-slate-400 border border-slate-700">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 -mt-0.5 font-normal">
                Financial Analytics
              </p>
            </div>
          </div>
        )}

        {collapsed && (
          <div className="mx-auto w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center text-white">
            <Activity className="w-4 h-4 stroke-[2.5]" />
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 overflow-y-auto px-2 space-y-1">
        {!collapsed && (
          <div className="px-3 pb-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Platform Navigation
          </div>
        )}

        {mainNavItems.map((item) => {
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center ${
                collapsed ? 'justify-center px-2' : 'justify-between px-3'
              } py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer group ${
                isActive
                  ? 'bg-[#1E293B] text-white border-l-2 border-[#2563EB]'
                  : 'text-slate-400 hover:text-white hover:bg-[#1E293B]/60'
              }`}
              title={collapsed ? `${item.label} (${item.sublabel})` : undefined}
            >
              <div className="flex items-center space-x-3">
                <span className={`${isActive ? 'text-[#3B82F6]' : 'text-slate-400 group-hover:text-slate-200'}`}>
                  {item.icon}
                </span>
                {!collapsed && (
                  <div className="text-left">
                    <span className="block text-slate-200 font-medium text-xs leading-tight">
                      {item.label}
                    </span>
                    {item.sublabel && (
                      <span className="block text-[11px] text-slate-400 leading-tight">
                        {item.sublabel}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {!collapsed && item.badge && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#2563EB]/20 text-[#60A5FA] border border-[#2563EB]/40 font-medium">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Sidebar Footer & Collapse Toggle */}
      <div className="p-3 border-t border-[#1E293B] flex items-center justify-between text-xs">
        {!collapsed && (
          <div className="flex items-center space-x-2 text-slate-400 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-[#16A34A]"></span>
            <span>yfinance · Live</span>
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className={`p-1.5 rounded-md hover:bg-[#1E293B] text-slate-400 hover:text-white transition-colors cursor-pointer ${
            collapsed ? 'mx-auto' : ''
          }`}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
};
