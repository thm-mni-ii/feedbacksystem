import type { Question } from '@/model/types'
import type EditableQuestion from '@/model/Question'
import type { Choice } from '@/model/questionTypes/Choice'
import type FillInTheBlanks from '@/model/questionTypes/FillInTheBlanks'

/**
 * Der Kompetenzgraph arbeitet ausschließlich mit `Question` (Mock-/lokalem
 * Domänenmodell aus `model/types.ts`), während `DialogEditQuestion`/`EditQuestion`
 * das v2-Wire-Format `model/Question.ts` erwartet (questionType/questionConfiguration).
 * Beide Modelle halten `questionType`/`questionConfiguration` inzwischen 1:1 identisch,
 * diese Adapter-Funktionen übernehmen daher nur noch das Umformen der übrigen Felder
 * (competencyIds/competencyLinks etc.), ohne beide Modelle dauerhaft vermischen zu müssen.
 */
export function toEditableQuestion(question: Question): EditableQuestion {
  return {
    id: question.id,
    text: question.text,
    title: question.title,
    competencyIds: [...question.competencyIds],
    competencyLinks: question.competencyLinks?.map((link) => ({ ...link })),
    questionType: question.questionType,
    questionConfiguration: question.questionConfiguration,
    difficulty: question.difficulty,
    excludeFromAlgorithm: question.excludeFromAlgorithm
  }
}

export function fromEditableQuestion(
  edited: EditableQuestion,
  original: Question
): Question {
  return {
    ...original,
    text: edited.text ?? original.text,
    title: edited.title ?? original.title,
    competencyIds: [...(edited.competencyIds ?? original.competencyIds)],
    competencyLinks: edited.competencyLinks?.map((link) => ({ ...link })) ?? original.competencyLinks,
    questionType: edited.questionType ?? original.questionType,
    questionConfiguration:
      (edited.questionConfiguration as Choice | FillInTheBlanks | undefined) ??
      original.questionConfiguration,
    difficulty: edited.difficulty ?? original.difficulty,
    excludeFromAlgorithm: edited.excludeFromAlgorithm ?? original.excludeFromAlgorithm
  }
}
