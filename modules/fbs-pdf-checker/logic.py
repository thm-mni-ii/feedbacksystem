import os, re, json, shutil, tempfile, base64
from typing import Union
from fastapi import UploadFile
import pdf_extractor, preprocessor, promptgen
from db import collection_submissions, collection_solutions

def _looks_like_pdf_b64(s: str) -> bool:
    if not s or not isinstance(s, str):
        return False
    t = s.strip()
    if t.startswith("data:"):
        t = t.split(",", 1)[1] if "," in t else ""
    t = re.sub(r"\s+", "", t).replace("-", "+").replace("_", "/")
    try:
        head = base64.b64decode(t[:128] or b"", validate=False)
    except Exception:
        return False
    return head.startswith(b"%PDF-")

def _looks_like_json(s) -> bool:
    # akzeptiere String oder bereits geparste Objekte
    if isinstance(s, (dict, list)):
        return True
    if not isinstance(s, str):
        return False
    t = s.lstrip()
    return t.startswith("{") or t.startswith("[")

def _parse_solution_json(payload):
    # akzeptiere bereits geparste Objekte
    data = payload if isinstance(payload, (dict, list)) else json.loads(payload)

    # Deine Struktur: Liste von Tasks mit title + preprocessed
    # Beispiel: [{"title": "...","preprocessed":[{...}, ...]}, ...]
    solution_map = {}
    default_sections = None

    if isinstance(data, list):
        if data and isinstance(data[0], dict) and "title" in data[0] and "preprocessed" in data[0]:
            for item in data:
                solution_map[item["title"]] = item["preprocessed"]
        else:
            # Liste ohne Titel -> als Default-Sektionen für alle Aufgaben verwenden
            default_sections = data

    elif isinstance(data, dict):
        # Alternative Formate: {"Aufgabe X":[{...}, ...], ...} oder {"tasks":[...]}
        if "tasks" in data and isinstance(data["tasks"], list):
            for item in data["tasks"]:
                if isinstance(item, dict) and "title" in item and "sections" in item:
                    solution_map[item["title"]] = item["sections"]
        else:
            # direktes Mapping: Titel -> Sektionen
            solution_map = data

    return solution_map, default_sections

def _b64_decode_relaxed(s: str) -> bytes:
    t = (s or "").strip()
    if t.startswith("data:"):
        t = t.split(",", 1)[1] if "," in t else ""
    t = re.sub(r"\s+", "", t).replace("-", "+").replace("_", "/")
    missing = (4 - (len(t) % 4)) % 4
    if missing:
        t += "=" * missing
    return base64.b64decode(t or "", validate=False)

def _as_json_payload(payload):
    if isinstance(payload, (dict, list)):
        return True, payload
    if isinstance(payload, str):
        t = payload.lstrip()
        # roh als Text?
        if t.startswith("{") or t.startswith("["):
            try:
                return True, json.loads(payload)
            except Exception:
                return False, None
        # Base64 -> Text -> JSON?
        try:
            raw = _b64_decode_relaxed(payload)
            if raw.startswith(b"%PDF-"):
                return False, None  # das ist ein PDF, kein JSON
            txt = raw.decode("utf-8", errors="strict").lstrip()
            if txt.startswith("{") or txt.startswith("["):
                return True, json.loads(txt)
        except Exception:
            pass
    return False, None

async def _load_solution_any(course_id: str, task_id: str):
    # 1) solution-... (PDF-B64 ODER JSON / Base64-JSON)
    sol = await collection_solutions.find_one({"submission_id": f"solution-{course_id}-{task_id}"})
    if sol:
        payload = sol.get("abgabe")
        if isinstance(payload, str) and _looks_like_pdf_b64(payload):
            return {"type": "pdf_b64", "payload": payload}
        ok, parsed = _as_json_payload(payload)
        if ok:
            return {"type": "json", "payload": parsed}

    # 2) sheet-... (kann ebenfalls Base64-JSON sein)
    sheet = await collection_solutions.find_one({"submission_id": f"sheet-{course_id}-{task_id}"})
    if sheet:
        ok, parsed = _as_json_payload(sheet.get("sheet"))
        if ok:
            return {"type": "json", "payload": parsed}

    return None

async def process_pdf_and_score(
    file: Union[UploadFile, str],
    course_id: str,
    task_id: str,
    submission_id: str,
):
    if isinstance(file, UploadFile):
        pdf_bytes = await file.read()
    elif isinstance(file, str):
        if os.path.exists(file):
            with open(file, "rb") as f:
                pdf_bytes = f.read()
        else:
            pdf_bytes = pdf_extractor.pdf_bytes_from_base64(file)
    else:
        raise TypeError("Unsupported type for 'file' parameter")

    if not pdf_bytes:
        raise ValueError("Abgabe ist leer (0 Bytes).")
    if not pdf_bytes.startswith(b"%PDF-"):
        raise ValueError("Abgabe ist kein PDF (fehlender %PDF-Header).")

    workdir = tempfile.mkdtemp()
    try:
        images = pdf_extractor.extract_images_with_fitz_bytes(pdf_bytes, workdir)
        markdown = pdf_extractor.extract_text_and_embed_bytes(pdf_bytes, images)
        await collection_submissions.update_one(
            {"submission_id": submission_id},
            {"$set": {"extracted_abgabe_md": markdown}},
            upsert=True
        )
        tasks = pdf_extractor.extract_tasks_from_markdown(markdown)
        student_tasks_pp = [
            {"title": t["title"], "preprocessed": preprocessor.preprocess_text(t["content"])}
            for t in tasks
        ]

        sol_any = await _load_solution_any(course_id, task_id)
        if not sol_any:
            raise ValueError(f"Keine Musterlösung für {course_id}/{task_id} gefunden.")

        if sol_any["type"] == "pdf_b64":
            sol_bytes = pdf_extractor.pdf_bytes_from_base64(sol_any["payload"])
            if not sol_bytes.startswith(b"%PDF-"):
                raise ValueError("Musterlösung ist kein PDF.")
            sol_images = pdf_extractor.extract_images_with_fitz_bytes(sol_bytes, workdir)
            sol_markdown = pdf_extractor.extract_text_and_embed_bytes(sol_bytes, sol_images)
            sol_tasks = pdf_extractor.extract_tasks_from_markdown(sol_markdown)
            solution_map = {t["title"]: preprocessor.preprocess_text(t["content"]) for t in sol_tasks}
            default_sections = None
        else:
            try:
                solution_map, default_sections = _parse_solution_json(sol_any["payload"])
            except Exception as e:
                raise ValueError(f"Musterlösung (JSON) ist ungültig: {e}")

        aufgaben_bewertungen = []
        for task in student_tasks_pp:
            title = task["title"]
            abgabe_pre = task["preprocessed"]
            if title in solution_map:
                muster_sections = solution_map[title]
            else:
                muster_sections = default_sections if default_sections is not None else []

            r = await promptgen.run_evaluation(muster_sections, abgabe_pre)
            r["title"] = title
            aufgaben_bewertungen.append(r)

        await collection_submissions.update_one(
            {"submission_id": submission_id},
            {"$set": {"bewertung": aufgaben_bewertungen}},
            upsert=True
        )
        return {"submission_id": submission_id, "aufgaben_bewertungen": aufgaben_bewertungen}
    finally:
        shutil.rmtree(workdir, ignore_errors=True)