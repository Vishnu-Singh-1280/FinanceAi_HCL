import os
import sys
import pytest
from fastapi.testclient import TestClient

# Ensure backend directory is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app
from app.database import init_db
from app.services.technical import TechnicalAnalysisService
from app.services.fundamental import FundamentalAnalysisService
from app.services.forecasting import ForecastingService
from app.services.optimizer import PortfolioOptimizerService
from app.services.backtest import BacktestService
from app.services.reports import ReportGeneratorService

client = TestClient(app)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    init_db()

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "FinanceAI"

def test_market_summary():
    response = client.get("/api/v1/market/summary")
    assert response.status_code == 200
    data = response.json()
    assert "indices" in data
    assert len(data["indices"]) >= 3
    assert "market_sentiment" in data

def test_market_movers():
    response = client.get("/api/v1/market/movers")
    assert response.status_code == 200
    data = response.json()
    assert "gainers" in data
    assert "losers" in data
    assert "most_active" in data

def test_stock_search():
    response = client.get("/api/v1/stocks/search?q=AAPL")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert data[0]["symbol"] == "AAPL"

def test_stock_quote():
    response = client.get("/api/v1/stocks/AAPL")
    assert response.status_code == 200
    data = response.json()
    assert data["symbol"] == "AAPL"
    assert data["price"] > 0
    assert "history" in data

def test_technical_analysis():
    tech = TechnicalAnalysisService.calculate_indicators("AAPL", period="1y")
    assert tech["symbol"] == "AAPL"
    assert "rsi_value" in tech
    assert 0 <= tech["rsi_value"] <= 100
    assert "trend" in tech
    assert len(tech["support_levels"]) > 0
    assert len(tech["resistance_levels"]) > 0
    assert len(tech["chart_data"]) > 0

def test_fundamental_analysis():
    fund = FundamentalAnalysisService.get_fundamentals("AAPL")
    assert fund["symbol"] == "AAPL"
    assert fund["trailing_pe"] is not None
    assert len(fund["strengths"]) > 0
    assert len(fund["risks"]) > 0

def test_ml_forecasting_pipeline():
    forecast = ForecastingService.run_forecast("AAPL")
    assert forecast["symbol"] == "AAPL"
    assert forecast["current_price"] > 0
    assert forecast["estimate_30d"] > 0
    assert forecast["estimate_60d"] > 0
    assert forecast["estimate_90d"] > 0
    assert len(forecast["forecast_points"]) == 90
    assert "metrics" in forecast
    assert "validation_r2" in forecast["metrics"]
    assert "validation_mae" in forecast["metrics"]
    assert forecast["metrics"]["train_size"] > 0
    assert forecast["metrics"]["val_size"] > 0
    # Uncertainty interval bounds
    first_pt = forecast["forecast_points"][0]
    assert first_pt["lower_bound"] <= first_pt["predicted_price"] <= first_pt["upper_bound"]

def test_portfolio_flow():
    # 1. Get initial portfolio
    resp1 = client.get("/api/v1/portfolio")
    assert resp1.status_code == 200
    data1 = resp1.json()
    assert "holdings" in data1
    assert data1["cash_balance"] > 0

    # 2. Add buy transaction
    tx_payload = {
        "portfolio_id": 1,
        "symbol": "GOOGL",
        "asset_type": "stock",
        "transaction_type": "buy",
        "quantity": 10.0,
        "price": 170.0,
        "fees": 2.0,
        "notes": "Test buy order"
    }
    resp2 = client.post("/api/v1/portfolio/transactions", json=tx_payload)
    assert resp2.status_code == 200
    tx_res = resp2.json()
    assert tx_res["symbol"] == "GOOGL"
    assert tx_res["quantity"] == 10.0

    # 3. Check updated portfolio contains GOOGL
    resp3 = client.get("/api/v1/portfolio")
    data3 = resp3.json()
    googl_holding = next((h for h in data3["holdings"] if h["symbol"] == "GOOGL"), None)
    assert googl_holding is not None
    assert googl_holding["quantity"] >= 10.0

def test_portfolio_optimizer():
    opt = PortfolioOptimizerService.optimize_portfolio(symbols=["AAPL", "MSFT", "GOOGL"])
    assert "max_sharpe_allocation" in opt
    assert "min_volatility_allocation" in opt
    assert len(opt["frontier"]) > 0
    assert opt["max_sharpe_ratio"] is not None
    assert opt["value_at_risk_95"] >= 0

def test_backtest_strategy():
    bt = BacktestService.run_backtest(symbol="AAPL", strategy="sma_crossover")
    assert bt["symbol"] == "AAPL"
    assert bt["strategy"] == "sma_crossover"
    assert bt["initial_capital"] == 10000.0
    assert "equity_curve" in bt
    assert len(bt["equity_curve"]) > 10

def test_report_generation():
    rep_data = ReportGeneratorService.generate_full_report_data("AAPL")
    pdf_bytes = ReportGeneratorService.build_pdf_bytes(rep_data)
    assert len(pdf_bytes) > 1000
    assert pdf_bytes.startswith(b"%PDF")

    excel_bytes = ReportGeneratorService.build_excel_bytes(rep_data)
    assert len(excel_bytes) > 1000

def test_watchlist_and_alerts():
    # Watchlist
    client.post("/api/v1/watchlist", json={"symbol": "NVDA", "notes": "GPU king"})
    w_list = client.get("/api/v1/watchlist").json()
    assert any(item["symbol"] == "NVDA" for item in w_list)

    # Alerts
    alert_resp = client.post("/api/v1/alerts", json={"symbol": "NVDA", "condition": "above", "target_value": 50.0})
    assert alert_resp.status_code == 200
    alert_data = alert_resp.json()
    assert alert_data["symbol"] == "NVDA"

    # Fetch alerts
    alerts_list = client.get("/api/v1/alerts").json()
    assert len(alerts_list) >= 1
