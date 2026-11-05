import { describe, expect, it } from 'vitest'
import {
  BENCHMARK_SCENARIOS,
  evaluateSelection,
  probabilityLoss,
  runBenchmark,
  runBenchmarkSequence,
  summarize
} from '../evaluation/selectionBenchmark'
import { renderChapterResults } from '../evaluation/chapterResults'

describe('reproducible evaluation harness', () => {
  it('calculates probability losses against known binary outcomes', () => {
    expect(probabilityLoss(0.5, 1).brierScore).toBe(0.25)
    expect(probabilityLoss(0.5, 0).logLoss).toBeCloseTo(Math.log(2))
    expect(probabilityLoss(1, 0).logLoss).toBeGreaterThan(27)
    expect(() => probabilityLoss(NaN, 1)).toThrow()
    expect(() => probabilityLoss(-0.1, 1)).toThrow()
    expect(summarize([1, 3])).toEqual({ mean: 2, sampleStandardDeviation: Math.sqrt(2) })
  })
  it('produces identical traces and numeric reports for identical seeds', () => {
    expect(evaluateSelection([1], 2)).toEqual(evaluateSelection([1], 2))
    expect(runBenchmark(BENCHMARK_SCENARIOS[1], 1, 'coverage-weighted').observations).not.toEqual(
      runBenchmark(BENCHMARK_SCENARIOS[1], 2, 'coverage-weighted').observations
    )
  }, 30_000)
  it('stores the prediction before incorporating the first answer', () => {
    const run = runBenchmark(BENCHMARK_SCENARIOS[1], 10, 'expected-information-gain')
    expect(run.observations[0].predictionBefore).toBeCloseTo(0.445)
    expect(run.observations[0].estimatedMasteryBefore).toBeCloseTo(0.35)
    expect(typeof run.observations[0].learnerMasteredBefore).toBe('boolean')
    expect(run.initialPredictionBrierScore).toBeGreaterThanOrEqual(0)
    expect(run.initialPredictionLogLoss).toBeGreaterThanOrEqual(0)
    expect(run.initialMasteryBrierScore).toBeGreaterThanOrEqual(0)
    expect(run.initialMasteryBrierScore).toBeLessThanOrEqual(1)
    expect(run.finalMasteryBrierScore).toBeGreaterThanOrEqual(0)
    expect(run.finalMasteryBrierScore).toBeLessThanOrEqual(1)
    expect(run.observations.every((item) => item.estimatedMasteryBefore >= 0)).toBe(true)
    expect(run.observations.every((item) => item.estimatedMasteryBefore <= 1)).toBe(true)
    expect(run.unmasteredTargetRate).toBeGreaterThanOrEqual(0)
    expect(run.unmasteredTargetRate).toBeLessThanOrEqual(1)
    expect(run.taskCount).toBeLessThanOrEqual(30)
    expect(run.taskCount).toBeGreaterThan(0)
    expect(run.competencyCoverage).toBeGreaterThan(0)
    expect(run.competencyCoverage).toBeLessThanOrEqual(1)
  })
  it('reports all strategies for every scenario without tuning their model parameters', () => {
    const report = evaluateSelection([1, 2, 3], 1)
    expect(report.runs).toHaveLength(72)
    expect(report.summaries).toHaveLength(24)
    expect(report.summaries.every((summary) => summary.runCount === 3)).toBe(true)
    expect(report.pairedDifferences).toHaveLength(24)
    expect(report.experiment).toBe('selection-benchmark-v6-longitudinal')
    expect(report.pairedDifferences[0]).toHaveProperty('unmasteredTargetRate')
    expect(report.pairedDifferences[0]).toHaveProperty('finalMasteryBrierScore')
    expect(report.configuration.model.initialMastery).toBe(0.35)
    expect(report.configuration.selection.stickinessQuestions).toBe(3)
    const latex = renderChapterResults(report)
    expect(latex).toContain('\\newcommand{\\EvaluationBrierTable}')
    expect(latex).toContain('\\newcommand{\\EvaluationNeedPlot}')
    expect(latex).toContain('\\newcommand{\\EvaluationEndpointTable}')
    expect(latex).toContain('\\newcommand{\\EvaluationSessions}{36}')
    expect(() => evaluateSelection([])).toThrow()
    expect(() => evaluateSelection([1, 1])).toThrow()
  })
  it('runs the random baseline without replacement and with shared stopping rules', () => {
    const run = runBenchmark(BENCHMARK_SCENARIOS[1], 7, 'random')
    expect(run.strategy).toBe('random')
    expect(run.repetitionRate).toBe(0)
    expect(run.taskCount).toBeLessThanOrEqual(30)
    expect(run.observations[0].predictionBefore).toBeCloseTo(0.445)
    expect(runBenchmark(BENCHMARK_SCENARIOS[1], 7, 'random')).toEqual(run)
    expect(
      runBenchmark(BENCHMARK_SCENARIOS[1], 7, 'coverage-weighted').initialMasteryBrierScore
    ).toBe(run.initialMasteryBrierScore)
    // Same learner streams across policies: identical oracle probability on the first step.
    expect([0.2, 0.9]).toContain(run.observations[0].oracleProbabilityBefore)
  })
  it('runs the platform test-data pool as a separate synthetic-response condition', () => {
    const run = runBenchmark(BENCHMARK_SCENARIOS[1], 11, 'random', 'platform-testdata')
    expect(run.pool).toBe('platform-testdata')
    expect(run.taskCount).toBeGreaterThan(0)
    expect(run.taskCount).toBeLessThanOrEqual(30)
    expect(run.observations.every((item) => item.questionId.startsWith('q-'))).toBe(true)

    const report = evaluateSelection([1], 1)
    expect(report.pools['platform-testdata']).toMatchObject({
      competencies: 48,
      questions: 147
    })
    expect(report.pools['platform-testdata'].eligibleCompetencies).toBeGreaterThan(0)
    expect(report.summaries.some((summary) => summary.pool === 'platform-testdata')).toBe(true)
  })
  it('continues mastery, evidence and learner states across five session boundaries', () => {
    for (const strategy of ['random', 'coverage-weighted', 'expected-information-gain'] as const) {
      const sequence = runBenchmarkSequence(
        BENCHMARK_SCENARIOS[1],
        11,
        strategy,
        'platform-testdata'
      )
      expect(sequence).toHaveLength(5)
      expect(sequence[0]).toEqual(
        runBenchmark(BENCHMARK_SCENARIOS[1], 11, strategy, 'platform-testdata')
      )
      sequence.forEach((run, index) => {
        expect(run.sessionNumber).toBe(index + 1)
        expect(run.taskCount).toBeLessThanOrEqual(30)
        expect(run.repetitionRate).toBe(0)
        expect(new Set(run.observations.map((item) => item.questionId)).size).toBe(run.taskCount)
        const after = run.competencyStatesAfter
        const before = run.competencyStatesBefore
        expect(run.finalMasteryBrierScore).toBeCloseTo(
          after.reduce((sum, state) => sum + (state.estimate - Number(state.mastered)) ** 2, 0) /
            after.length
        )
        expect(
          after.reduce((sum, state, i) => sum + state.timesAssessed - before[i].timesAssessed, 0)
        ).toBe(run.taskCount)
        if (index > 0) {
          expect(before).toEqual(sequence[index - 1].competencyStatesAfter)
          expect(run.initialMasteryBrierScore).toBe(sequence[index - 1].finalMasteryBrierScore)
        }
      })
      expect(sequence.flatMap((run) => run.observations).length).toBeGreaterThan(30)
    }
  })
  it('groups results by session and rejects invalid session counts', () => {
    const report = evaluateSelection([11], 2)
    expect(report.summaries.some((summary) => summary.sessionNumber === 2)).toBe(true)
    expect(report.pairedDifferences.every((comparison) => comparison.pairCount === 1)).toBe(true)
    expect(() =>
      runBenchmarkSequence(BENCHMARK_SCENARIOS[1], 1, 'random', 'synthetic', 0)
    ).toThrow()
  })
  it('reopens session-local item exclusions but stops after full-pool evidence completion', () => {
    const exhausted = runBenchmarkSequence(
      BENCHMARK_SCENARIOS[2],
      1,
      'coverage-weighted',
      'platform-testdata'
    )
    expect(exhausted[3].endReason).toBe('no-question')
    expect(exhausted[4].taskCount).toBeGreaterThan(0)
    expect(exhausted[4].competencyStatesBefore).toEqual(exhausted[3].competencyStatesAfter)
    const completed = runBenchmarkSequence(
      BENCHMARK_SCENARIOS[2],
      1,
      'coverage-weighted',
      'synthetic'
    )
    expect(completed).toHaveLength(2)
    expect(completed[1].endReason).toBe('evidence')
  })
})
