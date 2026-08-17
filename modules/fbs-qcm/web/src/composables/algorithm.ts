// composables/algorithm.ts
// ============================================================
// Adaptive Quiz Algorithm
// REFACTORED: Arbeitet mit vereinheitlichtem Competency-System
// ============================================================

import type {
  Competency,
  CompetencyState,
  Question,
  QuestionCompetencyLink,
  SessionState,
  AnswerRecord,
  NextQuestion,
  AnswerResult,
  ProgressItem
} from '@/model/types'
import { getQuestionCompetencyIds, getQuestionCompetencyLinks } from '@/composables/qMatrix'

/**
 * Session für einen Studierenden erstellen
 *
 * Initialisiert Scores für alle Kompetenzen auf 0.0
 */
export function createSession(studentId: string, competencies: Competency[]): SessionState {
  const competencyStates: Record<string, CompetencyState> = {}
  const now = Date.now()

  for (const competency of competencies) {
    competencyStates[competency.id] = {
      competencyId: competency.id,
      score: 0,
      timesAssessed: 0,
      lastAssessedAt: null
    }
  }

  return {
    id: crypto.randomUUID(),
    studentId,
    startedAt: now,
    updatedAt: now,
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

function relationFactor(link: QuestionCompetencyLink): number {
  return link.relation === 'supporting' ? 0.7 : 1
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
  private questionTargetsCompetency(question: Question, competencyId: string): boolean {
    return getQuestionCompetencyIds(question).includes(competencyId)
  }

  private scoreQuestionUtility(
    question: Question,
    session: SessionState,
    targetCompetencyId: string
  ): number {
    const links = getQuestionCompetencyLinks(question)

    if (links.length === 0) {
      return 0
    }

    let total = 0
    let weights = 0

    for (const link of links) {
      const state = session.competencies[link.competencyId]
      if (!state) continue

      const linkWeight = Math.max(0, link.weight ?? 1) * relationFactor(link)
      const information = Math.max(0, 1 - Math.abs(question.difficulty - state.score))
      const need = 1 - state.score
      const novelty = 1 / (state.timesAssessed + 1)
      const utility = information * 0.5 + need * 0.35 + novelty * 0.15

      total += linkWeight * utility
      weights += linkWeight
    }

    if (weights === 0) {
      return 0
    }

    const base = total / weights
    const targetBonus = this.questionTargetsCompetency(question, targetCompetencyId) ? 0.1 : 0
    return base + targetBonus
  }

  /**
 * Nächste Frage auswählen mit Schwierigkeitsadaption, Competency Stickiness
 * und expliziten fachlichen Voraussetzungen.
   *
   * Strategie:
   * 1. VORAUSSETZUNGEN: Nur Kompetenzen mit erfüllten expliziten
   *    Voraussetzungen werden angeboten. `parentId` wird hierfür bewusst nicht
   *    verwendet, da Taxonomie und Lernreihenfolge unterschiedliche Relationen sind.
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
    const MIN_QUESTIONS_PER_COMPETENCY = 5
    const excludedQuestionIds = new Set(session.excludedQuestionIds)
    const availableQuestions = questions.filter(
      (question) => !question.excludeFromAlgorithm && !excludedQuestionIds.has(question.id)
    )

    if (availableQuestions.length === 0) {
      return null
    }

    // Schritt 0: Filtere nur Kompetenzen, die Fragen haben
    const competenciesWithQuestions = competencies.filter((c) =>
      availableQuestions.some((q) => this.questionTargetsCompetency(q, c.id))
    )

    if (competenciesWithQuestions.length === 0) {
      return null
    }

    let targetCompetency: Competency
    let forceCurrentCompetency = false

    // SCHRITT 1: Harte Mindestanzahl je Kompetenz
    // Bleibe so lange in der aktuellen Kompetenz, bis mindestens 5 Fragen gestellt wurden.
    if (
      session.currentCompetencyId &&
      session.questionsInCurrentCompetency < MIN_QUESTIONS_PER_COMPETENCY
    ) {
      const currentCompetency = competencies.find((c) => c.id === session.currentCompetencyId)
      const hasAnyQuestionForCurrentCompetency =
        !!currentCompetency &&
        availableQuestions.some((q) => this.questionTargetsCompetency(q, currentCompetency.id))

      if (currentCompetency && hasAnyQuestionForCurrentCompetency) {
        targetCompetency = currentCompetency
        forceCurrentCompetency = true
      } else {
        // Falls wirklich keine Frage mehr für diese Kompetenz verfügbar ist, darf gewechselt werden.
        targetCompetency = this.selectNextCompetency(
          competenciesWithQuestions,
          session
        )
      }
    } else {
      // SCHRITT 2: Wähle neue Zielkompetenz (gewichtet nach Häufigkeit Tests)
      targetCompetency = this.selectNextCompetency(competenciesWithQuestions, session)
    }

    // SCHRITT 3: Finde Fragen für die Zielkompetenz
    const questionsForCompetency = availableQuestions.filter((q) =>
      this.questionTargetsCompetency(q, targetCompetency.id)
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

    // Harte Regel: Nie exakt dieselbe Frage direkt hintereinander stellen
    // Ausnahme: Bei erzwungener Mindestanzahl pro Kompetenz und Mini-Pool
    // darf die letzte Frage wiederholt werden, bevor die Kompetenz gewechselt wird.
    const lastQuestionId = session.history[session.history.length - 1]?.questionId ?? null

    let selectionPool = pool

    if (lastQuestionId) {
      const withoutLastQuestion = pool.filter((q) => q.id !== lastQuestionId)

      if (withoutLastQuestion.length > 0) {
        selectionPool = withoutLastQuestion
      } else if (forceCurrentCompetency) {
        // In der erzwungenen Phase bleiben wir in derselben Kompetenz,
        // auch wenn dadurch die letzte Frage erneut kommen kann.
        selectionPool = pool
      } else {
        // Fallback für kleine Pools: weiche auf eine andere Frage aus beliebiger Kompetenz aus
        const globalWithoutLast = availableQuestions.filter((q) => q.id !== lastQuestionId)

        if (globalWithoutLast.length === 0) {
          // Es existiert nur eine verfügbare Frage insgesamt
          return null
        }

        const fallbackQuestion =
          globalWithoutLast[Math.floor(Math.random() * globalWithoutLast.length)]
        const fallbackTargetCompetency =
          competencies.find((c) => this.questionTargetsCompetency(fallbackQuestion, c.id)) ??
          targetCompetency

        return {
          question: fallbackQuestion,
          targetCompetency: fallbackTargetCompetency
        }
      }
    }

    // SCHRITT 6: Q-Matrix-Utility über alle verknüpften Kompetenzen nutzen
    const weightedPool = selectionPool.map((q) => ({
      item: q,
      weight: Math.max(0.001, this.scoreQuestionUtility(q, session, targetCompetency.id))
    }))
    const question = weightedSample(weightedPool)

    return {
      question,
      targetCompetency
    }
  }

  /**
   * Hilfsfunktion: Wähle nächste Zielkompetenz mit expliziten Voraussetzungen.
   *
   * Prerequisite-Based Learning:
   * - Kompetenzen ohne Voraussetzungen sind verfügbar.
   * - Jede explizite Voraussetzung muss den angegebenen Beherrschungsgrad erreichen.
   * - Gewichtung: weniger getestet + niedriger Score
   * - Dadurch wird ein "Zweig" komplett abgearbeitet, bevor man zum nächsten wechselt
   */
  private selectNextCompetency(
    candidates: Competency[],
    session: SessionState
  ): Competency {
    // Filtere: Nur Kompetenzen, deren explizite Voraussetzungen erfüllt sind.
    const fullyUnlockedCandidates = candidates.filter((c) => {
      return (c.prerequisites ?? []).every((prerequisite) => {
        const mastery = session.competencies[prerequisite.competencyId]?.score ?? 0
        return mastery >= prerequisite.minimumMastery
      })
    })

    // Ein ungültiger oder zyklischer Voraussetzungsgraf darf die Session nicht blockieren.
    // Die Struktur wird zusätzlich beim Speichern/Import der Kompetenzen validiert.
    const activePool =
      fullyUnlockedCandidates.length > 0
        ? fullyUnlockedCandidates
        : candidates

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

    const links = getQuestionCompetencyLinks(question)

    // Alle Kompetenzen dieser Frage aktualisieren (gewichtet nach Q-Matrix-Link)
    for (const link of links) {
      const current = competencies[link.competencyId]

      if (!current) continue

      // Exponential Moving Average: newScore = oldScore + alpha * (newValue - oldScore)
      const influence = Math.max(0.2, Math.min(1.2, (link.weight ?? 1) * relationFactor(link)))
      const alpha = 0.3 * influence
      const updatedScore = current.score + alpha * (score - current.score)

      competencies[link.competencyId] = {
        ...current,
        score: updatedScore,
        timesAssessed: current.timesAssessed + 1,
        lastAssessedAt: Date.now()
      }
    }

    const answeredCompetencyIds = getQuestionCompetencyIds(question)

    // Datensatz erstellen
    const record: AnswerRecord = {
      questionId: question.id,
      competencyIds: answeredCompetencyIds,
      score,
      answeredAt: Date.now()
    }

    // Session updaten
    const updatedState: SessionState = {
      ...state,
      competencies,
      history: [...state.history, record],
      updatedAt: record.answeredAt,
      // Behalte die letzten 5 Fragen zur Vermeidung von Wiederholungen
      recentQuestionIds: [question.id, ...state.recentQuestionIds].slice(0, 5)
    }

    const result: AnswerResult = {
      updatedCompetencies: answeredCompetencyIds,
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
