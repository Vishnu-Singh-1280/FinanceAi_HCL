# FinanceAI — AI-Powered Financial Research, Stock Prediction & Portfolio Intelligence Platform

FinanceAI is an institutional-grade, full-stack financial analytics, quantitative modeling, machine-learning forecasting, and portfolio optimization platform.

---

## 🏛️ Architecture Overview

```
FinanceAI/
├── backend/
│   ├── app/
│   │   ├── main.py                # FastAPI entry point with CORS & lifecycle handlers
│   │   ├── config.py              # Pydantic Settings & environment variables
│   │   ├── database.py            # SQLite / PostgreSQL engine & sessionmaker
│   │   ├── models/                # SQLAlchemy models (Portfolio, Transactions, Alerts, Reports)
│   │   ├── schemas/               # Pydantic schemas for request/response contracts
│   │   ├── services/
│   │   │   ├── market_data.py     # yfinance market data with TTL cache & fallback engine
│   │   │   ├── technical.py       # Technical indicators (SMA, EMA, RSI, MACD, BB, ATR, Support/Resistance)
│   │   │   ├── fundamental.py     # Financial multiples, margins, ROE, automated risk synthesis
│   │   │   ├── forecasting.py     # GradientBoostingRegressor, 80/20 chronological split, 30/60/90d horizons
│   │   │   ├── portfolio.py       # Multi-asset transaction accounting, cost-basis & P&L tracking
│   │   │   ├── optimizer.py       # Markowitz Efficient Frontier, Max Sharpe, VaR 95%, CVaR
│   │   │   ├── backtest.py        # Trading strategy execution engine (SMA crossover, RSI)
│   │   │   ├── news_sentiment.py  # Financial news stream & sentiment polarity scoring
│   │   │   ├── ai_advisor.py      # LLM provider abstraction (Local, OpenAI, Groq, Ollama)
│   │   │   ├── macro.py           # Macroeconomic series (10Y Yield, VIX, Oil, Gold, Fed Funds, CPI)
│   │   │   ├── screener.py        # Multi-factor Stock & ETF screening engine
│   │   │   ├── peers.py           # Peer valuation and return correlation benchmarking
│   │   │   ├── earnings_dividends.py # EPS surprises, revenue, dividend schedules
│   │   │   ├── reports.py         # ReportLab PDF generator & openpyxl Excel exporter
│   │   │   └── rag.py             # RAG document parser, chunker, vector similarity & citations
│   │   └── routers/               # 15 domain-specific REST endpoints
│   ├── tests/                     # Pytest automated test suite (13 comprehensive tests)
│   ├── requirements.txt           # Python dependency specifications
│   └── run.py                     # Local backend execution runner
├── frontend/
│   ├── src/
│   │   ├── api/client.ts          # Typed API client connecting to backend
│   │   ├── types/index.ts         # TypeScript interfaces for all financial contracts
│   │   ├── components/            # Navbar, Collapsible Sidebar, MetricCard
│   │   ├── pages/                 # 18 interactive fintech dashboards & tools
│   │   └── test/                  # Vitest & React Testing Library test suite
│   ├── vite.config.ts             # Vite with Tailwind v4 and proxy configuration
│   └── package.json               # Frontend dependencies & scripts
├── .env.example                   # Environment configuration template
├── .gitignore                     # Git ignore rules
└── README.md                      # Comprehensive platform guide
```

---

## 🌟 Core Features & Modules

1. **Market Overview Command Center:**
   - Real-time global benchmark indices (S&P 500, NASDAQ, Dow Jones, NIFTY 50, SENSEX, VIX).
   - Market movers (Top Gainers, Top Losers, Most Active equities).
   - Live interactive benchmark chart and AI Global Market Briefing.
2. **Stock Analysis:**
   - Real-time pricing, volume, 52-week trading corridors, and market capitalization.
   - Interactive historical OHLCV chart with volume overlay.
3. **ML Stock Price Forecasting:**
   - Supervised `GradientBoostingRegressor` trained on 2-year daily OHLCV series.
   - Return lags (1d, 5d, 10d, 21d), 10d/30d rolling volatilities, SMA ratios, and RSI features.
   - Strict 80/20 chronological train-validation split (no time leakage or lookahead bias).
   - Multi-horizon projections (30-day, 60-day, 90-day estimates).
   - Statistical uncertainty bands expanding with $\sqrt{t}$ based on validation residual variance.
   - Transparent validation metrics ($R^2$, MAE, RMSE) and statistical disclaimers.
4. **Technical Analysis Suite:**
   - Simple Moving Averages (SMA 20, 50, 200) and Exponential Moving Averages (EMA 12, 26, 50).
   - 14-day Wilder smoothed Relative Strength Index (RSI).
   - Moving Average Convergence Divergence (MACD 12, 26, 9) signal & histogram.
   - Bollinger Bands (20, 2 $\sigma$) and Average True Range (ATR 14).
   - Dynamic support and resistance pivot levels.
5. **Fundamental Analysis & Valuation:**
   - Valuation multiples: Trailing P/E, Forward P/E, Price to Book (P/B), EPS.
   - Solvency and operational health: Net Profit Margin, ROE, Debt-to-Equity, Dividend Yield.
   - Automated rule-backed financial strengths, valuation weaknesses, and principal risks.
6. **AI Financial Advisor:**
   - Conversational assistant with financial symbol detection and live context injection.
   - Configurable provider abstraction: Local Quantitative Engine (zero external config needed), OpenAI, Groq, or Ollama.
7. **Financial News & Sentiment:**
   - Wire news deduplication and natural language polarity classification (Bullish, Bearish, Neutral).
   - Sentiment distribution percentages and aggregate polarity scores (-1.0 to +1.0).
8. **Portfolio Management:**
   - Multi-asset transaction accounting (Buy/Sell orders, quantity, cost basis, transaction fees).
   - Real-time market valuation, unrealized P&L, sector allocation, and concentration risk metrics.
9. **Markowitz Portfolio Optimizer:**
   - Modern Portfolio Theory (Mean-Variance) Efficient Frontier with 1,000 Monte Carlo iterations.
   - Maximum Sharpe Ratio optimal asset allocation and Minimum Volatility portfolio.
   - Value at Risk (1-Day 95% VaR), Conditional VaR (CVaR Expected Shortfall), and Sortino Ratio.
   - Cross-asset return correlation matrix and actionable rebalance insights.
10. **Stock & ETF Screener:**
    - Filter equities and ETFs by Sector, P/E multiples, Dividend Yield, Market Cap, and RSI.
11. **Cross-Sectional Peer Benchmarking:**
    - Side-by-side multiple comparisons and correlation heatmaps against direct industry peers.
12. **Earnings & Dividend Analytics:**
    - Historical quarterly EPS beats/misses, consensus surprises, and cash dividend payment schedules.
13. **Macroeconomic Dashboard:**
    - US 10-Year Treasury Yield (^TNX), VIX, Crude Oil, Gold, US Dollar Index, Fed Funds Rate, CPI Inflation, and Real GDP Growth.
14. **Strategy Backtesting:**
    - Rule-based simulation for SMA Crossover and RSI Mean Reversion strategies.
    - Transaction fee friction (0.1%), equity curve vs. Buy & Hold benchmark, win rate, and trade log.
15. **Research Report Generator:**
    - Institutional report compilation with one-click **PDF export** (via ReportLab) and **Excel financial model export** (via openpyxl).
16. **RAG Document Research:**
    - Upload SEC 10-K filings, earnings transcripts, or equity research notes (.pdf, .txt, .csv).
    - Chunking and TF-IDF cosine similarity search with exact source and page citations.
17. **Watchlist & Price Alerts:**
    - Real-time watchlist tracking and condition-based price alerts (Price Above / Below).
18. **System Settings & Diagnostics:**
    - Configurable LLM keys, provider switching, and telemetry inspection.

---

## 🚀 Local Startup Guide

### Prerequisites
- Python 3.10+ (tested on Python 3.14.1)
- Node.js 18+ (tested on v24.13.0) and npm

### 1. Configure Environment
Copy the example environment file:
```bash
cp .env.example .env
```
*(FinanceAI's built-in Quantitative Financial Engine operates immediately without external API keys. You can optionally add OpenAI or Groq keys in `.env` if desired).*

### 2. Run the Backend
From the root directory:
```bash
# Optional: create a virtual environment
py -m venv venv
.\venv\Scripts\activate

# Install backend dependencies
py -m pip install -r backend/requirements.txt

# Start backend FastAPI server on http://localhost:8000
py backend/run.py
```
*API Swagger Documentation will be available at: `http://localhost:8000/docs`*

### 3. Run the Frontend
In a new terminal:
```bash
cd frontend

# Install npm dependencies
npm install --legacy-peer-deps

# Start Vite dev server on http://localhost:5173
npm run dev
```
Open your browser and navigate to: **`http://localhost:5173`**

---

## 🧪 Automated Testing

### Backend Test Suite (Pytest)
Run the 13 automated backend unit and integration tests:
```bash
py -m pytest backend/tests/test_financeai.py -v
```
**Coverage:**
- Health check endpoint
- Market summary, movers, and indices
- Stock search and live quotes
- Technical indicator calculations (SMA, EMA, RSI, MACD, BB, ATR)
- Fundamental ratio extraction & risk generation
- Machine learning forecasting feature engineering & 80/20 chronological split
- Portfolio transaction reconciliation & holdings
- Markowitz portfolio optimization & VaR/CVaR
- Trading strategy backtest execution
- PDF and Excel report generation
- Watchlist and price alert triggers

### Frontend Test Suite (Vitest)
Run the frontend unit and component tests:
```bash
cd frontend
npm run test
```

### Production Build
Verify the optimized production bundle:
```bash
cd frontend
npm run build
```

---

## 🛡️ Security & Privacy Notice
- API keys are handled strictly on the backend and are never bundled into client code.
- SQLite database is stored locally in `backend/financeai.db` and is ignored by git.
- External providers (Yahoo Finance) are wrapped with in-memory caching and offline fallback models to ensure continuous reliability without downtime.

*Disclaimer: FinanceAI is designed for quantitative financial research, algorithmic prototyping, and informational purposes. It does not constitute guaranteed investment advice.*

---

## 👨‍💻 Author & Credits
**Developed by Vishnu Singh**
FinanceAI Platform — Institutional Quantitative Research Suite.

