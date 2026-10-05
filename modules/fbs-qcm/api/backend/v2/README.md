# QCM Backend v2 – Anleitung

Neues Backend für QCM, komplett unabhängig vom alten `api/backend/` (eigener
Port, eigene Datenbank). Diese Anleitung erklärt Schritt für Schritt, wie du
es startest und damit entwickelst.

## Kurz gesagt: Was ist der aktuelle Stand?

- **Backend v2** (dieser Ordner): stellt Questions, Competencies,
  StudySessions, QuestionAttempts und kursbezogene Study-Konfigurationen aus
  MongoDB bereit.
- **Frontend** (`web/`) greift über `/api_v2` auf dieses Backend zu. Für den
  vollständigen Study-Ablauf müssen daher Frontend, Backend v2 und MongoDB
  laufen.

Der Rest dieser Anleitung dreht sich nur um das Backend.

Der TypeScript-Build des übergeordneten Legacy-Backends ist auf dessen eigenen
`src`-Ordner begrenzt. Backend v2 wird separat in diesem Ordner gebaut.
Der Legacy-Kursimport prüft wieder HTTPS-Zertifikate. Für lokale Dienste mit
eigener CA muss diese ausdrücklich vertrauenswürdig konfiguriert werden,
beispielsweise über `NODE_EXTRA_CA_CERTS`; Zertifikatsprüfungen nicht abschalten.

## Kursbezogene Study-Konfiguration

Die Endpunkte
`GET`, `PUT` und `DELETE /api_v2/courses/:courseId/study-configuration`
liefern, ändern beziehungsweise setzen die Algorithmuseinstellungen eines
Kurses zurück. MongoDB speichert nur Abweichungen von den
Anwendungsstandards. Schreibzugriffe verwenden das Feld `revision`; veraltete
Revisionen werden mit HTTP 409 abgelehnt.

Beim Anlegen einer StudySession erzeugt das Backend einen unveränderlichen
Snapshot der zu diesem Zeitpunkt effektiven Konfiguration. Spätere
Kursänderungen beeinflussen bestehende Sessions nicht.

## Attempts: Retry und Wiederaufnahme

`POST /api_v2/sessions/:id/attempts` akzeptiert optional `clientAttemptId`
und `sessionStateAfter`. Der Client erzeugt die Retry-ID einmal pro Antwort
und verwendet bei Wiederholungen dieselbe ID und denselben Payload.
Ein eindeutiger MongoDB-Index über Session, Student und Retry-ID verhindert
doppelte Lernereignisse auch bei parallelen Requests. Identische Wiederholungen
liefern den ursprünglichen Attempt (HTTP 201); abweichende Payloads mit
derselben ID liefern HTTP 409. Der authentifizierte Besitzer wird vor jedem
Zugriff geprüft. Alte Attempts ohne Retry-ID bleiben lesbar und anlegbar.

`sessionStateAfter` ist der nach der Antwort berechnete vollständige
Session-Ersatz: `courseId`, `startedAt`, `updatedAt`, `completedAt`,
`competencies`, `recentQuestionIds`, `excludedQuestionIds`,
`currentCompetencyId`, `questionsInCurrentCompetency`. Er enthält weder
Identität, Student, History noch Algorithmuskonfiguration. Scores müssen
endlich und in [0, 1], Antwortdauer nicht-negativ sein; Zeitstempel,
Kompetenzzustände und Zähler werden ebenfalls validiert.

Wenn der Attempt-POST gelingt, aber das anschließende Session-PUT scheitert,
rekonstruiert das Frontend beim Laden den adaptiven Zustand aus dem neuesten
Attempt-Snapshot mit neuerem `updatedAt`. Es kombiniert alle zeitlich sortierten
Attempts zur History und behält die serverseitige Algorithmuskonfiguration.
Bei gleichem Zeitstempel werden Snapshots für noch offene Sessions verwendet;
ein unvollständiger Snapshot öffnet keine bereits abgeschlossene Session erneut.
Ohne Snapshot wird nur die History rekonstruiert. Das ist **Recovery im Client,
keine serverseitige Transaktion**; rohe Session-GETs können bis zum nächsten
erfolgreichen PUT noch den vorherigen Zustand liefern. Der Prototyp vertraut
weiterhin der clientseitigen Bewertung und Zustandsberechnung; diese Daten
sind keine manipulationssicheren Prüfungsnoten.

Optionales `predictionBefore` speichert die vor der Antwort ermittelte
Antwortwahrscheinlichkeit (endlich, [0, 1]) für spätere Kalibrierungsauswertungen.

Das Algorithm-Lab verwendet ausschließlich den isolierten Browser-Schlüssel
`fbs-qcm.algorithm-lab.v1`. Beschädigte lokale Daten werden ausdrücklich als
Fehler gemeldet und niemals stillschweigend zurückgesetzt.

Beim Start kopiert die Kompatibilitätsmigration alte `learningAttempt`-Daten
nicht-destruktiv nach `questionAttempt`. Die Quellcollection bleibt erhalten,
bei gleicher `_id` bleibt der bereits vorhandene Zielinhalt erhalten.
Eine Warnung fordert zur manuellen Prüfung (insbesondere von Konflikten) vor
einer etwaigen manuellen Bereinigung auf. Es wird keine Quellcollection gelöscht.

## Validierung von Fragen und Kompetenzreferenzen

Beim Anlegen und Ändern müssen die in `competencyIds`, `competencyLinks`,
`parentId` und `prerequisites` referenzierten Kompetenzen existieren;
ungültige Referenzen werden mit HTTP 400 abgelehnt. Teil-Updates einer Frage
validieren den zusammengeführten Zustand aus gespeicherter Frage und Update.
Das gilt insbesondere für `Matching`/`matching`, auch wenn `questionType`
im Update fehlt.

Das Löschen einer Kompetenz liefert HTTP 409, solange Fragen (einschließlich
Q-Matrix-Links), Unterkompetenzen oder Voraussetzungen sie referenzieren.
Kompetenzen ohne Fragen sind weiterhin erlaubt; unreferenzierte Kompetenzen
können gelöscht werden. Die Prüfungen ersetzen keine Transaktionen bei
gleichzeitigen Schreibzugriffen.

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
npm ci
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

Für eine neue Vorführdatenbank `MONGODB_DB_NAME` in `.env` beispielsweise auf
`QCM_v2_demo` setzen. Backend und Seed müssen dieselbe Datenbank verwenden.
Bestehende `.env`-Dateien nicht einfach mit der Vorlage überschreiben.

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

Das befüllt eine **leere** Datenbank mit den im Repository vorhandenen
Frontend-Dummy-Daten. Die importierten Anzahlen stehen im Abschlussprotokoll.
Enthält irgendeine Collection bereits Dokumente, bricht der Seed vor dem
Import ausdrücklich ab; er löscht keine vorhandenen Fragen, Kompetenzen oder
Lernverläufe. Für eine neue Vorführung eine neue leere Datenbank wählen.
Bei Fehlern während des Imports bleibt der teilweise importierte Stand bestehen.
Der Seed ist keine Transaktion und keine Reset-Funktion; währenddessen darf
niemand in diese neue Datenbank schreiben.

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

## Lokale Sicherheitsgrenze

Die API bindet standardmäßig an `127.0.0.1` (`HOST` in `.env`).
MongoDB und Mongo Express sind im Compose-Setup ebenfalls nur lokal
freigegeben. Das ist eine Einschränkung der Erreichbarkeit, **kein Ersatz für
Authentifizierung und Autorisierung**. `HOST=0.0.0.0` beziehungsweise ein
abweichendes Frontend-`VITE_HOST` öffnet diese Grenze ausdrücklich wieder
und ist nicht als sichere Produktionskonfiguration zu verstehen.

Die Demo nur lokal mit synthetischen Daten betreiben. Entwickler-Token und
Default-Secret, fehlende durchgängige Rollen-/Kursberechtigungen und
clientseitige Bewertungen sind weiterhin Grenzen des Prototyps.

## Automatisierte Abnahme

```powershell
$env:MONGOMS_IP = '127.0.0.1'
npm test
npm run build
npx tsc --noEmit -p tsconfig.seed.json
```

Die Tests nutzen isolierte MongoMemoryServer-Datenbanken. Die Seed-Sicherheit
wird ebenfalls dort geprüft; dabei wird die konfigurierte Demo-Datenbank nicht
zurückgesetzt. Windows kann einen von MongoMemoryServer ausgewählten Port
blockieren (`EACCES`); das ist ein Umgebungsfehler, kein bestandenes Testergebnis.
Eine erfolgreiche erneute Ausführung muss weiterhin alle Tests bestehen.

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
