import { describe, expect, it } from 'vitest'
import {
  advanceAlgorithmSimulation,
  createAlgorithmSimulation
} from '@/composables/algorithmSimulation'
import QuestionType from '@/enums/QuestionType'
import type { Competency, Question } from '@/model/types'

const competencies: Competency[] = [
  { id: 'sql', name: 'SQL' },
  { id: 'modeling', name: 'Datenmodellierung' }
]

const questions: Question[] = competencies.flatMap((competency) =>
  Array.from({ length: 5 }, (_, index) => ({
    id: `${competency.id}-${index}`,
    text: `Aufgabe ${index + 1} zu ${competency.name}`,
    competencyIds: [competency.id],
    competencyLinks: [{ competencyId: competency.id, relation: 'required' as const }],
    questionType: QuestionType.Choice,
    questionConfiguration: {
      multipleRow: false,
      multipleColumn: false,
      answerColumns: [{ id: 1, name: 'Korrekt' }],
      optionRows: [
        { id: 1, text: 'Ja', correctAnswers: [1] },
        { id: 2, text: 'Nein', correctAnswers: [] }
      ]
    },
    difficulty: 0.4
  }))
)

function run(seed: number) {
  const simulation = createAlgorithmSimulation({
    competencies,
    questions,
    profile: 'medium',
    seed,
    strategy: 'coverage-weighted'
  })
  const steps = []
  while (simulation.currentQuestion && !simulation.endReason) {
    const step = advanceAlgorithmSimulation(simulation)
    if (step) steps.push(step)
  }
  return steps
}

describe('algorithm lab simulation', () => {
  it('produces the same response and estimate sequence for the same seed', () => {
    const first = run(37)
    const second = run(37)

    expect(first.map((step) => [
      step.question.id,
      step.answeredCorrectly,
      step.predictionBefore,
      step.estimatedMasteryAfter
    ])).toEqual(
      second.map((step) => [
        step.question.id,
        step.answeredCorrectly,
        step.predictionBefore,
        step.estimatedMasteryAfter
      ])
    )
  })

  it('filters out items with multiple required competencies', () => {
    const multiCompetencyQuestion: Question = {
      ...questions[0],
      id: 'multi',
      competencyIds: ['sql', 'modeling'],
      competencyLinks: [
        { competencyId: 'sql', relation: 'required' },
        { competencyId: 'modeling', relation: 'required' }
      ]
    }
    const simulation = createAlgorithmSimulation({
      competencies,
      questions: [...questions, multiCompetencyQuestion],
      profile: 'low',
      seed: 5,
      strategy: 'coverage-weighted'
    })

    expect(simulation.eligibleQuestionCount).toBe(questions.length)
    expect(simulation.questions.some((question) => question.id === 'multi')).toBe(false)
  })

  it('configures expected-information-gain for binary single-competency responses', () => {
    const simulation = createAlgorithmSimulation({
      competencies,
      questions,
      profile: 'high',
      seed: 11,
      strategy: 'expected-information-gain'
    })

    expect(simulation.session.algorithm.configuration.selection.responseScoreThreshold).toBe(0.5)
    expect(simulation.session.algorithm.configuration.selection.singleRequiredItemsOnly).toBe(true)
    expect(advanceAlgorithmSimulation(simulation)?.number).toBe(1)
  })

  it('rejects invalid seeds with an explicit error', () => {
    expect(() =>
      createAlgorithmSimulation({
        competencies,
        questions,
        profile: 'medium',
        seed: 0,
        strategy: 'coverage-weighted'
      })
    ).toThrow('Der Seed muss eine ganze Zahl zwischen 1 und 1.000.000 sein.')
  })
})
