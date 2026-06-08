// ============================================================
// algorithm.ts
// Adaptiver Quiz-Algorithmus
//
// Kombiniert:
//   - KST  → Prerequisite-Logik (Doignon & Falmagne, 1985)
//   - BKT  → Mastery-Schätzung (Corbett & Anderson, 1994)
//   - CAT  → Difficulty-basierte Fragenauswahl
//   - MAB  → Gewichtetes Themen-Sampling (Thompson Sampling)
//   - ZPD/Flow → Asymmetrische Difficulty-Anpassung
// ============================================================

import type {
  Skill,
  Question,
  SessionState,
  AlgorithmConfig,
  AnswerRecord,
  AnswerResult,
  NextQuestion,
  SkillState,
} from './types'
import { DEFAULT_CONFIG } from './types'
import { applyAnswer, initSkillState } from './bkt'

// ============================================================
// Session-Initialisierung
// ============================================================

/**
 * Erstellt eine neue SessionState für einen Studenten.
 * Setzt alle Skills ohne Prerequisites direkt auf unlocked.
 *
 * KST: Skills ohne Prerequisite sind im initialen Wissenszustand erreichbar.
 */
export function createSession(
  studentId: string,
  skills: Skill[],
  config: AlgorithmConfig = DEFAULT_CONFIG,
): SessionState {
  const skillStates: Record<string, SkillState> = {}

  for (const skill of skills) {
    const unlocked = skill.prerequisites.length === 0
    skillStates[skill.id] = initSkillState(
      skill.id,
      unlocked,
      config.defaultBKTParams,
    )
  }

  return {
    studentId,
    skills: skillStates,
    currentDifficulty: 0.3,
    recentQuestionIds: [],
    history: [],
    startedAt: Date.now(),
  }
}

// ============================================================
// KST: Prerequisite-Logik
// ============================================================

/**
 * Prüft ob alle Prerequisites eines Skills gemeistert sind.
 * Wenn ja, wird der Skill freigeschaltet.
 *
 * KST: Ein Wissenszustand ist nur erreichbar, wenn alle
 * Vorläufer-Skills beherrscht werden (partielle Ordnung).
 */
function checkAndUnlockSkills(
  skills: Skill[],
  state: SessionState,
): { updatedState: SessionState; newlyUnlocked: Skill[] } {
  const newlyUnlocked: Skill[] = []
  const updatedSkills = { ...state.skills }

  for (const skill of skills) {
    const skillState = updatedSkills[skill.id]

    // Bereits freigeschaltet oder gemeistert → überspringen
    if (skillState.unlocked || skillState.mastered) continue

    // Alle Prerequisites gemeistert?
    const allPrereqsMet = skill.prerequisites.every(
      (prereqId) => updatedSkills[prereqId]?.mastered === true,
    )

    if (allPrereqsMet) {
      updatedSkills[skill.id] = { ...skillState, unlocked: true }
      newlyUnlocked.push(skill)
    }
  }

  return {
    updatedState: { ...state, skills: updatedSkills },
    newlyUnlocked,
  }
}

// ============================================================
// MAB: Gewichtetes Themen-Sampling (Thompson Sampling-inspiriert)
// ============================================================

/**
 * Berechnet das Sampling-Gewicht eines Skills.
 *
 * MAB Exploration/Exploitation:
 *   - Exploitation: Schwache Skills (niedriges P(L)) bevorzugen
 *   - Exploration:  Lange nicht gefragte Skills + Rauschen
 *
 * ZPD: Skills nahe der aktuellen Fähigkeitsgrenze werden
 * bevorzugt (nicht zu leicht, nicht zu schwer).
 */
function computeSkillWeight(
  skillState: SkillState,
  config: AlgorithmConfig,
): number {
  // Nicht zugängliche oder bereits gemeisterte Skills ausschließen
  if (!skillState.unlocked || skillState.mastered) return 0

  // Exploitation: Schwache Skills bevorzugen
  const weaknessScore = 1 - skillState.pLearned

  // Exploration: Recency-Bonus für lange nicht gefragte Skills
  let recencyBonus = 0
  if (skillState.lastAskedAt === null) {
    // Noch nie gefragt → stärkerer Bonus
    recencyBonus = 0.2
  } else {
    const hoursSince = (Date.now() - skillState.lastAskedAt) / (1000 * 60 * 60)
    recencyBonus = Math.min(hoursSince / config.recencyHours, 0.25)
  }

  // Exploration: Kontrolliertes Rauschen (Thompson Sampling Prinzip)
  // Statt Beta-Verteilung: vereinfachtes Uniform-Rauschen
  const noise = Math.random() * config.noiseFactor

  return weaknessScore + recencyBonus + noise
}

/**
 * Gewichtetes Zufalls-Sampling.
 * Gibt null zurück wenn alle Gewichte 0 sind (alle Skills gemeistert).
 */
function weightedSample<T>(items: [T, number][]): T | null {
  const totalWeight = items.reduce((sum, [, w]) => sum + w, 0)
  if (totalWeight === 0) return null

  let rand = Math.random() * totalWeight
  for (const [item, weight] of items) {
    rand -= weight
    if (rand <= 0) return item
  }
  // Floating-Point-Fallback
  return items[items.length - 1][0]
}

/**
 * Wählt den nächsten Skill per gewichtetem Sampling.
 *
 * Fallback wenn alle gemeistert: zufälliger gemeisterter Skill
 * für Wiederholung (Spaced Repetition Prinzip).
 */
function selectSkill(
  skills: Skill[],
  state: SessionState,
  config: AlgorithmConfig,
): Skill | null {
  const weighted: [Skill, number][] = skills.map((skill) => [
    skill,
    computeSkillWeight(state.skills[skill.id], config),
  ])

  const selected = weightedSample(weighted)
  if (selected) return selected

  // Alle gemeistert → Wiederholungsrunde
  const mastered = skills.filter((s) => state.skills[s.id]?.mastered)
  if (mastered.length === 0) return null
  return mastered[Math.floor(Math.random() * mastered.length)]
}

// ============================================================
// CAT: Difficulty-basierte Fragenauswahl
// ============================================================

/**
 * Wählt eine Frage aus dem Pool für den gegebenen Skill.
 *
 * CAT-Prinzip: Wähle die Frage, die dem aktuellen Schwierigkeitsniveau
 * des Studenten am nächsten liegt (maximaler Informationsgewinn).
 *
 * ZPD: Fragen knapp oberhalb der aktuellen Fähigkeit sind optimal.
 * Deshalb leichter Bias nach oben (+0.05).
 */
function selectQuestion(
  skillId: string,
  allQuestions: Question[],
  state: SessionState,
  config: AlgorithmConfig,
): Question | null {
  const candidates = allQuestions.filter((q) => q.skillId === skillId)
  if (candidates.length === 0) return null

  // Cooldown: Kürzlich gestellte Fragen ausschließen
  const cooldownFiltered = candidates.filter(
    (q) => !state.recentQuestionIds.includes(q.id),
  )

  // Fallback: Cooldown ignorieren wenn keine Alternativen
  const pool = cooldownFiltered.length > 0 ? cooldownFiltered : candidates

  // ZPD: Leichter Bias oberhalb des aktuellen Niveaus
  const targetDifficulty = Math.min(state.currentDifficulty + 0.05, 1.0)
  const tol = config.difficultyTolerance

  // Gewichtung nach Nähe zur Zieldifficulty
  const weighted: [Question, number][] = pool.map((q) => {
    const dist = Math.abs(q.difficulty - targetDifficulty)
    // Innerhalb der Toleranz: Gewicht proportional zur Nähe
    // Außerhalb: sehr kleines Restgewicht (kein hartes Ausschließen)
    const weight = dist <= tol ? (tol - dist) / tol + 0.05 : 0.01
    return [q, weight]
  })

  return weightedSample(weighted)
}

// ============================================================
// Hauptklasse
// ============================================================

export class AdaptiveQuizAlgorithm {
  private config: AlgorithmConfig

  constructor(config: Partial<AlgorithmConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  // ----------------------------------------------------------
  // Nächste Frage bestimmen
  // ----------------------------------------------------------

  /**
   * Gibt die nächste Frage zurück.
   * Kombiniert KST-Prerequisite-Check, MAB-Sampling, CAT-Auswahl.
   *
   * Gibt null zurück wenn:
   * - Keine Skills zugänglich sind
   * - Kein Fragepool für den gewählten Skill existiert
   */
  nextQuestion(
    skills: Skill[],
    allQuestions: Question[],
    state: SessionState,
  ): NextQuestion | null {
    const skill = selectSkill(skills, state, this.config)
    if (!skill) return null

    const question = selectQuestion(skill.id, allQuestions, state, this.config)
    if (!question) return null

    return { skill, question }
  }

  // ----------------------------------------------------------
  // Antwort verarbeiten
  // ----------------------------------------------------------

  /**
   * Verarbeitet eine Antwort und aktualisiert den SessionState.
   *
   * Ablauf:
   * 1. BKT: P(L) aktualisieren
   * 2. Difficulty: Asymmetrische Anpassung (ZPD/Flow)
   * 3. Cooldown-Queue aktualisieren
   * 4. Antwort in Historie schreiben
   * 5. KST: Neue Skills freischalten wenn Mastery erreicht
   */
  submitAnswer(
    question: Question,
    isCorrect: boolean,
    skills: Skill[],
    state: SessionState,
  ): { updatedState: SessionState; result: AnswerResult } {
    const skillId = question.skillId
    const currentSkillState = state.skills[skillId]

    if (!currentSkillState) {
      throw new Error(`Skill ${skillId} not found in session state`)
    }

    // 1. BKT: P(L) aktualisieren
    const updatedSkillState = applyAnswer(
      currentSkillState,
      isCorrect,
      this.config.defaultBKTParams,
      this.config.masteryThreshold,
      this.config.minAnswersForMastery,
    )

    const masteryAchieved =
      !currentSkillState.mastered && updatedSkillState.mastered

    // 2. Difficulty-Anpassung (asymmetrisch: ZPD/Flow)
    // Richtig → langsam hochklettern, Falsch → schneller zurück
    const updatedDifficulty = isCorrect
      ? Math.min(state.currentDifficulty + this.config.difficultyStepUp, 1.0)
      : Math.max(state.currentDifficulty - this.config.difficultyStepDown, 0.0)

    // 3. Cooldown-Queue
    const updatedRecentIds = [
      question.id,
      ...state.recentQuestionIds,
    ].slice(0, this.config.cooldownCount)

    // 4. Antwort-Historie
    const record: AnswerRecord = {
      questionId: question.id,
      skillId,
      isCorrect,
      answeredAt: Date.now(),
      difficulty: question.difficulty,
    }

    // State zusammenbauen
    let updatedState: SessionState = {
      ...state,
      skills: {
        ...state.skills,
        [skillId]: updatedSkillState,
      },
      currentDifficulty: updatedDifficulty,
      recentQuestionIds: updatedRecentIds,
      history: [...state.history, record],
    }

    // 5. KST: Skills freischalten
    const { updatedState: stateWithUnlocks, newlyUnlocked } =
      checkAndUnlockSkills(skills, updatedState)
    updatedState = stateWithUnlocks

    // Session abgeschlossen?
    const sessionComplete = skills.every(
      (s) => updatedState.skills[s.id]?.mastered === true,
    )

    const result: AnswerResult = {
      updatedPLearned: updatedSkillState.pLearned,
      masteryAchieved,
      unlockedSkills: newlyUnlocked,
      sessionComplete,
    }

    return { updatedState, result }
  }

  // ----------------------------------------------------------
  // Fortschritt auslesen
  // ----------------------------------------------------------

  /**
   * Gibt den Lernfortschritt aller Skills zurück.
   * Geeignet für Fortschrittsbalken und Dashboard-Anzeigen.
   */
  getProgress(skills: Skill[], state: SessionState) {
    return skills.map((skill) => {
      const s = state.skills[skill.id]
      return {
        skillId: skill.id,
        label: skill.label,
        pLearned: s?.pLearned ?? 0,
        mastered: s?.mastered ?? false,
        unlocked: s?.unlocked ?? false,
        timesAsked: s?.timesAsked ?? 0,
      }
    })
  }

  /**
   * Gesamtfortschritt der Session als 0.0–1.0.
   * Durchschnitt aller P(L)-Werte über freigeschaltete Skills.
   */
  getOverallProgress(skills: Skill[], state: SessionState): number {
    const unlocked = skills.filter((s) => state.skills[s.id]?.unlocked)
    if (unlocked.length === 0) return 0
    const sum = unlocked.reduce(
      (acc, s) => acc + (state.skills[s.id]?.pLearned ?? 0),
      0,
    )
    return sum / unlocked.length
  }
}
