import httpx
import re
import json
import asyncio
from settings import Settings
settings = Settings()

PROMPTS = {
    "Tutor": (
        "Du bist ein intelligenter Tutor, der Studierenden hilft, ihre Leistungen besser zu verstehen. "
        "Du erhältst eine Musterlösung mit gewichteten Abschnitten (Score 0 = unwichtig, 1 = relevant, 2 = sehr wichtig) "
        "sowie eine studentische Antwort. "
        "Bewerte, ob die studentische Antwort die Inhalte der relevanten Abschnitte (Score 1–2) vollständig, teilweise oder gar nicht abdeckt – unabhängig von der Formulierung. "
        "Addiere NUR die Scores der vollständig abgedeckten Abschnitte (Score >= 1), um die Gesamtpunktzahl zu berechnen. "
        "Erkläre außerdem kurz, was gut gemacht wurde und was fehlt."
    )
}

def calculate_max_score(muster):
    try:
        return round(sum(float(s.get("score", 0)) for s in muster if float(s.get("score", 0)) >= 1), 2)
    except Exception:
        return 0.0

def create_system_msg(muster, prompt_type="Tutor"):
    max_score = calculate_max_score(muster)
    prompt_content = PROMPTS.get(prompt_type, PROMPTS["Tutor"])
    return (
        f"{prompt_content}\n\n"
        f"Hinweis: Der Student kennt die Musterlösung nicht, das ist sehr wichtig! Du bewertest ausschließlich den Vergleich zwischen studentischer Abgabe und Musterlösung.\n"
        f"Maximal erreichbare Punktzahl für diese Aufgabe: {max_score}\n\n"
        "Vergleiche die Abgabe mit der Musterlösung und gib GENAU FOLGENDES aus:\n\n"
        "1. Ein kurzes Feedback in maximal drei Sätzen (auf Deutsch), das klar und präzise jeden Punktabzug mit einer kurzen Erklärung begründet, welche Inhalte fehlen oder falsch sind.\n"
        "2. Danach SOFORT und OHNE EINLEITUNG den JSON-Block:\n"
        '{ \"score\": X.X, \"max\": Y.Y }\n\n'
        "WICHTIG:\n"
        "- Der JSON-Block MUSS auf EINER einzigen Zeile stehen.\n"
        "- KEINE Markdown-Formatierung (kein ``` oder Ähnliches).\n"
        "- KEIN zusätzlicher Text, keine Anführungszeichen um den Block.\n"
        "- KEINE andere Skala als die, die du im Beispiel siehst (z.B. max: 4, 5 oder 3).\n"
        "- KEINE neuen Kategorien, KEIN Bewertungsschema erfinden.\n"
        "- Immer genau dieses Format: { \"score\": X.X, \"max\": Y.Y }\n"
        "- Wenn du unsicher bist: Nimm lieber konservativ Punkte weg, statt neue Maßstäbe zu setzen."
    )

def extract_score_robust(text, expected_max=None):
    cleaned = re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL)
    cleaned = re.sub(r"```.*?```", "", cleaned, flags=re.DOTALL).strip()
    m = re.findall(r'\{\s*"score"\s*:\s*([-+]?\d+(?:[.,]\d+)?),\s*"max"\s*:\s*([-+]?\d+(?:[.,]\d+)?)\s*\}', cleaned)
    if m:
        score = float(m[-1][0].replace(",", "."))
        max_found = float(m[-1][1].replace(",", "."))
        if expected_max is not None and abs(max_found - expected_max) > 1e-6:
            max_found = expected_max
        return score, max_found, cleaned
    return None, None, cleaned

async def run_evaluation(
    muster_preprocessed,
    abgabe_preprocessed,
    prompt_type="Tutor",
    model="qwen3:32b",
    retries: int = 5,
    backoff_base: float = 0.75
):
    max_score = calculate_max_score(muster_preprocessed)
    system_msg = create_system_msg(muster_preprocessed, prompt_type)
    muster_json = json.dumps(muster_preprocessed, ensure_ascii=False)
    abgabe_json = json.dumps(abgabe_preprocessed, ensure_ascii=False)

    base_user_msg = (
        f"Musterlösung (abschnittsweise, mit Gewichten):\n{muster_json}\n\n"
        f"Studentische Abgabe (vorverarbeitet):\n{abgabe_json}\n\n"
        f'{{ \"score\": X.X, \"max\": {max_score:.2f} }}'
    )
    url = settings.llm_url

    last_error = None
    async with httpx.AsyncClient() as client:
        for attempt in range(1, retries + 1):
            # Für Wiederholungen noch einmal sehr hart auf Format pochen
            user_msg = base_user_msg if attempt == 1 else (
                base_user_msg + "\n\nACHTUNG: Die letzte Ausgabe war ungültig. "
                "Gib jetzt GENAU zwei Dinge aus: 1) max. drei Sätze Feedback. "
                "2) direkt danach EINE EINZIGE ZEILE mit { \"score\": X.X, \"max\": Y.Y } – sonst nichts."
            )
            payload = {
                "model": model,
                "messages": [
                    {"role": "system", "content": system_msg},
                    {"role": "user", "content": user_msg}
                ],
                "stream": False,
            }

            try:
                resp = await client.post(url, json=payload, timeout=90)
                resp.raise_for_status()
                data = resp.json()
                if "message" in data and "content" in data["message"]:
                    answer = data["message"]["content"]
                elif "choices" in data:
                    answer = data["choices"][0]["message"]["content"]
                else:
                    last_error = f"Unerwartetes Antwortformat: {json.dumps(data)[:200]}…"
                    raise RuntimeError(last_error)

                score, _, feedback = extract_score_robust(answer, expected_max=max_score)
                if score is not None:
                    return {"score": float(score), "max": float(max_score), "feedback": feedback}

                last_error = "Kein gültiger JSON-Block erkannt."
                # kein raise -> Retry
            except Exception as e:
                last_error = f"{type(e).__name__}: {e}"

            if attempt < retries:
                await asyncio.sleep(backoff_base * (2 ** (attempt - 1)))
                continue

    # Fallback nach allen Versuchen: kein Exception-Throw -> kein „Fehler bei Bewertung“ im Markdown
    return {
        "score": 0.0,
        "max": float(max_score),
        "feedback": f"Automatische Bewertung fehlgeschlagen – {last_error or 'kein valides Ergebnis nach mehreren Versuchen'}. Bitte manuell prüfen."
    }
