import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { AuthModal } from './components/AuthModal';
import { UserPanelModal } from './components/UserPanelModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { AppDownloadModal } from './components/AppDownloadModal';

// Pages
import { Dashboard } from './pages/Dashboard';
import { StockAnalysis } from './pages/StockAnalysis';
import { Forecasting } from './pages/Forecasting';
import { TechnicalAnalysis } from './pages/TechnicalAnalysis';
import { FundamentalAnalysis } from './pages/FundamentalAnalysis';
import { AIAdvisor } from './pages/AIAdvisor';
import { NewsSentiment } from './pages/NewsSentiment';
import { Portfolio } from './pages/Portfolio';
import { PortfolioOptimizer } from './pages/PortfolioOptimizer';
import { Screener } from './pages/Screener';
import { PeerComparison } from './pages/PeerComparison';
import { EarningsDividends } from './pages/EarningsDividends';
import { MacroEconomy } from './pages/MacroEconomy';
import { Backtesting } from './pages/Backtesting';
import { ResearchReports } from './pages/ResearchReports';
import { RAGResearch } from './pages/RAGResearch';
import { WatchlistAlerts } from './pages/WatchlistAlerts';
import { Settings } from './pages/Settings';

export function App() {
  const [activePage, setActivePage] = useState<string>('dashboard');
  const [currentSymbol, setCurrentSymbol] = useState<string>('AAPL');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('fai_user');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    // Default institutional administrator profile
    return {
      id: 1,
      name: 'Vishnu Singh',
      email: 'admin@financeai.com',
      role: 'admin',
      title: 'Lead Quantitative Architect',
      tier: 'Enterprise Executive'
    };
  });

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [userPanelOpen, setUserPanelOpen] = useState(false);
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);
  const [downloadAppOpen, setDownloadAppOpen] = useState(false);

  const pageTitles: Record<string, string> = {
    dashboard: 'Dashboard',
    macro: 'Market Overview',
    stocks: 'Stock Explorer',
    forecasting: 'Stock Prediction',
    portfolio: 'Portfolio',
    fundamentals: 'Financial Research',
    advisor: 'AI Research Assistant',
    watchlist: 'Watchlist & Alerts',
    settings: 'Settings',
    technicals: 'Technical Analysis',
    optimizer: 'Portfolio Optimizer',
    screener: 'Stock Screener',
    peers: 'Peer Comparison',
    earnings: 'Earnings & Dividends',
    news: 'News & Sentiment',
    backtest: 'Strategy Backtesting',
    reports: 'Research Reports',
    rag: 'RAG Document Research'
  };

  const handleSelectSymbol = (symbol: string) => {
    setCurrentSymbol(symbol.toUpperCase());
    if (activePage === 'dashboard' || activePage === 'screener') {
      setActivePage('stocks');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('fai_user');
    localStorage.removeItem('fai_token');
    setCurrentUser(null);
  };

  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard onSelectSymbol={handleSelectSymbol} onNavigatePage={setActivePage} />;
      case 'macro':
        return <MacroEconomy />;
      case 'stocks':
        return <StockAnalysis symbol={currentSymbol} onNavigatePage={setActivePage} />;
      case 'forecasting':
        return <Forecasting symbol={currentSymbol} />;
      case 'technicals':
        return <TechnicalAnalysis symbol={currentSymbol} />;
      case 'fundamentals':
        return <FundamentalAnalysis symbol={currentSymbol} />;
      case 'advisor':
        return <AIAdvisor currentSymbol={currentSymbol} onSelectSymbol={handleSelectSymbol} />;
      case 'news':
        return <NewsSentiment symbol={currentSymbol} onSelectSymbol={handleSelectSymbol} />;
      case 'portfolio':
        return <Portfolio onSelectSymbol={handleSelectSymbol} onNavigatePage={setActivePage} />;
      case 'optimizer':
        return <PortfolioOptimizer />;
      case 'screener':
        return <Screener onSelectSymbol={handleSelectSymbol} />;
      case 'peers':
        return <PeerComparison currentSymbol={currentSymbol} onSelectSymbol={handleSelectSymbol} />;
      case 'earnings':
        return <EarningsDividends symbol={currentSymbol} />;
      case 'backtest':
        return <Backtesting currentSymbol={currentSymbol} />;
      case 'reports':
        return <ResearchReports currentSymbol={currentSymbol} />;
      case 'rag':
        return <RAGResearch />;
      case 'watchlist':
        return <WatchlistAlerts onSelectSymbol={handleSelectSymbol} />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard onSelectSymbol={handleSelectSymbol} onNavigatePage={setActivePage} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#172033] flex flex-col font-sans">
      {/* Top Global Navigation Bar */}
      <Navbar
        currentSymbol={currentSymbol}
        onSelectSymbol={handleSelectSymbol}
        onNavigatePage={setActivePage}
        pageTitle={pageTitles[activePage] || 'Dashboard'}
        currentUser={currentUser}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenUserPanel={() => setUserPanelOpen(true)}
        onOpenAdminPanel={() => setAdminPanelOpen(true)}
        onOpenDownloadApp={() => setDownloadAppOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main App Body: Sidebar + Dynamic Content Canvas */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activePage={activePage}
          onNavigate={setActivePage}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Scrollable Page Container */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-[#F7F9FC]">
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              {renderActivePage()}
            </div>
          </main>

          {/* Institutional Footer */}
          <footer className="border-t border-[#E5E7EB] bg-white px-6 py-4 mt-auto">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#667085]">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-[#172033]">FinanceAI Platform</span>
                <span>·</span>
                <span>v2.4-Production</span>
              </div>

              {/* Explicit User Credit */}
              <div className="flex items-center space-x-1.5 font-medium text-[#172033]">
                <span>Developed by</span>
                <span className="font-semibold text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded border border-[#BFDBFE]">
                  Vishnu Singh
                </span>
              </div>

              <div className="flex items-center space-x-3 text-[11px] text-[#98A2B3]">
                <span>Market Data via yfinance</span>
                <span>·</span>
                <span>Institutional Quantitative Research</span>
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={(user) => setCurrentUser(user)}
      />

      <UserPanelModal
        isOpen={userPanelOpen}
        onClose={() => setUserPanelOpen(false)}
        user={currentUser}
        onLogout={handleLogout}
        onOpenAdmin={() => setAdminPanelOpen(true)}
      />

      <AdminPanelModal
        isOpen={adminPanelOpen}
        onClose={() => setAdminPanelOpen(false)}
      />

      <AppDownloadModal
        isOpen={downloadAppOpen}
        onClose={() => setDownloadAppOpen(false)}
      />
    </div>
  );
}

export default App;
