import json
from fastapi import APIRouter, Depends, HTTPException, Response
from typing import List
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.entities import SavedReport
from app.services.reports import ReportGeneratorService
from app.schemas.domain import ReportGenerateRequest, ReportSummaryResponse

router = APIRouter(prefix="/api/v1/reports", tags=["Research Reports"])

@router.post("", response_model=ReportSummaryResponse)
def generate_report(req: ReportGenerateRequest, db: Session = Depends(get_db)):
    try:
        report_data = ReportGeneratorService.generate_full_report_data(req.symbol)
        saved = SavedReport(
            symbol=report_data["symbol"],
            title=report_data["title"],
            summary=report_data["summary"],
            data_json=json.dumps(report_data)
        )
        db.add(saved)
        db.commit()
        db.refresh(saved)

        return ReportSummaryResponse(
            id=saved.id,
            symbol=saved.symbol,
            title=saved.title,
            summary=saved.summary or "",
            created_at=saved.created_at.isoformat(),
            pdf_available=True,
            excel_available=True
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("", response_model=List[ReportSummaryResponse])
def list_reports(db: Session = Depends(get_db)):
    reports = db.query(SavedReport).order_by(SavedReport.created_at.desc()).all()
    # If empty, generate one default report so UI is populated
    if not reports:
        report_data = ReportGeneratorService.generate_full_report_data("AAPL")
        saved = SavedReport(
            symbol=report_data["symbol"],
            title=report_data["title"],
            summary=report_data["summary"],
            data_json=json.dumps(report_data)
        )
        db.add(saved)
        db.commit()
        db.refresh(saved)
        reports = [saved]

    return [
        ReportSummaryResponse(
            id=r.id,
            symbol=r.symbol,
            title=r.title,
            summary=r.summary or "",
            created_at=r.created_at.isoformat(),
            pdf_available=True,
            excel_available=True
        )
        for r in reports
    ]

@router.get("/{report_id}/pdf")
def download_pdf(report_id: int, db: Session = Depends(get_db)):
    r = db.query(SavedReport).filter(SavedReport.id == report_id).first()
    if not r or not r.data_json:
        raise HTTPException(status_code=404, detail="Report not found")
    data = json.loads(r.data_json)
    pdf_bytes = ReportGeneratorService.build_pdf_bytes(data)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{r.symbol}_Research_Report.pdf"'}
    )

@router.get("/{report_id}/excel")
def download_excel(report_id: int, db: Session = Depends(get_db)):
    r = db.query(SavedReport).filter(SavedReport.id == report_id).first()
    if not r or not r.data_json:
        raise HTTPException(status_code=404, detail="Report not found")
    data = json.loads(r.data_json)
    excel_bytes = ReportGeneratorService.build_excel_bytes(data)
    return Response(
        content=excel_bytes,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="{r.symbol}_Financial_Model.xlsx"'}
    )
