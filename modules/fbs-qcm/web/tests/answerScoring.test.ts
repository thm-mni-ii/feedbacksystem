import { describe, expect, it } from 'vitest'
import { scoreChoice, scoreFillInTheBlanks, scoreMatching } from '@/composables/answerScoring'
import { buildAnswerFeedback } from '@/composables/answerFeedback'
import QuestionType from '@/enums/QuestionType'
import type { Choice } from '@/model/questionTypes/Choice'
import type FillInTheBlanks from '@/model/questionTypes/FillInTheBlanks'
import type { Matching } from '@/model/questionTypes/Matching'

const choice: Choice = {
  multipleRow: false,
  multipleColumn: false,
  answerColumns: [{ id: 1, name: 'Richtig' }],
  optionRows: [
    { id: 1, text: 'A', correctAnswers: [1] },
    { id: 2, text: 'B', correctAnswers: [] },
    { id: 3, text: 'C', correctAnswers: [] },
    { id: 4, text: 'D', correctAnswers: [] }
  ]
}
const blanks: FillInTheBlanks = {
  showBlanks: false,
  textParts: [
    { order: 0, text: 'Beispiel', isBlank: false },
    { order: 1, text: 'JOIN', isBlank: true, acceptedAlternatives: ['Verbund'] },
    { order: 2, text: 'SQL', isBlank: true }
  ]
}
const matching: Matching = {
  categories: [
    { id: 'a', label: 'A' },
    { id: 'b', label: 'B' }
  ],
  items: [
    { id: 'first', text: 'Erstes Element', correctCategoryId: 'a' },
    { id: 'second', text: 'Zweites Element', correctCategoryId: 'b' }
  ]
}

describe('answer scoring used by the learning UI', () => {
  it('awards no partial credit for a wrong single-choice response', () => {
    expect(scoreChoice(choice, [1], [])).toBe(1)
    expect(scoreChoice(choice, [2], [])).toBe(0)
    expect(scoreChoice(choice, [], [])).toBe(0)
  })
  it('preserves row-based partial credit for multiple choice', () => {
    expect(scoreChoice({ ...choice, answerMode: 'multiple' }, [1, 2], [])).toBe(0.75)
  })
  it('requires the exact selected set for each matrix row', () => {
    const matrix = { ...choice, multipleColumn: true, optionRows: choice.optionRows.slice(0, 2) }
    expect(scoreChoice(matrix, [], [{ rowId: 1, colId: 1 }])).toBe(1)
    expect(
      scoreChoice(
        matrix,
        [],
        [
          { rowId: 1, colId: 1 },
          { rowId: 2, colId: 1 }
        ]
      )
    ).toBe(0.5)
  })
  it('accepts alternatives, normalizes text and counts unanswered blanks', () => {
    expect(scoreFillInTheBlanks(blanks, { 1: '  verbund ', 2: 'sql' })).toBe(1)
    expect(scoreFillInTheBlanks(blanks, { 1: 'JOIN' })).toBe(0.5)
    expect(scoreFillInTheBlanks(blanks, {})).toBe(0)
    expect(scoreFillInTheBlanks(blanks, { 1: 'JOI', 2: 'SQL' })).toBe(0.875)
  })
  it('uses the same blank scoring rules in the feedback', () => {
    const answers = { 1: 'Verbund', 2: 'SQ' }
    const score = scoreFillInTheBlanks(blanks, answers)
    const feedback = buildAnswerFeedback(
      {
        question: {
          id: 'blank',
          text: 'Text',
          questionType: QuestionType.FillInTheBlanks,
          questionConfiguration: blanks,
          competencyIds: ['skill'],
          difficulty: 0.5
        },
        targetCompetency: { id: 'skill', name: 'Kompetenz' }
      },
      score,
      answers
    )
    expect(feedback.score).toBeCloseTo(5 / 6)
    expect(feedback.items.map((item) => item.status)).toEqual(['correct', 'partial'])
  })
  it('scores matching by element and treats missing or unknown assignments as incorrect', () => {
    expect(scoreMatching(matching, { first: 'a', second: 'b' })).toBe(1)
    expect(scoreMatching(matching, { first: 'a' })).toBe(0.5)
    expect(scoreMatching(matching, { first: 'unknown', second: 'a' })).toBe(0)
  })
  it('reports unusable configurations explicitly', () => {
    expect(() => scoreChoice({ ...choice, optionRows: [] }, [], [])).toThrow()
    expect(() => scoreFillInTheBlanks({ ...blanks, textParts: [] }, {})).toThrow()
    expect(() => scoreMatching({ ...matching, items: [] }, {})).toThrow()
  })
})
