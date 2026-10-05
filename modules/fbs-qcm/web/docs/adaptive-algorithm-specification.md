# Adaptiver Lernalgorithmus – so funktioniert er

## In einem Satz

Das System führt für jede Kompetenz eine Zahl zwischen 0 und 1, die sagt, **wie wahrscheinlich die Person diese Kompetenz kann**. Nach jeder Antwort wird die Zahl angepasst, und die nächste Aufgabe kommt aus der Kompetenz, über die das System am wenigsten weiß oder bei der die Person am schwächsten ist.

## Der Ablauf in 5 Schritten

1. **Start:** Jede Kompetenz beginnt mit dem Wert `0.35` („wahrscheinlich noch nicht gekonnt“).
2. **Alte Antworten einrechnen:** Frühere Antworten der Person fließen ein. Je älter sie sind, desto weniger zählen sie.
3. **Kompetenz wählen:** Das System entscheidet, welche Kompetenz als Nächstes geübt wird.
4. **Aufgabe wählen:** Aus dieser Kompetenz wird eine Aufgabe gesucht, die von der Schwierigkeit zum aktuellen Stand passt.
5. **Antwort auswerten:** Richtig → Wert steigt. Falsch → Wert sinkt. Dann zurück zu Schritt 3, bis alle Kompetenzen „abgeschlossen“ sind oder 30 Aufgaben erreicht sind.

## Begriffe

### Sessions pausieren und fortsetzen

Auf der Kursseite hat eine offene Lernsession Vorrang vor einem Neustart:
„Session fortsetzen“ lädt den gespeicherten Zustand derselben Session.
Maßgeblich ist die zuletzt gestartete Session des Kurses (`startedAt`).
Ist sie abgeschlossen, werden ältere offene Sessions nicht erneut angeboten.
`updatedAt` bestimmt diese Auswahl nicht: Das spätere Speichern einer älteren
Session darf sie nicht zur aktuellen Session machen.
„Pausieren & zurück“ speichert den aktuellen Zustand, ohne die Session als
abgeschlossen zu markieren. Bereits abgeschickte Antworten bleiben erhalten;
nicht abgeschickte Eingaben werden nicht gespeichert. Beim Fortsetzen wird
die nächste Aufgabe aus dem gespeicherten Zustand ausgewählt.

Ein bestätigter Neustart beendet die bisherigen offenen Sessions des Kurses
über `completedAt`, bevor eine neue Session angelegt wird. Antworten werden
nicht gelöscht und fließen weiterhin in den Lernstand ein. Der reguläre
Frontend-Start setzt vorhandene offene Kurs-Sessions fort, statt weitere
anzulegen; dies ist keine serverseitige Sperre gegen parallele Starts aus
mehreren Browsern. Kursunabhängige Starts im Algorithmus-Labor bleiben unverändert.

Auch wenn die Aufgabenauswahl keine weitere Aufgabe liefern kann, wird die
Session dauerhaft beendet. Die Ergebnisansicht unterscheidet Aufgabenlimit,
ausreichende Diagnoseevidenz und fehlende geeignete Aufgaben. Ein Ende wegen
Aufgabenmangel ist kein Nachweis von Kompetenzbeherrschung.

Beim Fortsetzen erhalten neu hinzugefügte Kompetenzen den initialen Modellzustand.
Bestehende Zustände bleiben erhalten; entfernte Kompetenzen werden nicht mehr
für die Auswahl verwendet. Dies ist eine Kompatibilitätsregel für den Prototyp,
kein unveränderlicher Snapshot aller Aufgaben und Kompetenzen.

Das Algorithmus-Labor verwendet einen eigenen Store, eine eigene Identität und
einen getrennten Browser-Speicher (`fbs-qcm.algorithm-lab.v1`); produktive
Session-/Attempt-Endpunkte werden für Lab-Verläufe nicht genutzt.

| Begriff                                     | Bedeutung                                                                                                                                                                   |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Kompetenz**                               | Eine Fähigkeit, die geprüft wird, z. B. „SQL-Joins schreiben“.                                                                                                              |
| **Lernstand** (`masteryScore`, `p`)         | Die Zahl zwischen 0 und 1 pro Kompetenz. `0.9` heißt: Das System ist zu 90 % sicher, dass die Person es kann. Es ist eine **Schätzung**, keine Messung.                     |
| **BKT** (Bayesian Knowledge Tracing)        | Das bekannte Verfahren, nach dem der Lernstand aktualisiert wird (Corbett & Anderson, 1995). Unser Algorithmus ist daran **angelehnt**, aber nicht identisch (siehe unten). |
| **Raten** (`guessRate = 0.20`)              | Wahrscheinlichkeit, dass jemand die Aufgabe richtig hat, **obwohl** er es nicht kann.                                                                                       |
| **Flüchtigkeitsfehler** (`slipRate = 0.10`) | Wahrscheinlichkeit, dass jemand die Aufgabe falsch hat, **obwohl** er es kann.                                                                                              |
| **Lernrate** (`learnRate = 0.18`)           | Annahme, dass man schon durch das Bearbeiten einer Aufgabe etwas dazulernt. Nach jeder Aufgabe steigt der Wert deshalb ein kleines Stück, auch bei falscher Antwort.        |
| **Unsicherheit** (Entropie `H(p)`)          | Wie unsicher das System über eine Kompetenz ist. Maximal (1) bei `p = 0.5`, also „keine Ahnung“. Fast 0, wenn `p` nahe 0 oder nahe 1 liegt.                                 |
| **Versuche** (`timesAssessed`)              | Wie viele Antworten schon zu einer Kompetenz eingeflossen sind (richtig **und** falsch).                                                                                    |
| **Q-Matrix / Link**                         | Die Zuordnung „Aufgabe X prüft Kompetenz Y“. Ein Link ist `required` (Kompetenz wird wirklich gebraucht) oder `supporting` (hilft nur).                                     |
| **Voraussetzung** (`prerequisites`)         | „Kompetenz A sollte vor B gelernt werden.“                                                                                                                                  |
| **Hierarchie** (`parentId`)                 | Nur Ordnung wie Ordner/Unterordner. Hat **keinen** Einfluss auf die Auswahl.                                                                                                |

Alle Zahlenwerte sind **selbst gewählte Startannahmen**. Sie wurden nicht aus echten Antwortdaten geschätzt.

## Ein Beispiel zum Durchrechnen

Mit den Standardwerten (Start `0.35`) passiert bei einer Kompetenz Folgendes:

| Antworten                         | Lernstand danach | Unsicherheit | Abgeschlossen?                       |
| --------------------------------- | ---------------- | ------------ | ------------------------------------ |
| richtig                           | 0.76             | 0.79         | nein (erst 1 Versuch)                |
| richtig, richtig                  | 0.95             | 0.30         | **ja**                               |
| richtig, falsch                   | 0.41             | 0.98         | nein                                 |
| richtig, falsch, richtig, richtig | 0.96             | 0.25         | **ja**                               |
| nur falsch (beliebig oft)         | ≈ 0.21           | ≈ 0.73       | **nie** (siehe „Bekannte Schwächen“) |

So sieht man: Eine richtige Antwort bringt viel, weil Raten nur mit 20 % angenommen wird. Eine falsche Antwort wirft den Wert stark zurück.

## Die Schritte im Detail

### Schritt 2: Alte Antworten einrechnen

Frühere Antworten werden beim Start wie neue Antworten verarbeitet, aber vorher
abgeschwächt. Wenn eine binäre Antwortschwelle aktiviert ist, wird zuerst die
ursprüngliche Bewertung klassifiziert und erst danach abgeschwächt. Andernfalls
könnte eine alte richtige Antwort durch die Abschwächung als falsch gelten.
Nach 30 Tagen halbiert sich die Abweichung von `0.5`, nach 60 Tagen beträgt sie
ein Viertel. Die Formel verwendet den für das Modell klassifizierten Score:

$$
\text{Score}_{\text{alt}} = 0.5 + (\text{Score} - 0.5)\cdot 2^{-\text{Alter in Tagen}/30}
$$

Die 30 Tage sind eine eigene Annahme und nicht Teil von BKT. Antworten zu Aufgaben, die nicht mehr im Kurs sind, werden ignoriert. Alte Antworten zählen bei `timesAssessed` mit.
Auch ausgeschlossene Aufgaben werden nicht erneut als historische Evidenz
eingespielt. Die Abschwächung reduziert nicht den Beobachtungszähler und lässt
den Lernübergang bestehen: Auch neutrale alte Antworten sind daher nicht
vollständig wirkungslos. Dies bleibt eine explizite Modellgrenze.

### Schritt 3: Welche Kompetenz kommt als Nächstes?

Die Regeln in dieser Reihenfolge:

1. Nur Kompetenzen, zu denen es noch Aufgaben gibt.
2. Noch nicht abgeschlossene Kompetenzen haben Vorrang.
3. Kompetenzen, die in dieser Sitzung noch **unbeantwortete** Aufgaben haben, haben Vorrang. Gibt es keine, sind wieder alle erlaubt.
4. **Dranbleiben:** Die aktuelle Kompetenz bleibt bis zu 3 Aufgaben in Folge dran (`stickinessQuestions = 3`), damit nicht ständig gewechselt wird. Das gilt nur, solange sie nach Regel 1–3 noch erlaubt ist.
5. **Voraussetzungen:** Kompetenzen, deren Voraussetzungen schon gut genug sind, werden bevorzugt. Gibt es keine solche, sind alle erlaubt.
6. **Auslosen:** Unter den übrigen wird zufällig gelost. Kompetenzen mit **wenig Versuchen** und **niedrigem Lernstand** bekommen mehr Lose:

$$
\text{Lose} = \frac{1}{\text{Versuche}+1}\cdot(1-\text{Lernstand})
$$

Optional gibt es statt Regel 6 eine experimentelle Variante (siehe unten).

### Schritt 4: Welche Aufgabe?

0. Aufgaben, die in dieser Sitzung schon beantwortet wurden, kommen nur dann wieder, wenn zur Kompetenz nichts anderes mehr übrig ist. Grund: Nach jeder Antwort wird die Lösung gezeigt (siehe unten). Kommt dieselbe Aufgabe kurz danach wieder, misst sie eher, ob man sich die Lösung gemerkt hat, als ob man die Kompetenz kann. Das ist eine eigene Designentscheidung und kein Teil des klassischen BKT.
1. Bevorzugt werden Aufgaben, deren Schwierigkeit (0–1) höchstens `0.2` vom Lernstand entfernt ist. Wer bei `0.4` steht, bekommt also eher Aufgaben mit Schwierigkeit 0.2–0.6. Gibt es keine, werden alle Aufgaben der Kompetenz nach Nähe sortiert.
2. Die letzten 5 Aufgaben werden möglichst nicht wiederholt. Gibt es sonst nichts, wird diese Regel gelockert.
3. Unter den verbleibenden Aufgaben wird wieder gelost. Mehr Lose bekommt eine Aufgabe, wenn ihre Kompetenzen

   - unsicher sind (Gewicht 50 %),
   - wenige Versuche haben (Gewicht 30 %),
   - zur Schwierigkeit passen (Gewicht 20 %).

   Aufgaben, die die gewählte Kompetenz direkt prüfen, bekommen einen kleinen Bonus.

4. Notfall: Gibt es zur Kompetenz gar keine passende Aufgabe, wird irgendeine andere verfügbare Aufgabe genommen. Auch hier haben unbeantwortete Aufgaben Vorrang.

Die Schwierigkeit ist von Hand gesetzt und nicht statistisch bestimmt. Das Verfahren ist deshalb **kein** IRT- oder Rasch-Verfahren und sollte in der Arbeit auch nicht so heißen.

### Schritt 5: Antwort auswerten (der BKT-Teil)

Das System fragt: „Wie wahrscheinlich ist es, dass die Person die Kompetenz kann, **nachdem** ich diese Antwort gesehen habe?“

**Bei richtiger Antwort:**

$$
P(\text{kann}\mid\text{richtig}) = \frac{p\,(1-\text{Flüchtigkeit})}{p\,(1-\text{Flüchtigkeit}) + (1-p)\,\text{Raten}}
$$

Oben steht „kann es und hat keinen Flüchtigkeitsfehler gemacht“. Unten stehen alle Wege zu einer richtigen Antwort: „kann es“ oder „hat geraten“.

**Bei falscher Antwort:**

$$
P(\text{kann}\mid\text{falsch}) = \frac{p\cdot\text{Flüchtigkeit}}{p\cdot\text{Flüchtigkeit} + (1-p)(1-\text{Raten})}
$$

Danach kommen drei Anpassungen, die es im Original-BKT so nicht gibt:

1. **Teilpunkte:** Eine Antwort kann z. B. 0.6 statt nur richtig/falsch sein. Das gibt es bei Multiple Choice, Matrix, Zuordnung und Lückentext. **Single Choice** ist immer 1 (richtig) oder 0 (falsch). Dann werden beide Formeln gemischt: 60 % „richtig“-Ergebnis, 40 % „falsch“-Ergebnis. Das ist eine Vereinfachung.
2. **Link-Gewicht:** Bei `supporting`-Links (Faktor 0.7) oder kleinem Link-Gewicht bewegt sich der Wert nur teilweise in Richtung des neuen Ergebnisses. Positive Stärken werden auf 0.2–1.2 begrenzt. Ein Gewicht von genau `0` erzeugt keine Lernstandsaktualisierung und keine zusätzliche Beobachtung für diese Kompetenz. Die restliche Begrenzung ist weiterhin eine eigene Heuristik.
3. **Lernen:** Zum Schluss wird angenommen, dass die Person 18 % der verbleibenden Lücke durch das Üben geschlossen hat:

$$
p_{\text{neu}} = p + (1-p)\cdot 0.18
$$

### Feedback nach jeder Antwort

Nach jeder Antwort sieht die Person sofort, ob sie richtig, teilweise richtig oder falsch war, wie viel Prozent sie erreicht hat und was die richtige Lösung ist. Erst mit „Weiter“ (oder Enter) kommt die nächste Aufgabe.

Warum:

- Feedback gehört zu den wirksamsten Einflüssen auf das Lernen, vor allem wenn es zur Aufgabe etwas sagt und nicht zur Person (Hattie & Timperley, 2007; Kluger & DeNisi, 1996; Wisniewski et al., 2020).
- Nur „richtig/falsch“ hilft wenig. Erst die richtige Lösung bringt einen deutlichen Lerneffekt (Butler & Roediger, 2008; Van der Kleij et al., 2015).
- BKT nimmt an, dass man durch jede Aufgabe etwas lernt (Lernrate 0.18). Ohne Feedback ist diese Annahme schwer zu begründen. In den Tutoren, für die BKT entwickelt wurde, gab es immer sofortiges Feedback (Corbett & Anderson, 1995).

Die Texte beschreiben die Aufgabe („Noch nicht richtig“) und nicht die Person („Du bist schlecht“). Das Feedback ändert am Lernstand nichts. Gerechnet wird nur mit der Antwort.

### Wann ist Schluss?

Eine Kompetenz gilt als **abgeschlossen**, wenn **beide** Bedingungen erfüllt sind:

- mindestens **2 Versuche** (`minEvidencePerCompetency`), und
- Unsicherheit höchstens **0.7** (`maxUncertainty`). Das heißt: Lernstand ≥ 0.81 **oder** ≤ 0.19.

Die Sitzung endet, wenn alle Kompetenzen abgeschlossen sind, keine Aufgaben mehr übrig sind oder **30 Aufgaben** erreicht wurden.

**Wichtig:** „Abgeschlossen“ heißt nur „das System ist sich sicher genug“. Es heißt **nicht** „beherrscht“. Auch ein sicherer **niedriger** Wert (≤ 0.19) zählt als abgeschlossen.

Lehrende können pro Kurs eine von drei Voreinstellungen wählen:

| Voreinstellung        | Mindestversuche | max. Unsicherheit | entspricht Lernstand |
| --------------------- | --------------- | ----------------- | -------------------- |
| kurz                  | 1               | 0.85              | ≥ 0.72 oder ≤ 0.28   |
| ausgewogen (Standard) | 2               | 0.70              | ≥ 0.81 oder ≤ 0.19   |
| gründlich             | 3               | 0.55              | ≥ 0.87 oder ≤ 0.13   |

## Bekannte Schwächen

- **Nur falsche Antworten führen nie zum Abschluss.** Wegen der Lernrate sinkt der Lernstand nicht unter etwa 0.21. Die Unsicherheit bleibt dadurch bei etwa 0.73, also über der Grenze 0.7. Die Kompetenz endet dann nur über die 30-Aufgaben-Grenze.
- **„Abgeschlossen“ ≠ „beherrscht“.** Im klassischen BKT gilt eine Kompetenz ab einem Lernstand von 0.95 als beherrscht (Corbett & Anderson, 1995). Diese Grenze nutzt der Algorithmus derzeit nicht.
- **2 Versuche sind wenig.** Zweimal richtig raten passiert bei 20 % Ratewahrscheinlichkeit in 4 % der Fälle.
- **Alle Werte sind geschätzt**, nicht aus Daten gelernt. Das gilt für Start, Raten, Flüchtigkeit, Lernrate, 30 Tage, Gewichte und Grenzen.
- **Aufgaben mit mehreren Kompetenzen:** Bei einer falschen Antwort weiß das System nicht, welche Kompetenz schuld war. Alle verlieren.
- **Wenige Aufgaben pro Kompetenz:** Weil beantwortete Aufgaben nicht wiederholt werden, sind Kompetenzen mit wenigen Aufgaben schneller „leer“. Danach kommen doch Wiederholungen, und deren Ergebnis ist durch das gezeigte Feedback geschönt.

## Experimentelle Variante: „Informationsgewinn“

Statt zu losen (Schritt 3, Regel 6) kann man einstellen, dass die Kompetenz gewählt wird, **bei der die nächste Antwort am meisten Neues verraten würde** (`expected-information-gain`).

Die Idee: Für jede Kompetenz rechnet das System durch, wie unsicher es nach einer richtigen und nach einer falschen Antwort wäre. Beides wird nach Wahrscheinlichkeit gewichtet. Die Kompetenz, bei der die Unsicherheit im Schnitt am stärksten sinkt, wird gewählt. Bei Gleichstand gewinnt die mit weniger Versuchen.

$$
IG(k) = H(p_k) - P(\text{richtig})\,H(p_k\text{ nach richtig}) - P(\text{falsch})\,H(p_k\text{ nach falsch})
$$

Das wird pro **Kompetenz** gerechnet und nicht pro Aufgabe. Grund: Alle Aufgaben einer Kompetenz haben im Modell dieselben Rate- und Flüchtigkeitswerte und wären daher gleich gut. Die Aufgabenwahl (Schritt 4) bleibt unverändert.

„Experimentell“ heißt: eingebaut und einschaltbar, aber nicht nachgewiesen besser.

Für einen fairen Vergleich beider Varianten gibt es zwei Zusatzschalter:

- `singleRequiredItemsOnly = true`: nur Aufgaben, die genau **eine** Kompetenz als `required` prüfen.
- `responseScoreThreshold = 0.5`: Teilpunkte werden in richtig (≥ 0.5) oder falsch (< 0.5) umgewandelt. Die 0.5 ist eine eigene Festlegung. Man sollte auch 0.4 und 0.6 testen.

## Wie man die Varianten fair vergleicht

- Beide Varianten mit denselben Aufgaben, Kompetenzen und Einstellungen laufen lassen.
- Mehrere Durchläufe mit festgehaltenem Zufalls-Seed, weil gelost wird.
- Messen, z. B.:
  - Wie gut sagt der Lernstand die **nächste** Antwort voraus (Brier Score / Log-Loss)? Die Vorhersage muss **vor** der Antwort gespeichert werden.
  - Wie viele Aufgaben und Kompetenzen werden abgedeckt?
  - Wie oft wird wiederholt?
- Bessere Vorhersage heißt nicht automatisch, dass mehr gelernt wurde. Dafür braucht es eine Studie mit echten Lernenden.

Vorher festlegen: Wie werden automatische Bewertung, Selbsteinschätzung und Lehrendenbewertung behandelt? Bleibt die 30-Tage-Abschwächung an? Welche Schwellen werden getestet?

Für Simulationen kann `AdaptiveQuizAlgorithm(configuration, createSeededRandom(seed))`
verwendet werden. Die injizierte lineare Kongruenz-Zufallsquelle ist ausschließlich
ein Werkzeug zur Reproduzierbarkeit, keine wissenschaftliche Erweiterung des
Auswahlmodells und keine kryptographische Zufallsquelle. Produktionssessions
verwenden weiterhin `Math.random`.

Neue Antwortversuche speichern `predictionBefore`: die vor der Antwort aus dem
Zielkompetenzzustand berechnete Wahrscheinlichkeit einer richtigen Antwort
`p * (1 - slipRate) + (1 - p) * guessRate`. Für Mehrkompetenzaufgaben ist dies
keine validierte gemeinsame Item-Wahrscheinlichkeit; Auswertungen dieser
Vorhersage sollten daher auf Ein-Kompetenz-Items beschränkt oder entsprechend
als Heuristik gekennzeichnet werden. Alte Versuche besitzen diesen Wert nicht.

Ein gespeicherter Antwortversuch kann zusätzlich den Zustand nach der Antwort
enthalten. Dieser Snapshot dient der Wiederherstellung bei getrennten
Attempt-/Session-Speicheraufrufen und ersetzt nicht die Vorhersage vor der Antwort.

### Ausgeführter synthetischer Vergleich (Experiment v1)

Der ausführbare Versuchsaufbau liegt in `evaluation/selectionBenchmark.ts`;
`npm run evaluate` führt ihn aus. Es ist ein eigener technischer
Simulationsaufbau, keine Literaturbehauptung und keine empirische Studie.
Der simulierte Lerner besitzt je Kompetenz einen binären latenten Zustand:
Antworten entstehen aus Raten/Flüchtigkeitsfehlern, anschließend kann eine
noch nicht beherrschte Kompetenz mit der Lernwahrscheinlichkeit erworben werden.
Dieses generative Grundschema orientiert sich am BKT-Modell
(Corbett & Anderson; siehe Literaturteil).

**Festgelegter Aufbau:**

- 10 Kompetenzen, je 8 Ein-Kompetenz-Items; kein historischer Verlauf,
  keine Voraussetzungen und kein Vergessen.
- 100 Seeds (1–100), vier Szenarien, beide Strategien: 800 Sessions.
  Seed-Ableitung und getrennte Zufallsströme je Kompetenz stehen im Code.
  Beide Strategien verwenden dieselben Lernerströme; die Auswahlzufallsquelle
  ist davon getrennt.
- Beide Strategien erhalten die gleiche Konfiguration: 30 Aufgaben,
  Mindestbeobachtungen 2, Entropiegrenze 0.7, Stickiness 3,
  `singleRequiredItemsOnly=true`, `responseScoreThreshold=0.5`.
  Nur `competencyStrategy` unterscheidet sich.
- Die Schätzung startet immer bei 0.35. Die simulierte Anfangsbeherrschung
  beträgt je nach Szenario 0.10, 0.35 oder 0.85. Bei diesen drei Szenarien
  stimmen Lernrate (0.18), Raten (0.20) und Flüchtigkeitsfehler (0.10) mit
  dem Modell überein; „matched“ bezeichnet diese Übergangs-/Antwortparameter,
  nicht in allen Fällen den Anfangszustand.
- Das vierte Szenario weicht absichtlich ab: Anfangsbeherrschung 0.35,
  Lernrate 0.05, Raten 0.30, Flüchtigkeitsfehler 0.20.
- Aufgabenschwierigkeit beeinflusst die Auswahl, aber nicht die simulierte
  Antwortwahrscheinlichkeit. Das ist eine bewusste Vereinfachung.

Die Antwortvorhersage wird vor der Zustandsaktualisierung gespeichert.
Für binäre Antwort `y` und Vorhersage `q` ist der Brier Score
`(q-y)^2`; Log-Loss ist `-[y ln(q) + (1-y) ln(1-q)]`.
Nur für Log-Loss werden Wahrscheinlichkeiten numerisch auf
`[10^-12, 1-10^-12]` begrenzt. Kompetenzabdeckung ist die Zahl beobachteter
Kompetenzen geteilt durch 10; Itemabdeckung bezieht sich auf alle 80 Items.
Die Wiederholungsrate zählt weitere Präsentationen bereits beantworteter
Items relativ zur Aufgabenanzahl.

**Gemessene Mittelwerte, 100 Sessions je Tabellenzeile:**

| Szenario | Strategie | Aufgaben | Kompetenzabdeckung | Brier Score | Log-Loss |
| --- | --- | ---: | ---: | ---: | ---: |
| niedriger Anfangsstand | coverage-weighted | 30.00 | 92.8 % | 0.2352 | 0.6642 |
| niedriger Anfangsstand | expected-information-gain | 30.00 | 99.5 % | 0.2348 | 0.6635 |
| gemischter Anfangsstand | coverage-weighted | 30.00 | 95.6 % | 0.2317 | 0.6557 |
| gemischter Anfangsstand | expected-information-gain | 30.00 | 100.0 % | 0.2323 | 0.6570 |
| hoher Anfangsstand | coverage-weighted | 27.27 | 100.0 % | 0.2212 | 0.6304 |
| hoher Anfangsstand | expected-information-gain | 27.27 | 100.0 % | 0.2207 | 0.6293 |
| langsames Lernen / abweichende Parameter | coverage-weighted | 30.00 | 94.9 % | 0.2484 | 0.6912 |
| langsames Lernen / abweichende Parameter | expected-information-gain | 30.00 | 100.0 % | 0.2491 | 0.6924 |

Die gepaarten Brier-Differenzen (Informationsgewinn minus gewichtete Auswahl)
betragen ungefähr -0.00039, +0.00063, -0.00055 und +0.00063.
Ihre Stichprobenstandardabweichungen liegen bei 0.01292, 0.01286, 0.00487
und 0.01541. Sie sind deskriptive Kennzahlen, keine Signifikanzprüfung.
Der vollständige Export enthält auch Einzelverläufe, Konfiguration,
Abschlussgründe, Standardabweichungen, die konstante Anfangsvorhersage als
Vergleich sowie den Abstand zur synthetischen wahren Antwortwahrscheinlichkeit.

**Interpretation und Grenzen:** Die Informationsgewinn-Variante deckt in
diesen Szenarien etwas mehr Kompetenzen ab, zeigt aber keinen konsistenten
Vorteil bei der Vorhersagequalität. Die Strategien beantworten unterschiedliche
Items und erzeugen unterschiedliche Lernpfade: On-Policy-Brier-Scores sind
deshalb kein kausaler Vergleich des Lernerfolgs. Anfangsschätzungen,
Stop-Regeln, der kleine Pool und das binäre BKT-Lernermodell beeinflussen
die Resultate. Insbesondere ist ein BKT-nah erzeugter Lerner kein unabhängiger
Nachweis der Eignung von BKT für echte Studierende. Das Experiment rechtfertigt
weder eine Änderung der produktiven Voreinstellung noch Aussagen über reale
Lernverbesserung.

Der vollständige Versuch wurde zweimal ausgeführt; die JSON-Ergebnisse
waren byte-identisch. Zeitstempel und zufällige Session-IDs werden bewusst
nicht als experimentelle Ergebnisse exportiert.

## Interaktive Simulation im Algorithmus-Labor

Der Tab **„Simulierter Lernender“** führt eine einzelne adaptive Session mit
einem künstlichen Lernenden aus. Er ruft denselben Auswahl- und
Aktualisierungsalgorithmus wie die Lernsession auf, speichert jedoch keine
Antwortversuche oder Sessions. Der bestehende manuelle Test bleibt im Tab
**„Manueller Test“** verfügbar.

Vor dem Start wird nur das Vorwissensprofil gewählt. Die Profile setzen die
Wahrscheinlichkeit, mit der eine Kompetenz zu Simulationsbeginn latent
beherrscht ist, auf 0,10, 0,35 oder 0,85. Die Oberfläche verwendet fest die
Standardstrategie `coverage-weighted`; der technische Seed ist intern auf 42
gesetzt und wird nicht als Einstellung angeboten. Bei gleichen
Aufgaben-/Kompetenzdaten und gleichem Vorwissensprofil ist der Verlauf dadurch
reproduzierbar. Zufallsströme für Aufgabenauswahl, Antworten und Lernen sind
getrennt. Die alternative Strategie `expected-information-gain` bleibt für
technische Tests und Vergleiche verfügbar, ist aber keine Option im
vereinfachten Simulationsablauf.

Der Durchlauf ist in folgende Schritte aufgeteilt:

1. Die Simulation zeigt die vom adaptiven Algorithmus ausgewählte Aufgabe und
   erläutert die angewendeten Auswahlregeln. Die Erklärung beschreibt Regeln
   und Konfiguration, ist jedoch kein vollständiger interner Kandidaten-Trace.
2. Vor der Antwort wird die Modellvorhersage
   `p * (1 - slipRate) + (1 - p) * guessRate` gezeigt. Daneben wird die
   Antwortwahrscheinlichkeit des künstlichen Lernenden aus seinem separaten,
   latenten binären Zustand berechnet: `1 - slipRate` bei Beherrschung,
   andernfalls `guessRate`.
3. Ein Zufallszug erzeugt die binäre Antwort. Anschließend kann der latente
   Zustand einer zuvor nicht beherrschten Kompetenz mit `learnRate` in den
   beherrschten Zustand wechseln. Dieser Übergang ist von der Richtigkeit der
   gerade erzeugten Antwort unabhängig, wie im zugrunde liegenden BKT-Schema.
4. Die Antwort wird in-memory an den bestehenden Algorithmus übergeben. Die
   Oberfläche zeigt danach getrennt den latenten Simulationszustand und die
   aktualisierte Modellschätzung.

Die Simulation lässt nur Aufgaben mit genau einer erforderlichen Kompetenz zu
und übergibt ausschließlich binäre Antwortwerte. Insbesondere werden keine
konkrete Multiple-Choice-Auswahl und kein eingegebener Antworttext simuliert.
Schrittsteuerung und Autoplay verändern die Lernlogik nicht.

**Wissenschaftliche Einordnung:** Diese Oberfläche ist ein didaktisches
Erklärungs- und Debugginginstrument, kein empirisches Experiment. Der latente
Zustand und Antwortprozess sind synthetisch durch Parameter festgelegt; daraus
folgende Übereinstimmung von Vorhersage und Antwort belegt weder die
Modellgüte an realen Lernenden noch einen Lernerfolg. Ein Wechsel des
Vorwissensprofils verändert außerdem die Verteilung der simulierten
Anfangszustände und nicht die Anfangsschätzung des Algorithmus. Ergebnisse
sollten daher nicht als Beleg für die Überlegenheit einer Auswahlstrategie
interpretiert werden. Für wissenschaftliche Vergleiche gelten die separat
dokumentierten, reproduzierbaren Versuchsbedingungen und Grenzen aus
[Experiment v1](#ausgeführter-synthetischer-vergleich-experiment-v1).

## Kompetenzgraph

Drei Arten von Verbindungen, die man nicht verwechseln darf:

- **Hierarchie** (`parentId`): nur Ordnung, keine Lernreihenfolge.
- **Voraussetzung:** „erst A, dann B“, mit Pfeil von A nach B.
- **Aufgaben-Zuordnung:** welche Aufgabe welche Kompetenz prüft.

Wird der Lernstand im Graphen angezeigt, sollte daneben die Anzahl der Versuche stehen, und er sollte als **Schätzung** gekennzeichnet sein.

## Wo steht was im Code?

- Algorithmus: `web/src/composables/algorithm.ts`
- Sitzungsstart und alte Antworten: `web/src/stores/studySessionStore.ts`
- Standardwerte und Voreinstellungen: `web/src/model/StudyAlgorithmConfig.ts`
- Bewertung der Antworten (Punkte 0–1): `web/src/components/QuestionInteraction.vue`
- Feedback nach jeder Antwort: `web/src/composables/answerFeedback.ts` (Logik) und `web/src/components/StudyAnswerFeedback.vue` (Anzeige)

## Literatur

- Butler, A. C., & Roediger, H. L. (2008). Feedback enhances the positive effects and reduces the negative effects of multiple-choice testing. _Memory & Cognition, 36_(3), 604–616. https://doi.org/10.3758/MC.36.3.604
- Corbett, A. T., & Anderson, J. R. (1995). Knowledge tracing: Modeling the acquisition of procedural knowledge. _User Modeling and User-Adapted Interaction, 4_(4), 253–278. https://doi.org/10.1007/BF01099821
- Hattie, J., & Timperley, H. (2007). The Power of Feedback. _Review of Educational Research, 77_(1), 81–112. https://doi.org/10.3102/003465430298487
- Hawkins, W. J., Heffernan, N. T., & Baker, R. S. J. d. (2014). Learning Bayesian Knowledge Tracing Parameters with a Knowledge Heuristic and Empirical Probabilities. In _Intelligent Tutoring Systems_ (LNCS 8638, pp. 150–155). https://doi.org/10.1007/978-3-319-07221-0_18
- Kang, H.-A., Zhang, S., & Chang, H.-H. (2017). Dual-Objective Item Selection Criteria in Cognitive Diagnostic Computerized Adaptive Testing. _Journal of Educational Measurement, 54_(2), 165–183. https://doi.org/10.1111/jedm.12139
- Kluger, A. N., & DeNisi, A. (1996). The effects of feedback interventions on performance. _Psychological Bulletin, 119_(2), 254–284. https://doi.org/10.1037/0033-2909.119.2.254
- Lin, C.-J., & Chang, H.-H. (2019). Item Selection Criteria With Practical Constraints in Cognitive Diagnostic Computerized Adaptive Testing. _Educational and Psychological Measurement, 79_, 335–357. https://doi.org/10.1177/0013164418790634
- Pardos, Z. A., & Heffernan, N. T. (2010). Modeling Individualization in a Bayesian Networks Implementation of Knowledge Tracing. In _User Modeling, Adaptation, and Personalization_ (pp. 255–266). https://doi.org/10.1007/978-3-642-13470-8_24
- Van der Kleij, F. M., Feskens, R. C. W., & Eggen, T. J. H. M. (2015). Effects of Feedback in a Computer-Based Learning Environment on Students' Learning Outcomes: A Meta-Analysis. _Review of Educational Research, 85_(4), 475–511. https://doi.org/10.3102/0034654314564881
- Wisniewski, B., Zierer, K., & Hattie, J. (2020). The Power of Feedback Revisited: A Meta-Analysis of Educational Feedback Research. _Frontiers in Psychology, 10_, 3087. https://doi.org/10.3389/fpsyg.2020.03087
