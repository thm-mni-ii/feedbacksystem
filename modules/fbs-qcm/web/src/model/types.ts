// model/types.ts
// ============================================================
// REFACTORED: Einheitliches Competency-System
// Skills und Tags sind jetzt beide Competencies mit Hierarchie
// ============================================================

/**
 * Competency: Einzelne Kompetenz (früher: Skill oder Tag)
 * Unterstützt hierarchische Struktur durch parentId
 */
export interface Competency {
  id: string
  name: string
  description?: string
  // Hierarchie: optional Verweis auf übergeordnete Kompetenz
  parentId?: string | null
  // Kategorisierung (z.B. "SQL", "Datenbank", "OOP")
  category?: string
}

/**
 * Question: Quiz-Frage
 * Referenziert jetzt nur noch Competencies (nicht Skills und Tags separat)
 */
export interface Question {
  id: string
  text: string
  title?: string // für Kompatibilität
  // Array von Competency-IDs, die diese Frage abprüft
  competencyIds: string[]
  difficulty: number
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

/**
 * State einer Quiz-Session
 */
export interface SessionState {
  studentId: string
  competencies: Record<string, CompetencyState>
  history: AnswerRecord[]
  recentQuestionIds: string[]
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
