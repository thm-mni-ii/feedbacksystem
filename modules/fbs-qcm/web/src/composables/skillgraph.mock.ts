import type { Competency, Question } from '@/model/types'

export const competencies: Competency[] = [
  // ============================================================
  // OBERKOMPETENZ: SQL
  // ============================================================
  {
    id: 'c-sql',
    name: 'SQL',
    description: 'Structured Query Language',
    category: 'database'
  },
  {
    id: 'c-sql-select',
    name: 'SELECT Statements',
    description: 'SELECT, WHERE, ORDER BY, LIMIT, DISTINCT',
    parentId: 'c-sql',
    prerequisites: [{ competencyId: 'c-sql', minimumMastery: 0.6 }]
  },
  {
    id: 'c-sql-joins',
    name: 'JOINs',
    description: 'INNER JOIN, OUTER JOIN, CROSS JOIN',
    parentId: 'c-sql',
    prerequisites: [{ competencyId: 'c-sql', minimumMastery: 0.6 }]
  },
  {
    id: 'c-sql-dml',
    name: 'DML Operationen',
    description: 'INSERT, UPDATE, DELETE',
    parentId: 'c-sql',
    prerequisites: [{ competencyId: 'c-sql', minimumMastery: 0.6 }]
  },
  {
    id: 'c-sql-aggregation',
    name: 'Aggregation & Gruppierung',
    description: 'COUNT, SUM, AVG, GROUP BY, HAVING',
    parentId: 'c-sql',
    prerequisites: [{ competencyId: 'c-sql', minimumMastery: 0.6 }]
  },
  {
    id: 'c-sql-subqueries',
    name: 'Subqueries',
    description: 'Verschachtelte Abfragen',
    parentId: 'c-sql',
    prerequisites: [{ competencyId: 'c-sql', minimumMastery: 0.6 }]
  },
  {
    id: 'c-sql-advanced',
    name: 'SQL Fortgeschritten',
    description: 'Views, Stored Procedures',
    parentId: 'c-sql',
    prerequisites: [{ competencyId: 'c-sql', minimumMastery: 0.6 }]
  },

  // ============================================================
  // OBERKOMPETENZ: Datenbankdesign
  // ============================================================
  {
    id: 'c-db-design',
    name: 'Datenbankdesign',
    description: 'Grundlagen des Datenbankdesigns',
    category: 'database'
  },
  {
    id: 'c-er-model',
    name: 'ER-Modellierung',
    description: 'Entity-Relationship Modellierung',
    parentId: 'c-db-design',
    prerequisites: [{ competencyId: 'c-db-design', minimumMastery: 0.6 }]
  },
  {
    id: 'c-ser-model',
    name: 'SER-Modellierung',
    description: 'System Entity Relationship Modellierung',
    parentId: 'c-db-design',
    prerequisites: [{ competencyId: 'c-db-design', minimumMastery: 0.6 }]
  },
  {
    id: 'c-er-typ',
    name: 'ER-Typen',
    description: 'Entity-Relationship Typen und Attribute',
    parentId: 'c-ser-model',
    prerequisites: [{ competencyId: 'c-ser-model', minimumMastery: 0.6 }]
  },
  {
    id: 'c-er-entities',
    name: 'Entitäten & Beziehungen',
    description: 'Entitäten, Beziehungen, Kardinalitäten',
    parentId: 'c-er-model',
    prerequisites: [{ competencyId: 'c-er-model', minimumMastery: 0.6 }]
  },
  {
    id: 'c-er-cardinality',
    name: 'Kardinalitäten',
    description: '1:1, 1:n, n:m Beziehungen',
    parentId: 'c-er-model',
    prerequisites: [{ competencyId: 'c-er-model', minimumMastery: 0.6 }]
  },

  // ============================================================
  // OBERKOMPETENZ: Normalisierung
  // ============================================================
  {
    id: 'c-normalization',
    name: 'Normalisierung',
    description: 'Datenbanknormalisierung & Anomalien',
    category: 'database'
  },
  {
    id: 'c-norm-1nf',
    name: '1. Normalform (1NF)',
    description: 'Atomare Werte, keine Wiederholungsgruppen',
    parentId: 'c-normalization',
    prerequisites: [{ competencyId: 'c-normalization', minimumMastery: 0.6 }]
  },
  {
    id: 'c-norm-2nf',
    name: '2. Normalform (2NF)',
    description: 'Keine partiellen Abhängigkeiten',
    parentId: 'c-normalization',
    prerequisites: [{ competencyId: 'c-norm-1nf', minimumMastery: 0.6 }]
  },
  {
    id: 'c-norm-3nf',
    name: '3. Normalform (3NF)',
    description: 'Keine transitiven Abhängigkeiten',
    parentId: 'c-normalization',
    prerequisites: [{ competencyId: 'c-norm-2nf', minimumMastery: 0.6 }]
  },
  {
    id: 'c-norm-bcnf',
    name: 'BCNF',
    description: 'Boyce-Codd Normalform',
    parentId: 'c-normalization',
    prerequisites: [{ competencyId: 'c-norm-3nf', minimumMastery: 0.6 }]
  },
  {
    id: 'c-norm-anomalies',
    name: 'Datenbankanomalien',
    description: 'Einfüge-, Änderungs-, Löschanomalien',
    parentId: 'c-normalization',
    prerequisites: [{ competencyId: 'c-normalization', minimumMastery: 0.6 }]
  },
  {
    id: 'c-norm-dependencies',
    name: 'Funktionale Abhängigkeiten',
    description: 'Funktionale und transitive Abhängigkeiten',
    parentId: 'c-normalization',
    prerequisites: [{ competencyId: 'c-normalization', minimumMastery: 0.6 }]
  },

  // ============================================================
  // OBERKOMPETENZ: Concurrency
  // ============================================================
  {
    id: 'c-concurrency',
    name: 'Concurrency Control',
    description: 'Nebenläufigkeitskontrolle',
    category: 'database'
  },
  {
    id: 'c-isolation-levels',
    name: 'Isolation Levels',
    description: 'READ UNCOMMITTED bis SERIALIZABLE',
    parentId: 'c-concurrency',
    prerequisites: [{ competencyId: 'c-concurrency', minimumMastery: 0.6 }]
  },
  {
    id: 'c-concurrency-issues',
    name: 'Concurrency Issues',
    description: 'Dirty Read, Lost Update, Phantom Read',
    parentId: 'c-concurrency',
    prerequisites: [{ competencyId: 'c-concurrency', minimumMastery: 0.6 }]
  }
]

const difficultyPattern = [0.18, 0.24, 0.31, 0.38, 0.45, 0.53, 0.61, 0.69, 0.77, 0.85]

const questionBank: Array<{ competencyId: string; prompts: string[] }> = [
  {
    competencyId: 'c-sql',
    prompts: [
      'Was ist SQL und wofür wird es in relationalen Datenbanken eingesetzt?',
      'Welche Aufgaben unterscheiden DDL, DML und DCL in SQL?',
      'Was bedeutet es, dass SQL eine deklarative Sprache ist?',
      'Welche Rolle spielt das relationale Modell für SQL-Abfragen?',
      'Wie ist ein einfaches SQL-Statement grundsätzlich aufgebaut?',
      'Wann sind Aliase für Tabellen und Spalten in SQL sinnvoll?',
      'Welche Risiken entstehen durch unsauber formulierte SQL-Abfragen?',
      'Was unterscheidet den SQL-Standard von herstellerspezifischen Dialekten?',
      'Warum sollte man komplexe Abfragen schrittweise entwickeln und testen?',
      'Wann ist direktes SQL sinnvoller als die Verwendung eines ORMs?'
    ]
  },
  {
    competencyId: 'c-sql-select',
    prompts: [
      'Wie filtert eine WHERE-Klausel Datensätze in einer SELECT-Abfrage?',
      'Wann verwendet man DISTINCT in einer SELECT-Abfrage?',
      'Wie sortiert ORDER BY nach mehreren Spalten gleichzeitig?',
      'Wozu dient LIMIT oder FETCH FIRST in einer Abfrage?',
      'Was ist der Unterschied zwischen WHERE und ORDER BY in der Abfragelogik?',
      'Wann ist LIKE für die Suche nach Textmustern geeignet?',
      'Wie verwendet man IN-Listen in SELECT-Abfragen sinnvoll?',
      'Wann ist BETWEEN für Bereichsabfragen passend?',
      'Wie behandelt SQL NULL-Werte in Filterbedingungen?',
      'Wann verbessert ein Spaltenalias die Lesbarkeit eines SELECT-Statements?'
    ]
  },
  {
    competencyId: 'c-sql-joins',
    prompts: [
      'Wann verwendet man einen INNER JOIN?',
      'Worin unterscheidet sich ein LEFT JOIN von einem INNER JOIN?',
      'Wann kann ein RIGHT JOIN die Lesbarkeit einer Abfrage verschlechtern?',
      'Was liefert ein FULL OUTER JOIN fachlich betrachtet?',
      'Was erzeugt ein CROSS JOIN und wann ist das sinnvoll?',
      'Wie formuliert man eine Join-Bedingung sauber und nachvollziehbar?',
      'Welche Fehler entstehen bei einer fehlenden oder falschen Join-Bedingung?',
      'Warum können JOINs zu unerwarteten Duplikaten führen?',
      'Wie erkennt man in einer Abfrage eine 1:n-Beziehung?',
      'Wann ist EXISTS besser geeignet als ein JOIN?'
    ]
  },
  {
    competencyId: 'c-sql-dml',
    prompts: [
      'Wofür dient INSERT INTO in SQL?',
      'Wann verwendet man INSERT ... SELECT statt einzelner Inserts?',
      'Wie aktualisiert ein UPDATE gezielt nur bestimmte Datensätze?',
      'Warum ist eine WHERE-Klausel bei UPDATE besonders kritisch?',
      'Wann sollte man DELETE statt TRUNCATE einsetzen?',
      'Wie löscht man abhängige Daten fachlich sauber und nachvollziehbar?',
      'Was versteht man unter einem Upsert?',
      'Wann sind Bulk-Inserts für Importprozesse sinnvoll?',
      'Wie prüft man nach einer DML-Operation die Anzahl betroffener Zeilen?',
      'Welche Risiken haben DML-Operationen, wenn sie nicht sorgfältig abgesichert sind?'
    ]
  },
  {
    competencyId: 'c-sql-aggregation',
    prompts: [
      'Was berechnet COUNT(*) in einer SQL-Abfrage?',
      'Wann verwendet man SUM() für Auswertungen?',
      'Wie unterscheidet sich AVG() fachlich von SUM() und COUNT()? ',
      'Wozu dienen MIN() und MAX() in Berichten?',
      'Wann benötigt man GROUP BY?',
      'Was ist der Unterschied zwischen WHERE und HAVING?',
      'Wie aggregiert man Daten pro Kunde oder pro Monat?',
      'Warum müssen nicht aggregierte Spalten in GROUP BY berücksichtigt werden?',
      'Wann ist COUNT(DISTINCT ...) fachlich sinnvoll?',
      'Wie wirken sich NULL-Werte auf Aggregatfunktionen aus?'
    ]
  },
  {
    competencyId: 'c-sql-subqueries',
    prompts: [
      'Was ist eine Unterabfrage in SQL?',
      'Wann setzt man eine skalare Subquery ein?',
      'Wofür verwendet man EXISTS in Kombination mit Subqueries?',
      'Wann ist IN mit einer Unterabfrage sinnvoll?',
      'Was ist eine korrelierte Unterabfrage?',
      'Welche Performance-Probleme können verschachtelte Unterabfragen verursachen?',
      'Wann ist ein JOIN besser geeignet als eine Unterabfrage?',
      'Wie verwendet man eine Unterabfrage im FROM-Teil einer Abfrage?',
      'Was muss eine Subquery in einer Vergleichsbedingung zurückgeben?',
      'Wie testet man komplexe verschachtelte SQL-Abfragen schrittweise?'
    ]
  },
  {
    competencyId: 'c-sql-advanced',
    prompts: [
      'Was ist eine View in einer relationalen Datenbank?',
      'Wann ist eine materialisierte View sinnvoll?',
      'Welche Vorteile bieten Views für Sicherheit und Wiederverwendung?',
      'Was ist eine Stored Procedure?',
      'Wann verwendet man eine Datenbankfunktion statt einer Procedure?',
      'Welche Nachteile entstehen durch zu viele Datenbankobjekte?',
      'Wie versioniert man Views und Procedures in einem Team sauber?',
      'Wann sind Trigger sinnvoll und wann eher riskant?',
      'Wie dokumentiert man Geschäftslogik, die in der Datenbank liegt?',
      'Welche Unterschiede gibt es zwischen logischer und physischer Datenabstraktion?'
    ]
  },
  {
    competencyId: 'c-db-design',
    prompts: [
      'Welche Ziele verfolgt gutes Datenbankdesign?',
      'Wie identifiziert man die zentralen Entitäten eines Fachmodells?',
      'Warum trennt man Stammdaten und Bewegungsdaten?',
      'Wann benötigt ein Modell eine Zwischentabelle?',
      'Wie beeinflussen typische Abfragen den Schema-Entwurf?',
      'Welche Rolle spielen Geschäftsregeln im Datenbankdesign?',
      'Warum sollte Redundanz bewusst und nicht zufällig entstehen?',
      'Wie plant man Erweiterbarkeit in einem Datenmodell?',
      'Wann ist ein denormalisiertes Modell dennoch vertretbar?',
      'Welche typischen Fehler passieren im frühen Schema-Entwurf?'
    ]
  },
  {
    competencyId: 'c-er-model',
    prompts: [
      'Was zeigt ein ER-Diagramm?',
      'Wie erkennt man Entitäten in einer fachlichen Beschreibung?',
      'Was ist der Unterschied zwischen einer Entität und einem Entitätstyp?',
      'Wie modelliert man Beziehungen im ER-Diagramm?',
      'Wann ist ein Attribut mehrwertig?',
      'Welche Schritte gehören zu einem sauberen ER-Entwurf?',
      'Wie validiert man ein ER-Modell mit Fachanwendern?',
      'Woran erkennt man, dass in einem ER-Modell Geschäftsregeln fehlen?',
      'Wie überführt man ein ER-Modell in relationale Tabellen?',
      'Welche Grenzen hat ein ER-Diagramm bei komplexen Fachregeln?'
    ]
  },
  {
    competencyId: 'c-ser-model',
    prompts: [
      'Worin unterscheidet sich ein SER-Modell von einem fachlichen ER-Modell?',
      'Wann modelliert man technische statt rein fachlicher Entitäten?',
      'Wie bildet man Systemgrenzen in einem SER-Modell ab?',
      'Welche Rolle spielen Schnittstellenobjekte im SER-Modell?',
      'Wann wird ein fachliches Attribut zu einer eigenen Systementität?',
      'Wie geht man mit Audit- oder Protokolldaten im SER-Modell um?',
      'Warum sind Namenskonventionen im SER-Modell besonders wichtig?',
      'Wie berücksichtigt man Legacy-Systeme im SER-Modell?',
      'Welche Risiken entstehen durch zu technisches Modellieren?',
      'Wie verbindet man ein SER-Modell mit dem physischen Datenbankschema?'
    ]
  },
  {
    competencyId: 'c-er-typ',
    prompts: [
      'Was ist ein Entitätstyp?',
      'Wodurch unterscheiden sich starke und schwache Entitätstypen?',
      'Wann ist ein Attribut zusammengesetzt?',
      'Was ist ein abgeleitetes Attribut?',
      'Wie kennzeichnet man optionale Attribute fachlich sauber?',
      'Wann sollte ein Attribut ausgelagert statt direkt an einer Entität modelliert werden?',
      'Welche Attribute eignen sich als identifizierende Merkmale?',
      'Was unterscheidet einfache, mehrwertige und zusammengesetzte Attribute?',
      'Wie prüft man, ob ein Attribut fachlich stabil definiert ist?',
      'Welche Probleme entstehen durch unscharf definierte Attributtypen?'
    ]
  },
  {
    competencyId: 'c-er-entities',
    prompts: [
      'Was ist eine Entität?',
      'Woran erkennt man eine sinnvolle Abgrenzung von Entitäten?',
      'Wann sollten zwei ähnliche Objekte getrennte Entitäten sein?',
      'Was beschreibt eine Beziehung zwischen zwei Entitäten?',
      'Wie modelliert man rekursive Beziehungen?',
      'Wann benötigt eine Beziehung eigene Attribute?',
      'Wie findet man fehlende Beziehungen in einem Modell?',
      'Welche typischen Benennungsfehler gibt es bei Entitäten?',
      'Warum sollte eine Entität nicht mehrere Fachbedeutungen mischen?',
      'Wie erkennt man, dass eine Beziehung eigentlich eine eigene Entität sein sollte?'
    ]
  },
  {
    competencyId: 'c-er-cardinality',
    prompts: [
      'Was bedeutet eine 1:1-Beziehung?',
      'Wann liegt eine 1:n-Beziehung vor?',
      'Was kennzeichnet eine n:m-Beziehung?',
      'Wie dokumentiert man optionale Teilnahme an Beziehungen?',
      'Warum ist Kardinalität für das relationale Schema wichtig?',
      'Wie löst man n:m-Beziehungen in relationalen Tabellen auf?',
      'Welche Fehler entstehen durch falsch angenommene Kardinalitäten?',
      'Wie beeinflusst Kardinalität die Integritätsregeln eines Modells?',
      'Wann kann man eine 1:1-Beziehung in einer Tabelle zusammenführen?',
      'Wie überprüft man Kardinalitäten mit Beispieldaten?'
    ]
  },
  {
    competencyId: 'c-normalization',
    prompts: [
      'Warum normalisiert man relationale Datenmodelle?',
      'Welche Probleme löst Normalisierung typischerweise?',
      'Was ist der Zusammenhang zwischen Redundanz und Anomalien?',
      'Wann ist ein Schema fachlich übernormalisiert?',
      'Welche Rolle spielen funktionale Abhängigkeiten in der Normalisierung?',
      'Wie geht man schrittweise von einem unnormalisierten Modell zur 3NF?',
      'Wann ist Denormalisierung trotz guter Theorie sinnvoll?',
      'Wie validiert man eine Zerlegung fachlich und technisch?',
      'Warum verbessert Normalisierung nicht automatisch jede Abfrage?',
      'Welche Trade-offs entstehen zwischen Lesbarkeit und Normalisierung?'
    ]
  },
  {
    competencyId: 'c-norm-1nf',
    prompts: [
      'Was fordert die 1. Normalform?',
      'Warum verletzen Listen in einer Spalte die 1NF?',
      'Wie erkennt man Wiederholungsgruppen in einer Tabelle?',
      'Wie zerlegt man eine Tabelle in die 1. Normalform?',
      'Was bedeutet ein atomarer Wert im Kontext der 1NF?',
      'Sind JSON-Spalten im Hinblick auf 1NF problematisch?',
      'Welche Auswirkungen hat 1NF auf Suchbarkeit und Auswertung?',
      'Wann ist eine Kindtabelle besser als eine Sammelspalte?',
      'Wie prüft man, ob Importdaten 1NF-konform sind?',
      'Welche typischen Gegenbeispiele zur 1NF gibt es in der Praxis?'
    ]
  },
  {
    competencyId: 'c-norm-2nf',
    prompts: [
      'Was verlangt die 2. Normalform zusätzlich zur 1NF?',
      'Wann liegt eine partielle Abhängigkeit vor?',
      'Warum betrifft die 2NF vor allem zusammengesetzte Schlüssel?',
      'Wie erkennt man Attribute, die nur von einem Teilschlüssel abhängen?',
      'Wie zerlegt man eine Tabelle in die 2. Normalform?',
      'Welche Redundanzen beseitigt die 2NF?',
      'Wann ist eine Tabelle automatisch in der 2NF?',
      'Wie hängt die 2NF mit Zwischentabellen zusammen?',
      'Welche Fehler entstehen, wenn man die 2NF nur formal prüft?',
      'Wie testet man partielle Abhängigkeiten anhand von Beispieldaten?'
    ]
  },
  {
    competencyId: 'c-norm-3nf',
    prompts: [
      'Was fordert die 3. Normalform zusätzlich zur 2NF?',
      'Was ist eine transitive Abhängigkeit?',
      'Wie erkennt man Nicht-Schlüsselattribute, die andere Nicht-Schlüsselattribute bestimmen?',
      'Wie zerlegt man ein Schema in die 3. Normalform?',
      'Warum reduziert die 3NF Änderungsanomalien?',
      'Wann ist eine Lookup-Tabelle ein typisches Ergebnis der 3NF?',
      'Welche Geschäftsregeln bleiben trotz 3NF außerhalb des Schemas?',
      'Wie unterscheidet sich 3NF von bloßer Spaltentrennung?',
      'Wann ist eine 3NF-Zerlegung verlustfrei?',
      'Welche Beispiele veranschaulichen transitive Abhängigkeiten besonders gut?'
    ]
  },
  {
    competencyId: 'c-norm-bcnf',
    prompts: [
      'Worin unterscheidet sich BCNF von der 3. Normalform?',
      'Wann verletzt eine Tabelle BCNF, obwohl sie bereits in 3NF ist?',
      'Was ist ein Determinant in der BCNF-Betrachtung?',
      'Warum spielt BCNF oft bei mehreren Kandidatenschlüsseln eine Rolle?',
      'Wie zerlegt man eine Tabelle in BCNF?',
      'Welche Nachteile kann eine BCNF-Zerlegung für Abfragen haben?',
      'Wie prüft man, ob alle Determinanten Superschlüssel sind?',
      'Wann akzeptiert man bewusst 3NF statt BCNF?',
      'Welche klassischen Beispiele illustrieren BCNF gut?',
      'Wie bewertet man den Trade-off zwischen BCNF und Abfragekomfort?'
    ]
  },
  {
    competencyId: 'c-norm-anomalies',
    prompts: [
      'Was ist eine Einfügeanomalie?',
      'Was ist eine Änderungsanomalie?',
      'Was ist eine Löschanomalie?',
      'Wie entstehen Anomalien durch Redundanz?',
      'Woran erkennt man eine Tabelle mit hohem Anomalierisiko?',
      'Welche Beispieldaten zeigen eine Änderungsanomalie besonders deutlich?',
      'Warum können NULL-Felder Anomalien verdecken?',
      'Wie reduziert Normalisierung das Risiko für Anomalien?',
      'Wann können Anomalien trotz normalisierter Tabellen auftreten?',
      'Wie erklärt man Anomalien fachlichen Stakeholdern verständlich?'
    ]
  },
  {
    competencyId: 'c-norm-dependencies',
    prompts: [
      'Was ist eine funktionale Abhängigkeit?',
      'Wie liest man die Notation A -> B?',
      'Was ist eine vollständige funktionale Abhängigkeit?',
      'Was ist eine partielle Abhängigkeit?',
      'Was ist eine transitive Abhängigkeit?',
      'Wie ermittelt man funktionale Abhängigkeiten aus Fachregeln?',
      'Wozu dient die Attributhülle in der Analyse?',
      'Wie helfen funktionale Abhängigkeiten bei der Schlüsselbestimmung?',
      'Warum lassen sich Abhängigkeiten nicht sicher nur aus Beispieldaten ableiten?',
      'Welche Fehler entstehen durch falsch angenommene Abhängigkeiten?'
    ]
  },
  {
    competencyId: 'c-concurrency',
    prompts: [
      'Warum braucht man Nebenläufigkeitskontrolle in Datenbanksystemen?',
      'Welche Probleme entstehen bei gleichzeitigen Schreibzugriffen?',
      'Was ist der Unterschied zwischen pessimistischem und optimistischem Sperren?',
      'Wann setzt man Versionierung zur Konflikterkennung ein?',
      'Wie beeinflusst Concurrency Control die Performance eines Systems?',
      'Warum können lange Datenbankoperationen die Nebenläufigkeit verschlechtern?',
      'Wie verhindert man verlorene Updates in Web-Anwendungen?',
      'Wann ist Serialisierbarkeit für einen Geschäftsfall wichtig?',
      'Welche Rolle übernimmt das DBMS gegenüber der Anwendung bei Parallelität?',
      'Wie testet man Race Conditions in datenbanknahen Abläufen?'
    ]
  },
  {
    competencyId: 'c-isolation-levels',
    prompts: [
      'Welche Isolation Levels definiert der SQL-Standard?',
      'Was erlaubt READ UNCOMMITTED?',
      'Wann ist READ COMMITTED in der Praxis ausreichend?',
      'Welche Probleme verhindert REPEATABLE READ?',
      'Was garantiert SERIALIZABLE?',
      'Wie wirkt sich ein höheres Isolation Level auf den Durchsatz aus?',
      'Wann kann Snapshot Isolation sinnvoll sein?',
      'Warum unterscheiden sich Isolation Levels je nach Datenbanksystem?',
      'Welche Tests zeigen die Unterschiede zwischen Isolation Levels gut?',
      'Wie wählt man ein passendes Isolation Level für einen Geschäftsprozess?'
    ]
  },
  {
    competencyId: 'c-concurrency-issues',
    prompts: [
      'Was ist ein Dirty Read?',
      'Was ist ein Non-Repeatable Read?',
      'Was ist ein Phantom Read?',
      'Was ist ein Lost Update?',
      'In welcher Situation entsteht ein Write Skew?',
      'Wie kann man Race Conditions im Anwendungscode reproduzierbar machen?',
      'Welche Probleme treten bei gleichzeitiger Reservierung derselben Ressource auf?',
      'Wie verhindert man doppelte Buchungen durch parallele Zugriffe?',
      'Warum sind Nebenläufigkeitsfehler oft schwer reproduzierbar?',
      'Welche Logs oder Metriken helfen bei der Analyse von Concurrency-Problemen?'
    ]
  }
]

const createQuestions = (competencyId: string, prompts: string[]): Question[] => {
  if (prompts.length !== 10) {
    throw new Error(`Expected exactly 10 questions for ${competencyId}, got ${prompts.length}`)
  }

  return prompts.map((prompt, index) => ({
    id: `${competencyId}-q${index + 1}`,
    text: prompt,
    title: prompt,
    competencyIds: [competencyId],
    competencyLinks: [{ competencyId, relation: 'required', weight: 1 }],
    difficulty: difficultyPattern[index]
  }))
}

export const questions: Question[] = questionBank.flatMap(({ competencyId, prompts }) =>
  createQuestions(competencyId, prompts)
)
