// model/types.ts
// ============================================================
// REFACTORED: Einheitliches Competency-System
// Skills und Tags sind jetzt beide Competencies mit Hierarchie
// ============================================================

/**
 * Competency: fachlich abgegrenzte, beobachtbare Kompetenz.
 *
 * `parentId` beschreibt ausschließlich die Taxonomie bzw. Darstellung im
 * Kompetenzbaum. Sie leitet keine Lernreihenfolge ab. Fachliche
 * Voraussetzungen werden getrennt über `prerequisites` modelliert.
 */
export interface Competency {
  id: string
  name: string
  description?: string
  // Hierarchie: optional Verweis auf übergeordnete Kompetenz
  parentId?: string | null
  // Kategorisierung (z.B. "SQL", "Datenbank", "OOP")
  category?: string
  // Fachliche Voraussetzungen für die Bearbeitung dieser Kompetenz.
  prerequisites?: CompetencyPrerequisite[]
}

/**
 * Gerichtete Lernvoraussetzung zwischen zwei Kompetenzen.
 * Die Zielkompetenz wird erst angeboten, wenn die Quellkompetenz mindestens
 * den angegebenen Beherrschungsgrad erreicht hat.
 */
export interface CompetencyPrerequisite {
  competencyId: string
  minimumMastery: number
}

/**
 * Explizite Verknüpfung zwischen Item und Kompetenz im Q-Matrix-Sinn.
 * Damit können Items mehrere Kompetenzen mit unterschiedlicher Rolle/Weight referenzieren.
 */
export interface QuestionCompetencyLink {
  competencyId: string
  // Gewichtung der Kompetenz für dieses Item (Default in Utilities: 1)
  weight?: number
  // Semantik der Verknüpfung: required wirkt als Kernattribut, supporting als Nebenattribut
  relation?: 'required' | 'supporting'
}

/**
 * LearningQuestion: Frage im adaptiven Lern- und Diagnosemodell.
 * Dieses Domänenmodell ist absichtlich von den älteren REST-DTOs unter
 * `model/Question.ts` getrennt; diese repräsentieren weiterhin das bestehende
 * Backend-Format.
 */
export interface LearningQuestion {
  id: string
  text: string
  title?: string // für Kompatibilität
  // Legacy/kompakte Form: Array von Competency-IDs, die diese Frage abprüft
  competencyIds: string[]
  // Erweiterte Q-Matrix-Form mit Mehrfach-Attributen und optionalen Gewichten
  competencyLinks?: QuestionCompetencyLink[]
  difficulty: number
  excludeFromAlgorithm?: boolean
}

/** @deprecated Für die schrittweise Migration des Algorithmus-Labors. */
export type Question = LearningQuestion

/**
 * Kompakte Darstellung einer Q-Matrix als Items x Kompetenzen.
 * Zeilen und Spalten sind jeweils über IDs referenziert.
 */
export interface QMatrix {
  itemIds: string[]
  competencyIds: string[]
  values: number[][]
}

/**
 * Ergebnis grundlegender Q-Matrix-Validierung.
 */
export interface QMatrixValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Zustand einer Competency während einer Session
 */
export interface CompetencyState {
  competencyId: string
  score: number
  timesAssessed: number
  lastAssessedAt: number | null
}

/**
 * Antwortdatensatz im History
 */
export interface AnswerRecord {
  questionId: string
  competencyIds: string[]
  score: number
  answeredAt: number
}

/** Herkunft der Bewertung eines Antwortversuchs. */
export type EvaluationSource = 'automatic' | 'manual-self-assessment' | 'teacher-review'

/**
 * Ergebnis einer Antwortbewertung. `isCorrect` bleibt bei Teilpunkten oder
 * Selbsteinschätzungen bewusst optional.
 */
export interface AnswerEvaluation {
  score: number
  isCorrect?: boolean
  source: EvaluationSource
}

/**
 * Unveränderliches Lernereignis. Es ist die fachliche Grundlage für spätere
 * Verlaufsansichten, Reproduzierbarkeit und Knowledge Tracing.
 */
export interface LearningAttempt {
  id: string
  sessionId: string
  studentId: string
  questionId: string
  targetCompetencyId: string
  competencyIds: string[]
  evaluation: AnswerEvaluation
  responsePayload?: unknown
  submittedAt: number
  responseTimeMs: number
}

/**
 * State einer Quiz-Session
 */
export interface SessionState {
  id: string
  studentId: string
  startedAt: number
  updatedAt: number
  competencies: Record<string, CompetencyState>
  history: AnswerRecord[]
  recentQuestionIds: string[]
  excludedQuestionIds: string[]
  // Competency Stickiness: Aktuelle Kompetenz für mehrere Fragen fokussieren
  currentCompetencyId: string | null
  // Zähler: Wie viele Fragen wurden bereits zur aktuellen Kompetenz gestellt?
  questionsInCurrentCompetency: number
}

/**
 * Nächste zu stellende Frage mit Zielkompetenz
 */
export interface NextQuestion {
  question: Question
  targetCompetency: Competency
}

/**
 * Ergebnis nach Antwort
 */
export interface AnswerResult {
  updatedCompetencies: string[]
  sessionComplete: boolean
}

/**
 * Fortschritts-Item für UI
 */
export interface ProgressItem {
  competencyId: string
  label: string
  score: number
  timesAssessed: number
}
