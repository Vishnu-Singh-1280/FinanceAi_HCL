import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { App } from '../App';
import { MetricCard } from '../components/MetricCard';

// Mock API client to avoid network calls during unit tests
vi.mock('../api/client', () => ({
  api: {
    getMarketSummary: vi.fn().mockResolvedValue({
      indices: [
        { symbol: '^GSPC', name: 'S&P 500', price: 5850.2, change: 24.5, change_percent: 0.42, sparkline: [5800, 5850], timestamp: '2026-10-26' }
      ],
      market_sentiment: 'Bullish Expansion',
      top_briefing: 'Global markets advance on tech earnings momentum.',
      updated_at: '2026-10-26'
    }),
    getMarketMovers: vi.fn().mockResolvedValue({
      gainers: [{ symbol: 'NVDA', name: 'NVIDIA Corp', price: 135.0, change: 4.2, change_percent: 3.2, volume: 45000000 }],
      losers: [],
      most_active: [],
      market_coverage: 'US Equities',
      updated_at: '2026-10-26'
    }),
    getPortfolio: vi.fn().mockResolvedValue({
      id: 1,
      name: 'Primary Portfolio',
      cash_balance: 50000,
      total_equity: 125000,
      total_cost_basis: 100000,
      total_unrealized_pl: 25000,
      total_unrealized_pl_pct: 25.0,
      daily_change: 1250,
      daily_change_pct: 1.0,
      holdings: [],
      sector_allocation: { Technology: 65, BroadMarket: 35 },
      concentration_risk: 'Well Diversified',
      transactions_count: 5
    }),
    getStockQuote: vi.fn().mockResolvedValue({
      symbol: 'SPY',
      name: 'SPDR S&P 500 ETF Trust',
      price: 585.0,
      change: 2.5,
      change_percent: 0.43,
      volume: 45000000,
      history: []
    }),
    getNews: vi.fn().mockResolvedValue({
      symbol: 'SPY',
      overall_sentiment: 'Moderately Bullish',
      sentiment_score: 0.45,
      bullish_percent: 65,
      bearish_percent: 15,
      neutral_percent: 20,
      articles: [
        {
          id: '1',
          title: 'Stock Market Momentum Accelerates',
          publisher: 'Wall Street Journal',
          link: 'https://wsj.com',
          published_at: '2026-10-26 12:00 UTC',
          sentiment: 'Bullish',
          sentiment_score: 0.65,
          summary: 'Tech stocks drive positive index returns.',
          related_symbols: ['AAPL', 'NVDA'],
          image_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&q=80',
          category: 'Market Intelligence',
          time_ago: '15m ago'
        }
      ],
      breaking_newzz: [
        {
          id: 'brk-1',
          headline: '⚡ LATEST NEWZZ: Fed holds rate steady as market volume expands.',
          category: 'Central Banking',
          timestamp: '5m ago',
          urgency: 'Flash'
        }
      ],
      upcoming_catalysts: [
        {
          id: 'cat-1',
          symbol: 'NVDA',
          title: 'Q3 Earnings Release',
          event_type: 'Earnings',
          scheduled_date: 'Next Wednesday',
          impact_level: 'High',
          description: 'Anticipated report on AI datacenter revenue.'
        }
      ],
      generated_at: '2026-10-26'
    }),
    getAlerts: vi.fn().mockResolvedValue([]),
    getSettings: vi.fn().mockResolvedValue({
      ai_provider: 'local',
      available_providers: ['local', 'openai', 'groq', 'ollama'],
      openai_configured: false,
      groq_configured: false,
      ollama_configured: false,
      database_type: 'SQLite (Local Persistent)',
      market_data_provider: 'Yahoo Finance (yfinance)',
      version: 'FinanceAI v2.4-Production',
      timestamp: '2026-10-26'
    })
  }
}));

describe('FinanceAI Frontend Platform Tests', () => {
  it('renders FinanceAI branding and navigation header', () => {
    render(<App />);
    const brandingElements = screen.getAllByText(/Finance/i);
    expect(brandingElements.length).toBeGreaterThan(0);
    expect(screen.getByPlaceholderText(/Search ticker, company or ETF/i)).toBeInTheDocument();
  });

  it('renders sidebar navigation items', () => {
    render(<App />);
    expect(screen.getByText(/Overview Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/AI Advisor/i)).toBeInTheDocument();
    expect(screen.getByText(/ML Price Forecasting/i)).toBeInTheDocument();
    expect(screen.getByText(/Technical Analysis/i)).toBeInTheDocument();
    expect(screen.getByText(/Fundamental Analysis/i)).toBeInTheDocument();
    expect(screen.getByText(/Portfolio Management/i)).toBeInTheDocument();
  });

  it('navigates to settings page on click', async () => {
    render(<App />);
    const settingsButton = screen.getByText(/System Settings/i);
    fireEvent.click(settingsButton);
    const title = await screen.findByText(/System Settings & Infrastructure/i);
    expect(title).toBeInTheDocument();
  });

  it('renders MetricCard with positive percentage badge', () => {
    render(
      <MetricCard
        title="Portfolio Value"
        value="$125,000"
        change={5.25}
        changeLabel="Annual Return"
      />
    );
    expect(screen.getByText('Portfolio Value')).toBeInTheDocument();
    expect(screen.getByText('$125,000')).toBeInTheDocument();
    expect(screen.getByText('+5.25%')).toBeInTheDocument();
    expect(screen.getByText('Annual Return')).toBeInTheDocument();
  });
});
