# web

QCM-Prototyp für die lokale Demonstration adaptiver, kompetenzbasierter Lernsessions.

## Naming conventions

- `Study` bezeichnet den produktiven Lernbereich. In der deutschen UI werden
  dafür „Lernen“ und „Lernsitzung“ verwendet.
- `StudySession` bezeichnet eine konkrete adaptive Lernsitzung.
- `Competency` ist der einzige Begriff für Kompetenzen.
- `Question` bezeichnet eine Aufgabe, `QuestionAttempt` einen gespeicherten
  Antwortversuch.
- `AlgorithmLab` ist ausschließlich für experimentelle und diagnostische
  Oberflächen vorgesehen.
- Gemeinsam von Study und Algorithm Lab verwendete Komponenten tragen keinen
  Feature-Prefix, zum Beispiel `QuestionInteraction`.
- Route-Komponenten enden mit `View`, Dialoge beginnen mit `Dialog`.
- Dateinamen für Services und Stores verwenden den jeweiligen Domänenbegriff,
  zum Beispiel `studySession.service.ts` und `studySessionStore.ts`.

## Konfiguration des Lernalgorithmus

- Kursbezogene Einstellungen werden unter `/courses/:courseId/settings`
  bearbeitet.
- In der Datenbank werden nur Abweichungen von den Anwendungsdefaults
  gespeichert. Modellparameter und Auswahlgewichte sind keine regulären
  Dozenteneinstellungen.
- Jede neue `StudySession` erhält serverseitig einen unveränderlichen Snapshot
  der effektiven Konfiguration und ihrer Kurskonfigurationsrevision. Änderungen
  an einem Kurs wirken daher nicht rückwirkend auf laufende Sitzungen.
- Der öffentliche, versionierte Vertrag liegt in
  `src/model/StudyAlgorithmConfig.ts`. Interne Änderungen am Algorithmus dürfen
  diesen Vertrag nicht beiläufig verändern.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
npm install
```

## Reproduzierbarer lokaler Demo-Start

Node.js 22.12 oder neuer innerhalb einer von Vitest unterstützten LTS-Version
verwenden. Auf einem frischen Checkout in beiden Projektordnern `npm ci`
ausführen; die Lockfiles enthalten die vorgesehenen Versionen.

1. MongoDB und Backend v2 gemäß [Startanleitung](../api/backend/v2/README.md)
   starten. Für neue Demo-Daten eine eigene **leere** Datenbank wählen, zum
   Beispiel `MONGODB_DB_NAME=QCM_v2_demo`, statt eine bestehende Lernhistorie
   zurückzusetzen.
2. In einem zweiten Terminal im Ordner `web`:

   ```powershell
   npm run dev
   ```

3. `http://localhost:8086/courses/1` öffnen. Frontend und Backend binden
   standardmäßig an die lokale Loopback-Adresse. Nach Updates der
   Vite-Abhängigkeiten einen bereits laufenden Dev-Server neu starten.

Die Datenbankinitialisierung ist kein Reset: `npm run seed` verweigert den Start,
wenn die gewählte Datenbank Dokumente enthält. Ein teilweise fehlgeschlagener
Seed erfordert eine neue leere Demo-Datenbank und Fehleranalyse; er läuft nicht
automatisch erneut über vorhandene Daten.

### Abnahme vor der Vorführung

```powershell
npm test
npm run type-check:tests
npm run lint
npm run build
npm run evaluate
```

Backend-Tests und Build separat in `api\backend\v2` ausführen:

```powershell
$env:MONGOMS_IP = '127.0.0.1'
npm test
npm run build
npx tsc --noEmit -p tsconfig.seed.json
```

Die Backend-Tests verwenden temporäre MongoDB-Instanzen, nicht die Demo-Datenbank.
Die Regressionstests decken Doppelklicks, fehlgeschlagene Attempt-/Session-
Requests, Fortsetzen, Aufgabenlimit, Abschluss ohne nächste Aufgabe sowie die
Bewertung von Choice, Lückentext und Matching ab.

Im Browser zusätzlich prüfen: Starten → eine Antwort absenden → pausieren →
fortsetzen → Seite neu laden → abschließen → zurück zum Kurs. Innerhalb der
Session muss „Meine Kurse“ verschwinden; nach einem Abschluss darf die Session
nicht als offen angeboten werden. Noch nicht abgeschickte Eingaben werden nicht
gespeichert. „Speicherfehler behandeln“ bedeutet: Fehler anzeigen, weitere
Antworten sperren und den gespeicherten Zustand neu laden, nicht blind erneut
absenden.

## Reproduzierbarer Auswahlvergleich

`npm run evaluate` führt 2.400 synthetische Lernverläufe mit jeweils bis zu
fünf aufeinanderfolgenden Sessions aus: zwei Aufgabenbestände,
vier festgelegte Lerner-Szenarien, 100 Seeds und drei Auswahlstrategien
(zufällige Auswahl als Vergleich sowie die beiden adaptiven Strategien). Dies
nutzt weder API noch Browser-Speicher und verändert keine Lernhistorie.

Der Bericht fasst Brier-Wert und Log-Loss für die Vorhersagen auf den jeweils
gestellten Aufgaben zusammen und stellt sie einer festen Ausgangsschätzung
gegenüber. Zusätzlich wird ausgewiesen, welcher Anteil der ausgewählten
Kompetenzen der simulierte Lernende zum Auswahlzeitpunkt noch nicht beherrschte.
Kompetenzzustände, Schätzungen, Bewertungszahlen und Zufallsquellen werden
zwischen den Sessions fortgeführt. Aufgaben dürfen in späteren Sessions erneut
vorkommen, innerhalb einer Session nicht. Nur sitzungsbezogene Historie,
Fokusphase und Ausschlüsse beginnen neu; historisches Replay und zeitlicher
Verfall werden nicht simuliert. Pro Session gilt weiterhin das Limit von
30 Aufgaben. Erfüllt der gesamte geeignete Bestand beim nächsten Start bereits
das Evidenzkriterium, endet der Lernverlauf. Das bedeutet nicht zwingend,
dass alle Kompetenzen beherrscht werden.

Die Auswertung enthält getrennte Zusammenfassungen und gepaarte Differenzen
pro Sitzungsnummer sowie Kompetenzzustände vor und nach jeder Session.
Spätere Sitzungswerte beziehen sich nur auf noch aktive Verläufe; Fallzahlen
stehen im Export. Der Endvergleich in der LaTeX-Ausgabe verwendet dagegen alle
Lernverläufe mit ihrem jeweils letzten Zustand. Die Genauigkeit des gesamten
Kompetenzprofils wird über alle geeigneten Kompetenzen bewertet, einschließlich
nicht ausgewählter Kompetenzen.

Die Kompetenzabdeckung bleibt eine beschreibende Zusatzgröße. Da die Verfahren
unterschiedliche Aufgaben auswählen und die Antworten synthetisch erzeugt
werden, ist der Vergleich kein Nachweis eines kausalen Effekts oder eines
Lernzuwachses.

Optional alle Konfigurationen, Kennzahlen und Antwortsequenzen als JSON
exportieren (Zielordner muss existieren; vorhandene Dateien werden nicht
überschrieben):

```powershell
$env:QCM_EVALUATION_OUTPUT = Join-Path $env:TEMP 'qcm-evaluation.json'
npm run evaluate
Remove-Item Env:\QCM_EVALUATION_OUTPUT
```

Optional erzeugt `QCM_EVALUATION_LATEX` beim gleichen Lauf direkt Tabellen und
PGFPlots-Diagramme für Kapitel 5, beispielsweise mit einem noch nicht existierenden
Ausgabepfad im temporären Verzeichnis. Vorhandene Dateien werden nicht überschrieben.
Die Neufassung liegt in [kapitel5.tex](./docs/kapitel5.tex), die berechneten
Tabellen und Diagramme in [kapitel5-ergebnisse.tex](./docs/kapitel5-ergebnisse.tex).
Für Overleaf beide Dateien übernehmen und den `\input`-Pfad an die Ordnerstruktur
der Arbeit anpassen; in der Präambel `pgfplots` mit Kompatibilitätsstand 1.18 laden.
Die Literaturverweise verwenden die bereits in der Arbeit vorhandenen BibTeX-Schlüssel.

Experimentaufbau, tatsächlich gemessene Ergebnisse und Einschränkungen stehen
in [der Algorithmus-Spezifikation](./docs/adaptive-algorithm-specification.md).
Die Simulation ersetzt keine Studie mit echten Lernenden.

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

### Regressionstests

```sh
npm test
npm run type-check:tests
```

Die Vitest-Suite prüft numerische BKT-Übergänge, feste Zufalls-Seeds,
historische Antwortklassifikation, Session-Abschluss ohne weitere Aufgabe,
Fortsetzen nach Kompetenzänderungen, Speicherfehler und die Trennung zwischen
Lernbereich und Algorithmus-Labor. Repository-Tests verwenden isolierte
Browser-/HTTP-Testdaten, keine Entwicklungsdatenbank.

Die Testwerkzeuge benötigen Node.js 20, 22 oder mindestens 24. `npm run lint`
prüft Quellcode und Tests ohne Änderungen; `npm run lint:fix` aktiviert
automatische Korrekturen.

## Demo-Grenzen und Datenhaltung

- Lernsession-Daten werden über Backend v2 gespeichert; hierfür muss die API
  separat gestartet werden. Siehe [v2-Startanleitung](../api/backend/v2/README.md).
- Der manuelle Test im Algorithmus-Labor speichert seine Verläufe ausschließlich
  in einem eigenen Browser-Speicher; sie sind vom normalen Lernverlauf getrennt.
  Die Simulation mit künstlichem Lernenden läuft nur in-memory und speichert
  weder Antworten noch Sessions.
- Der Kompetenzgraph arbeitet weiterhin lokal mit Demo-Daten. Änderungen dort
  sind nicht mit der API synchronisiert und nicht dauerhaft gespeichert.
- Die Entwickler-Authentifizierung ist kein Login-/Berechtigungssystem für
  echten Mehrbenutzerbetrieb. Die Demo nicht öffentlich mit realen Daten betreiben.
- Ein Session-Ende kann durch Aufgabenmangel oder Aufgabenlimit entstehen und
  bedeutet nicht automatisch, dass die Kompetenzen beherrscht werden.

Eine wissenschaftliche Änderung ist in
[der Algorithmus-Spezifikation](./docs/adaptive-algorithm-specification.md)
von einer technischen Stabilisierung zu unterscheiden. Historische
Abschwächung, Teilpunkte und Q-Matrix-Gewichte bleiben dokumentierte Heuristiken.
