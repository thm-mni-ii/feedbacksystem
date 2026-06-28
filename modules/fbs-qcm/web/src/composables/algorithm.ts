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
    recentQuestionIds: [],
    excludedQuestionIds: [],
    currentCompetencyId: null,
    questionsInCurrentCompetency: 0
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
   * Nächste Frage auswählen mit IRT-basierter Schwierigkeitsadaption, Competency Stickiness und hierarchischer Freischaltung
   *
   * Strategie:
   * 1. HIERARCHIE: Nur Kompetenzen mit erfüllten Prerequisites werden angeboten
   *    - Eltern-Kompetenzen sind immer verfügbar
   *    - Kind-Kompetenzen brauchen Parent-Score > 0.6 (UNLOCK_THRESHOLD)
   *    → Damit wird ein "Zweig" von Kompetenzen komplett abgearbeitet
   * 2. STICKINESS: Falls gerade eine Kompetenz bearbeitet wird und < 5 Fragen gestellt,
   *    bleib bei dieser Kompetenz (reduziert Kontextwechsel)
   * 3. Wähle Zielkompetenz (gewichtet nach Anzahl Tests, Score und Hierarchie)
   * 4. IRT-Adaption: Filtere Fragen nach Schwierigkeit (Rasch-Modell):
   *    Ideal: |difficulty - studentScore| < 0.2 (50% Erfolgschance)
   * 5. Vermeide kürzlich gestellte Fragen
   * 6. Zufällige Auswahl aus dem angepassten Pool
   */
  nextQuestion(
    competencies: Competency[],
    questions: Question[],
    session: SessionState
  ): NextQuestion | null {
    const excludedQuestionIds = new Set(session.excludedQuestionIds)
    const availableQuestions = questions.filter(
      (question) => !question.excludeFromAlgorithm && !excludedQuestionIds.has(question.id)
    )

    if (availableQuestions.length === 0) {
      return null
    }

    // Schritt 0: Filtere nur Kompetenzen, die Fragen haben
    const competenciesWithQuestions = competencies.filter((c) =>
      availableQuestions.some((q) => q.competencyIds.includes(c.id))
    )

    if (competenciesWithQuestions.length === 0) {
      return null
    }

    let targetCompetency: Competency

    // SCHRITT 1: Competency Stickiness
    // Falls gerade eine Kompetenz bearbeitet wird und < 5 Fragen gestellt, bleib dabei
    const STICKINESS_THRESHOLD = 5
    if (
      session.currentCompetencyId &&
      session.questionsInCurrentCompetency < STICKINESS_THRESHOLD
    ) {
      const stickyCompetency = competencies.find((c) => c.id === session.currentCompetencyId)
      if (
        stickyCompetency &&
        availableQuestions.some((q) => q.competencyIds.includes(stickyCompetency.id))
      ) {
        targetCompetency = stickyCompetency
      } else {
        // Sticky Kompetenz hat keine Fragen mehr, wechsel zu neuer
        targetCompetency = this.selectNextCompetency(
          competenciesWithQuestions,
          session,
          competencies
        )
      }
    } else {
      // SCHRITT 2: Wähle neue Zielkompetenz (gewichtet nach Häufigkeit Tests)
      targetCompetency = this.selectNextCompetency(competenciesWithQuestions, session, competencies)
    }

    // SCHRITT 3: Finde Fragen für die Zielkompetenz
    const questionsForCompetency = availableQuestions.filter((q) =>
      q.competencyIds.includes(targetCompetency.id)
    )

    if (questionsForCompetency.length === 0) {
      return null
    }

    // SCHRITT 4: IRT-Schwierigkeitsadaption (Rasch-Modell)
    // Ideal: Schwierigkeit nahe beim Student-Score (ca. 50% Erfolgschance)
    const studentScore = session.competencies[targetCompetency.id]?.score ?? 0
    const DIFFICULTY_WINDOW = 0.2 // Fenster: [score - 0.2, score + 0.2]

    let difficultyAdapted = questionsForCompetency.filter(
      (q) => Math.abs(q.difficulty - studentScore) <= DIFFICULTY_WINDOW
    )

    // Fallback 1: Falls keine Fragen im idealen Bereich, nimm nächstbeste
    if (difficultyAdapted.length === 0) {
      difficultyAdapted = questionsForCompetency.sort(
        (a, b) => Math.abs(a.difficulty - studentScore) - Math.abs(b.difficulty - studentScore)
      )
    }

    // SCHRITT 5: Vermeide kürzlich gestellte Fragen
    const candidates = difficultyAdapted.filter((q) => !session.recentQuestionIds.includes(q.id))

    const pool = candidates.length > 0 ? candidates : difficultyAdapted

    if (pool.length === 0) {
      return null
    }

    // SCHRITT 6: Zufällige Auswahl aus dem adaptierten Pool
    const question = pool[Math.floor(Math.random() * pool.length)]

    return {
      question,
      targetCompetency
    }
  }

  /**
   * Hilfsfunktion: Wähle nächste Zielkompetenz mit hierarchischer Freischaltung
   *
   * Prerequisite-Based Learning:
   * - Nur Eltern-Kompetenzen (parentId = null) sind immer verfügbar
   * - Kind-Kompetenzen werden erst freigegeben, wenn Parent-Kompetenz Score > UNLOCK_THRESHOLD
   * - Gewichtung: weniger getestet + niedriger Score
   * - Dadurch wird ein "Zweig" komplett abgearbeitet, bevor man zum nächsten wechselt
   */
  private selectNextCompetency(
    candidates: Competency[],
    session: SessionState,
    allCompetencies: Competency[]
  ): Competency {
    const UNLOCK_THRESHOLD = 0.6 // 60% Parent-Score erforderlich für Kinder
    const competenciesByParent = new Map<string | null, Competency[]>()

    // Gruppiere Kompetenzen nach parentId
    for (const competency of allCompetencies) {
      const parentId = competency.parentId ?? null
      if (!competenciesByParent.has(parentId)) {
        competenciesByParent.set(parentId, [])
      }
      competenciesByParent.get(parentId)!.push(competency)
    }

    // Filtere: Nur Kompetenzen, deren Prerequisite erfüllt ist
    const fullyUnlockedCandidates = candidates.filter((c) => {
      // Eltern-Kompetenzen (parentId = null) sind immer verfügbar
      if (!c.parentId) {
        return true
      }

      // Kind-Kompetenzen: Parent muss Score > UNLOCK_THRESHOLD haben
      const parentScore = session.competencies[c.parentId]?.score ?? 0
      return parentScore > UNLOCK_THRESHOLD
    })

    // Fallback: Falls keine Kompetenzen freigegeben sind (z.B. am Anfang), nimm Eltern-Kompetenzen
    const activePool =
      fullyUnlockedCandidates.length > 0
        ? fullyUnlockedCandidates
        : candidates.filter((c) => !c.parentId)

    return weightedSample(
      activePool.map((c) => {
        const state = session.competencies[c.id]
        // Kombination: weniger getestet + niedriger Score
        const assessmentWeight = competencyWeight(state) // 1/(timesAssessed+1)
        const scoreWeight = 1 - state.score // Niedrige Scores bevorzugen
        const combinedWeight = assessmentWeight * scoreWeight
        return {
          item: c,
          weight: combinedWeight
        }
      })
    )
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
