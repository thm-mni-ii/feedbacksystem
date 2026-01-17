import spacy
import re
from motor.motor_asyncio import AsyncIOMotorClient
import base64
from settings import Settings

nlp = spacy.load("de_core_news_sm")
settings = Settings()
client = AsyncIOMotorClient(settings.mongo_url)
db = client[settings.mongo_db]
collection = db[settings.mongo_collection_submissions]

def extract_paragraphs(text):
    return re.split(
        r'(?:\n{2,}'
        r'|\n\s*\d+[\.\)]\s+'
        r'|\n\s*[a-zA-Z][\.\)]\s+'
        r'|\n\s*[●•\-*+]\s+)',
        text
    )

def preprocess_text(text):
    text_lower = text.lower()
    abschnitte = extract_paragraphs(text_lower)
    result = []
    for i, absatz in enumerate(abschnitte):
        doc = nlp(absatz.strip())
        tokens = [t.lemma_.lower() for t in doc if not t.is_punct and not t.is_space]
        if tokens:
            result.append({"abschnitt_id": i + 1, "tokens": tokens})
    return result

def _maybe_b64_to_text(s: str) -> str:
    try:
        b = base64.b64decode(s, validate=True)
        try:
            return b.decode("utf-8", errors="ignore")
        except Exception:
            return s
    except Exception:
        return s

async def load_preprocessed_submission(course_id: str, task_id: str):
    doc = await collection.find_one(
        {"course_id": course_id, "task_id": task_id},
        sort=[("_id", -1)]
    )
    if not doc:
        raise ValueError("Keine passende Abgabe gefunden.")
    text = _maybe_b64_to_text(doc.get("abgabe", ""))
    return {"title": f"{course_id}_{task_id}", "preprocessed": preprocess_text(text)}
