import { describe, expect, it } from 'vitest'
import QuestionType from '@/enums/QuestionType'
import type { Question } from '@/model/types'
import { fromEditableQuestion, toEditableQuestion } from '@/composables/competencyGraphQuestionAdapter'

const question: Question = {
  id: 'question-id',
  text: 'Question text',
  competencyIds: ['course-competency', 'other-course-competency'],
  competencyLinks: [
    { competencyId: 'course-competency', relation: 'supporting', weight: 0.5 },
    { competencyId: 'other-course-competency', relation: 'required', weight: 2 }
  ],
  questionType: QuestionType.Choice,
  questionConfiguration: {
    answerMode: 'single',
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [],
    optionRows: []
  },
  difficulty: 0.5
}

describe('competency graph question adapter', () => {
  it('keeps assignment metadata for other courses while changing competency selections', () => {
    const edited = {
      ...toEditableQuestion(question),
      competencyIds: ['new-course-competency', 'other-course-competency']
    }

    const updated = fromEditableQuestion(edited, question)

    expect(updated.competencyIds).toEqual(['new-course-competency', 'other-course-competency'])
    expect(updated.competencyLinks).toEqual([
      { competencyId: 'new-course-competency', relation: 'required', weight: 1 },
      { competencyId: 'other-course-competency', relation: 'required', weight: 2 }
    ])
  })

  it('removes only the competency links omitted from the edited assignment list', () => {
    const edited = {
      ...toEditableQuestion(question),
      competencyIds: ['other-course-competency']
    }

    const updated = fromEditableQuestion(edited, question)

    expect(updated.competencyIds).toEqual(['other-course-competency'])
    expect(updated.competencyLinks).toEqual([
      { competencyId: 'other-course-competency', relation: 'required', weight: 2 }
    ])
  })
})
