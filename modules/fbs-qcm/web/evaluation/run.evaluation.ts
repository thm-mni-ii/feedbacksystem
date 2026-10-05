import { writeFileSync } from 'node:fs'
import { test, expect } from 'vitest'
import { evaluateSelection } from './selectionBenchmark'

test('run and export the predefined synthetic selection experiment', () => {
  const report = evaluateSelection()
  expect(report.runs).toHaveLength(800)
  console.table(
    report.summaries.map((summary) => ({
      scenario: summary.scenario,
      strategy: summary.strategy,
      runs: summary.runCount,
      tasks: summary.metrics.taskCount.mean.toFixed(2),
      coverage: summary.metrics.competencyCoverage.mean.toFixed(3),
      brier: summary.metrics.brierScore.mean.toFixed(4),
      logLoss: summary.metrics.logLoss.mean.toFixed(4),
      repetition: summary.metrics.repetitionRate.mean.toFixed(3)
    }))
  )
  const output = process.env.QCM_EVALUATION_OUTPUT
  if (output) {
    writeFileSync(output, JSON.stringify(report, null, 2) + '\n', { flag: 'wx' })
    console.info(`Evaluation report saved to ${output}`)
  }
}, 30_000)
