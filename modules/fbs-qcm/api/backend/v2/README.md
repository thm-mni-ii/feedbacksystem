# QCM Backend v2 – Anleitung

Neues Backend für QCM, komplett unabhängig vom alten `api/backend/` (eigener
Port, eigene Datenbank). Diese Anleitung erklärt Schritt für Schritt, wie du
es startest und damit entwickelst.

## Kurz gesagt: Was ist der aktuelle Stand?

- **Backend v2** (dieser Ordner): läuft, hat zwei Bereiche ("Questions" und
  "Competencies/Skills") mit echten Daten in MongoDB.
- **Frontend** (`web/`): ist **noch nicht** mit diesem Backend verbunden. Es
  zeigt weiterhin seine eigenen eingebauten Test-Daten an (Dummy-Daten direkt
  im Frontend-Code). Das Backend zu starten ändert also aktuell noch nichts
  im Frontend, was du im Browser siehst.
- Das heißt: **Für's Frontend musst du gerade nichts extra tun.** Es läuft
  wie gewohnt mit `npm run dev` im `web/`-Ordner, unabhängig vom Backend. Die
  Verbindung Frontend ↔ Backend v2 ist ein späterer Schritt, den wir noch
  nicht gemacht haben.

Der Rest dieser Anleitung dreht sich nur um das Backend.

## Voraussetzungen (einmalig prüfen)

- Node.js installiert (Version 20 oder neuer)
- Docker Desktop installiert und **gestartet** (das Docker-Symbol muss
  laufen, sonst schlagen die folgenden Befehle fehl)

## Erststart (nur beim allerersten Mal nötig)

Alle Befehle werden in diesem Ordner ausgeführt:

```powershell
cd modules\fbs-qcm\api\backend\v2
```

**Schritt 1 – Pakete installieren:**

```powershell
npm install
```

**Schritt 2 – Konfigurationsdatei anlegen:**

```powershell
Copy-Item .env.example .env
```

Das kopiert die Vorlage `.env.example` zu einer neuen Datei `.env`. Die
`.env`-Datei sagt dem Backend, wie es sich mit der Datenbank verbindet
(Adresse, Passwörter etc.). Sie ist bewusst nicht Teil von Git (jeder
Entwickler hat seine eigene), deshalb musst du sie einmalig selbst erzeugen.
Ohne diese Datei startet nichts.

**Schritt 3 – Datenbank starten:**

```powershell
docker compose up -d
```

Das startet im Hintergrund zwei Docker-Container:
- eine MongoDB-Datenbank (Speicherort für alle Daten)
- eine kleine Weboberfläche, um die Datenbank im Browser anzuschauen

**Schritt 4 – Test-/Übungsdaten in die Datenbank laden:**

```powershell
npm run seed
```

Das befüllt die (noch leere) Datenbank mit den 142 Fragen und 43 Skills, die
aktuell auch im Frontend als Dummy-Daten existieren. Kannst du jederzeit
erneut ausführen, um die Datenbank zurückzusetzen.

Damit ist die Einrichtung abgeschlossen.

## Täglicher Gebrauch (jedes Mal, wenn du entwickeln willst)

**1. Docker Desktop starten** (falls nicht schon offen)

**2. Datenbank-Container starten**, falls sie nicht mehr laufen:

```powershell
cd modules\fbs-qcm\api\backend\v2
docker compose up -d
```

Tipp: Läuft der Container schon, passiert bei erneuter Ausführung nichts
Schlimmes – der Befehl merkt das und tut nichts.

**3. Backend-Server starten:**

```powershell
npm run dev
```

Das startet die API unter `http://localhost:3001` und lädt automatisch neu,
wenn du Code änderst. Läuft dauerhaft in diesem Terminal-Fenster – zum
Beenden `Strg+C`.

Das war's – das Backend läuft jetzt und ist bereit, Anfragen zu beantworten.

## Wie beende ich alles wieder?

- Backend-Server: im Terminal `Strg+C` drücken
- Datenbank-Container: `docker compose down` (Daten bleiben erhalten, du
  kannst sie beim nächsten Start einfach weiterverwenden)

## Wie sehe ich, was in der Datenbank drinsteht?

Zwei Möglichkeiten, beide funktionieren nur wenn die Container laufen
(Schritt 3 oben):

**Option A – im Browser (am einfachsten):**
Öffne http://localhost:8087 – kein Login nötig.

**Option B – mit MongoDB Compass** (falls installiert):
Verbinde dich mit: `mongodb://localhost:27019`
Datenbank heißt `QCM_v2`, darin liegen die Collections `question` und
`competency`.

## Wie teste ich, ob die API funktioniert?

Die API verlangt für jede Anfrage einen "Token" (eine Art Ausweis, damit nur
angemeldete Nutzer Daten sehen). Zum Testen erzeugst du dir selbst einen:

```powershell
node -e "console.log(require('jsonwebtoken').sign({username:'me',id:1}, 'change-me'))"
```

Das gibt eine lange Zeichenkette aus, z.B. `eyJhbGci...`. Diese Zeichenkette
kopierst du dir und setzt sie in den folgenden Befehlen anstelle von
`DEIN_TOKEN` ein:

```powershell
$token = "DEIN_TOKEN"
curl.exe http://localhost:3001/api_v2/questions --header "authorization: Bearer $token"
curl.exe http://localhost:3001/api_v2/competencies --header "authorization: Bearer $token"
```

Wenn alles funktioniert, bekommst du eine lange JSON-Antwort mit allen
Fragen bzw. Skills zurück.

## Automatisierte Tests laufen lassen

Falls du am Backend-Code etwas änderst und prüfen willst, ob nichts kaputt
gegangen ist:

```powershell
npm test
```

Das braucht keine laufenden Docker-Container – die Tests bauen sich ihre
eigene, temporäre Test-Datenbank automatisch.

## Womit kann ich sonst noch arbeiten?

Produktions-Build lokal testen (normalerweise nicht nötig für die
Entwicklung, nur zur Kontrolle):

```powershell
npm run build     # übersetzt TypeScript nach JavaScript (Ordner dist/)
npm start          # baut und startet den fertigen Build
```

## Kurzreferenz aller Befehle

| Befehl | Wofür |
|---|---|
| `npm install` | Pakete installieren (einmalig, oder nach Änderungen an package.json) |
| `Copy-Item .env.example .env` | Konfigurationsdatei anlegen (einmalig) |
| `docker compose up -d` | Datenbank-Container starten |
| `docker compose down` | Datenbank-Container stoppen |
| `npm run seed` | Test-Daten in die Datenbank laden/zurücksetzen |
| `npm run dev` | Backend-Server starten (Entwicklung) |
| `npm test` | Automatisierte Tests laufen lassen |
| `npm run build` / `npm start` | Produktions-Build lokal testen |

## Für später: Struktur des Codes (nur relevant, wenn du selbst am Code mitschreibst)

```
api/backend/v2/
├── docker-compose.yml       # Datenbank-Container-Definition
├── .env.example             # Vorlage für .env
├── package.json             # alle npm-Befehle
└── src/
    ├── index.ts             # Startpunkt des Servers
    ├── app.ts                # Express-App-Aufbau
    ├── mongo/mongo.ts        # Datenbank-Verbindung
    ├── middleware/authenticateToken.ts   # Prüft den Token bei jeder Anfrage
    ├── question/             # Alles rund um Fragen (Modell, Routen, Logik, Tests)
    ├── competency/           # Alles rund um Skills/Kompetenzen (gleicher Aufbau)
    └── seed/seed.ts          # Lädt die Frontend-Dummy-Daten in die Datenbank
```

Jede Domain (`question/`, `competency/`, künftig weitere) ist gleich
aufgebaut: Route → Controller → Repository → Datenbank. Die Datenmodelle
orientieren sich bewusst an den Typen aus `web/src/model/types.ts`, damit das
Frontend später ohne große Umbauten an die echte API angebunden werden kann.

## Geplante nächste Schritte

1. Session/Lernfortschritt-Bereich im Backend (damit Sessions und Antworten
   gespeichert werden können)
2. Frontend tatsächlich mit dem Backend verbinden (aktuell nutzt es nur
   Dummy-Daten, siehe oben)
3. Kurse-Bereich + echtes Login-System (aktuell nur ein Platzhalter)
