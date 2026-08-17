# Vertrag: Adaptive Lernereignisse

Die Frontend-Schnittstelle `LearningProgressRepository` ist der verbindliche
Vertrag zwischen adaptivem Lernmodus und Backend. Der aktuelle Browser-Adapter
speichert dieselben Datensätze lokal; ein API-Adapter ersetzt nur dessen
Implementierung.

## Ressourcen

| Ressource | Schlüsselattribute | Zweck |
| --- | --- | --- |
| `adaptive-session` | `id`, `studentId`, `startedAt`, `updatedAt`, Kompetenzzustände | reproduzierbarer Zustand einer Lernsession |
| `learning-attempt` | `id`, `sessionId`, `studentId`, `questionId`, `targetCompetencyId`, Bewertung, Zeit | unveränderliches Ereignis für Verlauf und Knowledge Tracing |

## Vorgesehene Endpunkte

```text
POST /api/v1/adaptive-sessions
PUT  /api/v1/adaptive-sessions/{sessionId}
GET  /api/v1/adaptive-sessions/{sessionId}
POST /api/v1/adaptive-sessions/{sessionId}/attempts
GET  /api/v1/adaptive-sessions/{sessionId}/attempts
```

`POST .../attempts` ist append-only und verwendet die clientseitig erzeugte
`attempt.id` als Idempotenzschlüssel. So führt ein Wiederholungsversuch nach
einem Netzfehler nicht zu zwei Lernereignissen.

## Bewertungsdaten

Jeder Versuch enthält eine `evaluation` mit `score` im Intervall `[0, 1]`, der
Quelle (`automatic`, `manual-self-assessment` oder `teacher-review`) und bei
binär bewertbaren Aufgaben optional `isCorrect`. Das Backend soll zusätzlich
das ursprüngliche `responsePayload` speichern, aber fachliche Antwortdaten
nicht aus dem Fortschrittswert rekonstruieren.

Die Trennung ermöglicht später automatische Bewertung, Teilpunkte und
Lehrendenkorrektur, ohne historische Lernereignisse umzuformen.
