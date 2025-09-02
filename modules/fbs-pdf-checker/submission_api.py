from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from db import collection

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

# Student submission POST
@router.post("/", response_model=Submission)
async def submit_submission(sub: Submission):
    entry = sub.dict()
    entry["is_solution"] = False
    await collection.replace_one({"submission_id": entry["submission_id"]}, entry, upsert=True)
    return entry

# List all submissions (not solutions)
@router.get("/", response_model=List[Submission])
async def list_submissions():
    cursor = collection.find({"is_solution": False})
    return await cursor.to_list(length=100)

# SOLUTION CREATE (POST)
@router.post("/solution", response_model=Submission)
async def submit_solution(solution: SolutionCreate):
    await collection.delete_many({"course_id": solution.course_id, "task_id": solution.task_id, "is_solution": True})
    entry = solution.dict()
    entry["submission_id"] = f"solution-{solution.course_id}-{solution.task_id}"
    entry["student_id"] = "system"
    entry["is_solution"] = True
    await collection.insert_one(entry)
    return entry

# SOLUTION UPDATE (PUT)
@router.put("/solution", response_model=SolutionCreate)
async def update_solution(solution: SolutionCreate):
    result = await collection.update_one(
        {"course_id": solution.course_id, "task_id": solution.task_id, "is_solution": True},
        {"$set": {"abgabe": solution.abgabe}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="No solution found.")
    return solution

# SOLUTION DELETE
@router.delete("/solution")
async def delete_solution(course_id: str, task_id: str):
    result = await collection.delete_one({"course_id": course_id, "task_id": task_id, "is_solution": True})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="No solution found.")
    return {"message": "Solution deleted."}