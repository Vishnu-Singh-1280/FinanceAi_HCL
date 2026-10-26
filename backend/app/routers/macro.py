from fastapi import APIRouter
from app.services.macro import MacroService
from app.schemas.domain import MacroSummaryResponse

router = APIRouter(prefix="/api/v1/macro", tags=["Macroeconomic Intelligence"])

@router.get("/summary", response_model=MacroSummaryResponse)
def get_macro_summary():
    data = MacroService.get_macro_summary()
    return MacroSummaryResponse(**data)
