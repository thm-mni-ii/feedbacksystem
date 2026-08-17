# Wissenschaftliche Spezifikation des adaptiven Algorithmus

## Zweck und Abgrenzung

Die Plattform schätzt für jede **atomare Kompetenz** die aktuelle
Beherrschungswahrscheinlichkeit eines Studierenden und wählt die nächste
Aufgabe anhand dieser Schätzung aus. Die Kompetenzhierarchie strukturiert die
Domäne; sie ist keine implizite Lernreihenfolge. Fachliche Lernreihenfolgen
werden ausschließlich über explizite Voraussetzungen modelliert.

Der bisherige EMA-Score bleibt als technische Vergleichsbaseline erhalten. Er
ist kein psychometrisches Wissensmodell und wird weder als BKT noch als
IRT/Rasch bezeichnet.

## Wissensschätzung: Bayesian Knowledge Tracing

Für Studierende `s` und Kompetenz `k` speichert das Modell
`p(s,k) = P(L_k)`, die Wahrscheinlichkeit der Beherrschung. Für jede
Kompetenz sind vier BKT-Parameter konfigurierbar:

| Parameter | Bedeutung |
| --- | --- |
| `P(L0)` | anfängliche Beherrschungswahrscheinlichkeit |
| `P(T)` | Wahrscheinlichkeit, nach einer Lerngelegenheit zu lernen |
| `P(G)` | Ratewahrscheinlichkeit bei nicht beherrschter Kompetenz |
| `P(S)` | Flüchtigkeitswahrscheinlichkeit trotz Beherrschung |

Für eine binär bewertete Antwort wird zunächst der Posterior aktualisiert.
Bei einer richtigen Antwort gilt:

```text
P(L | correct) = P(L) · (1 - P(S))
               / (P(L) · (1 - P(S)) + (1 - P(L)) · P(G))
```

Bei einer falschen Antwort gilt:

```text
P(L | incorrect) = P(L) · P(S)
                 / (P(L) · P(S) + (1 - P(L)) · (1 - P(G)))
```

Danach folgt der Lernübergang:

```text
P(L_next) = P(L | response) + (1 - P(L | response)) · P(T)
```

Die erste Implementierung modelliert kein Vergessen. Diese Annahme ist für
kurze Lernsitzungen nachvollziehbar, muss aber bei langfristigem Lernen
später durch einen zeitabhängigen Vergessensparameter geprüft werden.

Parameter werden nicht als universelle Konstanten behauptet. Zu Beginn sind
sie konfigurierbare, fachlich begründete Startwerte; nach einer Pilotphase
werden sie aus den gespeicherten `LearningAttempt`s geschätzt und per
Sensitivitätsanalyse beurteilt.

## Verbindung von Aufgaben und Kompetenzen

Die binäre Q-Matrix wird aus allen `competencyLinks` mit
`relation = required` gebildet. Sie beschreibt, welche Kompetenzen zur Lösung
einer Aufgabe erforderlich sind. `supporting` und `weight` sind zusätzliche
Plattformmetadaten; sie ersetzen keine formale Q-Matrix.

Bei einem Item mit mehreren erforderlichen Kompetenzen aktualisiert die erste
Version jede dieser Kompetenzen. Diese Annahme wird transparent dokumentiert:
Eine einzelne falsche Antwort identifiziert noch nicht sicher die verursachende
Teilkompetenz. Mit mehr Daten kann ein Cognitive-Diagnosis-Modell als
Erweiterung geprüft werden.

## Auswahl der nächsten Aufgabe

Die Auswahl besteht aus harten Nebenbedingungen und einer Nutzenfunktion.

### Harte Nebenbedingungen

1. Die Aufgabe ist aktiv und nicht ausgeschlossen.
2. Alle expliziten Voraussetzungen der Zielkompetenz sind erfüllt.
3. Die Aufgabe wurde nicht unmittelbar zuvor gestellt.
4. Definierte Grenzen für Item-Exposure und Kompetenzabdeckung werden
   eingehalten.

### Nutzenfunktion

Für jede Kandidatenaufgabe wird der erwartete Informationsgewinn berechnet.
Für eine Kompetenz mit Beherrschungswahrscheinlichkeit `p` ist deren binäre
Unsicherheit:

```text
H(p) = -p · log(p) - (1 - p) · log(1 - p)
```

Der Informationsgewinn eines Items ist die erwartete Reduktion dieser
Unsicherheit nach richtiger bzw. falscher Antwort. Für mehrere erforderliche
Kompetenzen werden die Gewinne aggregiert. Die Auswahl berücksichtigt daneben
Abdeckung, Wiederholung und Exposure als klar dokumentierte Nebenbedingungen.

Die gegenwärtliche Schwierigkeitsskala ist noch nicht empirisch kalibriert.
Sie wird daher zunächst als didaktisches Metadatum verwendet, nicht als
Rasch-Parameter. Eine Rasch- oder IRT-basierte Auswahl ist erst nach
Itemkalibrierung zulässig.

## Darstellungsregeln für den Kompetenzgraphen

Der Graph soll drei verschiedene Relationen sichtbar, aber unterscheidbar
machen:

| Relation | Darstellung |
| --- | --- |
| Taxonomie (`parentId`) | durchgezogene, neutrale Baumkante ohne Lernrichtung |
| Voraussetzung | gestrichelter, gerichteter Pfeil von Voraussetzung zu Zielkompetenz; Label mit Mindestbeherrschung |
| Q-Matrix/Itemzuordnung | nur in einem zuschaltbaren Item-Layer; jede erforderliche Kompetenz erhält eine eigene Kante |

Die bestehende Darstellung ist hierfür zu ändern: Sie zeigt pro Frage nur die
„spezifischste“ Kompetenz und verliert damit Mehrfachzuordnungen. Die
Q-Matrix-Tabelle bleibt die präzise Prüfansicht; der Graph ist die
übersichtliche Navigationsansicht.

Für Studierende zeigt ein zusätzlicher Overlay je Kompetenz die geschätzte
Beherrschungswahrscheinlichkeit und die Evidenzmenge (Anzahl Versuche), nicht
eine unkommentierte Ampelfarbe. Für Lehrende bleibt der Strukturgraph davon
getrennt und zeigt zusätzlich die Abdeckung des Itempools.

## Evaluation

Die Evaluierung vergleicht die BKT-Schätzung mit der EMA-Baseline anhand der
Vorhersage der jeweils nächsten Antwort. Ergänzend werden Kompetenzabdeckung,
benötigte Aufgabenanzahl und Verständlichkeit der Darstellung untersucht.

## Literaturbasis

- Corbett, A. T., & Anderson, J. R. (1995). *Knowledge tracing: Modeling the
  acquisition of procedural knowledge*. User Modeling and User-Adapted
  Interaction, 4, 253–278. https://doi.org/10.1007/BF01099821
- Hawkins, W. J., Heffernan, N. T., & Baker, R. S. J. d. (2013). *Learning
  Bayesian Knowledge Tracing Parameters with a Knowledge Heuristic and
  Empirical Probabilities*.
- Kang, H.-A., Zhang, S., & Chang, H.-H. (2017). *Dual-Objective Item Selection
  Criteria in Cognitive Diagnostic Computerized Adaptive Testing*. Journal of
  Educational Measurement, 54, 165–183. https://doi.org/10.1111/jedm.12139
- Lin, C.-J., & Chang, H.-H. (2019). *Item Selection Criteria With Practical
  Constraints in Cognitive Diagnostic Computerized Adaptive Testing*. Educational
  and Psychological Measurement, 79, 335–357.
  https://doi.org/10.1177/0013164418790634
