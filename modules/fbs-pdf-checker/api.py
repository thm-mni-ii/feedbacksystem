from fastapi import APIRouter, UploadFile, File, HTTPException, Query, Response
import logic
from db import collection_submissions as collection

router = APIRouter(prefix="/pdf-checker", tags=["PDF-Checker"])

@router.post("/evaluate",response_class=Response,summary="Evaluate Uploaded Pdf and return Markdown")

async def evaluate_uploaded_pdf(
    file: UploadFile = File(...),
    course_id: str = Query(...),
    task_id: str = Query(...),
    submission_id: str = Query(...)
):
    try:
        result = await logic.process_pdf_and_score(
            file, course_id, task_id, submission_id
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    md_lines = [f"# Feedback für Submission {result['submission_id']}", ""]
    for fb in result["aufgaben_bewertungen"]:
        md_lines += [
            f"## {fb['title']}",
            f"- **Punkte:** {fb['score']} / {fb['max']}",
            "",
            fb["feedback"],
            "",
            "---",
            ""
        ]
    markdown = "\n".join(md_lines)

    await collection.update_one(
        {"submission_id": result["submission_id"]},
        {"$set": {"feedback_md": markdown}},
        upsert=True
    )

    return Response(content=markdown, media_type="text/markdown")