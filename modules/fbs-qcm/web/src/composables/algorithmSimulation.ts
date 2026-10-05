import { AdaptiveQuizAlgorithm, createSeededRandom, createSession } from '@/composables/algorithm'
import { getQuestionCompetencyLinks } from '@/composables/qMatrix'
import { DEFAULT_STUDY_ALGORITHM_CONFIG } from '@/model/StudyAlgorithmConfig'
import type { Competency, NextQuestion, Question, StudySession } from '@/model/types'

export type SimulatedLearnerProfile = 'low' | 'medium' | 'high'
export type SimulationEndReason = 'evidence' | 'task-limit' | 'no-question'

export const SIMULATED_LEARNER_PROFILES: Record<
  SimulatedLearnerProfile,
  { label: string; initialKnowledgeProbability: number }
> = {
  low: { label: 'Wenig Vorwissen', initialKnowledgeProbability: 0.1 },
  medium: { label: 'Mittleres Vorwissen', initialKnowledgeProbability: 0.35 },
  high: { label: 'Viel Vorwissen', initialKnowledgeProbability: 0.85 }
}

interface SimulatedKnowledgeState {
  random: () => number
  knowsCompetency: boolean
}

export interface SimulationStep {
  number: number
  question: Question
  targetCompetency: Competency
  predictionBefore: number
  responseProbability: number
  answeredCorrectly: boolean
  knowsBefore: boolean
  knowsAfter: boolean
  estimatedMasteryBefore: number
  estimatedMasteryAfter: number
  competencySelectionExplanation: string
  questionSelectionExplanation: string
}

export interface AlgorithmSimulation {
  readonly competencies: Competency[]
  readonly questions: Question[]
  readonly eligibleQuestionCount: number
  readonly profile: SimulatedLearnerProfile
  readonly seed: number
  readonly strategy: 'coverage-weighted' | 'expected-information-gain'
  session: StudySession
  readonly algorithm: AdaptiveQuizAlgorithm
  readonly knowledge: Map<string, SimulatedKnowledgeState>
  currentQuestion: NextQuestion | null
  endReason: SimulationEndReason | null
  lastStep: SimulationStep | null
}

function validateSeed(seed: number): void {
  if (!Number.isSafeInteger(seed) || seed < 1 || seed > 1_000_000) {
    throw new Error('Der Seed muss eine ganze Zahl zwischen 1 und 1.000.000 sein.')
  }
}

function isSingleRequiredCompetencyQuestion(question: Question): boolean {
  const links = getQuestionCompetencyLinks(question)
  return links.length === 1 && links[0].relation === 'required'
}

function learnerSeed(seed: number, competencyIndex: number): number {
  return Math.imul(seed + 10_000 * (competencyIndex + 1), 0x9e3779b1) >>> 0
}

export function createAlgorithmSimulation(options: {
  competencies: Competency[]
  questions: Question[]
  profile: SimulatedLearnerProfile
  seed: number
  strategy: 'coverage-weighted' | 'expected-information-gain'
}): AlgorithmSimulation {
  const { competencies, profile, seed, strategy } = options
  validateSeed(seed)
  if (competencies.length === 0) throw new Error('Es sind keine Kompetenzen geladen.')

  const competencyIds = new Set(competencies.map((competency) => competency.id))
  const eligibleQuestions = options.questions.filter((question) => {
    if (question.excludeFromAlgorithm || !isSingleRequiredCompetencyQuestion(question)) return false
    return getQuestionCompetencyLinks(question).every((link) => competencyIds.has(link.competencyId))
  })
  if (eligibleQuestions.length === 0) {
    throw new Error(
      'Für die Simulation werden Aufgaben mit genau einer erforderlichen Kompetenz benötigt.'
    )
  }

  const configuration = structuredClone(DEFAULT_STUDY_ALGORITHM_CONFIG)
  configuration.selection.competencyStrategy = strategy
  configuration.selection.singleRequiredItemsOnly = true
  if (strategy === 'expected-information-gain') {
    configuration.selection.responseScoreThreshold = 0.5
  }

  const algorithm = new AdaptiveQuizAlgorithm(
    configuration,
    createSeededRandom(Math.imul(seed + 1, 0x9e3779b1) >>> 0)
  )
  const knowledge = new Map<string, SimulatedKnowledgeState>()
  const initialKnowledgeProbability = SIMULATED_LEARNER_PROFILES[profile].initialKnowledgeProbability

  competencies.forEach((competency, index) => {
    const random = createSeededRandom(learnerSeed(seed, index))
    knowledge.set(competency.id, {
      random,
      knowsCompetency: random() < initialKnowledgeProbability
    })
  })

  const session = createSession('simulated-learner', competencies, configuration)
  const currentQuestion = algorithm.nextQuestion(competencies, eligibleQuestions, session)
  const endReason = currentQuestion
    ? null
    : algorithm.getCompletionStatus(competencies, eligibleQuestions, session).isComplete
      ? 'evidence'
      : 'no-question'

  return {
    competencies,
    questions: eligibleQuestions,
    eligibleQuestionCount: eligibleQuestions.length,
    profile,
    seed,
    strategy,
    session,
    algorithm,
    knowledge,
    currentQuestion,
    endReason,
    lastStep: null
  }
}

function selectionExplanations(
  simulation: AlgorithmSimulation,
  next: NextQuestion
): Pick<SimulationStep, 'competencySelectionExplanation' | 'questionSelectionExplanation'> {
  const config = simulation.session.algorithm.configuration
  const state = simulation.session.competencies[next.targetCompetency.id]
  const usedForCompetency = simulation.session.history.filter((answer) =>
    answer.competencyIds.includes(next.targetCompetency.id)
  ).length
  const isStickySelection =
    simulation.session.currentCompetencyId === next.targetCompetency.id &&
    simulation.session.questionsInCurrentCompetency < config.selection.stickinessQuestions

  const competencySelectionExplanation = isStickySelection
    ? `Die Kompetenz bleibt innerhalb der eingestellten Fokusphase aktiv (bis zu ${config.selection.stickinessQuestions} Aufgaben).`
    : config.selection.competencyStrategy === 'coverage-weighted'
      ? `Die Strategie gewichtet offene Kompetenzen mit wenigen Beobachtungen und niedrigem geschätztem Lernstand stärker. Für diese Kompetenz liegen ${usedForCompetency} Beobachtungen vor.`
      : 'Die Strategie wählt unter den zulässigen Kompetenzen diejenige mit dem höchsten erwarteten Informationsgewinn.'

  const difficultyDifference = Math.abs(next.question.difficulty - (state?.score ?? 0))
  const difficultyExplanation =
    difficultyDifference <= config.selection.difficultyWindow
      ? 'Die Aufgabenschwierigkeit liegt im bevorzugten Bereich um den geschätzten Lernstand.'
      : 'Keine verfügbare Aufgabe lag im bevorzugten Schwierigkeitsbereich; die Auswahl verwendet den nächstliegenden Pool.'
  const questionSelectionExplanation = `${difficultyExplanation} Zusätzlich berücksichtigt der Algorithmus kürzlich gestellte Aufgaben und die Q-Matrix-Utility. Die Auswahl innerhalb des Kandidatenpools ist gewichtet bzw. zufällig.`

  return { competencySelectionExplanation, questionSelectionExplanation }
}

export function advanceAlgorithmSimulation(
  simulation: AlgorithmSimulation
): SimulationStep | null {
  const selected = simulation.currentQuestion
  if (!selected || simulation.endReason) return null

  const { question, targetCompetency } = selected
  const learner = simulation.knowledge.get(targetCompetency.id)
  if (!learner) {
    throw new Error(`Für Kompetenz '${targetCompetency.id}' fehlt ein simulierter Lernzustand.`)
  }

  const model = simulation.session.algorithm.configuration.model
  const currentMastery =
    simulation.session.competencies[targetCompetency.id]?.score ?? model.initialMastery
  const predictionBefore =
    currentMastery * (1 - model.slipRate) + (1 - currentMastery) * model.guessRate
  const knowsBefore = learner.knowsCompetency
  const responseProbability = knowsBefore ? 1 - model.slipRate : model.guessRate
  const answeredCorrectly = learner.random() < responseProbability
  const selectionExplanation = selectionExplanations(simulation, selected)

  if (!learner.knowsCompetency && learner.random() < model.learnRate) {
    learner.knowsCompetency = true
  }

  const targetCompetencyId = targetCompetency.id
  const sessionWithStickiness: StudySession =
    simulation.session.currentCompetencyId === targetCompetencyId
      ? {
          ...simulation.session,
          questionsInCurrentCompetency: simulation.session.questionsInCurrentCompetency + 1
        }
      : {
          ...simulation.session,
          currentCompetencyId: targetCompetencyId,
          questionsInCurrentCompetency: 1
        }
  const result = simulation.algorithm.submitAnswer(
    question,
    answeredCorrectly ? 1 : 0,
    sessionWithStickiness,
    simulation.competencies,
    simulation.questions
  )
  simulation.session = result.updatedState

  const next = result.result.sessionComplete
    ? null
    : simulation.algorithm.nextQuestion(
        simulation.competencies,
        simulation.questions,
        simulation.session
      )
  if (!next && simulation.session.completedAt == null) {
    simulation.session.completedAt = Math.max(Date.now(), simulation.session.updatedAt + 1)
  }
  simulation.currentQuestion = next
  simulation.endReason = result.result.sessionComplete
    ? simulation.session.history.length >= modelSessionLimit(simulation)
      ? 'task-limit'
      : 'evidence'
    : next
      ? null
      : 'no-question'

  const step: SimulationStep = {
    number: simulation.session.history.length,
    question,
    targetCompetency,
    predictionBefore,
    responseProbability,
    answeredCorrectly,
    knowsBefore,
    knowsAfter: learner.knowsCompetency,
    estimatedMasteryBefore: currentMastery,
    estimatedMasteryAfter: simulation.session.competencies[targetCompetencyId]?.score ?? currentMastery,
    ...selectionExplanation
  }
  simulation.lastStep = step
  return step
}

function modelSessionLimit(simulation: AlgorithmSimulation): number {
  return simulation.session.algorithm.configuration.session.maxQuestionsPerSession
}
