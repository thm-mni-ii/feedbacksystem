// composables/algorithm.ts
// ============================================================
// Adaptive Quiz Algorithm
// REFACTORED: Arbeitet mit vereinheitlichtem Competency-System
// ============================================================

import type {
  Competency,
  CompetencyState,
  Question,
  SessionState,
  AnswerRecord,
  NextQuestion,
  AnswerResult,
  ProgressItem
} from '@/model/types'

/**
 * Session für einen Studierenden erstellen
 *
 * Initialisiert Scores für alle Kompetenzen auf 0.0
 */
export function createSession(studentId: string, competencies: Competency[]): SessionState {
  const competencyStates: Record<string, CompetencyState> = {}

  for (const competency of competencies) {
    competencyStates[competency.id] = {
      competencyId: competency.id,
      score: 0,
      timesAssessed: 0,
      lastAssessedAt: null
    }
  }

  return {
    studentId,
    competencies: competencyStates,
    history: [],
    recentQuestionIds: []
  }
}

/**
 * Hilfsfunktion: Gewichtete Zufallsauswahl
 *
 * Wählt ein Item basierend auf Gewichtung aus
 */
function weightedSample<T>(items: Array<{ item: T; weight: number }>): T {
  const totalWeight = items.reduce((sum, x) => sum + x.weight, 0)

  let random = Math.random() * totalWeight

  for (const entry of items) {
    random -= entry.weight

    if (random <= 0) {
      return entry.item
    }
  }

  return items[0].item
}

/**
 * Gewichtung für eine Kompetenz berechnen
 *
 * Kompetenzen, die weniger getestet wurden, bekommen höhere Gewichtung
 * Formel: 1 / (timesAssessed + 1)
 */
function competencyWeight(state: CompetencyState): number {
  return 1 / (state.timesAssessed + 1)
}

/**
 * Adaptive Quiz Algorithm
 *
 * Wählt adaptiv Fragen basierend auf:
 * - Weniger getestete Kompetenzen
 * - Aktuelle Score-Werte
 * - Recent History (um Wiederholungen zu vermeiden)
 */
export class AdaptiveQuizAlgorithm {
  /**
   * Nächste Frage auswählen
   *
   * Strategie:
   * 1. Wähle eine Kompetenz (gewichtet nach Anzahl Tests)
   * 2. Wähle eine Frage, die diese Kompetenz testet
   * 3. Vermeide kürzlich gestellte Fragen
   */
  nextQuestion(
    competencies: Competency[],
    questions: Question[],
    session: SessionState
  ): NextQuestion | null {
    if (questions.length === 0) {
      return null
    }

    // Schritt 0: Filtere nur Kompetenzen, die Fragen haben
    const competenciesWithQuestions = competencies.filter((c) =>
      questions.some((q) => q.competencyIds.includes(c.id))
    )

    if (competenciesWithQuestions.length === 0) {
      return null
    }

    // Schritt 1: Wähle Zielkompetenz (gewichtet nach Häufigkeit der Tests)
    const competency = weightedSample(
      competenciesWithQuestions.map((c) => ({
        item: c,
        weight: competencyWeight(session.competencies[c.id])
      }))
    )

    // Schritt 2: Finde Fragen, die diese Kompetenz testen
    const candidates = questions.filter(
      (q) => q.competencyIds.includes(competency.id) && !session.recentQuestionIds.includes(q.id)
    )

    // Fallback: Wenn alle Fragen für diese Kompetenz kürzlich gestellt wurden,
    // verwende alle verfügbaren Fragen
    const pool =
      candidates.length > 0
        ? candidates
        : questions.filter((q) => q.competencyIds.includes(competency.id))

    if (pool.length === 0) {
      return null
    }

    // Schritt 3: Zufällige Frage aus dem Pool
    const question = pool[Math.floor(Math.random() * pool.length)]

    return {
      question,
      targetCompetency: competency
    }
  }

  /**
   * Antwort verarbeiten und Scores aktualisieren
   *
   * Algorithmus:
   * - Exponential Moving Average (EMA) für Score-Updates
   * - Alpha = 0.3 (30% neue Information, 70% alte Information)
   * - Alle mit dieser Frage assoziierten Kompetenzen werden aktualisiert
   */
  submitAnswer(
    question: Question,
    score: number,
    state: SessionState
  ): {
    updatedState: SessionState
    result: AnswerResult
  } {
    // Kopie der Kompetenzen erstellen
    const competencies = {
      ...state.competencies
    }

    // Alle Kompetenzen dieser Frage aktualisieren
    for (const competencyId of question.competencyIds) {
      const current = competencies[competencyId]

      if (!current) continue

      // Exponential Moving Average: newScore = oldScore + alpha * (newValue - oldScore)
      const alpha = 0.3
      const updatedScore = current.score + alpha * (score - current.score)

      competencies[competencyId] = {
        ...current,
        score: updatedScore,
        timesAssessed: current.timesAssessed + 1,
        lastAssessedAt: Date.now()
      }
    }

    // Datensatz erstellen
    const record: AnswerRecord = {
      questionId: question.id,
      competencyIds: question.competencyIds,
      score,
      answeredAt: Date.now()
    }

    // Session updaten
    const updatedState: SessionState = {
      ...state,
      competencies,
      history: [...state.history, record],
      // Behalte die letzten 5 Fragen zur Vermeidung von Wiederholungen
      recentQuestionIds: [question.id, ...state.recentQuestionIds].slice(0, 5)
    }

    const result: AnswerResult = {
      updatedCompetencies: question.competencyIds,
      sessionComplete: false
    }

    return {
      updatedState,
      result
    }
  }

  /**
   * Fortschritt für alle Kompetenzen berechnen
   *
   * Gibt formatierte Progress-Items für die UI zurück
   */
  getProgress(competencies: Competency[], state: SessionState): ProgressItem[] {
    return competencies.map((c) => ({
      competencyId: c.id,
      label: c.name,
      score: state.competencies[c.id]?.score ?? 0,
      timesAssessed: state.competencies[c.id]?.timesAssessed ?? 0
    }))
  }

  /**
   * Gesamtpunktzahl berechnen
   *
   * Durchschnitt aller Kompetenzscores
   */
  getOverallScore(competencies: Competency[], state: SessionState): number {
    if (competencies.length === 0) {
      return 0
    }

    const sum = competencies.reduce(
      (acc, competency) => acc + (state.competencies[competency.id]?.score ?? 0),
      0
    )

    return sum / competencies.length
  }
}
