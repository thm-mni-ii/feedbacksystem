import type { Competency, Question } from '@/model/types'
import { questionMocks, type QuestionMockItem } from '@/composables/question.mock'

type CompetencyMockItem = {
  _id: string
  name: string
  description?: string
  difficulty?: number
  courseId?: string | null
  isPublic?: boolean
  parentId?: string
  category?: string
  prerequisites?: Array<{
    competencyId: string
    minimumMastery?: number
  }>
}

const competencyMocks: CompetencyMockItem[] = [
  {
    _id: 'c-datenorganisation',
    name: 'Datenorganisation & Datenbankkonzept',
    description:
      'Logische/physische Datenorganisation, Dateikonzept vs. Datenbankkonzept, DBMS-Architektur',
    difficulty: 0.2,
    courseId: null,
    isPublic: true,
    category: 'database'
  },
  {
    _id: 'c-datenorg-dateikonzept',
    name: 'Dateikonzept vs. Datenbankkonzept',
    description: 'Nachteile des Dateikonzepts, Vorteile/Nachteile des Datenbankkonzepts',
    difficulty: 0.2,
    courseId: null,
    isPublic: true,
    parentId: 'c-datenorganisation'
  },
  {
    _id: 'c-datenorg-architektur',
    name: 'Drei-Schichten-Architektur (ANSI/SPARC)',
    description: 'Externe, konzeptionelle und interne Ebene eines Datenbanksystems',
    difficulty: 0.3,
    courseId: null,
    isPublic: true,
    parentId: 'c-datenorganisation'
  },
  {
    _id: 'c-datenorg-dbms',
    name: 'Datenbanksystem & DBMS-Aufgaben',
    description:
      'Aufbau eines Datenbanksystems, Aufgaben eines DBMS, Datenbankgeschichte, konkrete DBMS-Produkte',
    difficulty: 0.2,
    courseId: null,
    isPublic: true,
    parentId: 'c-datenorganisation'
  },
  {
    _id: 'c-modellierung',
    name: 'Semantische Datenmodellierung',
    description: 'Modellierung mit ERM, SERM und UML (Kapitel 3)',
    difficulty: 0.3,
    courseId: null,
    isPublic: true,
    category: 'database'
  },
  {
    _id: 'c-modellierung-grundbegriffe',
    name: 'ERM-Grundbegriffe',
    description: 'Entität, Entity-Typ, Attribut, Domäne, Beziehung/Relationship-Typ, Assoziation',
    difficulty: 0.1,
    courseId: null,
    isPublic: true,
    parentId: 'c-modellierung'
  },
  {
    _id: 'c-modellierung-kardinalitaeten',
    name: 'Kardinalitäten & Assoziationstypen',
    description:
      'Einfache, konditionelle, multiple und multipel-konditionelle Assoziationen; Min-Max-Notation',
    difficulty: 0.3,
    courseId: null,
    isPublic: true,
    parentId: 'c-modellierung',
    prerequisites: [
      {
        competencyId: 'c-modellierung-grundbegriffe'
      }
    ]
  },
  {
    _id: 'c-modellierung-schluessel',
    name: 'Schlüssel & referentielle Integrität',
    description:
      'Identifikationsschlüssel, Schlüsselvererbung, schwache Objekttypen, referentielle Integrität',
    difficulty: 0.3,
    courseId: null,
    isPublic: true,
    parentId: 'c-modellierung'
  },
  {
    _id: 'c-modellierung-generalisierung',
    name: 'Generalisierung',
    description:
      'Zerlegung/Zusammenfassung von Objekttypen, disjunkt/nicht-disjunkt, Aggregation, rekursive Beziehungen',
    difficulty: 0.4,
    courseId: null,
    isPublic: true,
    parentId: 'c-modellierung',
    prerequisites: [
      {
        competencyId: 'c-modellierung-grundbegriffe'
      }
    ]
  },
  {
    _id: 'c-modellierung-serm',
    name: 'Strukturiertes Entity-Relationship-Modell (SERM)',
    description:
      'Darstellungsregeln, Links-Rechts-Anordnung, Schlüsselvererbung im SERM, Vergleich zu ERM',
    difficulty: 0.4,
    courseId: null,
    isPublic: true,
    parentId: 'c-modellierung',
    prerequisites: [
      {
        competencyId: 'c-modellierung-kardinalitaeten'
      }
    ]
  },
  {
    _id: 'c-modellierung-uml',
    name: 'UML-Datenmodellierung',
    description:
      'Klassendiagramm, Objektdiagramm, Assoziationen, Aggregation/Komposition, Vergleich UML-ERM',
    difficulty: 0.3,
    courseId: null,
    isPublic: true,
    parentId: 'c-modellierung'
  },
  {
    _id: 'c-relationenmodell',
    name: 'Logischer Datenbankentwurf',
    description:
      'Datenmodelle (hierarchisch, Netzwerk, objektorientiert, relational) und Transformation ins Relationenmodell (Kapitel 4)',
    difficulty: 0.3,
    courseId: null,
    isPublic: true,
    category: 'database'
  },
  {
    _id: 'c-relationenmodell-datenmodelle',
    name: 'Historische Datenmodelle',
    description:
      'Hierarchisches Modell, Netzwerkmodell, objektorientiertes Modell: Eigenschaften, Vor-/Nachteile',
    difficulty: 0.2,
    courseId: null,
    isPublic: true,
    parentId: 'c-relationenmodell'
  },
  {
    _id: 'c-relationenmodell-grundlagen',
    name: 'Grundlagen des Relationenmodells',
    description: 'Relation, Tupel, Grad, Domäne, Eigenschaften und Vorteile des Relationenmodells',
    difficulty: 0.2,
    courseId: null,
    isPublic: true,
    parentId: 'c-relationenmodell'
  },
  {
    _id: 'c-relationenmodell-transformation',
    name: 'Relationsmodell Transformation',
    description: 'Regeln zur Ableitung von Tabellen aus Entity-Typen und Beziehungstypen',
    difficulty: 0.4,
    courseId: null,
    isPublic: true,
    parentId: 'c-relationenmodell',
    prerequisites: [
      {
        competencyId: 'c-modellierung-grundbegriffe'
      },
      {
        competencyId: 'c-relationenmodell-grundlagen'
      }
    ]
  },
  {
    _id: 'c-normalisierung',
    name: 'Normalisierung',
    description:
      'Normalformen, funktionale Abhängigkeiten und referentielle Integrität (Kapitel 4)',
    difficulty: 0.3,
    courseId: null,
    isPublic: true,
    category: 'database'
  },
  {
    _id: 'c-normalisierung-grundlagen',
    name: 'Ziele der Normalisierung & Schlüsselbegriffe',
    description: 'Mutationsanomalien, Identifikator, Schlüsselkandidat, Primär-/Fremdschlüssel',
    difficulty: 0.2,
    courseId: null,
    isPublic: true,
    parentId: 'c-normalisierung'
  },
  {
    _id: 'c-normalisierung-1nf',
    name: 'Erste Normalform (1NF)',
    description: 'Atomare Attributwerte',
    difficulty: 0.2,
    courseId: null,
    isPublic: true,
    parentId: 'c-normalisierung'
  },
  {
    _id: 'c-normalisierung-2nf',
    name: 'Zweite Normalform (2NF)',
    description: 'Vollfunktionale Abhängigkeit, funktionale Abhängigkeit',
    difficulty: 0.3,
    courseId: null,
    isPublic: true,
    parentId: 'c-normalisierung',
    prerequisites: [
      {
        competencyId: 'c-normalisierung-1nf'
      }
    ]
  },
  {
    _id: 'c-normalisierung-3nf-bcnf',
    name: 'Dritte Normalform & Boyce-Codd-Normalform',
    description: 'Transitive Abhängigkeit, Determinante, Schlüsselkandidat als Determinante',
    difficulty: 0.4,
    courseId: null,
    isPublic: true,
    parentId: 'c-normalisierung',
    prerequisites: [
      {
        competencyId: 'c-normalisierung-2nf'
      }
    ]
  },
  {
    _id: 'c-normalisierung-4nf-5nf',
    name: 'Vierte und fünfte Normalform',
    description: 'Mehrwertige Abhängigkeit, Verbundabhängigkeit',
    difficulty: 0.5,
    courseId: null,
    isPublic: true,
    parentId: 'c-normalisierung',
    prerequisites: [
      {
        competencyId: 'c-normalisierung-3nf-bcnf'
      }
    ]
  },
  {
    _id: 'c-normalisierung-ri',
    name: 'Referentielle Integrität & Änderungsregeln',
    description: 'RESTRICT, CASCADE, SET NULL, SET DEFAULT, NO ACTION',
    difficulty: 0.7,
    courseId: null,
    isPublic: true,
    parentId: 'c-normalisierung'
  },
  {
    _id: 'c-relationenalgebra',
    name: 'Relationenalgebra',
    description: 'Mathematische Grundlage relationaler Datenbankoperationen (Kapitel 5)',
    difficulty: 0.3,
    courseId: null,
    isPublic: true,
    category: 'database'
  },
  {
    _id: 'c-relationenalgebra-mengen',
    name: 'Mengenoperationen der Relationenalgebra',
    description:
      'Vereinigung, Durchschnitt, Differenz, symmetrische Differenz, kartesisches Produkt, Vereinigungsverträglichkeit',
    difficulty: 0.2,
    courseId: null,
    isPublic: true,
    parentId: 'c-relationenalgebra'
  },
  {
    _id: 'c-relationenalgebra-projektion-restriktion',
    name: 'Projektion & Restriktion',
    description: 'Auswahl von Spalten (Projektion) bzw. Zeilen (Restriktion/Selektion)',
    difficulty: 0.3,
    courseId: null,
    isPublic: true,
    parentId: 'c-relationenalgebra'
  },
  {
    _id: 'c-relationenalgebra-join',
    name: 'Verbund/Join-Operationen',
    description: 'Equi-Join, Natural Join, Left/Right/Full-Outer-Join',
    difficulty: 0.4,
    courseId: null,
    isPublic: true,
    parentId: 'c-relationenalgebra'
  },
  {
    _id: 'c-sql',
    name: 'SQL',
    description: 'Structured Query Language: DDL, DML, DQL, VDL, DCL (Kapitel 5)',
    difficulty: 0.7,
    courseId: null,
    isPublic: true,
    category: 'database'
  },
  {
    _id: 'c-sql-ddl',
    name: 'Data Definition Language (DDL)',
    description: 'CREATE/ALTER/DROP TABLE, Datentypen, Constraints',
    difficulty: 0.2,
    courseId: null,
    isPublic: true,
    parentId: 'c-sql'
  },
  {
    _id: 'c-sql-dml',
    name: 'Data Manipulation Language (DML)',
    description: 'INSERT, UPDATE, DELETE',
    difficulty: 0.5,
    courseId: null,
    isPublic: true,
    parentId: 'c-sql'
  },
  {
    _id: 'c-sql-select',
    name: 'SELECT / Datenretrieval',
    description:
      'SELECT, WHERE, JOIN, GROUP BY, HAVING, ORDER BY, Aggregatfunktionen, Unterabfragen',
    difficulty: 0.3,
    courseId: null,
    isPublic: true,
    parentId: 'c-sql',
    prerequisites: [
      {
        competencyId: 'c-sql-ddl'
      }
    ]
  },
  {
    _id: 'c-sql-views',
    name: 'Views',
    description: 'CREATE VIEW, Einsatzzwecke von Views',
    difficulty: 0.7,
    courseId: null,
    isPublic: true,
    parentId: 'c-sql'
  },
  {
    _id: 'c-sql-stored-procedures',
    name: 'Stored Procedures & Functions',
    description: 'Syntax, Parameter, Kontrollstrukturen, Cursor',
    difficulty: 0.4,
    courseId: null,
    isPublic: true,
    parentId: 'c-sql'
  },
  {
    _id: 'c-sql-trigger',
    name: 'Trigger',
    description: 'BEFORE/AFTER-Trigger, OLD/NEW-Werte, Einsatzzwecke',
    difficulty: 0.7,
    courseId: null,
    isPublic: true,
    parentId: 'c-sql'
  },
  {
    _id: 'c-sql-metadaten',
    name: 'Metadaten & Zugriffsrechte',
    description: 'Data Dictionary, information_schema, GRANT/REVOKE',
    difficulty: 0.3,
    courseId: null,
    isPublic: true,
    parentId: 'c-sql'
  },
  {
    _id: 'c-transaktionen',
    name: 'Transaktionsmanagement',
    description:
      'Konsistenz, Transaktionen, Nebenläufigkeitsprobleme, Sperrverfahren, Recovery (Kapitel 6)',
    difficulty: 0.8,
    courseId: null,
    isPublic: true,
    category: 'database'
  },
  {
    _id: 'c-transaktionen-grundlagen',
    name: 'Transaktionen & ACID-Prinzip',
    description: 'Definition Transaktion, Bestandteile, ACID-Eigenschaften',
    difficulty: 0.2,
    courseId: null,
    isPublic: true,
    parentId: 'c-transaktionen'
  },
  {
    _id: 'c-transaktionen-probleme',
    name: 'Nebenläufigkeitsprobleme',
    description: 'Lost Update, Dirty Read, Non-Repeatable Read, Serialisierbarkeit, Präzedenzgraph',
    difficulty: 0.4,
    courseId: null,
    isPublic: true,
    parentId: 'c-transaktionen'
  },
  {
    _id: 'c-transaktionen-sperrverfahren',
    name: 'Sperrverfahren & Deadlocks',
    description: 'Shared/Exclusive Locks, Zweiphasen-Sperrprotokoll, Deadlock-Erkennung',
    difficulty: 0.4,
    courseId: null,
    isPublic: true,
    parentId: 'c-transaktionen',
    prerequisites: [
      {
        competencyId: 'c-transaktionen-grundlagen'
      }
    ]
  },
  {
    _id: 'c-transaktionen-recovery',
    name: 'Datenrekonstruktion & Recovery',
    description: 'Logfile, Rollback, Restart, Rekonstruktion, Checkpoints',
    difficulty: 0.4,
    courseId: null,
    isPublic: true,
    parentId: 'c-transaktionen',
    prerequisites: [
      {
        competencyId: 'c-transaktionen-sperrverfahren'
      }
    ]
  },
  {
    _id: 'c-entwicklung',
    name: 'Datenbankentwicklung',
    description:
      'Vorgehensmodelle, Projektorganisation und -management für Datenbankprojekte (Kapitel 7)',
    difficulty: 0.6,
    courseId: null,
    isPublic: true,
    category: 'database'
  },
  {
    _id: 'c-entwicklung-vorgehensmodell',
    name: 'Vorgehensmodell & ARIS-Konzept',
    description:
      'Phasen des Datenbankentwurfs, ARIS-Sichten, klassisches sequentielles Vorgehensmodell',
    difficulty: 0.2,
    courseId: null,
    isPublic: true,
    parentId: 'c-entwicklung'
  },
  {
    _id: 'c-entwicklung-lastenpflichtenheft',
    name: 'Lasten- und Pflichtenheft',
    description: 'Zweck, Inhalt und Unterschiede von Lasten- und Pflichtenheft',
    difficulty: 0.2,
    courseId: null,
    isPublic: true,
    parentId: 'c-entwicklung'
  },
  {
    _id: 'c-entwicklung-projektorganisation',
    name: 'Projektorganisation',
    description: 'Stabs-, reine und Matrix-Projektorganisation; Projektbeteiligte',
    difficulty: 0.7,
    courseId: null,
    isPublic: true,
    parentId: 'c-entwicklung'
  }
]

const DEFAULT_MINIMUM_MASTERY = 0.6
const LEGACY_DIFFICULTY_MIN = 0.18
const LEGACY_DIFFICULTY_MAX = 0.85

function normalizeMinimumMastery(minimumMastery: number | undefined): number {
  if (typeof minimumMastery !== 'number' || !Number.isFinite(minimumMastery)) {
    return DEFAULT_MINIMUM_MASTERY
  }

  return Math.min(1, Math.max(0, minimumMastery))
}

function mapDifficultyToLegacyRange(difficulty: number): number {
  if (!Number.isFinite(difficulty)) {
    return (LEGACY_DIFFICULTY_MIN + LEGACY_DIFFICULTY_MAX) / 2
  }

  const clampedRawDifficulty = Math.min(3, Math.max(1, difficulty))
  const normalized = (clampedRawDifficulty - 1) / 2
  return LEGACY_DIFFICULTY_MIN + normalized * (LEGACY_DIFFICULTY_MAX - LEGACY_DIFFICULTY_MIN)
}

function toCompetency(competency: CompetencyMockItem): Competency {
  if (!competency._id) {
    throw new Error('Competency mock entry is missing _id.')
  }

  return {
    id: competency._id,
    name: competency.name,
    description: competency.description,
    parentId: competency.parentId ?? null,
    category: competency.category,
    prerequisites: competency.prerequisites?.map((prerequisite) => ({
      competencyId: prerequisite.competencyId,
      minimumMastery: normalizeMinimumMastery(prerequisite.minimumMastery)
    }))
  }
}

function toLearningQuestion(question: QuestionMockItem): Question {
  if (!question._id) {
    throw new Error('Question mock entry is missing _id.')
  }

  if (!question.questiontext) {
    throw new Error(`Question '${question._id}' is missing questiontext.`)
  }

  if (!Array.isArray(question.questiontags) || question.questiontags.length === 0) {
    throw new Error(`Question '${question._id}' must have at least one questiontag.`)
  }

  return {
    id: question._id,
    text: question.questiontext,
    title: question.questiontext,
    competencyIds: [...question.questiontags],
    competencyLinks: question.questiontags.map((competencyId) => ({
      competencyId,
      relation: 'required',
      weight: 1
    })),
    difficulty: mapDifficultyToLegacyRange(question.difficulty),
    excludeFromAlgorithm: question.excludeFromAlgorithm
  }
}

export const competencies: Competency[] = competencyMocks.map(toCompetency)
export const questions: Question[] = questionMocks.map(toLearningQuestion)
