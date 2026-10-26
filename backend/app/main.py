import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse

from app.config import settings
from app.database import init_db
from app.routers import (
    market,
    stocks,
    forecast,
    advisor,
    news,
    portfolio,
    backtest,
    screener,
    peers,
    earnings_dividends,
    macro,
    reports,
    rag,
    watchlist_alerts,
    settings as settings_router,
    auth,
    admin
)
import os
from fastapi.staticfiles import StaticFiles

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("FinanceAI")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing FinanceAI Database & Engine...")
    init_db()
    logger.info("FinanceAI ready to serve requests.")
    yield
    logger.info("Shutting down FinanceAI...")

app = FastAPI(
    title="FinanceAI API",
    description="AI-Powered Financial Research, Stock Prediction & Portfolio Intelligence Platform",
    version="2.4.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global error on {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": "InternalServerError", "message": str(exc), "path": request.url.path}
    )

# Health Check
@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "FinanceAI",
        "version": "2.4.0",
        "environment": settings.APP_ENV
    }

# Register Routers
app.include_router(market.router)
app.include_router(stocks.router)
app.include_router(forecast.router)
app.include_router(advisor.router)
app.include_router(news.router)
app.include_router(portfolio.router)
app.include_router(backtest.router)
app.include_router(screener.router)
app.include_router(peers.router)
app.include_router(earnings_dividends.router)
app.include_router(macro.router)
app.include_router(reports.router)
app.include_router(rag.router)
app.include_router(watchlist_alerts.router)
app.include_router(settings_router.router)
app.include_router(auth.router)
app.include_router(admin.router)

# Robust Static SPA Serving for Production Deployment
candidate_paths = [
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../frontend/dist"),
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "../frontend/dist"),
    os.path.abspath("frontend/dist"),
    os.path.abspath("../frontend/dist"),
    "/app/frontend/dist"
]

dist_dir = None
for p in candidate_paths:
    if os.path.isdir(p):
        dist_dir = os.path.abspath(p)
        break

if dist_dir:
    assets_dir = os.path.join(dist_dir, "assets")
    if os.path.isdir(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa_app(full_path: str):
        # Do not catch API endpoints, docs, or health
        if full_path.startswith("api") or full_path.startswith("health") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
            return JSONResponse(status_code=404, content={"detail": "Not Found"})
        file_path = os.path.join(dist_dir, full_path)
        if full_path and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(dist_dir, "index.html"))


