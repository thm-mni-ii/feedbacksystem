---
name: qcm
description: "Use for any change to QCM domain code (Question, Skill/Kompetenz, Session, Course, Lernfortschritt) in web/ (Vue frontend) or api/ (backend). Also use when deciding whether code is legacy/'catalog' (deprecated, do not extend) or new work. Backend will be rewritten from scratch (v2) with MongoDB; current data is dummy data, not yet backend-connected."
---

# QCM – Adaptive Lernplattform

Kontext: Bachelorarbeit "Konzeption und Implementierung einer adaptiven Lernplattform
zur kompetenzbasierten und personalisierten Steuerung von Aufgabenauswahl und
Lernfortschritt". Ziel ist es u.a., Modelle wie Bayesian Knowledge Tracing (BKT)
und verwandte Verfahren zu nutzen, um passende Fragen für den Lernenden auszuwählen.

## Wichtigste Regeln (immer beachten)

1. **"catalog" = tot.** Alles im Code (Backend oder Frontend), das "catalog" im
   Namen trägt, ist Legacy und wird nicht mehr verwendet. Niemals catalog-Code
   erweitern oder als Vorbild für neue Features nehmen.
2. **Alles ist aktuell Dummy-Daten.** Questions, Skills, Sessions, Courses etc.
   sind im Frontend derzeit nur Mock-/Dummy-Daten, es gibt noch keine echte
   Backend-Anbindung für diese Domänen. Code so schreiben, dass er später
   sauber an ein echtes Backend (v2) angebunden werden kann:
   - Datenzugriffe über Services kapseln (siehe unten), nicht direkt in
     Components/Views hardcoden.
   - Typen/Interfaces so definieren, dass sie 1:1 einer künftigen API-Response
     entsprechen könnten (keine UI-spezifischen Krücken in den Model-Typen).
3. **Backend v2 kommt, existiert aber noch nicht.** Es ist geplant, `api/`
   komplett neu zu schreiben (weiterhin MongoDB). Es gibt noch keine konkrete
   v2-Architektur. Bis dahin: keine Annahmen über eine neue Backend-Struktur
   treffen, keinen "Vorgriffs-Code" für v2 schreiben, der nicht explizit
   angefragt wurde.
4. **Adaptive Auswahl ist wissenschaftliche Arbeit, kein normales Feature.**
   Der Kern liegt in `web/src/composables/algorithm.ts`: ein Prototyp, der
   Fragen auswählt und den Kenntnisstand des Studenten auswertet. Basis ist
   Bayesian Knowledge Tracing (BKT) sowie weitere Modelle/Erkenntnisse aus der
   Lernforschung (nicht nur BKT). Bei jeder Änderung oder Erweiterung an
   diesem Code:
   - Immer im Bewusstsein arbeiten, dass dies der wissenschaftliche Kern der
     Bachelorarbeit ist – keine "quick fixes" ohne fachliche Begründung.
   - Jede nicht-triviale Entscheidung (z.B. Parameterwahl, welches Modell für
     welchen Fall greift, wie Werte kombiniert/gewichtet werden) klar
     begründen: warum diese Herangehensweise, welche Quelle/welches Konzept
     aus der Lernforschung dahintersteht, welche Annahmen getroffen werden.
   - Nicht einfach "plausiblen" Code hinschreiben, sondern nachvollziehbar
     machen, ob etwas Standard-BKT ist, eine Erweiterung/Anpassung davon, oder
     ein anderes Verfahren.
   - Bei Unsicherheit über die fachliche Fundierung: das explizit als offene
     Frage/Annahme kennzeichnen, statt es zu verschweigen.
5. **Vuetify Styling Beachten.** Alle UI-Elemente (Buttons, Inputs, Dialoge etc.) müssen wenn möglich Vuetify
   nutzen. so wenig eigene Styles/Components wie möglich. Vuetify ist bereits im Projekt
   integriert und bietet alle benötigten UI-Elemente. Die Theme Farben stehen in `web/src/plugins/vuetify.ts` zur Verfügung. Bitte keine eigenen Farben/Styles definieren, sondern die Vuetify Theme Farben nutzen. Falls du irgendwo im code andere Farben/Styles siehst, die nicht Vuetify sind, bitte anpassen.

## Domänenmodell

- **Skill** (= Kompetenz, deutsch/englisch synonym verwendet): kann mehrere
  Questions haben, kann mehrere Unter-Skills (Kompetenzen) haben → hierarchisch.
- **Question**: gehört zu genau einem Skill.
- **Course**: fasst Skills/Lerninhalte zusammen (Lernfluss-Kontext).
- **Session**: eine Lern-/Prüfungssitzung, in der Questions gestellt werden;
  später Basis für die adaptive Auswahl.

Types dazu liegen in `web/src/model/`.

## Projektstruktur & Konventionen

**Frontend (`web/`)** – Vue 3, TypeScript, Vuetify, Pinia.

- Types/Interfaces: `web/src/model/`
- Services (API-/Datenzugriffs-Kapselung): `web/src/services/`, z.B.
  `question.service.ts`. Neue Domänen-Logik immer in einen passenden Service
  auslagern statt in Components.
- Adaptiver Algorithmus (BKT + weitere Lernmodelle, wissenschaftlicher Kern
  der Arbeit): `web/src/composables/algorithm.ts` – siehe eigene Regel dazu
  weiter oben.
- Naming:
  - Views: Suffix `View.vue`, z.B. `QuestionOverviewView.vue`
  - Dialoge: Prefix `Dialog`, z.B. `DialogEditQuestion.vue`
  - (Weitere Komponenten-Namen: bestehende Files im jeweiligen Ordner als
    Vorbild nehmen, wenn kein Muster hier dokumentiert ist.)
- Build/Check-Befehle (in `web/`):
  - `npm run type-check` – TypeScript-Check
  - `npm run lint` – ESLint mit `--fix`
  - `npm run build` – type-check + Vite-Build

**Backend (`api/`)**

- Noch Legacy-Struktur, wird komplett neu geschrieben (v2). Keine
  Struktur-Annahmen treffen, die nicht im aktuellen Code sichtbar sind.
- MongoDB wird auch in v2 voraussichtlich weiter genutzt.

## Workflow

### 1. Scope klären

- Welche Domäne betroffen? Question / Skill / Session / Course / Lernfluss?
- API, UI oder beides?
- Ist das Legacy (inkl. alles mit "catalog"), aktuelle Dummy-Daten-Welt im
  Frontend, oder explizit v2-Konzeptarbeit?

### 2. Muster im Code suchen

- Ähnlichen Service/Component/View/Dialog im jeweiligen Ordner finden.
- Bestehende Naming-Konventionen (siehe oben) übernehmen.
- Bei "catalog"-Treffern: nicht als Vorbild nutzen, stattdessen nicht-catalog
  Pendant suchen oder nachfragen.

### 3. Einordnen

- Frontend-only (Dummy-Daten-Ebene) / API-only / API+Frontend / reine
  v2-Konzeptidee.

### 4. Minimal korrekt umsetzen

- Nur das ändern, was zur Aufgabe gehört, kein Nebenrefactoring.
- Datenzugriff über Services kapseln, nicht direkt in Components.
- Typen in `web/src/model/` so halten, dass sie später zu einer echten
  API-Response passen könnten.
- Naming-Konventionen einhalten (View/Dialog-Suffixe/Prefixe).

### 5. Datenfluss prüfen

- Sind die Dummy-Daten realistisch genug, um später 1:1 durch echte
  API-Daten ersetzt zu werden?
- Werden Null/Undefined-Fälle (z.B. Skill ohne Unter-Skills, Question ohne
  Session-Kontext) sauber behandelt?

### 6. Validieren

- `npm run type-check` und `npm run lint` in `web/` laufen lassen.
- Betroffenen Flow (z.B. Skill-Baum, Session-Ablauf) kurz manuell/gedanklich
  durchspielen.

## Erfolgskriterium

Frontend-Typen, Services und Components/Views/Dialoge passen zusammen,
Naming-Konventionen sind eingehalten, kein catalog-Code wurde erweitert,
und es wurde nichts implementiert, das eine bereits existierende
Backend-v2-Architektur voraussetzt, die es noch nicht gibt.

## Beispielprompts

- "/qcm add a new question type"
- "/qcm skill tree component erweitern"
- "/qcm debug session flow"
- "/qcm ist das hier legacy/catalog oder aktuell relevant?"
- "/qcm algorithm.ts um ein weiteres Lernmodell erweitern"
- "/qcm begründe die aktuelle Parameterwahl im BKT-Teil von algorithm.ts"
