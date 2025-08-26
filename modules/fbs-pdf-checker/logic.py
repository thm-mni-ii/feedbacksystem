import tempfile
import os
from fastapi import UploadFile
import pdf_extractor, preprocessor, promptgen
from db import collection

async def load_solution(course_id, task_id):
    return await collection.find_one({
        "course_id": course_id,
        "task_id": task_id,
        "is_solution": True
    })

async def process_pdf_and_score(
    file: UploadFile,
    course_id: str,
    task_id: str,
    submission_id: str,
):
    with tempfile.TemporaryDirectory() as tmpdir:
        pdf_path = os.path.join(tmpdir, "upload.pdf")
        with open(pdf_path, "wb") as f:
            f.write(await file.read())

        images = pdf_extractor.extract_images_with_fitz(pdf_path, tmpdir)
        markdown = pdf_extractor.extract_text_and_embed(pdf_path, images)
        tasks = pdf_extractor.extract_tasks_from_markdown(markdown)
        preprocessed = [
            {"title": t["title"], "preprocessed": preprocessor.preprocess_text(t["content"])}
            for t in tasks
        ]

        muster_doc = await load_solution(course_id, task_id)
        if not muster_doc:
            raise ValueError(f"Keine Musterlösung für {course_id}/{task_id} gefunden.")
        muster_abgabe = muster_doc["abgabe"]
        muster_preprocessed_all = preprocessor.preprocess_text(muster_abgabe)

        aufgaben_bewertungen = []
        for task in preprocessed:
            title = task["title"]
            abgabe_preprocessed = task["preprocessed"]

            muster_sections = muster_preprocessed_all

            result = await promptgen.run_evaluation(muster_sections, abgabe_preprocessed)
            result["title"] = title
            aufgaben_bewertungen.append(result)

        await collection.update_one(
            {"submission_id": submission_id},
            {"$set": {"bewertung": aufgaben_bewertungen}},
            upsert=True
        )

        return {
            "submission_id": submission_id,
            "aufgaben_bewertungen": aufgaben_bewertungen
        }
