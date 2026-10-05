import { describe, expect, it } from 'vitest'
import {
  BENCHMARK_SCENARIOS,
  evaluateSelection,
  probabilityLoss,
  runBenchmark,
  summarize
} from '../evaluation/selectionBenchmark'

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
    expect(evaluateSelection([1, 2])).toEqual(evaluateSelection([1, 2]))
    expect(runBenchmark(BENCHMARK_SCENARIOS[1], 1, 'coverage-weighted').observations).not.toEqual(
      runBenchmark(BENCHMARK_SCENARIOS[1], 2, 'coverage-weighted').observations
    )
  })
  it('stores the prediction before incorporating the first answer', () => {
    const run = runBenchmark(BENCHMARK_SCENARIOS[1], 10, 'expected-information-gain')
    expect(run.observations[0].predictionBefore).toBeCloseTo(0.445)
    expect(run.taskCount).toBeLessThanOrEqual(30)
    expect(run.taskCount).toBeGreaterThan(0)
    expect(run.competencyCoverage).toBeGreaterThan(0)
    expect(run.competencyCoverage).toBeLessThanOrEqual(1)
  })
  it('reports both strategies for every scenario without tuning their model parameters', () => {
    const report = evaluateSelection([1, 2, 3])
    expect(report.runs).toHaveLength(24)
    expect(report.summaries).toHaveLength(8)
    expect(report.summaries.every((summary) => summary.runCount === 3)).toBe(true)
    expect(report.configuration.model.initialMastery).toBe(0.35)
    expect(report.configuration.selection.stickinessQuestions).toBe(3)
    expect(() => evaluateSelection([])).toThrow()
    expect(() => evaluateSelection([1, 1])).toThrow()
  })
})
