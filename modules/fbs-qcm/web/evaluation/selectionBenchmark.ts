import { AdaptiveQuizAlgorithm, createSeededRandom, createSession } from '@/composables/algorithm'
import {
  DEFAULT_STUDY_ALGORITHM_CONFIG,
  type CompetencySelectionStrategy
} from '@/model/StudyAlgorithmConfig'
import QuestionType from '@/enums/QuestionType'
import type { Competency, Question } from '@/model/types'

export const BENCHMARK_SCENARIOS = [
  { id: 'matched-low', initialMastery: 0.1, learnRate: 0.18, guessRate: 0.2, slipRate: 0.1 },
  { id: 'matched-mixed', initialMastery: 0.35, learnRate: 0.18, guessRate: 0.2, slipRate: 0.1 },
  { id: 'matched-high', initialMastery: 0.85, learnRate: 0.18, guessRate: 0.2, slipRate: 0.1 },
  { id: 'mismatched-slow', initialMastery: 0.35, learnRate: 0.05, guessRate: 0.3, slipRate: 0.2 }
] as const

const STRATEGIES: CompetencySelectionStrategy[] = ['coverage-weighted', 'expected-information-gain']
const competencies: Competency[] = Array.from({ length: 10 }, (_, index) => ({
  id: `skill-${index}`,
  name: `Synthetic skill ${index}`
}))
const questions: Question[] = competencies.flatMap((competency) =>
  Array.from({ length: 8 }, (_, index) => ({
    id: `${competency.id}-item-${index}`,
    text: `Synthetic item ${index}`,
    competencyIds: [competency.id],
    competencyLinks: [{ competencyId: competency.id, relation: 'required' as const, weight: 1 }],
    questionType: QuestionType.Choice,
    questionConfiguration: {
      multipleRow: false,
      multipleColumn: false,
      answerColumns: [{ id: 1, name: 'Correct' }],
      optionRows: [
        { id: 1, text: 'A', correctAnswers: [1] },
        { id: 2, text: 'B', correctAnswers: [] }
      ]
    },
    difficulty: 0.2 + index * 0.1
  }))
)

type Scenario = (typeof BENCHMARK_SCENARIOS)[number]
export interface Observation {
  questionId: string
  competencyId: string
  predictionBefore: number
  oracleProbabilityBefore: number
  score: 0 | 1
}
export interface BenchmarkRun {
  scenario: string
  seed: number
  strategy: CompetencySelectionStrategy
  endReason: 'task-limit' | 'evidence' | 'no-question'
  taskCount: number
  competencyCoverage: number
  itemCoverage: number
  repetitionRate: number
  brierScore: number
  logLoss: number
  initialPredictionBrierScore: number
  finalOracleProbabilityMAE: number
  observations: Observation[]
}

export function probabilityLoss(prediction: number, score: 0 | 1) {
  if (!Number.isFinite(prediction) || prediction < 0 || prediction > 1) {
    throw new Error('Prediction must be finite and in [0, 1].')
  }
  if (score !== 0 && score !== 1) throw new Error('The benchmark requires binary responses.')
  const bounded = Math.min(1 - 1e-12, Math.max(1e-12, prediction))
  return {
    brierScore: (prediction - score) ** 2,
    logLoss: -(score * Math.log(bounded) + (1 - score) * Math.log(1 - bounded))
  }
}

export function runBenchmark(
  scenario: Scenario,
  seed: number,
  strategy: CompetencySelectionStrategy
): BenchmarkRun {
  if (!Number.isSafeInteger(seed) || seed < 0 || seed > 1_000_000) {
    throw new Error('Benchmark seed must be an integer in [0, 1000000].')
  }
  const configuration = structuredClone(DEFAULT_STUDY_ALGORITHM_CONFIG)
  configuration.selection.competencyStrategy = strategy
  configuration.selection.singleRequiredItemsOnly = true
  configuration.selection.responseScoreThreshold = 0.5
  const algorithm = new AdaptiveQuizAlgorithm(
    configuration,
    createSeededRandom(Math.imul(seed + 1, 0x9e3779b1) >>> 0)
  )
  const learners = new Map(
    competencies.map((competency, index) => {
      // Selection and per-skill response streams are independent and shared across policies.
      const random = createSeededRandom(Math.imul(seed + 10_000 * (index + 1), 0x9e3779b1) >>> 0)
      return [competency.id, { random, mastered: random() < scenario.initialMastery }]
    })
  )
  let session = createSession('synthetic-learner', competencies, configuration)
  const observations: Observation[] = []
  let endReason: BenchmarkRun['endReason'] = 'no-question'
  while (observations.length < configuration.session.maxQuestionsPerSession) {
    const next = algorithm.nextQuestion(competencies, questions, session)
    if (!next) {
      endReason = algorithm.getCompletionStatus(competencies, questions, session).isComplete
        ? 'evidence'
        : 'no-question'
      break
    }
    const id = next.targetCompetency.id
    const learner = learners.get(id)
    if (!learner) throw new Error(`Unknown benchmark competency: ${id}`)
    const model = configuration.model
    const mastery = session.competencies[id].score
    const predictionBefore = mastery * (1 - model.slipRate) + (1 - mastery) * model.guessRate
    const oracleProbabilityBefore = learner.mastered ? 1 - scenario.slipRate : scenario.guessRate
    const score = learner.random() < oracleProbabilityBefore ? 1 : 0
    observations.push({
      questionId: next.question.id,
      competencyId: id,
      predictionBefore,
      oracleProbabilityBefore,
      score
    })
    const learningDraw = learner.random()
    if (!learner.mastered && learningDraw < scenario.learnRate) learner.mastered = true
    // Match the store's stickiness bookkeeping, rather than benchmarking a different policy.
    session = {
      ...session,
      currentCompetencyId: id,
      questionsInCurrentCompetency:
        session.currentCompetencyId === id ? session.questionsInCurrentCompetency + 1 : 1
    }
    const result = algorithm.submitAnswer(next.question, score, session, competencies, questions)
    session = result.updatedState
    if (result.result.sessionComplete) {
      endReason =
        observations.length >= configuration.session.maxQuestionsPerSession
          ? 'task-limit'
          : 'evidence'
      break
    }
  }
  if (observations.length === 0) throw new Error('The benchmark produced no observations.')
  const uniqueItems = new Set(observations.map((item) => item.questionId)).size
  const initial = configuration.model
  const initialPrediction =
    initial.initialMastery * (1 - initial.slipRate) +
    (1 - initial.initialMastery) * initial.guessRate
  return {
    scenario: scenario.id,
    seed,
    strategy,
    endReason,
    taskCount: observations.length,
    competencyCoverage:
      new Set(observations.map((item) => item.competencyId)).size / competencies.length,
    itemCoverage: uniqueItems / questions.length,
    repetitionRate: (observations.length - uniqueItems) / observations.length,
    brierScore: mean(
      observations.map((item) => probabilityLoss(item.predictionBefore, item.score).brierScore)
    ),
    logLoss: mean(
      observations.map((item) => probabilityLoss(item.predictionBefore, item.score).logLoss)
    ),
    initialPredictionBrierScore: mean(
      observations.map((item) => probabilityLoss(initialPrediction, item.score).brierScore)
    ),
    finalOracleProbabilityMAE: mean(
      competencies.map((competency) => {
        const mastery = session.competencies[competency.id].score
        const prediction = mastery * (1 - initial.slipRate) + (1 - mastery) * initial.guessRate
        const learner = learners.get(competency.id)!
        return Math.abs(
          prediction - (learner.mastered ? 1 - scenario.slipRate : scenario.guessRate)
        )
      })
    ),
    observations
  }
}

const METRICS = [
  'taskCount',
  'competencyCoverage',
  'itemCoverage',
  'repetitionRate',
  'brierScore',
  'logLoss',
  'initialPredictionBrierScore',
  'finalOracleProbabilityMAE'
] as const

function mean(values: number[]) {
  if (values.length === 0) throw new Error('Cannot summarize an empty sample.')
  return values.reduce((sum, value) => sum + value, 0) / values.length
}
export function summarize(values: number[]) {
  const average = mean(values)
  return {
    mean: average,
    sampleStandardDeviation:
      values.length > 1
        ? Math.sqrt(
            values.reduce((sum, value) => sum + (value - average) ** 2, 0) / (values.length - 1)
          )
        : 0
  }
}

export function evaluateSelection(
  seeds: number[] = Array.from({ length: 100 }, (_, index) => index + 1)
) {
  if (seeds.length === 0 || new Set(seeds).size !== seeds.length) {
    throw new Error('Evaluation requires a nonempty set of unique seeds.')
  }
  const runs = BENCHMARK_SCENARIOS.flatMap((scenario) =>
    seeds.flatMap((seed) => STRATEGIES.map((strategy) => runBenchmark(scenario, seed, strategy)))
  )
  const summaries = BENCHMARK_SCENARIOS.flatMap((scenario) =>
    STRATEGIES.map((strategy) => {
      const selected = runs.filter(
        (run) => run.scenario === scenario.id && run.strategy === strategy
      )
      return {
        scenario: scenario.id,
        strategy,
        runCount: selected.length,
        endReasons: Object.fromEntries(
          ['task-limit', 'evidence', 'no-question'].map((reason) => [
            reason,
            selected.filter((run) => run.endReason === reason).length
          ])
        ),
        metrics: Object.fromEntries(
          METRICS.map((metric) => [metric, summarize(selected.map((run) => run[metric]))])
        )
      }
    })
  )
  const pairedDifferences = BENCHMARK_SCENARIOS.map((scenario) => ({
    scenario: scenario.id,
    direction: 'expected-information-gain minus coverage-weighted',
    brierScore: summarize(
      seeds.map((seed) => {
        const pair = runs.filter((run) => run.scenario === scenario.id && run.seed === seed)
        return (
          pair.find((run) => run.strategy === 'expected-information-gain')!.brierScore -
          pair.find((run) => run.strategy === 'coverage-weighted')!.brierScore
        )
      })
    )
  }))
  return {
    schemaVersion: 1,
    experiment: 'synthetic-selection-benchmark-v1',
    configuration: {
      ...structuredClone(DEFAULT_STUDY_ALGORITHM_CONFIG),
      selection: {
        ...DEFAULT_STUDY_ALGORITHM_CONFIG.selection,
        singleRequiredItemsOnly: true,
        responseScoreThreshold: 0.5
      }
    },
    scenarios: BENCHMARK_SCENARIOS,
    seeds,
    pool: { competencies: competencies.length, questions: questions.length, itemsPerCompetency: 8 },
    assumptions: {
      latentModel: 'Binary BKT learner; response before learning; no forgetting or prerequisites.',
      difficulty:
        'Varies in the item pool, but has no effect on the synthetic response probability.',
      streams: 'Separate selection and per-competency streams; same streams for both strategies.',
      initialState: 'No historical attempts; initial estimate 0.35 for every competency.',
      baseline:
        'Fixed initial answer probability, scored on the same policy-specific observations.',
      comparison:
        'On-policy scores describe different selected items; not a causal learning comparison.',
      interpretation:
        'Synthetic demonstration, not empirical validation or evidence of real learning gains.'
    },
    summaries,
    pairedDifferences,
    runs
  }
}
