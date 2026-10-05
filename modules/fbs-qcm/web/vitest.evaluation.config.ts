import { mergeConfig, defineConfig } from 'vitest/config'
import base from './vitest.config'

export default mergeConfig(
  base,
  defineConfig({
    test: { include: ['evaluation/run.evaluation.ts'], exclude: ['tests/**'], reporters: ['verbose'], silent: false }
  })
)
