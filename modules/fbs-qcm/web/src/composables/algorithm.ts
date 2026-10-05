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

function expectedInformationGain(mastery: number, config: StudyAlgorithmConfig['model']): number {
  const p = clampProbability(mastery)
  const probabilityCorrect = p * (1 - config.slipRate) + (1 - p) * config.guessRate
  const correctPosterior = posteriorAfterResponse(p, 1, config)
  const incorrectPosterior = posteriorAfterResponse(p, 0, config)
  const expectedPosteriorEntropy =
    probabilityCorrect * binaryEntropy(correctPosterior) +
    (1 - probabilityCorrect) * binaryEntropy(incorrectPosterior)

  return Math.max(0, binaryEntropy(p) - expectedPosteriorEntropy)
}

function applyLearningTransition(mastery: number, config: StudyAlgorithmConfig['model']): number {
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
function weightedSample<T>(
  items: Array<{ item: T; weight: number }>,
  randomSource: () => number
): T {
  const totalWeight = items.reduce((sum, x) => sum + x.weight, 0)

  let random = randomSource() * totalWeight

  for (const entry of items) {
    random -= entry.weight

    if (random <= 0) {
      return entry.item
    }
  }

  return items[0].item
}

/** Deterministische Zufallsquelle für reproduzierbare Simulationen, nicht für Sicherheit. */
export function createSeededRandom(seed: number): () => number {
  if (!Number.isSafeInteger(seed)) {
    throw new Error('Der Zufalls-Seed muss eine sichere Ganzzahl sein.')
  }
  let state = seed >>> 0
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0
    return state / 4294967296
  }
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
 * Wählt adaptiv Aufgaben basierend auf:
 * - Weniger getestete Kompetenzen
 * - Aktuelle Score-Werte
 * - Recent History (um Wiederholungen zu vermeiden)
 */
export class AdaptiveQuizAlgorithm {
  constructor(
    private readonly config: StudyAlgorithmConfig = DEFAULT_STUDY_ALGORITHM_CONFIG,
    private readonly randomSource: () => number = Math.random
  ) {
    if (
      config.selection.competencyStrategy === 'expected-information-gain' &&
      (typeof config.selection.responseScoreThreshold !== 'number' ||
        !Number.isFinite(config.selection.responseScoreThreshold) ||
        config.selection.responseScoreThreshold < 0.01 ||
        config.selection.responseScoreThreshold > 1 ||
        config.selection.singleRequiredItemsOnly !== true)
    ) {
      throw new Error(
        'Expected information gain requires a response score threshold and single-required-item filtering.'
      )
    }
  }

  private questionTargetsCompetency(question: Question, competencyId: string): boolean {
    return getQuestionCompetencyIds(question).includes(competencyId)
  }

  private isQuestionEligible(question: Question): boolean {
    if (!this.config.selection.singleRequiredItemsOnly) {
      return true
    }

    const links = getQuestionCompetencyLinks(question)
    return links.length === 1 && links[0].relation === 'required'
  }

  private getSelectionQuestions(questions: Question[]): Question[] {
    return questions.filter((question) => this.isQuestionEligible(question))
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
   * Nächste Aufgabe auswählen mit Schwierigkeitsadaption, Competency Stickiness
   * und expliziten fachlichen Voraussetzungen.
   *
   * Strategie:
   * 1. Filtere optional auf Items mit genau einer erforderlichen Kompetenz.
   * 2. Behalte die bestehende Abschluss-, Stickiness- und Voraussetzungsauswahl bei.
   * 3. Wähle die Zielkompetenz gewichtet oder nach erwartetem Informationsgewinn.
   * 4. Filtere Aufgaben heuristisch nach Schwierigkeit und Wiederholung.
   * 5. Wähle eine Aufgabe anhand der bestehenden Q-Matrix-Utility.
   */
  nextQuestion(
    competencies: Competency[],
    questions: Question[],
    session: StudySession
  ): NextQuestion | null {
    const selectionQuestions = this.getSelectionQuestions(questions)
    const completion = this.evaluateCompletionStatus(competencies, selectionQuestions, session)
    if (completion.isComplete) {
      return null
    }

    const excludedQuestionIds = new Set(session.excludedQuestionIds)
    const availableQuestions = selectionQuestions.filter(
      (question) => !question.excludeFromAlgorithm && !excludedQuestionIds.has(question.id)
    )

    if (availableQuestions.length === 0) {
      return null
    }

    // Schritt 0: Filtere nur Kompetenzen, die Aufgaben haben und noch Evidenz brauchen.
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
    const baseCandidateCompetencies =
      pendingCompetenciesWithQuestions.length > 0
        ? pendingCompetenciesWithQuestions
        : competenciesWithQuestions

    // Nach jeder Antwort wird die Lösung angezeigt. Eine erneut gestellte Aufgabe
    // würde dann eher Erinnerung an die Lösung als Kompetenz messen. Deshalb
    // werden innerhalb der Sitzung zuerst noch nicht beantwortete Aufgaben
    // verwendet; Wiederholungen nur, wenn nichts anderes mehr übrig ist.
    // Eigene Designentscheidung, kein Bestandteil von Standard-BKT.
    const answeredQuestionIds = new Set(session.history.map((record) => record.questionId))
    const hasUnansweredQuestion = (competencyId: string) =>
      availableQuestions.some(
        (q) => !answeredQuestionIds.has(q.id) && this.questionTargetsCompetency(q, competencyId)
      )
    const candidatesWithUnansweredQuestions = baseCandidateCompetencies.filter((c) =>
      hasUnansweredQuestion(c.id)
    )
    const candidateCompetencies =
      candidatesWithUnansweredQuestions.length > 0
        ? candidatesWithUnansweredQuestions
        : baseCandidateCompetencies

    let targetCompetency: Competency

    // SCHRITT 1: Sehr kurze Stickiness
    // Bei aktiver Kompetenz bleibt der Flow höchstens für eine direkte Folgeaufgabe dort.
    if (
      session.currentCompetencyId &&
      pendingCompetencyIds.has(session.currentCompetencyId) &&
      session.questionsInCurrentCompetency < this.config.selection.stickinessQuestions
    ) {
      const currentCompetency = competencies.find((c) => c.id === session.currentCompetencyId)
      const canStayOnCurrentCompetency =
        !!currentCompetency && candidateCompetencies.some((c) => c.id === currentCompetency.id)

      if (currentCompetency && canStayOnCurrentCompetency) {
        targetCompetency = currentCompetency
      } else {
        // Keine (unbeantwortete) Aufgabe mehr für diese Kompetenz: Wechsel erlaubt.
        targetCompetency = this.selectNextCompetency(candidateCompetencies, session)
      }
    } else {
      // SCHRITT 2: Wähle neue Zielkompetenz (gewichtet nach Häufigkeit Tests)
      targetCompetency = this.selectNextCompetency(candidateCompetencies, session)
    }

    // SCHRITT 3: Finde Aufgaben für die Zielkompetenz, bevorzugt unbeantwortete
    const allQuestionsForCompetency = availableQuestions.filter((q) =>
      this.questionTargetsCompetency(q, targetCompetency.id)
    )
    const unansweredQuestionsForCompetency = allQuestionsForCompetency.filter(
      (q) => !answeredQuestionIds.has(q.id)
    )
    const questionsForCompetency =
      unansweredQuestionsForCompetency.length > 0
        ? unansweredQuestionsForCompetency
        : allQuestionsForCompetency

    if (questionsForCompetency.length === 0) {
      return null
    }

    // SCHRITT 4: BKT-geleitete Schwierigkeitseingrenzung
    // Ideal: Schwierigkeit nahe an der aktuellen Kompetenzschätzung
    const studentScore = session.competencies[targetCompetency.id]?.score ?? 0
    let difficultyAdapted = questionsForCompetency.filter(
      (q) => Math.abs(q.difficulty - studentScore) <= this.config.selection.difficultyWindow
    )

    // Fallback 1: Falls keine Aufgaben im idealen Bereich, nimm nächstbeste
    if (difficultyAdapted.length === 0) {
      difficultyAdapted = questionsForCompetency.sort(
        (a, b) => Math.abs(a.difficulty - studentScore) - Math.abs(b.difficulty - studentScore)
      )
    }

    // SCHRITT 5: Vermeide kürzlich gestellte Aufgaben
    const candidates = difficultyAdapted.filter((q) => !session.recentQuestionIds.includes(q.id))

    const pool = candidates.length > 0 ? candidates : difficultyAdapted

    if (pool.length === 0) {
      return null
    }

    // Harte Regel: Nie exakt dieselbe Aufgabe direkt hintereinander stellen.
    // Bei einem Mini-Pool wird stattdessen kompetenzübergreifend ausgewichen;
    // Wiederholung kann später bewusst als Spaced-Retrieval-Strategie modelliert werden.
    const lastQuestionId = session.history[session.history.length - 1]?.questionId ?? null

    let selectionPool = pool

    if (lastQuestionId) {
      const withoutLastQuestion = pool.filter((q) => q.id !== lastQuestionId)

      if (withoutLastQuestion.length > 0) {
        selectionPool = withoutLastQuestion
      } else {
        // Fallback für kleine Pools: weiche auf eine andere Aufgabe aus beliebiger Kompetenz aus
        const globalWithoutLast = availableQuestions.filter((q) => q.id !== lastQuestionId)

        if (globalWithoutLast.length === 0) {
          // Es existiert nur eine verfügbare Aufgabe insgesamt
          return null
        }

        const globalUnanswered = globalWithoutLast.filter((q) => !answeredQuestionIds.has(q.id))
        const fallbackPool = globalUnanswered.length > 0 ? globalUnanswered : globalWithoutLast
        const fallbackQuestion = fallbackPool[Math.floor(this.randomSource() * fallbackPool.length)]
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
    const question = weightedSample(weightedPool, this.randomSource)

    return {
      question,
      targetCompetency
    }
  }

  /**
   * Wählt nach Voraussetzungen und konfigurierter Kompetenzstrategie.
   * Sind keine Voraussetzungen erfüllt, bleibt der bestehende Fallback auf
   * alle Kandidaten aktiv.
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

    if (this.config.selection.competencyStrategy === 'expected-information-gain') {
      if (
        this.config.selection.responseScoreThreshold === null ||
        this.config.selection.responseScoreThreshold === undefined
      ) {
        throw new Error(
          'Expected information gain requires a response score threshold for binary BKT updates.'
        )
      }

      return [...activePool].sort((a, b) => {
        const aMastery = session.competencies[a.id]?.score ?? this.config.model.initialMastery
        const bMastery = session.competencies[b.id]?.score ?? this.config.model.initialMastery
        const informationGainDifference =
          expectedInformationGain(bMastery, this.config.model) -
          expectedInformationGain(aMastery, this.config.model)

        if (informationGainDifference !== 0) {
          return informationGainDifference
        }

        const evidenceDifference =
          (session.competencies[a.id]?.timesAssessed ?? 0) -
          (session.competencies[b.id]?.timesAssessed ?? 0)
        return evidenceDifference || a.id.localeCompare(b.id)
      })[0]
    }

    return weightedSample(
      activePool.map((c) => {
        const state = session.competencies[c.id] ?? {
          competencyId: c.id,
          score: this.config.model.initialMastery,
          timesAssessed: 0,
          lastAssessedAt: null
        }
        // Kombination: weniger getestet + niedriger Score
        const assessmentWeight = competencyWeight(state) // 1/(timesAssessed+1)
        const scoreWeight = 1 - state.score // Niedrige Scores bevorzugen
        const combinedWeight = assessmentWeight * scoreWeight
        return {
          item: c,
          weight: combinedWeight
        }
      }),
      this.randomSource
    )
  }

  /**
   * Antwort verarbeiten und Scores aktualisieren.
   *
   * Algorithmus:
   * - BKT-Posterior pro verknüpfter Kompetenz
   * - anschließender Lernübergang nach der Antwort
   * - alle mit dieser Aufgabe assoziierten Kompetenzen werden aktualisiert
   */
  /**
   * Übernimmt historische Evidenz, ohne sie als Antwort der neuen Session zu
   * zählen. Erst die ursprüngliche Antwort klassifizieren, dann zeitlich
   * abschwächen: Alte richtige Antworten dürfen nicht zu falschen werden.
   */
  applyHistoricalEvidence(
    question: Question,
    score: number,
    state: StudySession,
    reliability = 1
  ): StudySession {
    if (!this.isQuestionEligible(question) || question.excludeFromAlgorithm) {
      return state
    }

    const competencies = { ...state.competencies }
    const links = getQuestionCompetencyLinks(question)
    const modelScore =
      0.5 + (this.getModelResponseScore(score) - 0.5) * clampProbability(reliability)

    for (const link of links) {
      const current = competencies[link.competencyId]
      if (!current || (link.weight ?? 1) === 0) continue

      const influence = Math.max(0.2, Math.min(1.2, (link.weight ?? 1) * relationFactor(link)))
      const posterior = posteriorAfterResponse(current.score, modelScore, this.config.model)
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
    const modelScore = this.getModelResponseScore(score)
    // Kopie der Kompetenzen erstellen
    const competencies = {
      ...state.competencies
    }

    const links = getQuestionCompetencyLinks(question)

    const answeredCompetencyIds: string[] = []
    // Alle Kompetenzen dieser Aufgabe aktualisieren (gewichtet nach Q-Matrix-Link)
    for (const link of links) {
      const current = competencies[link.competencyId]

      if (!current || (link.weight ?? 1) === 0) continue

      const influence = Math.max(0.2, Math.min(1.2, (link.weight ?? 1) * relationFactor(link)))
      const posterior = posteriorAfterResponse(current.score, modelScore, this.config.model)
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
      answeredCompetencyIds.push(link.competencyId)
    }

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
      // Behalte die letzten 5 Aufgaben zur Vermeidung von Wiederholungen
      recentQuestionIds: [question.id, ...state.recentQuestionIds].slice(
        0,
        this.config.selection.recentQuestionWindow
      )
    }

    const completion = this.evaluateCompletionStatus(
      competenciesInput,
      this.getSelectionQuestions(questions),
      updatedState
    )
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
        1 - binaryEntropy(state.competencies[c.id]?.score ?? this.config.model.initialMastery)
    }))
  }

  private getModelResponseScore(score: number): number {
    const normalizedScore = clampProbability(score)
    const threshold = this.config.selection.responseScoreThreshold

    if (threshold === null || threshold === undefined) {
      return normalizedScore
    }

    return normalizedScore >= threshold ? 1 : 0
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
    return this.evaluateCompletionStatus(
      competencies,
      this.getSelectionQuestions(questions),
      session
    )
  }
}
