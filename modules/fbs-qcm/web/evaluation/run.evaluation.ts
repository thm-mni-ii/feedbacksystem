import { writeFileSync } from 'node:fs'
import { test, expect } from 'vitest'
import { evaluateSelection } from './selectionBenchmark'
import { renderChapterResults } from './chapterResults'

test('run and export the predefined two-pool selection experiment', () => {
  const report = evaluateSelection()
  expect(report.runs.filter((run) => run.sessionNumber === 1)).toHaveLength(2400)
  expect(report.runs.length).toBeLessThanOrEqual(12000)
  expect(report.runs.some((run) => run.sessionNumber === 5)).toBe(true)
  console.table(
    report.summaries.map((summary) => ({
      pool: summary.pool,
      scenario: summary.scenario,
      strategy: summary.strategy,
      session: summary.sessionNumber,
      runs: summary.runCount,
      tasks: summary.metrics.taskCount.mean.toFixed(2),
      coverage: summary.metrics.competencyCoverage.mean.toFixed(3),
      unmasteredTargets: summary.metrics.unmasteredTargetRate.mean.toFixed(3),
      brier: summary.metrics.brierScore.mean.toFixed(4),
      initialBrier: summary.metrics.initialPredictionBrierScore.mean.toFixed(4),
      masteryBrierBefore: summary.metrics.initialMasteryBrierScore.mean.toFixed(4),
      masteryBrierAfter: summary.metrics.finalMasteryBrierScore.mean.toFixed(4),
      logLoss: summary.metrics.logLoss.mean.toFixed(4),
      initialLogLoss: summary.metrics.initialPredictionLogLoss.mean.toFixed(4),
      repetition: summary.metrics.repetitionRate.mean.toFixed(3)
    }))
  )
  console.table(
    report.pairedDifferences.map((difference) => ({
      pool: difference.pool,
      scenario: difference.scenario,
      comparison: difference.direction,
      session: difference.sessionNumber,
      pairs: difference.pairCount,
      masteryBrierDifference: difference.finalMasteryBrierScore.mean.toFixed(4),
      masteryBrierStdDev: difference.finalMasteryBrierScore.sampleStandardDeviation.toFixed(4)
    }))
  )
  const output = process.env.QCM_EVALUATION_OUTPUT
  if (output) {
    writeFileSync(output, JSON.stringify(report, null, 2) + '\n', { flag: 'wx' })
    console.info(`Evaluation report saved to ${output}`)
  }
  const latexOutput = process.env.QCM_EVALUATION_LATEX
  if (latexOutput) {
    writeFileSync(latexOutput, renderChapterResults(report), { flag: 'wx' })
    console.info(`Chapter tables and plots saved to ${latexOutput}`)
  }
}, 600_000)
