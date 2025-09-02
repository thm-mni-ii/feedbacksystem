from fastapi import APIRouter, UploadFile, File, HTTPException, Query
import logic

router = APIRouter(prefix="/pdf-checker", tags=["PDF-Checker"])

@router.post("/evaluate")
async def evaluate_uploaded_pdf(
    file: UploadFile = File(...),
    course_id: str = Query(...),
    task_id: str = Query(...),
    submission_id: str = Query(...)
):
    try:
        result = await logic.process_pdf_and_score(file, course_id, task_id, submission_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))