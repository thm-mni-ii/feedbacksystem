// model/types.ts
// ============================================================
// Einheitliches Competency-System mit Hierarchie
// ============================================================
import type QuestionType from '@/enums/QuestionType'
import type { Choice } from './questionTypes/Choice'
import type FillInTheBlanks from './questionTypes/FillInTheBlanks'
import type { Matching } from './questionTypes/Matching'
import type { StudyAlgorithmConfig } from './StudyAlgorithmConfig'

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
  // Kurse, in denen die global wiederverwendbare Kompetenz angeboten wird.
  courseIds?: string[]
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
 * Question: Frage im adaptiven Lern- und Diagnosemodell.
 * Dieses Domänenmodell ist absichtlich von den älteren REST-DTOs unter
 * `model/Question.ts` getrennt; diese repräsentieren weiterhin das bestehende
 * Backend-Format.
 *
 * `questionType`/`questionConfiguration` sind bewusst 1:1 zum v2-Wire-Format
 * (`model/Question.ts`) gehalten, damit das Algorithm-Lab echte
 * Antwortmöglichkeiten rendern kann, ohne auf ein separates,
 * lose typisiertes Legacy-Objekt angewiesen zu sein.
 */
export interface Question {
  id: string
  text: string
  title?: string // für Kompatibilität
  /**
   * @deprecated Kompakte Legacy-Form. `competencyLinks` ist die Source of
   * Truth für Kompetenz-Zuordnungen; `competencyIds` wird daraus abgeleitet
   * und nur noch für Rückwärtskompatibilität mitgeführt.
   */
  competencyIds: string[]
  // Erweiterte Q-Matrix-Form mit Mehrfach-Attributen und optionalen Gewichten
  competencyLinks?: QuestionCompetencyLink[]
  questionType: QuestionType
  questionConfiguration: Choice | FillInTheBlanks | Matching
  difficulty: number
  excludeFromAlgorithm?: boolean
}

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
export interface QuestionAttempt {
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
export interface StudySession {
  id: string
  studentId: string
  // Optionale Kurs-Zuordnung, z.B. für späteres Reporting nach Kurs.
  courseId?: string | null
  algorithm: {
    configuration: StudyAlgorithmConfig
    courseConfigurationRevision: number
  }
  startedAt: number
  updatedAt: number
  completedAt?: number | null
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
  uncertainty: number
  certainty: number
}
