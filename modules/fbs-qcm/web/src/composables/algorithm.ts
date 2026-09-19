import type {
  Competency,
  CompetencyState,
  Question,
  QuestionCompetencyLink,
  StudySession,
  AnswerRecord,
  NextQuestion,
  AnswerResult,
  ProgressItem
} from '@/model/types'
import { getQuestionCompetencyIds, getQuestionCompetencyLinks } from '@/composables/qMatrix'
import {
  DEFAULT_STUDY_ALGORITHM_CONFIG,
  type StudyAlgorithmConfig
} from '@/model/StudyAlgorithmConfig'

type CompletionStatus = {
  isComplete: boolean
  relevantCompetencyIds: string[]
  completedCompetencyIds: string[]
  pendingCompetencyIds: string[]
  averageUncertainty: number
}

function clampProbability(value: number): number {
  if (Number.isNaN(value)) return 0.5
  return Math.min(1, Math.max(0, value))
}

function binaryEntropy(probability: number): number {
  const p = clampProbability(probability)
  if (p <= 0 || p >= 1) return 0

  const entropy = -p * Math.log(p) - (1 - p) * Math.log(1 - p)

  return entropy / Math.log(2)
}

function posteriorAfterResponse(
  prior: number,
  responseScore: number,
  config: StudyAlgorithmConfig['model']
): number {
  const p = clampProbability(prior)
  const r = clampProbability(responseScore)

  const correctPosterior =
    (p * (1 - config.slipRate)) / (p * (1 - config.slipRate) + (1 - p) * config.guessRate)

  const incorrectPosterior =
    (p * config.slipRate) / (p * config.slipRate + (1 - p) * (1 - config.guessRate))

  return clampProbability(r * correctPosterior + (1 - r) * incorrectPosterior)
}

function applyLearningTransition(
  mastery: number,
  config: StudyAlgorithmConfig['model']
): number {
  return clampProbability(mastery + (1 - mastery) * config.learnRate)
}

function isCompetencyRelevant(
  competencyId: string,
  questions: Question[],
  excludedQuestionIds: Set<string>
): boolean {
  return questions.some((question) => {
    if (question.excludeFromAlgorithm || excludedQuestionIds.has(question.id)) {
      return false
    }

    return getQuestionCompetencyIds(question).includes(competencyId)
  })
}

/**
 * Session für einen Studierenden erstellen.
 *
 * Initialisiert alle Kompetenzen mit einer BKT-Ausgangsschätzung.
 */
export function createSession(
  studentId: string,
  competencies: Competency[],
  configuration: StudyAlgorithmConfig = DEFAULT_STUDY_ALGORITHM_CONFIG,
  courseConfigurationRevision = 0
): StudySession {
  const competencyStates: Record<string, CompetencyState> = {}
  const now = Date.now()

  for (const competency of competencies) {
    competencyStates[competency.id] = {
      competencyId: competency.id,
      score: configuration.model.initialMastery,
      timesAssessed: 0,
      lastAssessedAt: null
    }
  }

  return {
    id: crypto.randomUUID(),
    studentId,
    algorithm: {
      configuration,
      courseConfigurationRevision
    },
    startedAt: now,
    updatedAt: now,
    completedAt: null,
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
  constructor(private readonly config: StudyAlgorithmConfig = DEFAULT_STUDY_ALGORITHM_CONFIG) {
  }

  private questionTargetsCompetency(question: Question, competencyId: string): boolean {
    return getQuestionCompetencyIds(question).includes(competencyId)
  }

  private evaluateCompletionStatus(
    competencies: Competency[],
    questions: Question[],
    session: StudySession
  ): CompletionStatus {
    if (
      Number.isFinite(this.config.session.maxQuestionsPerSession) &&
      session.history.length >= this.config.session.maxQuestionsPerSession
    ) {
      return {
        isComplete: true,
        relevantCompetencyIds: competencies.map((competency) => competency.id),
        completedCompetencyIds: [],
        pendingCompetencyIds: [],
        averageUncertainty:
          competencies.length > 0
            ? competencies.reduce(
                (sum, competency) =>
                  sum +
                  binaryEntropy(
                    session.competencies[competency.id]?.score ?? this.config.model.initialMastery
                  ),
                0
              ) / competencies.length
            : 1
      }
    }

    const excludedQuestionIds = new Set(session.excludedQuestionIds)
    const relevantCompetencyIds = competencies
      .map((competency) => competency.id)
      .filter((competencyId) => isCompetencyRelevant(competencyId, questions, excludedQuestionIds))

    if (relevantCompetencyIds.length === 0) {
      return {
        isComplete: false,
        relevantCompetencyIds: [],
        completedCompetencyIds: [],
        pendingCompetencyIds: [],
        averageUncertainty: 1
      }
    }

    const completedCompetencyIds: string[] = []
    const pendingCompetencyIds: string[] = []
    let uncertaintySum = 0

    for (const competencyId of relevantCompetencyIds) {
      const state = session.competencies[competencyId]
      const uncertainty = binaryEntropy(state?.score ?? this.config.model.initialMastery)
      uncertaintySum += uncertainty

      if (
        state &&
        state.timesAssessed >= this.config.completion.minEvidencePerCompetency &&
        uncertainty <= this.config.completion.maxUncertainty
      ) {
        completedCompetencyIds.push(competencyId)
      } else {
        pendingCompetencyIds.push(competencyId)
      }
    }

    return {
      isComplete: pendingCompetencyIds.length === 0,
      relevantCompetencyIds,
      completedCompetencyIds,
      pendingCompetencyIds,
      averageUncertainty: uncertaintySum / relevantCompetencyIds.length
    }
  }

  private scoreQuestionUtility(
    question: Question,
    session: StudySession,
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
      const uncertainty = binaryEntropy(state.score)
      const evidenceNeed = 1 / (state.timesAssessed + 1)
      const difficultyFit = Math.max(0, 1 - Math.abs(question.difficulty - state.score))
      const utility =
        uncertainty * this.config.utilityWeights.uncertainty +
        evidenceNeed * this.config.utilityWeights.evidenceNeed +
        difficultyFit * this.config.utilityWeights.difficultyFit

      total += linkWeight * utility
      weights += linkWeight
    }

    if (weights === 0) {
      return 0
    }

    const base = total / weights
    const targetBonus = this.questionTargetsCompetency(question, targetCompetencyId)
      ? this.config.utilityWeights.targetCompetencyBonus
      : 0
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
   * 4. IRT-Adaption: Filtere Fragen anhand des konfigurierten
   *    Schwierigkeitsfensters um den aktuellen Kompetenzwert.
   * 5. Vermeide kürzlich gestellte Fragen
   * 6. Zufällige Auswahl aus dem angepassten Pool
   */
  nextQuestion(
    competencies: Competency[],
    questions: Question[],
    session: StudySession
  ): NextQuestion | null {
    const completion = this.evaluateCompletionStatus(competencies, questions, session)
    if (completion.isComplete) {
      return null
    }

    const excludedQuestionIds = new Set(session.excludedQuestionIds)
    const availableQuestions = questions.filter(
      (question) => !question.excludeFromAlgorithm && !excludedQuestionIds.has(question.id)
    )

    if (availableQuestions.length === 0) {
      return null
    }

    // Schritt 0: Filtere nur Kompetenzen, die Fragen haben und noch Evidenz brauchen.
    const competenciesWithQuestions = competencies.filter((c) =>
      availableQuestions.some((q) => this.questionTargetsCompetency(q, c.id))
    )

    if (competenciesWithQuestions.length === 0) {
      return null
    }

    const pendingCompetencyIds = new Set(completion.pendingCompetencyIds)
    const pendingCompetenciesWithQuestions = competenciesWithQuestions.filter((c) =>
      pendingCompetencyIds.has(c.id)
    )
    const candidateCompetencies =
      pendingCompetenciesWithQuestions.length > 0
        ? pendingCompetenciesWithQuestions
        : competenciesWithQuestions

    let targetCompetency: Competency

    // SCHRITT 1: Sehr kurze Stickiness
    // Bei aktiver Kompetenz bleibt der Flow höchstens für eine direkte Folgefrage dort.
    if (
      session.currentCompetencyId &&
      pendingCompetencyIds.has(session.currentCompetencyId) &&
      session.questionsInCurrentCompetency < this.config.selection.stickinessQuestions
    ) {
      const currentCompetency = competencies.find((c) => c.id === session.currentCompetencyId)
      const hasAnyQuestionForCurrentCompetency =
        !!currentCompetency &&
        availableQuestions.some((q) => this.questionTargetsCompetency(q, currentCompetency.id))

      if (currentCompetency && hasAnyQuestionForCurrentCompetency) {
        targetCompetency = currentCompetency
      } else {
        // Falls wirklich keine Frage mehr für diese Kompetenz verfügbar ist, darf gewechselt werden.
        targetCompetency = this.selectNextCompetency(candidateCompetencies, session)
      }
    } else {
      // SCHRITT 2: Wähle neue Zielkompetenz (gewichtet nach Häufigkeit Tests)
      targetCompetency = this.selectNextCompetency(candidateCompetencies, session)
    }

    // SCHRITT 3: Finde Fragen für die Zielkompetenz
    const questionsForCompetency = availableQuestions.filter((q) =>
      this.questionTargetsCompetency(q, targetCompetency.id)
    )

    if (questionsForCompetency.length === 0) {
      return null
    }

    // SCHRITT 4: BKT-geleitete Schwierigkeitseingrenzung
    // Ideal: Schwierigkeit nahe an der aktuellen Kompetenzschätzung
    const studentScore = session.competencies[targetCompetency.id]?.score ?? 0
    let difficultyAdapted = questionsForCompetency.filter(
      (q) => Math.abs(q.difficulty - studentScore) <= this.config.selection.difficultyWindow
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

    // Harte Regel: Nie exakt dieselbe Frage direkt hintereinander stellen.
    // Bei einem Mini-Pool wird stattdessen kompetenzübergreifend ausgewichen;
    // Wiederholung kann später bewusst als Spaced-Retrieval-Strategie modelliert werden.
    const lastQuestionId = session.history[session.history.length - 1]?.questionId ?? null

    let selectionPool = pool

    if (lastQuestionId) {
      const withoutLastQuestion = pool.filter((q) => q.id !== lastQuestionId)

      if (withoutLastQuestion.length > 0) {
        selectionPool = withoutLastQuestion
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
  private selectNextCompetency(candidates: Competency[], session: StudySession): Competency {
    // Filtere: Nur Kompetenzen, deren explizite Voraussetzungen erfüllt sind.
    const fullyUnlockedCandidates = candidates.filter((c) => {
      return (c.prerequisites ?? []).every((prerequisite) => {
        const mastery = session.competencies[prerequisite.competencyId]?.score ?? 0
        return mastery >= prerequisite.minimumMastery
      })
    })

    // Ein ungültiger oder zyklischer Voraussetzungsgraf darf die Session nicht blockieren.
    // Die Struktur wird zusätzlich beim Speichern/Import der Kompetenzen validiert.
    const activePool = fullyUnlockedCandidates.length > 0 ? fullyUnlockedCandidates : candidates

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
   * Antwort verarbeiten und Scores aktualisieren.
   *
   * Algorithmus:
   * - BKT-Posterior pro verknüpfter Kompetenz
   * - anschließender Lernübergang nach der Antwort
   * - alle mit dieser Frage assoziierten Kompetenzen werden aktualisiert
   */
  /**
   * Übernimmt historische Evidenz, ohne sie als Antwort der neuen Session zu
   * zählen. Die zeitliche Gewichtung wird vor dem Aufruf auf den Score
   * angewendet; dadurch bleibt die BKT-Aktualisierung identisch zur aktiven
   * Antwortauswertung.
   */
  applyHistoricalEvidence(
    question: Question,
    score: number,
    state: StudySession
  ): StudySession {
    const competencies = { ...state.competencies }
    const links = getQuestionCompetencyLinks(question)

    for (const link of links) {
      const current = competencies[link.competencyId]
      if (!current) continue

      const influence = Math.max(0.2, Math.min(1.2, (link.weight ?? 1) * relationFactor(link)))
      const posterior = posteriorAfterResponse(current.score, score, this.config.model)
      const updatedScore = applyLearningTransition(
        current.score + (posterior - current.score) * influence,
        this.config.model
      )

      competencies[link.competencyId] = {
        ...current,
        score: updatedScore,
        timesAssessed: current.timesAssessed + 1,
        lastAssessedAt: Date.now()
      }
    }

    return { ...state, competencies }
  }

  submitAnswer(
    question: Question,
    score: number,
    state: StudySession,
    competenciesInput: Competency[],
    questions: Question[]
  ): {
    updatedState: StudySession
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

      const influence = Math.max(0.2, Math.min(1.2, (link.weight ?? 1) * relationFactor(link)))
      const posterior = posteriorAfterResponse(current.score, score, this.config.model)
      const updatedScore = applyLearningTransition(
        current.score + (posterior - current.score) * influence,
        this.config.model
      )

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
    const updatedState: StudySession = {
      ...state,
      competencies,
      history: [...state.history, record],
      updatedAt: record.answeredAt,
      // Behalte die letzten 5 Fragen zur Vermeidung von Wiederholungen
      recentQuestionIds: [question.id, ...state.recentQuestionIds].slice(
        0,
        this.config.selection.recentQuestionWindow
      )
    }

    const completion = this.evaluateCompletionStatus(competenciesInput, questions, updatedState)
    if (completion.isComplete) {
      updatedState.completedAt = updatedState.completedAt ?? record.answeredAt
    }

    const result: AnswerResult = {
      updatedCompetencies: answeredCompetencyIds,
      sessionComplete: completion.isComplete
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
  getProgress(competencies: Competency[], state: StudySession): ProgressItem[] {
    return competencies.map((c) => ({
      competencyId: c.id,
      label: c.name,
      score: state.competencies[c.id]?.score ?? 0,
      timesAssessed: state.competencies[c.id]?.timesAssessed ?? 0,
      uncertainty: binaryEntropy(
        state.competencies[c.id]?.score ?? this.config.model.initialMastery
      ),
      certainty:
        1 -
        binaryEntropy(state.competencies[c.id]?.score ?? this.config.model.initialMastery)
    }))
  }

  /**
   * Gesamtpunktzahl berechnen
   *
   * Durchschnitt aller Kompetenzscores
   */
  getOverallScore(competencies: Competency[], state: StudySession): number {
    if (competencies.length === 0) {
      return 0
    }

    const sum = competencies.reduce(
      (acc, competency) => acc + (state.competencies[competency.id]?.score ?? 0),
      0
    )

    return sum / competencies.length
  }

  getCompletionStatus(
    competencies: Competency[],
    questions: Question[],
    session: StudySession
  ): CompletionStatus {
    return this.evaluateCompletionStatus(competencies, questions, session)
  }
}
