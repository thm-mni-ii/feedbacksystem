from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
import logic
from db import collection_solutions, collection_submissions

router = APIRouter(prefix="/submission", tags=["Submission"])

class Submission(BaseModel):
    submission_id: str
    student_id: str
    course_id: str
    task_id: str
    abgabe: str

class SolutionCreate(BaseModel):
    course_id: str
    task_id: str
    abgabe: str

class Sheet(BaseModel):
    submission_id: str
    student_id: str
    course_id: str
    task_id: str
    sheet: str

class SheetCreate(BaseModel):
    course_id: str
    task_id: str
    sheet: str

@router.post("/", response_model=Submission)
async def submit_submission(sub: Submission):
    entry = sub.dict()
    await collection_submissions.replace_one(
        {"submission_id": entry["submission_id"]}, entry, upsert=True
    )
    try:
        result = await logic.process_pdf_and_score(
            sub.abgabe, sub.course_id, sub.task_id, sub.submission_id
        )
    except Exception as e:
        markdown = f"# Feedback für Submission {sub.submission_id}\n\nFehler bei Bewertung hier: {e}"
        await collection_submissions.update_one(
            {"submission_id": sub.submission_id},
            {"$set": {"feedback_md": markdown}},
            upsert=True
        )
        return {**entry, "abgabe": markdown}

    md_lines = [f"# Feedback für Submission {result['submission_id']}", ""]
    total_score = total_max = 0.0
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
        total_score += float(fb["score"]); total_max += float(fb["max"])

    md_lines.insert(2, f"**Gesamtpunkte:** {total_score:.2f} / {total_max:.2f}")
    markdown = "\n".join(md_lines)

    await collection_submissions.update_one(
        {"submission_id": result["submission_id"]},
        {"$set": {"feedback_md": markdown, "total_score": round(total_score, 2), "total_max": round(total_max, 2)}},
        upsert=True
    )
    return {**entry, "abgabe": markdown}

@router.get("/", response_model=List[Submission])
async def list_submissions():
    cursor = collection_submissions.find()
    return await cursor.to_list(length=100)

@router.post("/solution", response_model=Submission)
async def submit_solution(solution: SolutionCreate):
    entry = solution.dict()
    entry["submission_id"] = f"solution-{solution.course_id}-{solution.task_id}"
    entry["student_id"] = "system"
    await collection_solutions.replace_one({"submission_id": entry["submission_id"]}, entry, upsert=True)
    return entry

@router.put("/solution", response_model=SolutionCreate)
async def update_solution(solution: SolutionCreate):
    result = await collection_solutions.update_one(
        {"submission_id": f"solution-{solution.course_id}-{solution.task_id}"},
        {"$set": {"abgabe": solution.abgabe}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="No solution found.")
    return solution

@router.delete("/solution")
async def delete_solution(course_id: str, task_id: str):
    result = await collection_solutions.delete_one({"submission_id": f"solution-{course_id}-{task_id}"})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="No solution found.")
    return {"message": "Solution deleted."}

@router.post("/sheet", response_model=Sheet)
async def submit_sheet(sheet: SheetCreate):
    entry = sheet.dict()
    entry["submission_id"] = f"sheet-{sheet.course_id}-{sheet.task_id}"
    entry["student_id"] = "system"
    await collection_solutions.replace_one({"submission_id": entry["submission_id"]}, entry, upsert=True)
    return entry

@router.put("/sheet", response_model=SheetCreate)
async def update_sheet(sheet: SheetCreate):
    result = await collection_solutions.update_one(
        {"submission_id": f"sheet-{sheet.course_id}-{sheet.task_id}"},
        {"$set": {"sheet": sheet.sheet}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="No sheet found.")
    return sheet

@router.delete("/sheet")
async def delete_sheet(course_id: str, task_id: str):
    result = await collection_solutions.delete_one({"submission_id": f"sheet-{course_id}-{task_id}"})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="No sheet found.")
    return {"message": "Sheet deleted."}
