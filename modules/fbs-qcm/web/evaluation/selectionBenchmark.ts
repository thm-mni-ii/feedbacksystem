import { AdaptiveQuizAlgorithm, createSeededRandom, createSession } from '@/composables/algorithm'
import {
  DEFAULT_STUDY_ALGORITHM_CONFIG,
  type CompetencySelectionStrategy
} from '@/model/StudyAlgorithmConfig'
import QuestionType from '@/enums/QuestionType'
import type { Competency, NextQuestion, Question, StudySession } from '@/model/types'
import { getQuestionCompetencyLinks } from '@/composables/qMatrix'
import {
  competencies as platformCompetencies,
  questions as platformQuestions
} from '@/composables/competencyGraph.mock'

/**
 * Benchmark-Strategien: die beiden adaptiven Produktivstrategien plus eine
 * nicht-adaptive Zufalls-Baseline (uniforme Ziehung ohne Zurücklegen), die
 * Mastery-Schätzung, Coverage und Schwierigkeit ignoriert. BKT-Updates und
 * Abbruchregeln sind identisch; Unterschiede der Auswahlbedingungen werden
 * im Report dokumentiert. `random` existiert nur im Benchmark und ist
 * bewusst keine Produktiv-Option in `CompetencySelectionStrategy`.
 */
export type BenchmarkStrategy = CompetencySelectionStrategy | 'random'
export type BenchmarkPoolId = 'synthetic' | 'platform-testdata'

export const BENCHMARK_SCENARIOS = [
  { id: 'vorwissen-niedrig', initialMastery: 0.1, learnRate: 0.18, guessRate: 0.2, slipRate: 0.1 },
  {
    id: 'vorwissen-gemischt',
    initialMastery: 0.35,
    learnRate: 0.18,
    guessRate: 0.2,
    slipRate: 0.1
  },
  { id: 'vorwissen-hoch', initialMastery: 0.85, learnRate: 0.18, guessRate: 0.2, slipRate: 0.1 },
  {
    id: 'modellabweichend-langsam',
    initialMastery: 0.35,
    learnRate: 0.05,
    guessRate: 0.3,
    slipRate: 0.2
  }
] as const

const STRATEGIES: BenchmarkStrategy[] = ['random', 'coverage-weighted', 'expected-information-gain']
const syntheticCompetencies: Competency[] = Array.from({ length: 10 }, (_, index) => ({
  id: `skill-${index}`,
  name: `Synthetic skill ${index}`
}))
const syntheticQuestions: Question[] = syntheticCompetencies.flatMap((competency) =>
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
const benchmarkPools: Record<
  BenchmarkPoolId,
  { competencies: Competency[]; questions: Question[] }
> = {
  synthetic: { competencies: syntheticCompetencies, questions: syntheticQuestions },
  'platform-testdata': { competencies: platformCompetencies, questions: platformQuestions }
}

function getEligibleQuestions(questions: Question[]) {
  return questions.filter((question) => {
    const links = getQuestionCompetencyLinks(question)
    return !question.excludeFromAlgorithm && links.length === 1 && links[0].relation === 'required'
  })
}

function getEligibleCompetencies(competencies: Competency[], questions: Question[]) {
  const competencyIds = new Set(
    questions.flatMap((question) =>
      getQuestionCompetencyLinks(question).map((link) => link.competencyId)
    )
  )
  return competencies.filter((competency) => competencyIds.has(competency.id))
}

type Scenario = (typeof BENCHMARK_SCENARIOS)[number]
export const BENCHMARK_SESSION_COUNT = 5
export interface Observation {
  questionId: string
  competencyId: string
  learnerMasteredBefore: boolean
  estimatedMasteryBefore: number
  predictionBefore: number
  oracleProbabilityBefore: number
  score: 0 | 1
}
export interface BenchmarkRun {
  pool: BenchmarkPoolId
  scenario: string
  seed: number
  strategy: BenchmarkStrategy
  sessionNumber: number
  endReason: 'task-limit' | 'evidence' | 'no-question'
  taskCount: number
  competencyCoverage: number
  itemCoverage: number
  repetitionRate: number
  brierScore: number
  logLoss: number
  initialPredictionBrierScore: number
  initialPredictionLogLoss: number
  initialMasteryBrierScore: number
  finalMasteryBrierScore: number
  unmasteredTargetRate: number
  observations: Observation[]
  competencyStatesBefore: MasterySnapshot[]
  competencyStatesAfter: MasterySnapshot[]
}

interface MasterySnapshot {
  competencyId: string
  mastered: boolean
  estimate: number
  timesAssessed: number
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

/**
 * Nicht-adaptive Kontrollbedingung: zieht gleichverteilt ohne Zurücklegen aus
 * demselben geeigneten Aufgabenpool, den auch die adaptiven Verfahren nutzen.
 * Abschlussprüfung und Modell-Updates verwenden denselben Algorithmus; die
 * Zufallsbedingung ignoriert jedoch Schwierigkeit und Lernstand und ist daher
 * kein Ein-Faktor-Ablationstest.
 */
function nextRandomQuestion(
  algorithm: AdaptiveQuizAlgorithm,
  competencies: Competency[],
  eligibleQuestions: Question[],
  observations: Observation[],
  random: () => number,
  session: StudySession
): NextQuestion | null {
  if (algorithm.getCompletionStatus(competencies, eligibleQuestions, session).isComplete) {
    return null
  }
  const asked = new Set(observations.map((item) => item.questionId))
  const pool = eligibleQuestions.filter((question) => !asked.has(question.id))
  if (pool.length === 0) {
    return null
  }
  const question = pool[Math.floor(random() * pool.length)]
  const targetCompetency = competencies.find((item) => item.id === question.competencyIds[0])
  if (!targetCompetency) {
    throw new Error(`Benchmark question without known competency: ${question.id}`)
  }
  return { question, targetCompetency }
}

export function runBenchmark(
  scenario: Scenario,
  seed: number,
  strategy: BenchmarkStrategy,
  poolId: BenchmarkPoolId = 'synthetic'
): BenchmarkRun {
  return runBenchmarkSequence(scenario, seed, strategy, poolId, 1)[0]
}

export function runBenchmarkSequence(
  scenario: Scenario,
  seed: number,
  strategy: BenchmarkStrategy,
  poolId: BenchmarkPoolId = 'synthetic',
  sessionCount = BENCHMARK_SESSION_COUNT
): BenchmarkRun[] {
  if (!Number.isSafeInteger(sessionCount) || sessionCount < 1) {
    throw new Error('Session count must be a positive integer.')
  }
  if (!Number.isSafeInteger(seed) || seed < 0 || seed > 1_000_000) {
    throw new Error('Benchmark seed must be an integer in [0, 1000000].')
  }
  const { competencies, questions } = benchmarkPools[poolId]
  const eligibleQuestions = getEligibleQuestions(questions)
  const eligibleCompetencies = getEligibleCompetencies(competencies, eligibleQuestions)
  if (eligibleCompetencies.length === 0 || eligibleQuestions.length === 0) {
    throw new Error(`Benchmark pool '${poolId}' has no eligible competencies or questions.`)
  }
  const configuration = structuredClone(DEFAULT_STUDY_ALGORITHM_CONFIG)
  if (strategy !== 'random') {
    configuration.selection.competencyStrategy = strategy
  }
  configuration.selection.singleRequiredItemsOnly = true
  configuration.selection.responseScoreThreshold = 0.5
  // One shared selection stream per run: the adaptive policies consume it inside
  // the algorithm, the random baseline consumes it directly. Learner streams use
  // different seed offsets, so learner behavior stays identical across policies.
  const selectionRandom = createSeededRandom(Math.imul(seed + 1, 0x9e3779b1) >>> 0)
  const algorithm = new AdaptiveQuizAlgorithm(configuration, selectionRandom)
  const learners = new Map(
    competencies.map((competency, index) => {
      // Selection and per-skill response streams are independent and shared across policies.
      const random = createSeededRandom(Math.imul(seed + 10_000 * (index + 1), 0x9e3779b1) >>> 0)
      return [competency.id, { random, mastered: random() < scenario.initialMastery }]
    })
  )
  let session = createSession('synthetic-learner', competencies, configuration)
  const snapshot = (): MasterySnapshot[] =>
    eligibleCompetencies.map((competency) => {
      const learner = learners.get(competency.id)
      const estimate = session.competencies[competency.id]
      if (!learner || !estimate) throw new Error(`Missing competency state: ${competency.id}`)
      return {
        competencyId: competency.id,
        mastered: learner.mastered,
        estimate: estimate.score,
        timesAssessed: estimate.timesAssessed
      }
    })
  const runs: BenchmarkRun[] = []
  for (let sessionNumber = 1; sessionNumber <= sessionCount; sessionNumber++) {
    if (sessionNumber > 1) {
      const previousCompetencies = session.competencies
      session = createSession('synthetic-learner', competencies, configuration)
      session.competencies = previousCompetencies
    }
    if (algorithm.getCompletionStatus(competencies, eligibleQuestions, session).isComplete) break
    const competencyStatesBefore = snapshot()
    const initialMasteryBrierScore = mean(
      competencyStatesBefore.map(
        (state) => probabilityLoss(state.estimate, state.mastered ? 1 : 0).brierScore
      )
    )
    const observations: Observation[] = []
    let endReason: BenchmarkRun['endReason'] = 'no-question'
    while (observations.length < configuration.session.maxQuestionsPerSession) {
      const next =
        strategy === 'random'
          ? nextRandomQuestion(
              algorithm,
              competencies,
              eligibleQuestions,
              observations,
              selectionRandom,
              session
            )
          : algorithm.nextQuestion(competencies, questions, session)
      if (!next) {
        endReason = algorithm.getCompletionStatus(competencies, eligibleQuestions, {
          ...session,
          excludedQuestionIds: []
        }).isComplete
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
      const learnerMasteredBefore = learner.mastered
      const oracleProbabilityBefore = learner.mastered ? 1 - scenario.slipRate : scenario.guessRate
      const score = learner.random() < oracleProbabilityBefore ? 1 : 0
      observations.push({
        questionId: next.question.id,
        competencyId: id,
        learnerMasteredBefore,
        estimatedMasteryBefore: mastery,
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
      // Reset only session-local exclusions at the next boundary; evidence persists.
      session.excludedQuestionIds = observations.map((item) => item.questionId)
      if (
        (result.result.sessionComplete ||
          observations.length >= configuration.session.maxQuestionsPerSession) &&
        algorithm.getCompletionStatus(competencies, eligibleQuestions, {
          ...session,
          excludedQuestionIds: []
        }).isComplete
      ) {
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
    const finalMasteryBrierScore = mean(
      eligibleCompetencies.map((competency) => {
        const learner = learners.get(competency.id)
        const estimate = session.competencies[competency.id]?.score
        if (!learner || estimate === undefined) {
          throw new Error(`Missing final mastery state for benchmark competency: ${competency.id}`)
        }
        return probabilityLoss(estimate, learner.mastered ? 1 : 0).brierScore
      })
    )
    runs.push({
      pool: poolId,
      scenario: scenario.id,
      seed,
      strategy,
      sessionNumber,
      endReason,
      taskCount: observations.length,
      competencyCoverage:
        new Set(observations.map((item) => item.competencyId)).size / eligibleCompetencies.length,
      itemCoverage: uniqueItems / eligibleQuestions.length,
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
      initialPredictionLogLoss: mean(
        observations.map((item) => probabilityLoss(initialPrediction, item.score).logLoss)
      ),
      initialMasteryBrierScore,
      finalMasteryBrierScore,
      unmasteredTargetRate:
        observations.filter((item) => !item.learnerMasteredBefore).length / observations.length,
      observations,
      competencyStatesBefore,
      competencyStatesAfter: snapshot()
    })
  }
  return runs
}

const METRICS = [
  'taskCount',
  'competencyCoverage',
  'itemCoverage',
  'repetitionRate',
  'brierScore',
  'logLoss',
  'initialPredictionBrierScore',
  'initialPredictionLogLoss',
  'initialMasteryBrierScore',
  'finalMasteryBrierScore',
  'unmasteredTargetRate'
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
  seeds: number[] = Array.from({ length: 100 }, (_, index) => index + 1),
  sessionCount = BENCHMARK_SESSION_COUNT
) {
  if (seeds.length === 0 || new Set(seeds).size !== seeds.length) {
    throw new Error('Evaluation requires a nonempty set of unique seeds.')
  }
  const poolIds = Object.keys(benchmarkPools) as BenchmarkPoolId[]
  const runs = poolIds.flatMap((poolId) =>
    BENCHMARK_SCENARIOS.flatMap((scenario) =>
      seeds.flatMap((seed) =>
        STRATEGIES.flatMap((strategy) =>
          runBenchmarkSequence(scenario, seed, strategy, poolId, sessionCount)
        )
      )
    )
  )
  const sessionNumbers = Array.from({ length: sessionCount }, (_, index) => index + 1)
  const summaries = sessionNumbers
    .flatMap((sessionNumber) =>
      poolIds.flatMap((poolId) =>
        BENCHMARK_SCENARIOS.flatMap((scenario) =>
          STRATEGIES.map((strategy) => {
            const selected = runs.filter(
              (run) =>
                run.pool === poolId &&
                run.scenario === scenario.id &&
                run.strategy === strategy &&
                run.sessionNumber === sessionNumber
            )
            if (selected.length === 0) return null
            return {
              pool: poolId,
              scenario: scenario.id,
              strategy,
              sessionNumber,
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
      )
    )
    .filter((summary): summary is NonNullable<typeof summary> => summary !== null)
  const runIndex = new Map(
    runs.map(
      (run) =>
        [
          `${run.pool}|${run.scenario}|${run.seed}|${run.strategy}|${run.sessionNumber}`,
          run
        ] as const
    )
  )
  const comparisons: Array<[BenchmarkStrategy, BenchmarkStrategy]> = [
    ['expected-information-gain', 'coverage-weighted'],
    ['coverage-weighted', 'random'],
    ['expected-information-gain', 'random']
  ]
  const pairedDifferences = sessionNumbers
    .flatMap((sessionNumber) =>
      poolIds.flatMap((poolId) =>
        BENCHMARK_SCENARIOS.flatMap((scenario) =>
          comparisons.map(([left, right]) => {
            const pairedSeeds = seeds.filter(
              (seed) =>
                runIndex.has(`${poolId}|${scenario.id}|${seed}|${left}|${sessionNumber}`) &&
                runIndex.has(`${poolId}|${scenario.id}|${seed}|${right}|${sessionNumber}`)
            )
            if (pairedSeeds.length === 0) return null
            const difference = (
              metric: 'brierScore' | 'logLoss' | 'unmasteredTargetRate' | 'finalMasteryBrierScore'
            ) =>
              summarize(
                pairedSeeds.map(
                  (seed) =>
                    runIndex.get(`${poolId}|${scenario.id}|${seed}|${left}|${sessionNumber}`)![
                      metric
                    ] -
                    runIndex.get(`${poolId}|${scenario.id}|${seed}|${right}|${sessionNumber}`)![
                      metric
                    ]
                )
              )
            return {
              pool: poolId,
              scenario: scenario.id,
              sessionNumber,
              pairCount: pairedSeeds.length,
              direction: `${left} minus ${right}`,
              brierScore: difference('brierScore'),
              logLoss: difference('logLoss'),
              unmasteredTargetRate: difference('unmasteredTargetRate'),
              finalMasteryBrierScore: difference('finalMasteryBrierScore')
            }
          })
        )
      )
    )
    .filter((comparison): comparison is NonNullable<typeof comparison> => comparison !== null)
  return {
    schemaVersion: 6,
    experiment: 'selection-benchmark-v6-longitudinal',
    sessionCount,
    trajectoryCount: poolIds.length * BENCHMARK_SCENARIOS.length * seeds.length * STRATEGIES.length,
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
    pools: Object.fromEntries(
      poolIds.map((poolId) => {
        const pool = benchmarkPools[poolId]
        return [
          poolId,
          {
            competencies: pool.competencies.length,
            questions: pool.questions.length,
            eligibleQuestions: getEligibleQuestions(pool.questions).length,
            eligibleCompetencies: getEligibleCompetencies(
              pool.competencies,
              getEligibleQuestions(pool.questions)
            ).length,
            description:
              poolId === 'synthetic'
                ? 'Balanced synthetic control pool; eight single-competency questions per competency.'
                : 'Current platform mock/test data from the database-systems course; responses are still generated synthetically.'
          }
        ]
      })
    ),
    assumptions: {
      latentModel: 'Binary BKT learner; response before learning; no forgetting or prerequisites.',
      difficulty:
        'Question difficulty is considered by the adaptive strategy but has no effect on the simulated response probability.',
      streams:
        'Separate selection and per-competency streams; same learner streams for all strategies.',
      initialState: 'No historical attempts; initial estimate 0.35 for every competency.',
      continuation:
        'Up to five sessions per trajectory by default. Carry exact competency estimates, evidence counts, latent learner states and RNG streams forward. Reset session history, focus, recent items and exclusions. No time decay or historical replay. Stop a trajectory when the full eligible competency pool meets the evidence criterion at the next session boundary; later session summaries contain only trajectories still running.',
      repetitions:
        'No item repeats within a session; previously answered items become available in the next session. The simulator models no item-specific memory.',
      baseline:
        'Fixed initial answer probability, scored with Brier score and log loss on the same policy-specific observations.',
      randomBaseline:
        'Non-adaptive control: uniform selection without replacement over the same eligible questions; identical BKT updates and stopping rules.',
      platformPool:
        'Uses the current platform mock/test-data structure and question metadata, but not real student answers. Synthetic response probabilities depend only on the simulated latent mastery state; question content and difficulty do not change the response probability.',
      comparison:
        'Answer-prediction scores describe different selected items. Final mastery Brier scores compare all eligible competencies for paired runs with the same seed and initial learner states.',
      selectionRelevance:
        'Share of selected target competencies that the simulated learner had not mastered at selection time; this measures alignment with simulated need, not learning gain.',
      finalStateMetric:
        'Initial and final mastery Brier scores compare the estimated mastery probability with the simulated binary mastery state across all eligible competencies, including competencies not selected during a session. Lower values indicate closer estimates; they do not measure real learner outcomes.',
      interpretation:
        'Synthetic demonstration, not empirical validation or evidence of real learning gains.'
    },
    summaries,
    pairedDifferences,
    runs
  }
}
