from fastapi import APIRouter
from typing import List
from app.services.peers import PeerComparisonService
from app.schemas.domain import PeerComparisonRequest, PeerComparisonResponse

router = APIRouter(prefix="/api/v1/peers", tags=["Peer Comparison"])

@router.get("/{symbol}", response_model=PeerComparisonResponse)
def get_peers_for_symbol(symbol: str):
    clean = symbol.strip().upper()
    peer_map = {
        "AAPL": ["AAPL", "MSFT", "GOOGL"],
        "MSFT": ["MSFT", "AAPL", "GOOGL", "AMZN"],
        "NVDA": ["NVDA", "AMD", "TSLA", "MSFT"],
        "AMZN": ["AMZN", "GOOGL", "META", "MSFT"],
        "RELIANCE.NS": ["RELIANCE.NS", "TCS.NS", "HDFCBANK.NS"]
    }
    peers = peer_map.get(clean, [clean, "AAPL", "MSFT"])
    data = PeerComparisonService.compare_peers(peers)
    return PeerComparisonResponse(**data)

@router.post("/compare", response_model=PeerComparisonResponse)
def compare_custom_peers(req: PeerComparisonRequest):
    data = PeerComparisonService.compare_peers(req.symbols)
    return PeerComparisonResponse(**data)
