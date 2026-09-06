import type { Question as LearningQuestion } from '@/model/types'
import type EditableQuestion from '@/model/Question'
import type { QuestionMockItem } from '@/composables/question.mock'
import QuestionType from '@/enums/QuestionType'

/**
 * Der SkillGraph arbeitet ausschließlich mit `LearningQuestion` (Mock-/lokalem
 * Domänenmodell aus `model/types.ts`), während `DialogEditQuestion`/`EditQuestion`
 * das v2-Wire-Format `model/Question.ts` erwartet (questionType/questionConfiguration).
 * Diese Adapter-Funktionen übersetzen zwischen beiden, damit der Bearbeiten-Dialog
 * im SkillGraph korrekt vorbefüllt wird, ohne dass beide Modelle dauerhaft vermischt
 * werden müssen.
 */
export function toEditableQuestion(question: LearningQuestion): EditableQuestion {
  const legacy = question.legacyQuestion as QuestionMockItem | undefined
  const isFillInTheBlanks = legacy?.questiontype === 'fill-in-the-blank'

  const questionType = isFillInTheBlanks ? QuestionType.FillInTheBlanks : QuestionType.Choice

  const questionConfiguration = isFillInTheBlanks
    ? {
        showBlanks: (legacy?.showBlanks as boolean) ?? true,
        textParts: (legacy?.textParts as { order: number; text: string; isBlank: boolean }[]) ?? [
          { order: 1, text: '', isBlank: false }
        ]
      }
    : {
        multipleRow: (legacy?.multipleRow as boolean) ?? false,
        multipleColumn: (legacy?.multipleColumn as boolean) ?? false,
        answerColumns: (legacy?.answerColumns as { id: number; name: string }[]) ?? [
          { id: 1, name: '' }
        ],
        optionRows: (legacy?.optionRows as {
          id: number
          text: string
          correctAnswers: number[]
        }[]) ?? [{ id: 1, text: '', correctAnswers: [] }]
      }

  return {
    id: question.id,
    text: question.text,
    title: question.title,
    competencyIds: [...question.competencyIds],
    competencyLinks: question.competencyLinks?.map((link) => ({ ...link })),
    questionType,
    questionConfiguration,
    difficulty: question.difficulty,
    excludeFromAlgorithm: question.excludeFromAlgorithm
  }
}

export function fromEditableQuestion(
  edited: EditableQuestion,
  original: LearningQuestion
): LearningQuestion {
  return {
    ...original,
    text: edited.text ?? original.text,
    title: edited.title ?? original.title,
    competencyIds: [...(edited.competencyIds ?? original.competencyIds)],
    competencyLinks: edited.competencyLinks?.map((link) => ({ ...link })) ?? original.competencyLinks,
    difficulty: edited.difficulty ?? original.difficulty,
    excludeFromAlgorithm: edited.excludeFromAlgorithm ?? original.excludeFromAlgorithm
  }
}
