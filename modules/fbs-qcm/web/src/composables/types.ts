// ============================================================
// types.ts
// Zentrale Typdefinitionen für das adaptive Quiz-System
// ============================================================

// ------------------------------------------------------------
// Graph-Struktur (wird vom Professor definiert)
// ------------------------------------------------------------

/**
 * Ein Skill/Themengebiet im Wissensgraphen.
 * Entspricht einem Node im KST-Graphen.
 */
export interface Skill {
  id: string
  label: string
  /** IDs von Skills, die zuerst gemeistert werden müssen */
  prerequisites: string[]
  /** IDs von Skills, die dieser Skill freischaltet */
  unlocks: string[]
}

/**
 * Eine einzelne Frage im Pool.
 * Difficulty ist vom Professor vergeben: 0.0 (leicht) bis 1.0 (schwer).
 */
export interface Question {
  id: string
  skillId: string
  text: string
  /** Vom Professor vergeben: 0.0–1.0 */
  difficulty: number
  /** Optionale Metadaten (z.B. Fragetyp, Quelle) */
  meta?: Record<string, unknown>
}

// ------------------------------------------------------------
// BKT-Modell: Zustand pro Skill
// ------------------------------------------------------------

/**
 * Die vier BKT-Parameter pro Skill.
 * Können vom Professor konfiguriert oder als Defaults belassen werden.
 *
 * Quellen: Corbett & Anderson (1994), "Knowledge Tracing:
 * Modeling the Acquisition of Procedural Knowledge"
 */
export interface BKTParams {
  /** P(L₀): Wahrscheinlichkeit, dass Student Skill bereits kennt */
  pInit: number
  /** P(T): Lernrate – Wahrscheinlichkeit pro Frage, Skill zu erwerben */
  pTransit: number
  /** P(S): Slip-Rate – kann es, macht aber Fehler */
  pSlip: number
  /** P(G): Guess-Rate – kann es nicht, rät aber richtig */
  pGuess: number
}

export const DEFAULT_BKT_PARAMS: BKTParams = {
  pInit: 0.3,
  pTransit: 0.1,
  pSlip: 0.1,
  pGuess: 0.2
}

/**
 * Laufzeitzustand eines Studenten für einen einzelnen Skill.
 * Wird nach jeder Antwort aktualisiert.
 */
export interface SkillState {
  skillId: string
  /** P(L_n): Aktuelle BKT-Schätzung, dass Student den Skill beherrscht */
  pLearned: number
  /** Ist der Skill aktuell für den Studenten zugänglich? */
  unlocked: boolean
  /** Wurde der Mastery-Threshold erreicht? */
  mastered: boolean
  /** Zeitstempel der letzten gestellten Frage aus diesem Skill */
  lastAskedAt: number | null
  /** Anzahl der gestellten Fragen aus diesem Skill */
  timesAsked: number
}

// ------------------------------------------------------------
// Studenten-Session
// ------------------------------------------------------------

/**
 * Eine einzelne Antwort in der Session-Historie.
 */
export interface AnswerRecord {
  questionId: string
  skillId: string
  isCorrect: boolean
  answeredAt: number
  /** Schwierigkeit der Frage zum Zeitpunkt der Antwort */
  difficulty: number
}

/**
 * Vollständiger Zustand einer laufenden Quiz-Session.
 * Wird nach jeder Antwort persistiert (z.B. in Pinia Store).
 */
export interface SessionState {
  studentId: string
  /** skillId → SkillState */
  skills: Record<string, SkillState>
  /** Globales Schwierigkeitsniveau des Studenten: 0.0–1.0 */
  currentDifficulty: number
  /** FIFO-Queue der zuletzt gestellten Fragen-IDs (Cooldown) */
  recentQuestionIds: string[]
  /** Vollständige Antworthistorie der Session */
  history: AnswerRecord[]
  /** Zeitstempel Session-Start */
  startedAt: number
}

// ------------------------------------------------------------
// Algorithmus-Konfiguration
// ------------------------------------------------------------

/**
 * Alle Stellschrauben des Algorithmus an einem Ort.
 * Kann vom Professor/Admin konfiguriert werden.
 */
export interface AlgorithmConfig {
  /** Ab diesem P(L) gilt ein Skill als gemeistert (default: 0.75) */
  masteryThreshold: number
  /** Mindestanzahl Antworten vor Mastery-Check (default: 3) */
  minAnswersForMastery: number
  /** Anzahl Fragen im Cooldown-Fenster (default: 5) */
  cooldownCount: number
  /** Zufallsanteil beim Themen-Sampling: 0.0–1.0 (default: 0.15) */
  noiseFactor: number
  /** Stunden bis Recency-Bonus aktiv wird (default: 24) */
  recencyHours: number
  /** Toleranz beim Difficulty-Matching: ±delta (default: 0.3) */
  difficultyTolerance: number
  /** Wie stark Difficulty steigt bei richtiger Antwort (default: 0.08) */
  difficultyStepUp: number
  /** Wie stark Difficulty fällt bei falscher Antwort (default: 0.12) */
  difficultyStepDown: number
  /** BKT-Parameter – können per Skill überschrieben werden */
  defaultBKTParams: BKTParams
}

export const DEFAULT_CONFIG: AlgorithmConfig = {
  masteryThreshold: 0.75,
  minAnswersForMastery: 3,
  cooldownCount: 5,
  noiseFactor: 0.15,
  recencyHours: 24,
  difficultyTolerance: 0.3,
  difficultyStepUp: 0.08,
  difficultyStepDown: 0.12,
  defaultBKTParams: DEFAULT_BKT_PARAMS
}

// ------------------------------------------------------------
// Ausgabe des Algorithmus
// ------------------------------------------------------------

/**
 * Was der Algorithmus pro Runde zurückgibt.
 */
export interface NextQuestion {
  skill: Skill
  question: Question
}

/**
 * Ergebnis nach dem Einreichen einer Antwort.
 */
export interface AnswerResult {
  /** Aktualisierter P(L) nach der Antwort */
  updatedPLearned: number
  /** Hat sich der Mastery-Status durch diese Antwort geändert? */
  masteryAchieved: boolean
  /** Wurde dadurch ein neuer Skill freigeschaltet? */
  unlockedSkills: Skill[]
  /** Sind noch offene (ungemasterte) Skills übrig? */
  sessionComplete: boolean
}
