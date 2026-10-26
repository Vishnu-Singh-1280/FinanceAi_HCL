from fastapi import APIRouter, Query
from typing import Optional
from app.services.news_sentiment import NewsSentimentService
from app.schemas.domain import NewsSentimentResponse

router = APIRouter(prefix="/api/v1", tags=["News & Sentiment"])

@router.get("/news", response_model=NewsSentimentResponse)
def get_market_news(symbol: Optional[str] = Query(None)):
    data = NewsSentimentService.get_news_and_sentiment(symbol)
    return NewsSentimentResponse(**data)

@router.get("/sentiment/{symbol}", response_model=NewsSentimentResponse)
def get_symbol_sentiment(symbol: str):
    data = NewsSentimentService.get_news_and_sentiment(symbol)
    return NewsSentimentResponse(**data)
