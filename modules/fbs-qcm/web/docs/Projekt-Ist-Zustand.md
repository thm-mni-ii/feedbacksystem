---
title: "Projekt-Ist-Zustand – adaptive Lernplattform"
date: 2026-10-03
status: "Bestandsaufnahme"
tags:
  - bachelorarbeit
  - qcm
  - adaptive-learning
  - projekt-dokumentation
---

# Projekt-Ist-Zustand: Adaptive Lernplattform

> [!info] Zweck und Geltungsbereich
> Dieses Dokument beschreibt den im Repository vorhandenen technischen und
> fachlichen Stand der QCM-Lernplattform zum **3. Oktober 2026**. Es ist eine
> Bestandsaufnahme für Obsidian und keine abgeschlossene wissenschaftliche
> Evaluation. Aussagen über die Implementierung beziehen sich auf die unten
> verlinkten Quellcodedateien und ergänzenden Projektdokumente.

## Inhaltsverzeichnis

- [[#1. Kurzüberblick]]
- [[#2. Anwendungsumfang und Systemgrenzen]]
- [[#3. Technologie-Stack]]
- [[#4. Architektur und Datenfluss]]
- [[#5. Domänenmodell]]
- [[#6. Adaptiver Algorithmus]]
- [[#7. Bewertung und Feedback]]
- [[#8. Persistenz, Sessions und Wiederherstellung]]
- [[#9. Backend v2 und API]]
- [[#10. Oberfläche und Routen]]
- [[#11. Algorithmus-Labor und Evaluation]]
- [[#12. Konfiguration und Standardparameter]]
- [[#13. Aktuelle Grenzen und wissenschaftliche Einordnung]]
- [[#14. Projekt lokal ausführen und prüfen]]
- [[#15. Relevante Dateien]]
- [[#16. Quellen und Referenzen]]

## 1. Kurzüberblick

Das Repository enthält einen lauffähigen Prototyp einer kompetenzbasierten
Lernplattform. Lernende bearbeiten Aufgaben in einer Lernsitzung. Nach einer
Antwort berechnet das Frontend eine Bewertung, aktualisiert pro Kompetenz eine
Mastery-Schätzung und wählt anschließend die nächste Aufgabe aus. Der
produktive Lernbereich speichert Sessions und Antwortversuche über das neue
**Backend v2** in MongoDB.

Der zentrale adaptive Prototyp befindet sich in
[`web/src/composables/algorithm.ts`](../src/composables/algorithm.ts). Er
verwendet Bayes-Updates, die an Bayesian Knowledge Tracing (BKT) angelehnt
sind, kombiniert diese aber mit zusätzlichen, projektspezifischen
Entscheidungen: Teilpunkte, Kompetenz-Link-Gewichte, Q-Matrix-basierte
Itemauswahl, Gewichtung nach Evidenzbedarf, Aufgaben-Schwierigkeitsfilter,
historische Evidenz mit zeitlicher Abschwächung und konfigurierbare
Abschlussregeln.

Die Anwendung ist weiterhin ein **Prototyp bzw. eine lokale Demo** und keine
Produktionsplattform für echte Prüfungen oder Mehrbenutzerbetrieb. Lerninhalte
werden aus MongoDB geladen, aber die Demo-Bestände stammen aus Seed-Daten. Die
Authentifizierung ist eine Übergangslösung. Es liegen keine echten
Lernendendaten zugrunde, aus denen die Modellparameter geschätzt oder die
Lernwirkung empirisch belegt worden wäre.

## 2. Anwendungsumfang und Systemgrenzen

### 2.1 Im aktuellen Umfang

- Kompetenz- und Aufgabenverwaltung im Kurs- und globalen Aufgabenpool.
- Aufgaben mit Zuordnung zu einer oder mehreren Kompetenzen.
- Kursbezogene adaptive Lernsessions mit Pause, Fortsetzung und Ergebnisansicht.
- Automatische Bewertung von Choice-, Matrix-, Lückentext- und
  Zuordnungsaufgaben.
- Pro Kompetenz geführter Lernstand, Evidenzzähler und Unsicherheit.
- Speicherung der Session und einzelner Antwortversuche über Backend v2.
- Konfigurierbare Sessionlänge, Abschlusskriterien und Auswahlstrategie.
- Ein isoliertes Algorithmus-Labor für Simulationen und Experimente.
- Ein lokal arbeitender Kompetenzgraph, dessen Daten nicht mit der API
  synchronisiert werden.

### 2.2 Nicht im aktuellen Umfang

- Kein echtes Login- oder Rollen-/Rechtesystem für den Produktivbetrieb.
- Keine manipulationssichere Prüfungsbewertung: Bewertung und
  Zustandsberechnung erfolgen clientseitig.
- Keine empirische Studie mit echten Lernenden und kein Nachweis tatsächlicher
  Lernverbesserung.
- Keine automatische Schätzung oder Kalibrierung von BKT-Parametern anhand
  realer Antwortdaten.
- Keine echte kognitive Diagnose mit statistisch identifizierten
  Q-Matrix-/CDM-Parametern.
- Kein dauerhaft an die API angebundener Kompetenzgraph.
- Keine Garantie, dass ein Session-Abschluss bedeutet, dass eine Kompetenz
  beherrscht wird.

## 3. Technologie-Stack

| Schicht | Technologien / Komponenten | Rolle |
| --- | --- | --- |
| Frontend | Vue 3, TypeScript, Composition API | Single-Page-Anwendung und fachliche UI-Logik |
| UI | Vuetify 3, Material Design Icons | Komponenten, Layout und Styling |
| Clientzustand | Pinia | Sessionzustand, Inhalt, Fortschritt und Aktionen |
| Routing | Vue Router | Kurs-, Aufgabenpool-, Lern- und Lab-Routen |
| Build / Entwicklung | Vite, `vue-tsc`, ESLint, Prettier | Dev-Server, Build, Typprüfung und Linting |
| HTTP | Axios | Aufrufe der Backend-v2-API über `/api_v2` |
| Backend | Node.js, TypeScript, Express | REST-Endpunkte, Validierung und Geschäftsoperationen |
| Datenbank | MongoDB, offizieller `mongodb`-Treiber | Persistenz für v2-Domänenressourcen |
| Backend-Tests | Jest, Supertest, `mongodb-memory-server` | API- und Repositorytests mit isolierter Testdatenbank |
| Frontend-Tests | Vitest | Unit- und Integrationstests für Algorithmus, Store und Services |
| Algorithmus-Evaluation | Vitest-Skript, synthetische Lerner | Reproduzierbarer Vergleich von Auswahlstrategien |

Die wesentlichen Abhängigkeiten und Befehle stehen in
[`web/package.json`](../package.json) und
[`api/backend/v2/package.json`](../../api/backend/v2/package.json).

## 4. Architektur und Datenfluss

### 4.1 Überblick

```text
Vue Views / Components
        │
        ├── Pinia: studySessionStore
        │       ├── StudyContentService ── CompetencyService / QuestionService
        │       │                                 │
        │       ├── AdaptiveQuizAlgorithm          │ HTTP /api_v2
        │       └── StudyProgressRepository        │
        │                    │                     │
        │                    └── StudySessionService
        │                                  │
        └──────────────────────────────────┼───────────────┐
                                           ▼               ▼
                                  Express Backend v2    MongoDB
                                  competencies,         sessions,
                                  questions, config,     attempts,
                                  sessions, attempts     config
```

Das Frontend kapselt HTTP-Zugriffe in Services. Der Store koordiniert Laden,
Starten, Fortsetzen, Beantworten und Speichern. Die Auswahl- und
Lernstandslogik liegt in einem eigenständigen Algorithmusmodul und wird nicht
in Vue-Komponenten ausgeführt.

### 4.2 Ablauf einer normalen Lernsitzung

1. `StudySessionView` bzw. `StudyCourseView` nutzt den Study-Store.
2. Der Store lädt Kurskompetenzen und Aufgaben über `StudyContentService`.
3. Für einen Kurs werden die v2-Kurskonfiguration und ihre Revision geladen.
4. Eine vorhandene offene Session wird fortgesetzt; andernfalls wird eine neue
   Session angelegt und ihre Konfiguration als Snapshot gespeichert.
5. Der Algorithmus wählt eine Aufgabe samt Zielkompetenz.
6. `QuestionInteraction` rendert die Aufgabe und liefert Bewertung sowie
   Antwortpayload zurück.
7. Der Store berechnet den neuen Sessionzustand und legt einen
   `QuestionAttempt` an.
8. Das Frontend zeigt Feedback zur Antwort. Erst nach „Weiter“ wird die nächste
   Aufgabe freigegeben.
9. Beim Pausieren oder Abschließen bleibt die Session gespeichert und kann auf
   der Kursseite wieder aufgenommen bzw. angezeigt werden.

### 4.3 Datenzugriff und Trennung der Bereiche

- **Study-Lernbereich:** Aufgaben und Kompetenzen kommen aus Backend v2;
  StudySessions und Attempts werden dort gespeichert.
- **Algorithmus-Labor:** eigener Pinia-Store und eigener Browser-
  `localStorage`-Schlüssel; keine produktiven Session-/Attempt-Endpunkte.
- **Kompetenzgraph:** lokal arbeitende Demo-/Mockdaten; keine API-Synchronisation.
- **Ältere API-/Catalog-Strukturen:** im Repository noch vorhanden, aber nicht
  als Grundlage für neue v2-Funktionen zu verstehen.

## 5. Domänenmodell

Die v2-nahen Frontendtypen befinden sich in
[`web/src/model/types.ts`](../src/model/types.ts).

### 5.1 Kompetenz (`Competency`)

Eine Kompetenz ist eine fachlich abgegrenzte Fähigkeit und hat unter anderem:

- eine ID, einen Namen und optional eine Beschreibung;
- optionale Kurszuordnungen;
- `parentId` zur hierarchischen Gruppierung;
- `prerequisites` mit Kompetenz-ID und minimalem Mastery-Wert.

Die Hierarchie dient der Taxonomie bzw. Darstellung. Sie erzeugt **keine**
automatische Lernreihenfolge. Lernvoraussetzungen werden getrennt in
`prerequisites` gespeichert und vom Auswahlalgorithmus geprüft.

### 5.2 Aufgabe (`Question`)

Eine Aufgabe gehört zu einem Fragetyp und einer ausführbaren Konfiguration.
Zusätzlich enthält sie Schwierigkeit und Verknüpfungen zu Kompetenzen:

- `competencyLinks` bildet die differenziertere Q-Matrix ab;
- `relation` kann `required` oder `supporting` sein;
- `weight` beeinflusst den Einfluss des Antwortversuchs;
- `excludeFromAlgorithm` kann eine Aufgabe aus der adaptiven Auswahl
  ausschließen.

Wenn `competencyLinks` fehlen, normalisiert
[`qMatrix.ts`](../src/composables/qMatrix.ts) die älteren `competencyIds` als
Links mit Gewicht 1 und Relation `required`.

### 5.3 Session (`StudySession`)

Eine Session hält:

- Lernenden- und Kursbezug;
- unveränderliche Algorithmuskonfiguration und Kurskonfigurationsrevision;
- Start-, Änderungs- und optionalen Abschlusszeitpunkt;
- Kompetenzzustände (Mastery-Schätzung, Beobachtungszahl, letzte Bewertung);
- Antwortverlauf;
- kürzlich gestellte und explizit ausgeschlossene Aufgaben;
- aktuelle Zielkompetenz und Zähler für Stickiness.

### 5.4 Antwortversuch (`QuestionAttempt`)

Ein Attempt ist ein einzelnes gespeichertes Lernereignis. Er enthält Bewertung
und Quelle, Aufgabe, Session, Zielkompetenz, Antwortpayload, Zeitstempel,
Antwortdauer, optional Vorhersage vor der Antwort sowie optional einen
Zustandssnapshot nach der Antwort. Im Backend ist das Modell als append-only
Event ausgelegt: Attempts werden angelegt und gelesen, nicht nachträglich
überschrieben.

## 6. Adaptiver Algorithmus

### 6.1 Grundidee und Einordnung

Für jede Kompetenz \(k\) wird ein Wert \(p_k \in [0,1]\) geführt. Er ist die
modellinterne Schätzung, dass die Kompetenz beherrscht wird. Der Wert ist
weder eine direkt gemessene Fähigkeit noch ohne Kalibrierung eine empirisch
belegte Wahrscheinlichkeit.

Der Ansatz verwendet den Bayes-Posterior aus BKT. Die Implementierung
unterscheidet sich jedoch vom klassischen binären Grundmodell: Sie unterstützt
kontinuierliche Scores und Q-Matrix-Gewichte, fügt nach jedem Versuch einen
Lernübergang hinzu und wählt Items mit projektspezifischen Heuristiken aus.
Deshalb ist die angemessene Beschreibung **„BKT-inspirierter adaptiver
Prototyp“**, nicht „unverändertes Standard-BKT“.

### 6.2 Startzustand und Konfigurations-Snapshot

Bei einer neuen Session erhalten Kompetenzen zunächst
`initialMastery = 0.35`, `timesAssessed = 0` und `lastAssessedAt = null`.
Die Session speichert außerdem die effektive Konfiguration und die Revision
der Kurskonfiguration, mit der sie erstellt wurde. Änderungen an den
Kurseinstellungen wirken damit nicht rückwirkend auf diesen gespeicherten
Snapshot.

### 6.3 Historische Antwortversuche

Beim Start einer neuen Session lädt der Store die bisherigen Attempts des
Lernenden. Verwendet werden nur Versuche, deren Aufgaben-ID in den aktuell
geladenen Lerninhalten gefunden wird. Für jeden verwendeten Versuch berechnet
der Store den Altersfaktor:

$$
r = 2^{-d/30}
$$

wobei \(d\) das Alter des Attempts in Tagen ist. 30 Tage sind eine
Implementierungsannahme: In diesem Abstand halbiert sich die Abweichung der
Antwortwirkung von einem neutralen Score von 0.5.

Der historische Score wird über dieselbe Antwortlogik wie eine neue Antwort
verarbeitet. Die Zuverlässigkeit \(r\) zieht ihn zunächst in Richtung 0.5:

$$
s_{\text{historisch}} = 0.5 + (s_{\text{Modell}} - 0.5)\cdot r
$$

Danach werden BKT-Update, Q-Matrix-Einfluss und Lernübergang angewendet. Die
historischen Versuche erhöhen auch `timesAssessed`. Das Abschwächen verändert
daher die Stärke der Evidenz, entfernt den Versuch aber nicht vollständig.
Die Zeitabschächung ist eine eigene Modellentscheidung und kein Standardteil
des hier verwendeten BKT-Updates.

### 6.4 Antwortscore auf das Modell abbilden

Das Bewertungsinterface liefert einen Score im Intervall \([0,1]\). Standardmäßig
wird dieser Score direkt in die Modellaktualisierung übernommen. Wird
`responseScoreThreshold` gesetzt, wird er binarisiert:

$$
s_{\text{Modell}} =
\begin{cases}
1 & s \geq \text{responseScoreThreshold}\\
0 & s < \text{responseScoreThreshold}
\end{cases}
$$

Die `expected-information-gain`-Konfiguration verlangt einen Schwellenwert und
Items mit genau einer erforderlichen Kompetenz, weil die in der Auswahl
verwendete erwartete Antwortwahrscheinlichkeit auf einem binären
Ein-Kompetenz-Fall beruht.

### 6.5 Bayes-Update pro verknüpfter Kompetenz

Für eine binäre richtige Antwort verwendet der Code den Posterior:

$$
P(K\mid R) =
\frac{p(1-S)}
     {p(1-S)+(1-p)G}
$$

Für eine falsche Antwort:

$$
P(K\mid F) =
\frac{pS}
     {pS+(1-p)(1-G)}
$$

Dabei steht \(p\) für den bisherigen Mastery-Wert, \(G\) für die
Ratewahrscheinlichkeit (`guessRate`) und \(S\) für die
Flüchtigkeitsfehlerwahrscheinlichkeit (`slipRate`).

Bei Teilpunkten \(s\) interpoliert die Implementierung zwischen beiden
Posteriors:

$$
p_{\text{Posterior}} =
s\cdot P(K\mid R) + (1-s)\cdot P(K\mid F)
$$

Das ist eine projektspezifische Erweiterung der binären Beobachtung: Sie
interpretiert einen Teilscore als Mischung aus „richtig“ und „falsch“, nicht
als eigens statistisch modellierte Antwortkategorie.

### 6.6 Kompetenz-Linkgewicht und Lernübergang

Der Posterior wird mit einem Einflussfaktor \(w\) an den bisherigen Stand
angenähert. Für `supporting`-Links gilt zusätzlich ein Faktor von 0.7; ein
explizites Gewicht von 0 überspringt die Aktualisierung:

$$
w = \min(1.2,\max(0.2,\text{Linkgewicht}\cdot\text{Relationsfaktor}))
$$

$$
p_{\text{vor Lernen}} = p + w(p_{\text{Posterior}}-p)
$$

Danach wird unabhängig vom Score der implementierte Lernübergang ausgeführt:

$$
p_{\text{neu}} = p_{\text{vor Lernen}} +
(1-p_{\text{vor Lernen}})\cdot L
$$

mit `learnRate` \(L=0.18\) in der Standardkonfiguration. Das bedeutet, dass
auch nach einer falschen Antwort noch ein Lernübergang nach oben erfolgt.
Das ist eine Annahme des Prototyps, keine aus den Projektantworten gelernte
Rate.

Alle verknüpften Kompetenzen mit gültigem Zustand und positivem Linkgewicht
werden aktualisiert. Es wird damit nicht nur der als Ziel ausgewählte
Kompetenzzustand beeinflusst.

### 6.7 Auswahl der nächsten Kompetenz

Die Auswahl ist eine Abfolge von Kandidatenbildung und Strategieauswahl:

1. Optional auf Items mit genau einem `required`-Link einschränken.
2. Aufgaben ausschließen, die global deaktiviert oder in dieser Session
   ausgeschlossen wurden.
3. Nur Kompetenzen berücksichtigen, zu denen noch verfügbare Aufgaben
   existieren.
4. Nicht abgeschlossene Kompetenzen bevorzugen.
5. Kompetenzen mit unbeantworteten Aufgaben in der Session bevorzugen, wenn
   solche Kandidaten vorhanden sind.
6. Die aktuelle Kompetenz für bis zu drei aufeinanderfolgende Aufgaben
   beibehalten, sofern sie noch gültig und nicht abgeschlossen ist.
7. Erfüllte Voraussetzungen bevorzugen. Wenn keine Kandidaten alle
   Voraussetzungen erfüllen, fällt die Auswahl auf den Kandidatenpool zurück.
8. Mit einer von zwei konfigurierten Strategien auswählen.

#### Standard: `coverage-weighted`

Die Standardstrategie wählt gewichtet nach Evidenzmangel und niedrigem
Mastery-Wert:

$$
W_k = \frac{1}{n_k+1}\cdot(1-p_k)
$$

Dabei ist \(n_k\) die Anzahl der bisherigen Beobachtungen. Wenig geprüfte und
niedrig eingeschätzte Kompetenzen erhalten mehr Gewicht. Es ist eine
gewichtete Zufallsauswahl, keine deterministische Sortierung.

#### Experimentell: `expected-information-gain`

Diese Option berechnet je Kompetenz den erwarteten Informationsgewinn als
Differenz zwischen aktueller binärer Entropie und dem erwarteten Posterior nach
richtiger bzw. falscher Antwort. Gewählt wird der Kandidat mit dem größten
Informationsgewinn. Bei Gleichstand entscheiden weniger Versuche und danach
die ID. Diese Strategie ist nur mit einem binären Score-Schwellenwert und
Ein-Kompetenz-Items zulässig.

### 6.8 Auswahl der konkreten Aufgabe

Nach der Zielkompetenz filtert der Algorithmus deren verfügbare Aufgaben:

1. Unbeantwortete Aufgaben werden bevorzugt.
2. Aufgaben innerhalb des `difficultyWindow` (Standard: 0.2) um den Mastery-
   Wert werden bevorzugt.
3. Gibt es keine Aufgabe in diesem Fenster, werden Aufgaben nach Nähe zur
   Mastery-Schätzung sortiert; die nächstgelegenen bleiben im Kandidatenpool.
4. Die letzten fünf Aufgaben werden nach Möglichkeit vermieden
   (`recentQuestionWindow = 5`).
5. Dieselbe Aufgabe wird nicht direkt zweimal hintereinander gestellt. Ist
   aufgrund eines Mini-Pools keine andere Aufgabe möglich, wird
   kompetenzübergreifend ausgewichen. Gibt es global nur die unmittelbar zuvor
   gestellte Aufgabe, liefert die Auswahl keine nächste Aufgabe.
6. Unter verbleibenden Kandidaten erfolgt eine gewichtete Zufallsauswahl
   anhand einer Q-Matrix-Utility.

Die Item-Utility aggregiert über die Kompetenzlinks:

$$
U(q) =
\frac{\sum_k \alpha_k
  \left(0.5H(p_k)+0.3\frac{1}{n_k+1}
  +0.2\max(0,1-|D_q-p_k|)\right)}
{\sum_k \alpha_k}
+ B_q
$$

Hier ist \(H\) die normierte binäre Entropie, \(D_q\) die manuell gepflegte
Aufgabenschwierigkeit und \(\alpha_k\) das Linkgewicht mit dem
`supporting`-Faktor 0.7. \(B_q\) ist der kleine Bonus (Standard 0.1), wenn die
Aufgabe die ausgewählte Zielkompetenz prüft. Die Gewichte und die
Schwierigkeitsnähe sind Auswahlheuristiken; sie stammen nicht aus einer
Itemkalibrierung.

### 6.9 Unsicherheit und Abschluss

Die Unsicherheit wird als normierte binäre Entropie berechnet:

$$
H(p) =
\frac{-p\ln(p)-(1-p)\ln(1-p)}{\ln(2)}
$$

Sie ist maximal bei \(p=0.5\) und nahe 0, wenn \(p\) nahe an 0 oder 1 liegt.
Eine Kompetenz zählt nach den Standardwerten als ausreichend diagnostisch
abgeschlossen, wenn beide Bedingungen erfüllt sind:

- `timesAssessed >= 2`;
- `uncertainty <= 0.7`.

Die Schwelle ist symmetrisch: Ein sicher niedriger Lernstand kann die
Abschlussbedingung ebenfalls erfüllen. „Abgeschlossen“ bedeutet hier
ausreichende Evidenz nach den konfigurierten Regeln, **nicht** „beherrscht“.

Eine Session kann außerdem enden, wenn 30 Aufgaben erreicht sind oder der
Algorithmus keine weitere geeignete Aufgabe liefern kann. Der Store speichert
auch das Ende aufgrund fehlender Aufgaben. Die Ergebnisansicht unterscheidet
diese Situation von ausreichender Evidenz.

### 6.10 Ablauf als Pseudocode

```text
Session starten oder fortsetzen
  lade Kompetenzen, Aufgaben und effektive Kurskonfiguration
  initialisiere Kompetenzzustände mit initialMastery
  spiele verfügbare historische Attempts mit Altersfaktor ein

solange Session offen ist
  wenn Aufgabenlimit erreicht: beenden
  bilde gültige Aufgaben und relevante Kompetenzen
  wenn alle relevanten Kompetenzen genug Evidenz und geringe Unsicherheit haben:
    beenden
  wähle Zielkompetenz:
    offene Evidenz bevorzugen
    Stickiness und Voraussetzungen anwenden
    coverage-weighted oder expected-information-gain ausführen
  wähle Aufgabe:
    unbeantwortete + passende Schwierigkeit bevorzugen
    kürzliche und direkte Wiederholung vermeiden
    Q-Matrix-Utility gewichtet auslosen
  rendere Aufgabe
  bewerte Antwort als Score 0..1
  aktualisiere alle relevanten Kompetenzzustände per BKT-Posterior,
    Linkgewicht und Lernübergang
  speichere Attempt und Sessionzustand
  zeige Feedback und gehe nach Bestätigung weiter
```

## 7. Bewertung und Feedback

Die automatischen Bewertungsfunktionen liegen in
[`answerScoring.ts`](../src/composables/answerScoring.ts). Sie liefern Scores
zwischen 0 und 1:

| Aufgabentyp | Implementierte Bewertung |
| --- | --- |
| Single Choice | 1 bei Auswahl einer als korrekt markierten Option, sonst 0 |
| Multiple Choice | Anteil korrekt behandelter Optionszeilen; Auswahl und Nichtauswahl werden berücksichtigt |
| Matrix | Anteil der Zeilen, deren ausgewählte Spalten exakt der erwarteten Menge entsprechen |
| Lückentext | Durchschnitt der Ähnlichkeit zu akzeptierten Lösungen (Levenshtein-basierte Similarity) |
| Matching | Anteil korrekt zugeordneter Elemente |

Für Choice-Optionen verwendet die UI stabile IDs. In der aktuellen
`QuestionInteraction`-Komponente wird die reine Anzeige-Reihenfolge beim
Darstellen der Aufgabe zufällig gemischt. Das verändert weder gespeicherte
Fragekonfiguration noch ID-basierte Bewertung.

Das Feedback zeigt Korrektheit bzw. Teilscore und die Lösung. Die
Feedback-Erzeugung befindet sich in
[`answerFeedback.ts`](../src/composables/answerFeedback.ts), die Anzeige in
[`StudyAnswerFeedback.vue`](../src/components/StudyAnswerFeedback.vue). Das
Feedback selbst verändert den Score des Attempts nicht; die nächste Aufgabe
wird erst nach Fortsetzen der Anzeige freigegeben.

## 8. Persistenz, Sessions und Wiederherstellung

### 8.1 Study-Bereich

Der aktive Adapter ist `HttpStudyProgressRepository` in
[`studyProgress.repository.ts`](../src/services/studyProgress.repository.ts).
Er verwendet `StudySessionService` und speichert:

- Sessionzustände als vollständigen Ersatz;
- Attempts separat als einzelne Events;
- Attempt-IDs des Clients als Retry-ID;
- Antwortpayload, Score, Zeit, Antwortdauer und Vorhersage vor der Antwort.

Der Server kann bei Sessionanlage IDs vergeben. Der Client übernimmt die
zurückgegebenen Datensätze. Eine Wiederholung eines identischen Attempt-POSTs
mit derselben Retry-ID soll kein zweites Lernereignis erzeugen. Abweichende
Payloads mit derselben Retry-ID werden laut Backend-Vertrag abgelehnt.

### 8.2 Fehlerbehandlung und Recovery

Der Store speichert zuerst den Attempt und anschließend den neuen
Sessionzustand. Scheitert ein Teil dieses Ablaufs, sperrt der Store weitere
Antworten, bis die gespeicherte Session erneut geladen wurde. Attempts können
einen Zustandssnapshot nach der Antwort enthalten. Beim Laden werden Attempts
sortiert und der neueste passende Snapshot kann zur Wiederherstellung eines
fortgeschritteneren Sessionzustands verwendet werden.

Diese Recovery ist **keine Datenbanktransaktion**: Wenn Attempt-Speicherung
gelingt, aber das Session-Update fehlschlägt, können rohe Sessiondaten im
Backend bis zur Wiederherstellung einen älteren Zustand enthalten. Der Client
rekonstruiert beim Laden den adaptive Zustand anhand der gespeicherten
Attempts/Snapshots.

### 8.3 Pause, Fortsetzung und Neustart

- Noch nicht abgeschickte Antworten werden nicht gespeichert.
- Pausieren speichert die aktuelle Session und gibt den Store frei.
- Beim Fortsetzen werden Kursinhalte geladen und die nächste Aufgabe anhand
  des gespeicherten Zustands ausgewählt.
- Neu hinzugekommene Kompetenzen können beim Fortsetzen mit Initialzuständen
  ergänzt werden; gespeicherte Kompetenzzustände bleiben erhalten.
- Ein bestätigter Neustart markiert bestehende offene Sessions des Kurses als
  abgeschlossen und legt eine neue an. Die Attempts bleiben erhalten.
- Bei Kursstarts wird eine offene passende Session bevorzugt fortgesetzt.

### 8.4 Algorithmus-Labor

Das Lab speichert Daten getrennt im Browser unter
`fbs-qcm.algorithm-lab.v1`. Es verwendet denselben Algorithmuscode, jedoch eine
eigene Store-Instanz und eine eigene Identität. Lab-Verläufe gehen nicht in
produktive Study-Session- oder Attempt-Endpunkte ein.

## 9. Backend v2 und API

Das neue Backend liegt unter `api/backend/v2` und ist vom älteren Backend
getrennt. Es verwendet Express, MongoDB, JWT-Middleware und die
`/api_v2`-Routebasis. Die wesentlichen Routen werden in
[`app.ts`](../../api/backend/v2/src/app.ts) registriert.

| Ressource | Im Backend vorhandene Operationen |
| --- | --- |
| Questions | `GET/POST /api_v2/questions`, `GET/PUT/DELETE /api_v2/questions/:id` |
| Competencies | `GET/POST /api_v2/competencies`, `GET/PUT/DELETE /api_v2/competencies/:id` |
| StudySessions | `GET/POST /api_v2/sessions`, `GET/PUT /api_v2/sessions/:id` |
| QuestionAttempts | `GET/POST /api_v2/sessions/:id/attempts` |
| Kurskonfiguration | `GET/PUT/DELETE /api_v2/courses/:courseId/study-configuration` |

Die API validiert Daten und Referenzen zwischen Aufgaben und Kompetenzen.
Kurskonfigurationen speichern Overrides relativ zu den Anwendungsdefaults,
verwenden Revisionsnummern gegen veraltete Änderungen und werden als Snapshot
an eine neu gestartete Session gebunden. Die Projekt-README beschreibt
zusätzlich Seed-Verhalten, lokale Einrichtung, Migration und Recovery-Details:
[`api/backend/v2/README.md`](../../api/backend/v2/README.md).

> [!warning] Authentifizierung ist nicht produktionsreif
> Der v2-Zugriff ist per JWT-Middleware geschützt, aber das Frontend verwendet
> aktuell eine fest eingebaute Entwickleridentität bzw. einen
> Übergangstoken. Es gibt noch kein echtes Login-/Autorisierungssystem für
> Mehrbenutzerbetrieb. Die Demo darf daher nicht öffentlich mit realen
> Lernenden- oder Prüfungsdaten betrieben werden.

## 10. Oberfläche und Routen

| Route | Bereich | Zweck |
| --- | --- | --- |
| `/` | Home | Einstieg |
| `/pool` | globaler Aufgabenpool | Aufgaben verwalten |
| `/lab` | AlgorithmLab | Dozent:innen-Testmodus |
| `/courses/:courseId` | Kurs | Kursübersicht und Lernstart |
| `/courses/:courseId/competencies` | Kompetenzansicht | Kompetenzgraph |
| `/courses/:courseId/questions` | Kursverwaltung | Aufgaben eines Kurses verwalten |
| `/courses/:courseId/settings` | Kurseinstellungen | Abschluss-/Sessionparameter |
| `/courses/:courseId/session/:sessionId` | Lernsitzung | Aufgabe, Feedback, Fortschritt und Ergebnis |

Die Routen sind in
[`web/src/router/index.ts`](../src/router/index.ts) definiert. Admin-Werkzeuge
werden zusätzlich über einen Frontend-Router-Guard eingeschränkt; das ersetzt
keine serverseitige Berechtigungsprüfung.

## 11. Algorithmus-Labor und Evaluation

### 11.1 Reproduzierbarer Zufall

Der Algorithmus akzeptiert eine injizierbare Zufallsquelle. Für Tests und
Simulationen existiert `createSeededRandom(seed)`. Die Produktionsauswahl
verwendet standardmäßig `Math.random`. Die Seed-Funktion ist ausschließlich
für Reproduzierbarkeit und nicht kryptografische Sicherheit vorgesehen.

### 11.2 Synthetischer Vergleich dokumentiert

Die bestehende Spezifikation beschreibt eine Simulation von 800 Sessions:
vier synthetische Lernszenarien, jeweils 100 Seeds und zwei
Kompetenzauswahlstrategien. Gemessen wurden Aufgabenanzahl,
Kompetenzabdeckung, Brier Score und Log-Loss. Die Ergebnisse zeigen in diesen
Szenarien höhere Kompetenzabdeckung für `expected-information-gain`, jedoch
keinen konsistenten Vorteil bei der Vorhersagequalität.

Diese Zahlen sind **keine** empirische Untersuchung mit echten Lernenden. Der
synthetische Lerner wird selbst nach einem BKT-ähnlichen Antwort-/Lernschema
erzeugt; beide Strategien laufen außerdem auf unterschiedlichen Antwortpfaden.
Die Simulation kann daher weder kausale Lernwirkung noch die Eignung für reale
Lernende belegen. Aufbau, Kennzahlen und Tabellen stehen in
[`adaptive-algorithm-specification.md`](./adaptive-algorithm-specification.md).

## 12. Konfiguration und Standardparameter

Die öffentliche Konfigurationsstruktur liegt in
[`StudyAlgorithmConfig.ts`](../src/model/StudyAlgorithmConfig.ts). Aktuelle
Anwendungsdefaults:

| Parameter | Standard | Bedeutung |
| --- | ---: | --- |
| `algorithmVersion` | `adaptive-bkt-v2` | Algorithmusversion in der Konfiguration |
| `maxQuestionsPerSession` | 30 | maximales Aufgabenlimit pro Session |
| `minEvidencePerCompetency` | 2 | Mindestbeobachtungen zum Kompetenzabschluss |
| `maxUncertainty` | 0.7 | maximal zulässige Entropie zum Kompetenzabschluss |
| `stickinessQuestions` | 3 | maximale Zahl aufeinanderfolgender Aufgaben derselben Kompetenz |
| `difficultyWindow` | 0.2 | bevorzugte Nähe der Itemschwierigkeit zum Mastery-Wert |
| `recentQuestionWindow` | 5 | Zahl kürzlich verwendeter Aufgaben, die vermieden werden |
| `competencyStrategy` | `coverage-weighted` | Kompetenz-Auswahlstrategie |
| `responseScoreThreshold` | `null` | kein Binarisieren des Scores im Standard |
| `singleRequiredItemsOnly` | `false` | Mehrkompetenz-Items nicht standardmäßig ausschließen |
| `initialMastery` | 0.35 | Mastery-Ausgangsschätzung |
| `learnRate` | 0.18 | Lernübergang nach jeder Antwort |
| `guessRate` | 0.20 | angenommene Ratewahrscheinlichkeit |
| `slipRate` | 0.10 | angenommene Flüchtigkeitsfehlerwahrscheinlichkeit |
| Utility `uncertainty` | 0.5 | Gewicht der Kompetenzunsicherheit für Itemauswahl |
| Utility `evidenceNeed` | 0.3 | Gewicht fehlender Beobachtungen |
| Utility `difficultyFit` | 0.2 | Gewicht der Schwierigkeitspassung |
| Utility `targetCompetencyBonus` | 0.1 | Bonus für die ausgewählte Zielkompetenz |

Zusätzlich sind für den Kompetenzabschluss die Presets `short`, `balanced` und
`thorough` definiert. Sie ändern Mindestbeobachtungen und maximale Unsicherheit
(1/0.85, 2/0.7 bzw. 3/0.55). Die Modellparameter und Utility-Gewichte sind
keine regulären Kurs-Overrides.

> [!important] Status der Zahlen
> Diese Werte sind derzeit gesetzte Modell- und Produktannahmen. Eine
> Dokumentation des Codes ist kein Nachweis, dass die Werte optimal,
> populationsgerecht oder empirisch kalibriert sind.

## 13. Aktuelle Grenzen und wissenschaftliche Einordnung

### 13.1 Modellgrenzen

- `learnRate > 0` lässt den Mastery-Wert nach jedem bewerteten Versuch steigen,
  selbst bei falscher Antwort. Wiederholte ausschließlich falsche Antworten
  können deshalb unter den Standardbedingungen oberhalb eines Mastery-Werts
  bleiben, der die Standard-Abschlussschwelle der Unsicherheit nicht erreicht.
  Solche Sessions enden dann gegebenenfalls am Aufgabenlimit.
- Die Abschlussregel misst hinreichend geringe Unsicherheit, nicht
  Beherrschung. Auch ein sicher niedriger Mastery-Wert erfüllt sie.
- Zwei Beobachtungen sind wenig Evidenz; korrektes Raten ist möglich.
- Die Teilscore-Interpolation ist keine voll spezifizierte
  Antwortwahrscheinlichkeitsverteilung.
- Q-Matrix-Gewichte, Supporting-Faktor, Difficulty Fit und
  Evidenzgewichtung sind Heuristiken und nicht aus realen Daten geschätzt.
- Die Aufgabenschwierigkeit wird manuell angegeben; sie ist keine
  psychometrische Itemparameter-Schätzung. Das ist kein IRT-/Rasch-Modell.
- Mehrkompetenzaufgaben beeinflussen mehrere Kompetenzzustände. Die
  gemeinsame Antwortwahrscheinlichkeit solcher Items ist nicht als
  statistisches Mehrdimensionalmodell validiert.
- Die Altersabschwächung historischer Antworten ist eine angenommene
  Halbwertszeit von 30 Tagen; Vergessen wird damit nicht aus Verlaufsdaten
  geschätzt.
- Voraussetzungskanten sind eine Auswahlheuristik. Wenn keine Kandidaten die
  Voraussetzungen erfüllen, wird auf alle Kandidaten zurückgefallen, damit
  die Session nicht blockiert.

### 13.2 Evaluation und Arbeitsschreibweise

Bei der wissenschaftlichen Ausarbeitung sollten insbesondere klar getrennt
werden:

1. BKT-Grundidee und wissenschaftliche Grundlagen;
2. projektspezifische Abweichungen bzw. Heuristiken;
3. technische Implementierung;
4. reproduzierbare synthetische Simulation;
5. empirische Evaluation mit realen Lernenden (derzeit nicht vorhanden).

Eine synthetische Kennzahl ist als Ergebnis des konkret beschriebenen
Simulationsaufbaus zu benennen, nicht als Beleg allgemeiner Lernwirksamkeit.
Modellannahmen und Parameter brauchen eine fachliche Begründung oder eine
ausdrückliche Kennzeichnung als zu prüfende Designannahme.

Die im Repository enthaltenen Hinweise zur Abschlussarbeit empfehlen unter
anderem, eine wissenschaftliche Arbeit nicht als Erfahrungsbericht zu
schreiben, verwandte Arbeiten von Grundlagen zu trennen und Methodik und
Ergebnisse nachvollziehbar darzustellen. Das sind Empfehlungen des
Dokuments, keine allgemeingültige Prüfungsordnung:
[`Hinweise_zur_Abschlussarbeit.pdf`](./Hinweise_zur_Abschlussarbeit.pdf).

## 14. Projekt lokal ausführen und prüfen

### 14.1 Voraussetzungen

- Node.js entsprechend den Angaben in der jeweiligen Projekt-README;
- Docker Desktop für den lokalen MongoDB-Dienst;
- Abhängigkeiten im Frontend und in `api/backend/v2`;
- lokale `.env`-Konfiguration für Backend v2.

### 14.2 Lokaler Demo-Start

Backend v2 im Verzeichnis `api/backend/v2` installieren und konfigurieren.
Für eine Demo wird eine **eigene leere Datenbank** verwendet:

```powershell
npm ci
Copy-Item .env.example .env
docker compose up -d
npm run seed
npm run dev
```

Danach im Verzeichnis `web`:

```powershell
npm ci
npm run dev
```

Der Vite-Dev-Server läuft standardmäßig unter `http://localhost:8086`; die
v2-API unter `http://localhost:3001`. Der Seed bricht ab, wenn die konfigurierte
Datenbank bereits Dokumente enthält; er ist kein Reset-Befehl. Details und
konkrete Startreihenfolge: [`web/README.md`](../README.md) sowie
[`api/backend/v2/README.md`](../../api/backend/v2/README.md).

### 14.3 Relevante Prüfungen

Im `web`-Verzeichnis:

```powershell
npm test
npm run type-check:tests
npm run lint
npm run build
npm run evaluate
```

Im `api/backend/v2`-Verzeichnis:

```powershell
npm test
npm run build
npx tsc --noEmit -p tsconfig.seed.json
```

Die bestehenden Frontendtests prüfen unter anderem BKT-Übergänge,
Antwortbewertung, Sessionabschluss, Wiederaufnahme, Persistenzfehler und
Algorithmusauswahl. Für eine Vorführung sollte zusätzlich der Ablauf Start →
Antwort → Pause → Fortsetzen → Reload → Abschluss manuell geprüft werden.

## 15. Relevante Dateien

### Frontend

| Datei | Zweck |
| --- | --- |
| [`algorithm.ts`](../src/composables/algorithm.ts) | Mastery-Update, Kompetenz-/Aufgabenauswahl, Abschlussstatus |
| [`StudyAlgorithmConfig.ts`](../src/model/StudyAlgorithmConfig.ts) | Standardwerte, Versionierung, Kurs-Overrides |
| [`types.ts`](../src/model/types.ts) | Study-Domänentypen |
| [`qMatrix.ts`](../src/composables/qMatrix.ts) | Normalisierung und Validierung der Kompetenzlinks |
| [`studySessionStore.ts`](../src/stores/studySessionStore.ts) | Start, Fortsetzen, Antworten und Sessionablauf |
| [`studyProgress.repository.ts`](../src/services/studyProgress.repository.ts) | HTTP- und Browser-Persistenzadapter |
| [`studySession.service.ts`](../src/services/studySession.service.ts) | HTTP-Zugriffe auf Sessions und Attempts |
| [`studyContent.service.ts`](../src/services/studyContent.service.ts) | Laden/Normalisieren von Study-Inhalten |
| [`answerScoring.ts`](../src/composables/answerScoring.ts) | automatische Score-Berechnung |
| [`answerFeedback.ts`](../src/composables/answerFeedback.ts) | Feedbackdaten nach Antwort |
| [`QuestionInteraction.vue`](../src/components/QuestionInteraction.vue) | Darstellung und Antworterfassung |
| [`adaptive-algorithm-specification.md`](./adaptive-algorithm-specification.md) | ausführliche Algorithmus- und Evaluationsspezifikation |

### Backend

| Datei | Zweck |
| --- | --- |
| [`app.ts`](../../api/backend/v2/src/app.ts) | Express-App und API-Router |
| [`index.ts`](../../api/backend/v2/src/index.ts) | DB-Verbindung, Indexe und Serverstart |
| [`session.routes.ts`](../../api/backend/v2/src/session/session.routes.ts) | Session- und Attempt-Endpunkte |
| [`questionAttempt.model.ts`](../../api/backend/v2/src/session/questionAttempt.model.ts) | Attempt-Datenmodell |
| [`studyConfiguration.routes.ts`](../../api/backend/v2/src/studyConfiguration/studyConfiguration.routes.ts) | Kurskonfiguration |
| [`README.md`](../../api/backend/v2/README.md) | Backend-Setup, Datenhaltung und API-Verhalten |

## 16. Quellen und Referenzen

### Primäre technische Quellen im Repository

- Implementierung des Lernalgorithmus:
  [`web/src/composables/algorithm.ts`](../src/composables/algorithm.ts)
- Modellannahmen und synthetische Evaluation:
  [`web/docs/adaptive-algorithm-specification.md`](./adaptive-algorithm-specification.md)
- Konfigurationsschema:
  [`web/src/model/StudyAlgorithmConfig.ts`](../src/model/StudyAlgorithmConfig.ts)
- Projekt-/Backend-Setup:
  [`web/README.md`](../README.md),
  [`api/backend/v2/README.md`](../../api/backend/v2/README.md)
- Hinweise zum Verfassen der Abschlussarbeit:
  [`web/docs/Hinweise_zur_Abschlussarbeit.pdf`](./Hinweise_zur_Abschlussarbeit.pdf)

### Wissenschaftliche Referenz zum Knowledge Tracing

Die Implementierung und Spezifikation führen folgende Arbeit als
Grundlagenreferenz für Knowledge Tracing. Der vorhandene Skill-BibTeX-Eintrag
verwendet 1994; in Teilen der Projektdokumentation steht 1995. Das Jahr sollte
vor Übernahme in die finale Literaturdatenbank anhand der verwendeten
Originalquelle bzw. des DOI-Datensatzes vereinheitlicht werden.

```bibtex
@article{corbett1994knowledge,
  title={Knowledge tracing: Modeling the acquisition of procedural knowledge},
  author={Corbett, Albert T and Anderson, John R},
  journal={User modeling and user-adapted interaction},
  volume={4},
  number={4},
  pages={253--278},
  year={1994},
  publisher={Springer}
}
```

Die Dokumentation ist eine technische Zustandsaufnahme. Wissenschaftliche
Behauptungen über die Wirksamkeit des Systems müssen in der Abschlussarbeit
durch passende Primärliteratur und/oder eine eigene Evaluation belegt werden.
