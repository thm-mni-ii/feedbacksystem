import httpx
import re
import json
from settings import Settings
settings = Settings()

PROMPTS = {
    "Tutor": (
        "Du bist ein intelligenter Tutor, der Studierenden hilft, ihre Leistungen besser zu verstehen. "
        "Du erhältst eine Musterlösung mit gewichteten Abschnitten (Score 0 = unwichtig, 1 = relevant, 2 = sehr wichtig) "
        "sowie eine studentische Antwort. "
        "Bewerte, ob die studentische Antwort die Inhalte der relevanten Abschnitte (Score 1–2) vollständig, teilweise oder gar nicht abdeckt – unabhängig von der Formulierung. "
        "Addiere die Scores der vollständig abgedeckten Abschnitte, um die Gesamtpunktzahl zu berechnen. "
        "Erkläre außerdem, was gut gemacht wurde, welche Inhalte fehlen oder wie die Antwort verbessert werden kann."
    )
}

def calculate_max_score(muster):
    return round(sum(abschnitt.get("score", 0) for abschnitt in muster), 2)

def create_system_msg(muster, prompt_type="Tutor"):
    max_score = calculate_max_score(muster)
    prompt_content = PROMPTS.get(prompt_type, PROMPTS["Tutor"])
    return (
        f"{prompt_content}\n\n"
        f"Hinweis: Der Student kennt die Musterlösung nicht. Du bewertest ausschließlich den Vergleich zwischen studentischer Abgabe und Musterlösung.\n"
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

def extract_score_robust(text):
    cleaned_text = re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL).strip()
    matches = re.findall(r'\{\s*"score"\s*:\s*(\d+(?:[.,]\d+)?),\s*"max"\s*:\s*(\d+(?:[.,]\d+)?)\s*\}', cleaned_text)
    if matches:
        last_match = matches[-1]
        score = float(last_match[0].replace(",", "."))
        max_score = float(last_match[1].replace(",", "."))
        return score, max_score, cleaned_text
    return None, None, cleaned_text

async def run_evaluation(muster_preprocessed, abgabe_preprocessed, prompt_type="Tutor", model="qwen3:32b"):
    max_score = calculate_max_score(muster_preprocessed)
    system_msg = create_system_msg(muster_preprocessed, prompt_type)
    muster_json = json.dumps(muster_preprocessed, ensure_ascii=False)
    abgabe_json = json.dumps(abgabe_preprocessed, ensure_ascii=False)
    user_msg = (
        f"Musterlösung:\n{muster_json}\n\n"
        f"Studentische Abgabe:\n{abgabe_json}\n\n"
        f'{{ "score": X.X, "max": Y.Y }}'
    )

    url = settings.llm_url
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_msg},
            {"role": "user", "content": user_msg}
        ]
    }

    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(url, json=payload, timeout=60)
            resp.raise_for_status()
            answer = resp.json()["choices"][0]["message"]["content"]
            score, max_score_extracted, feedback = extract_score_robust(answer)
            if score is not None and max_score_extracted == max_score:
                return {
                    "score": score,
                    "max": max_score,
                    "feedback": feedback
                }
            return {
                "score": 0.0,
                "max": max_score,
                "feedback": "Keine valide Bewertung erkannt.\n" + answer
            }
        except Exception as e:
            return {
                "score": 0.0,
                "max": max_score,
                "feedback": f"Fehler bei Bewertung: {str(e)}"
            }

