from fastapi import APIRouter, HTTPException
from app.schemas.report_schema import CitizenReportCreate
from app.services.report_service import process_citizen_report

router = APIRouter()

@router.post("/")
async def submit_report(report: CitizenReportCreate):
    """
    Accepts a 2-tap citizen report containing precise coordinates and heading.
    """
    try:
        result = await process_citizen_report(report)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
