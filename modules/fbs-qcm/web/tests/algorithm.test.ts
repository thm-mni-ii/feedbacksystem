import { describe, expect, it } from 'vitest'
import { AdaptiveQuizAlgorithm, createSeededRandom, createSession } from '@/composables/algorithm'
import { buildQMatrix } from '@/composables/qMatrix'
import { DEFAULT_STUDY_ALGORITHM_CONFIG } from '@/model/StudyAlgorithmConfig'
import QuestionType from '@/enums/QuestionType'
import type { Competency, Question } from '@/model/types'

const competency: Competency = { id: 'skill', name: 'Kompetenz' }
const question: Question = {
  id: 'question',
  text: 'Aufgabe',
  competencyIds: ['skill'],
  questionType: QuestionType.Choice,
  questionConfiguration: {
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [{ id: 1, name: 'Antwort' }],
    optionRows: [{ id: 1, text: 'Richtig', correctAnswers: [1] }]
  },
  difficulty: 0.4
}

describe('adaptive algorithm regression', () => {
  it('preserves standard BKT transitions and the input state', () => {
    const algo = new AdaptiveQuizAlgorithm()
    const state = createSession('student', [competency])
    const first = algo.submitAnswer(question, 1, state, [competency], [question])
    expect(first.updatedState.competencies.skill.score).toBeCloseTo(0.7604494382)
    expect(state.competencies.skill.score).toBe(0.35)
    expect(state.history).toEqual([])
    const second = algo.submitAnswer(question, 1, first.updatedState, [competency], [question])
    expect(second.updatedState.competencies.skill.score).toBeCloseTo(0.9463532589)
    expect(second.result.sessionComplete).toBe(true)
    expect(second.updatedState.completedAt).not.toBeNull()
  })

  it('does not update zero-weight competency links', () => {
    const algo = new AdaptiveQuizAlgorithm()
    const state = createSession('student', [competency])
    const zeroWeight = { ...question, competencyLinks: [{ competencyId: 'skill', weight: 0 }] }
    expect(buildQMatrix([zeroWeight], [competency]).values).toEqual([[0]])
    const after = algo.submitAnswer(zeroWeight, 1, state, [competency], [zeroWeight])
    expect(after.updatedState.competencies.skill).toEqual(state.competencies.skill)
    expect(after.result.updatedCompetencies).toEqual([])
    expect(after.updatedState.history[0].competencyIds).toEqual([])
    expect(algo.applyHistoricalEvidence(zeroWeight, 1, state).competencies.skill).toEqual(
      state.competencies.skill
    )
  })

  it('can select a newly added competency without crashing', () => {
    const state = createSession('student', [])
    const result = new AdaptiveQuizAlgorithm().nextQuestion([competency], [question], state)
    expect(result?.targetCompetency.id).toBe('skill')
  })

  it('does not replay historical evidence from excluded questions', () => {
    const state = createSession('student', [competency])
    const excluded = { ...question, excludeFromAlgorithm: true }
    expect(new AdaptiveQuizAlgorithm().applyHistoricalEvidence(excluded, 1, state)).toEqual(state)
  })

  it('classifies historical responses before age decay, not afterwards', () => {
    const config = structuredClone(DEFAULT_STUDY_ALGORITHM_CONFIG)
    config.selection.responseScoreThreshold = 0.6
    config.selection.singleRequiredItemsOnly = true
    config.selection.competencyStrategy = 'expected-information-gain'
    const algo = new AdaptiveQuizAlgorithm(config)
    const state = createSession('student', [competency], config)
    const reliability = 2 ** (-180 / 30)
    const correct = algo.applyHistoricalEvidence(question, 1, state, reliability)
    const incorrect = algo.applyHistoricalEvidence(question, 0, state, reliability)
    const neutral = algo.applyHistoricalEvidence(question, 0.5, state, 0)
    expect(correct.competencies.skill.score).toBeGreaterThan(neutral.competencies.skill.score)
    expect(incorrect.competencies.skill.score).toBeLessThan(neutral.competencies.skill.score)
    expect(correct.history).toEqual([])
  })

  it('reports completion against the eligible EIG pool', () => {
    const config = structuredClone(DEFAULT_STUDY_ALGORITHM_CONFIG)
    config.selection.responseScoreThreshold = 0.5
    config.selection.singleRequiredItemsOnly = true
    config.selection.competencyStrategy = 'expected-information-gain'
    const other = { id: 'other', name: 'Other' }
    const state = createSession('student', [competency, other], config)
    state.competencies.skill = { ...state.competencies.skill, score: 0.95, timesAssessed: 2 }
    const multi = { ...question, id: 'multi', competencyIds: ['skill', 'other'] }
    const algo = new AdaptiveQuizAlgorithm(config)
    expect(algo.getCompletionStatus([competency, other], [question, multi], state).isComplete).toBe(
      true
    )
    expect(algo.nextQuestion([competency, other], [question, multi], state)).toBeNull()
  })

  it('reproduces the entire selection sequence using a fixed seed', () => {
    const pool = Array.from({ length: 8 }, (_, index) => ({ ...question, id: `q${index}` }))
    const run = (seed: number) => {
      const algo = new AdaptiveQuizAlgorithm(
        DEFAULT_STUDY_ALGORITHM_CONFIG,
        createSeededRandom(seed)
      )
      let state = createSession('student', [competency])
      const ids: string[] = []
      for (let index = 0; index < 8; index++) {
        const selected = algo.nextQuestion([competency], pool, state)
        if (!selected) break
        ids.push(selected.question.id)
        state = algo.submitAnswer(selected.question, 0, state, [competency], pool).updatedState
      }
      return ids
    }
    expect(run(42)).toEqual(run(42))
    expect(run(42)).not.toEqual(run(43))
  })

  it('validates the deterministic seed', () => {
    expect(() => createSeededRandom(NaN)).toThrow()
    expect(() => createSeededRandom(1.5)).toThrow()
    const random = createSeededRandom(0)
    for (let index = 0; index < 50; index++) {
      const value = random()
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(1)
    }
  })
})
