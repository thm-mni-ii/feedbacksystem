import type { Competency, Question } from '@/model/types'

export const competencies: Competency[] = [
  // ============================================================
  // KATEGORIE: SQL
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
    parentId: 'c-sql'
  },
  {
    id: 'c-sql-joins',
    name: 'JOINs',
    description: 'INNER JOIN, OUTER JOIN, CROSS JOIN',
    parentId: 'c-sql'
  },
  {
    id: 'c-sql-dml',
    name: 'DML Operationen',
    description: 'INSERT, UPDATE, DELETE',
    parentId: 'c-sql'
  },
  {
    id: 'c-sql-aggregation',
    name: 'Aggregation & Gruppierung',
    description: 'COUNT, SUM, AVG, GROUP BY, HAVING',
    parentId: 'c-sql'
  },
  {
    id: 'c-sql-subqueries',
    name: 'Subqueries',
    description: 'Verschachtelte Abfragen',
    parentId: 'c-sql'
  },
  {
    id: 'c-sql-advanced',
    name: 'SQL Fortgeschritten',
    description: 'Views, Stored Procedures',
    parentId: 'c-sql'
  },

  // ============================================================
  // KATEGORIE: Datenbankdesign
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
    parentId: 'c-db-design'
  },
  {
    id: 'c-ser-model',
    name: 'SER-Modellierung',
    description: 'System Entity Relationship Modellierung',
    parentId: 'c-db-design'
  },
  {
    id: 'c-er-typ',
    name: 'ER-Typen',
    description: 'Entity-Relationship Typen und Attribute',
    parentId: 'c-ser-model'
  },
  {
    id: 'c-er-entities',
    name: 'Entitäten & Beziehungen',
    description: 'Entitäten, Beziehungen, Kardinalitäten',
    parentId: 'c-er-model'
  },
  {
    id: 'c-er-cardinality',
    name: 'Kardinalitäten',
    description: '1:1, 1:n, n:m Beziehungen',
    parentId: 'c-er-model'
  },

  // ============================================================
  // KATEGORIE: Normalisierung
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
    parentId: 'c-normalization'
  },
  {
    id: 'c-norm-2nf',
    name: '2. Normalform (2NF)',
    description: 'Keine partiellen Abhängigkeiten',
    parentId: 'c-normalization'
  },
  {
    id: 'c-norm-3nf',
    name: '3. Normalform (3NF)',
    description: 'Keine transitiven Abhängigkeiten',
    parentId: 'c-normalization'
  },
  {
    id: 'c-norm-bcnf',
    name: 'BCNF',
    description: 'Boyce-Codd Normalform',
    parentId: 'c-normalization'
  },
  {
    id: 'c-norm-anomalies',
    name: 'Datenbankanomalien',
    description: 'Einfüge-, Änderungs-, Löschanomalien',
    parentId: 'c-normalization'
  },
  {
    id: 'c-norm-dependencies',
    name: 'Funktionale Abhängigkeiten',
    description: 'Funktionale und transitive Abhängigkeiten',
    parentId: 'c-normalization'
  },

  // ============================================================
  // KATEGORIE: Schlüssel & Integrität
  // ============================================================
  {
    id: 'c-keys',
    name: 'Schlüssel',
    description: 'Primär-, Fremd- und Kandidatschlüssel',
    category: 'database'
  },
  {
    id: 'c-key-primary',
    name: 'Primärschlüssel',
    description: 'Eindeutige Identifikation von Tupeln',
    parentId: 'c-keys'
  },
  {
    id: 'c-key-foreign',
    name: 'Fremdschlüssel',
    description: 'Referenzielle Integrität',
    parentId: 'c-keys'
  },
  {
    id: 'c-key-candidate',
    name: 'Kandidatschlüssel',
    description: 'Potenzielle Primärschlüssel',
    parentId: 'c-keys'
  },
  {
    id: 'c-key-composite',
    name: 'Zusammengesetzte Schlüssel',
    description: 'Schlüssel aus mehreren Attributen',
    parentId: 'c-keys'
  },
  {
    id: 'c-integrity',
    name: 'Datenintegrität',
    description: 'Referenzielle Integrität, Constraints',
    parentId: 'c-keys'
  },

  // ============================================================
  // KATEGORIE: Transaktionen & Concurrency
  // ============================================================
  {
    id: 'c-transactions',
    name: 'Transaktionen',
    description: 'ACID Properties und Transaktionsmanagement',
    category: 'database'
  },
  {
    id: 'c-acid',
    name: 'ACID Properties',
    description: 'Atomicity, Consistency, Isolation, Durability',
    parentId: 'c-transactions'
  },
  {
    id: 'c-locks',
    name: 'Locks & Deadlocks',
    description: 'Sperrmechanismen und Verklemmungen',
    parentId: 'c-transactions'
  },

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
    parentId: 'c-concurrency'
  },
  {
    id: 'c-concurrency-issues',
    name: 'Concurrency Issues',
    description: 'Dirty Read, Lost Update, Phantom Read',
    parentId: 'c-concurrency'
  },

  // ============================================================
  // KATEGORIE: Indizes & Performance
  // ============================================================
  {
    id: 'c-indexes',
    name: 'Indizes',
    description: 'Performanceoptimierung durch Indizes',
    category: 'database'
  },
  {
    id: 'c-index-btree',
    name: 'B-Tree Indizes',
    description: 'Balancierte Baumindizes',
    parentId: 'c-indexes'
  },
  {
    id: 'c-index-hash',
    name: 'Hash Indizes',
    description: 'Hash-basierte Indizes',
    parentId: 'c-indexes'
  },

  {
    id: 'c-db-architecture',
    name: 'Datenbankarchitektur',
    description: 'Struktur relationaler Datenbanksysteme',
    category: 'database'
  },

  // ============================================================
  // KATEGORIE: Objektorientierte Programmierung
  // ============================================================
  {
    id: 'c-oop',
    name: 'Objektorientierte Programmierung',
    description: 'OOP Konzepte und Prinzipien',
    category: 'programming'
  },
  {
    id: 'c-oop-basics',
    name: 'OOP Grundlagen',
    description: 'Klassen, Objekte, Vererbung',
    parentId: 'c-oop'
  },
  {
    id: 'c-oop-inheritance',
    name: 'Vererbung',
    description: 'Klassenhierarchien und Methodenüberschreibung',
    parentId: 'c-oop-basics'
  },
  {
    id: 'c-oop-polymorphism',
    name: 'Polymorphismus',
    description: 'Methoden- und Operator-Polymorphismus',
    parentId: 'c-oop'
  },
  {
    id: 'c-oop-encapsulation',
    name: 'Kapselung',
    description: 'Datenkapselung und Information Hiding',
    parentId: 'c-oop'
  },
  {
    id: 'c-oop-abstraction',
    name: 'Abstraktion',
    description: 'Abstraktion und Interface Design',
    parentId: 'c-oop'
  },

  {
    id: 'c-design-patterns',
    name: 'Design Patterns',
    description: 'Entwurfsmuster und Best Practices',
    category: 'programming'
  },
  {
    id: 'c-pattern-singleton',
    name: 'Singleton Pattern',
    description: 'Singleton-Muster und Variationen',
    parentId: 'c-design-patterns'
  },
  {
    id: 'c-pattern-factory',
    name: 'Factory Pattern',
    description: 'Factory-Methode und Abstract Factory',
    parentId: 'c-design-patterns'
  },

  // ============================================================
  // KATEGORIE: UML & Modellierung
  // ============================================================
  {
    id: 'c-uml',
    name: 'UML',
    description: 'Unified Modeling Language',
    category: 'modeling'
  },
  {
    id: 'c-uml-class-diag',
    name: 'Klassendiagramme',
    description: 'UML Klassendiagramme und Notationen',
    parentId: 'c-uml'
  },
  {
    id: 'c-uml-sequence-diag',
    name: 'Sequenzdiagramme',
    description: 'UML Sequenzdiagramme und Abläufe',
    parentId: 'c-uml'
  }
]

/**
 * QUESTIONS: Refaktoriert
 *
 * Neu:
 * - competencyIds statt skillId + tags
 * - title optional (für Kompatibilität)
 */
export const questions: Question[] = [
  // SQL: SELECT
  {
    id: 'q1',
    text: 'Was ist ein SELECT Statement?',
    title: 'Was ist ein SELECT Statement?',
    competencyIds: ['c-sql', 'c-sql-select'],
    difficulty: 0.23
  },
  {
    id: 'q44',
    text: 'Wie funktioniert ORDER BY?',
    title: 'Wie funktioniert ORDER BY?',
    competencyIds: ['c-sql-select'],
    difficulty: 0.17
  },
  {
    id: 'q45',
    text: 'Was bewirkt DISTINCT?',
    title: 'Was bewirkt DISTINCT?',
    competencyIds: ['c-sql-select'],
    difficulty: 0.33
  },
  {
    id: 'q46',
    text: 'Was ist LIMIT?',
    title: 'Was ist LIMIT?',
    competencyIds: ['c-sql-select'],
    difficulty: 0.11
  },

  // SQL: JOINs
  {
    id: 'q2',
    text: 'Wie funktioniert INNER JOIN?',
    title: 'Wie funktioniert INNER JOIN?',
    competencyIds: ['c-sql', 'c-sql-joins'],
    difficulty: 0.45
  },
  {
    id: 'q8',
    text: 'Wie funktioniert OUTER JOIN?',
    title: 'Wie funktioniert OUTER JOIN?',
    competencyIds: ['c-sql-joins'],
    difficulty: 0.51
  },
  {
    id: 'q14',
    text: 'Wie funktioniert ein CROSS JOIN?',
    title: 'Wie funktioniert ein CROSS JOIN?',
    competencyIds: ['c-sql-joins'],
    difficulty: 0.58
  },

  // SQL: DML
  {
    id: 'q3',
    text: 'DELETE vs. TRUNCATE?',
    title: 'DELETE vs. TRUNCATE?',
    competencyIds: ['c-sql-dml'],
    difficulty: 0.61
  },
  {
    id: 'q9',
    text: 'Wofür wird UPDATE verwendet?',
    title: 'Wofür wird UPDATE verwendet?',
    competencyIds: ['c-sql-dml'],
    difficulty: 0.28
  },
  {
    id: 'q10',
    text: 'Wie funktioniert INSERT INTO?',
    title: 'Wie funktioniert INSERT INTO?',
    competencyIds: ['c-sql-dml'],
    difficulty: 0.19
  },

  // SQL: Aggregation
  {
    id: 'q11',
    text: 'Wann verwendet man GROUP BY?',
    title: 'Wann verwendet man GROUP BY?',
    competencyIds: ['c-sql-aggregation'],
    difficulty: 0.49
  },
  {
    id: 'q13',
    text: 'Was ist der Unterschied zwischen WHERE und HAVING?',
    title: 'Was ist der Unterschied zwischen WHERE und HAVING?',
    competencyIds: ['c-sql-aggregation'],
    difficulty: 0.66
  },
  {
    id: 'q41',
    text: 'Was macht COUNT(*)?',
    title: 'Was macht COUNT(*)?',
    competencyIds: ['c-sql-aggregation'],
    difficulty: 0.12
  },
  {
    id: 'q42',
    text: 'Wofür wird SUM() verwendet?',
    title: 'Wofür wird SUM() verwendet?',
    competencyIds: ['c-sql-aggregation'],
    difficulty: 0.14
  },
  {
    id: 'q43',
    text: 'Wann verwendet man AVG()?',
    title: 'Wann verwendet man AVG()?',
    competencyIds: ['c-sql-aggregation'],
    difficulty: 0.21
  },

  // SQL: Subqueries
  {
    id: 'q12',
    text: 'Was sind Unterabfragen (Subqueries)?',
    title: 'Was sind Unterabfragen (Subqueries)?',
    competencyIds: ['c-sql-subqueries'],
    difficulty: 0.73
  },

  // SQL: Advanced
  {
    id: 'q47',
    text: 'Was ist eine View?',
    title: 'Was ist eine View?',
    competencyIds: ['c-sql-advanced'],
    difficulty: 0.57
  },
  {
    id: 'q48',
    text: 'Welche Vorteile bieten Views?',
    title: 'Welche Vorteile bieten Views?',
    competencyIds: ['c-sql-advanced'],
    difficulty: 0.62
  },
  {
    id: 'q49',
    text: 'Was ist eine Stored Procedure?',
    title: 'Was ist eine Stored Procedure?',
    competencyIds: ['c-sql-advanced'],
    difficulty: 0.79
  },
  {
    id: 'q50',
    text: 'Wann verwendet man Stored Procedures?',
    title: 'Wann verwendet man Stored Procedures?',
    competencyIds: ['c-sql-advanced'],
    difficulty: 0.74
  },

  // ER-Modellierung
  {
    id: 'q4',
    text: 'Was ist die 3. Normalform?',
    title: 'Was ist die 3. Normalform?',
    competencyIds: ['c-er-model', 'c-norm-3nf'],
    difficulty: 0.82
  },
  {
    id: 'q5',
    text: 'Wie erstellt man ein ER-Diagramm?',
    title: 'Wie erstellt man ein ER-Diagramm?',
    competencyIds: ['c-er-model'],
    difficulty: 0.54
  },
  {
    id: 'q27',
    text: 'Was ist eine Entität?',
    title: 'Was ist eine Entität?',
    competencyIds: ['c-er-entities'],
    difficulty: 0.22
  },
  {
    id: 'q28',
    text: 'Was ist eine Beziehung im ER-Modell?',
    title: 'Was ist eine Beziehung im ER-Modell?',
    competencyIds: ['c-er-entities'],
    difficulty: 0.31
  },
  {
    id: 'q29',
    text: 'Was ist eine n:m-Beziehung?',
    title: 'Was ist eine n:m-Beziehung?',
    competencyIds: ['c-er-cardinality'],
    difficulty: 0.55
  },
  {
    id: 'q30',
    text: 'Wie werden Kardinalitäten dargestellt?',
    title: 'Wie werden Kardinalitäten dargestellt?',
    competencyIds: ['c-er-cardinality'],
    difficulty: 0.47
  },
  {
    id: 'q64',
    text: 'Welche Kardinalitäten gibt es?',
    title: 'Welche Kardinalitäten gibt es?',
    competencyIds: ['c-er-cardinality'],
    difficulty: 0.42
  },
  {
    id: 'q65',
    text: 'Wie wird eine n:m-Beziehung relational umgesetzt?',
    title: 'Wie wird eine n:m-Beziehung relational umgesetzt?',
    competencyIds: ['c-er-cardinality'],
    difficulty: 0.75
  },

  // Normalisierung
  {
    id: 'q15',
    text: 'Was ist die 1. Normalform?',
    title: 'Was ist die 1. Normalform?',
    competencyIds: ['c-norm-1nf'],
    difficulty: 0.41
  },
  {
    id: 'q16',
    text: 'Was ist die 2. Normalform?',
    title: 'Was ist die 2. Normalform?',
    competencyIds: ['c-norm-2nf'],
    difficulty: 0.68
  },
  {
    id: 'q17',
    text: 'Wann verletzt ein Schema die BCNF?',
    title: 'Wann verletzt ein Schema die BCNF?',
    competencyIds: ['c-norm-bcnf'],
    difficulty: 0.94
  },
  {
    id: 'q18',
    text: 'Warum wird normalisiert?',
    title: 'Warum wird normalisiert?',
    competencyIds: ['c-normalization'],
    difficulty: 0.37
  },
  {
    id: 'q51',
    text: 'Was sind funktionale Abhängigkeiten?',
    title: 'Was sind funktionale Abhängigkeiten?',
    competencyIds: ['c-norm-dependencies'],
    difficulty: 0.87
  },
  {
    id: 'q52',
    text: 'Was sind transitive Abhängigkeiten?',
    title: 'Was sind transitive Abhängigkeiten?',
    competencyIds: ['c-norm-dependencies'],
    difficulty: 0.91
  },
  {
    id: 'q53',
    text: 'Welche Anomalien verhindert Normalisierung?',
    title: 'Welche Anomalien verhindert Normalisierung?',
    competencyIds: ['c-norm-anomalies'],
    difficulty: 0.69
  },
  {
    id: 'q54',
    text: 'Was ist eine Einfügeanomalie?',
    title: 'Was ist eine Einfügeanomalie?',
    competencyIds: ['c-norm-anomalies'],
    difficulty: 0.65
  },
  {
    id: 'q55',
    text: 'Was ist eine Löschanomalie?',
    title: 'Was ist eine Löschanomalie?',
    competencyIds: ['c-norm-anomalies'],
    difficulty: 0.67
  },

  // Schlüssel
  {
    id: 'q36',
    text: 'Was ist ein Primärschlüssel?',
    title: 'Was ist ein Primärschlüssel?',
    competencyIds: ['c-key-primary'],
    difficulty: 0.18
  },
  {
    id: 'q37',
    text: 'Was ist ein Fremdschlüssel?',
    title: 'Was ist ein Fremdschlüssel?',
    competencyIds: ['c-key-foreign'],
    difficulty: 0.29
  },
  {
    id: 'q61',
    text: 'Was ist ein Kandidatschlüssel?',
    title: 'Was ist ein Kandidatschlüssel?',
    competencyIds: ['c-key-candidate'],
    difficulty: 0.72
  },
  {
    id: 'q62',
    text: 'Was ist ein Surrogatschlüssel?',
    title: 'Was ist ein Surrogatschlüssel?',
    competencyIds: ['c-key-composite'],
    difficulty: 0.53
  },
  {
    id: 'q63',
    text: 'Wann verwendet man zusammengesetzte Schlüssel?',
    title: 'Wann verwendet man zusammengesetzte Schlüssel?',
    competencyIds: ['c-key-composite'],
    difficulty: 0.61
  },

  // Integrität
  {
    id: 'q38',
    text: 'Was versteht man unter referenzieller Integrität?',
    title: 'Was versteht man unter referenzieller Integrität?',
    competencyIds: ['c-integrity'],
    difficulty: 0.63
  },

  // Datenbankarchitektur
  {
    id: 'q39',
    text: 'Was ist eine relationale Datenbank?',
    title: 'Was ist eine relationale Datenbank?',
    competencyIds: ['c-db-architecture'],
    difficulty: 0.25
  },
  {
    id: 'q40',
    text: 'Welche Vorteile bieten relationale Datenbanken?',
    title: 'Welche Vorteile bieten relationale Datenbanken?',
    competencyIds: ['c-db-architecture'],
    difficulty: 0.38
  },

  // Transaktionen
  {
    id: 'q19',
    text: 'Was bedeutet ACID?',
    title: 'Was bedeutet ACID?',
    competencyIds: ['c-acid'],
    difficulty: 0.76
  },
  {
    id: 'q20',
    text: 'Was ist eine Datenbanktransaktion?',
    title: 'Was ist eine Datenbanktransaktion?',
    competencyIds: ['c-transactions'],
    difficulty: 0.48
  },
  {
    id: 'q21',
    text: 'Wozu dienen Locks?',
    title: 'Wozu dienen Locks?',
    competencyIds: ['c-locks'],
    difficulty: 0.71
  },
  {
    id: 'q22',
    text: 'Was ist ein Deadlock?',
    title: 'Was ist ein Deadlock?',
    competencyIds: ['c-locks'],
    difficulty: 0.83
  },
  {
    id: 'q56',
    text: 'Was bedeutet Isolation bei ACID?',
    title: 'Was bedeutet Isolation bei ACID?',
    competencyIds: ['c-acid'],
    difficulty: 0.77
  },

  // Concurrency
  {
    id: 'q57',
    text: 'Was ist ein Lost Update?',
    title: 'Was ist ein Lost Update?',
    competencyIds: ['c-concurrency-issues'],
    difficulty: 0.84
  },
  {
    id: 'q58',
    text: 'Welche Isolation Levels gibt es?',
    title: 'Welche Isolation Levels gibt es?',
    competencyIds: ['c-isolation-levels'],
    difficulty: 0.95
  },
  {
    id: 'q59',
    text: 'Was ist Dirty Read?',
    title: 'Was ist Dirty Read?',
    competencyIds: ['c-concurrency-issues'],
    difficulty: 0.86
  },
  {
    id: 'q60',
    text: 'Was ist Phantom Read?',
    title: 'Was ist Phantom Read?',
    competencyIds: ['c-concurrency-issues'],
    difficulty: 0.92
  },

  // Indizes
  {
    id: 'q23',
    text: 'Was ist ein Index?',
    title: 'Was ist ein Index?',
    competencyIds: ['c-indexes'],
    difficulty: 0.52
  },
  {
    id: 'q24',
    text: 'Wann verbessert ein Index die Performance?',
    title: 'Wann verbessert ein Index die Performance?',
    competencyIds: ['c-indexes'],
    difficulty: 0.64
  },
  {
    id: 'q25',
    text: 'Wie funktioniert ein B-Tree Index?',
    title: 'Wie funktioniert ein B-Tree Index?',
    competencyIds: ['c-index-btree'],
    difficulty: 0.89
  },
  {
    id: 'q26',
    text: 'Wann eignet sich ein Hash-Index?',
    title: 'Wann eignet sich ein Hash-Index?',
    competencyIds: ['c-index-hash'],
    difficulty: 0.81
  },

  // OOP
  {
    id: 'q6',
    text: 'Was ist eine Klasse in OOP?',
    title: 'Was ist eine Klasse in OOP?',
    competencyIds: ['c-oop-basics'],
    difficulty: 0.15
  },
  {
    id: 'q7',
    text: 'Was ist Polymorphismus?',
    title: 'Was ist Polymorphismus?',
    competencyIds: ['c-oop-polymorphism'],
    difficulty: 0.78
  },
  {
    id: 'q31',
    text: 'Was versteht man unter Vererbung?',
    title: 'Was versteht man unter Vererbung?',
    competencyIds: ['c-oop-inheritance'],
    difficulty: 0.39
  },
  {
    id: 'q32',
    text: 'Was ist Kapselung?',
    title: 'Was ist Kapselung?',
    competencyIds: ['c-oop-encapsulation'],
    difficulty: 0.43
  },
  {
    id: 'q33',
    text: 'Was bedeutet Abstraktion?',
    title: 'Was bedeutet Abstraktion?',
    competencyIds: ['c-oop-abstraction'],
    difficulty: 0.59
  },
  {
    id: 'q34',
    text: 'Was ist Methodenüberschreibung?',
    title: 'Was ist Methodenüberschreibung?',
    competencyIds: ['c-oop-inheritance'],
    difficulty: 0.56
  },
  {
    id: 'q35',
    text: 'Was ist der Unterschied zwischen Klasse und Objekt?',
    title: 'Was ist der Unterschied zwischen Klasse und Objekt?',
    competencyIds: ['c-oop-basics'],
    difficulty: 0.34
  },

  // Design Patterns
  {
    id: 'q71',
    text: 'Was ist das Singleton Pattern?',
    title: 'Was ist das Singleton Pattern?',
    competencyIds: ['c-pattern-singleton'],
    difficulty: 0.68
  },
  {
    id: 'q72',
    text: 'Welche Nachteile hat Singleton?',
    title: 'Welche Nachteile hat Singleton?',
    competencyIds: ['c-pattern-singleton'],
    difficulty: 0.74
  },
  {
    id: 'q73',
    text: 'Was ist das Factory Pattern?',
    title: 'Was ist das Factory Pattern?',
    competencyIds: ['c-pattern-factory'],
    difficulty: 0.71
  },
  {
    id: 'q74',
    text: 'Wann verwendet man eine Factory?',
    title: 'Wann verwendet man eine Factory?',
    competencyIds: ['c-pattern-factory'],
    difficulty: 0.66
  },

  // UML
  {
    id: 'q75',
    text: 'Was zeigt ein Klassendiagramm?',
    title: 'Was zeigt ein Klassendiagramm?',
    competencyIds: ['c-uml-class-diag'],
    difficulty: 0.46
  },
  {
    id: 'q76',
    text: 'Was zeigt ein Sequenzdiagramm?',
    title: 'Was zeigt ein Sequenzdiagramm?',
    competencyIds: ['c-uml-sequence-diag'],
    difficulty: 0.59
  },
  {
    id: 'q77',
    text: 'Wie werden Assoziationen dargestellt?',
    title: 'Wie werden Assoziationen dargestellt?',
    competencyIds: ['c-uml-class-diag'],
    difficulty: 0.52
  },
  {
    id: 'q78',
    text: 'Wie wird Vererbung in UML dargestellt?',
    title: 'Wie wird Vererbung in UML dargestellt?',
    competencyIds: ['c-uml-class-diag'],
    difficulty: 0.48
  }
]
