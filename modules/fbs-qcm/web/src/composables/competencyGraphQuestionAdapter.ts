import type { Question } from '@/model/types'
import type EditableQuestion from '@/model/Question'
import type { Choice } from '@/model/questionTypes/Choice'
import type FillInTheBlanks from '@/model/questionTypes/FillInTheBlanks'
import type { Matching } from '@/model/questionTypes/Matching'
import { getQuestionCompetencyIds } from '@/composables/qMatrix'

/**
 * Der Kompetenzgraph verwendet das Domänenmodell aus `model/types.ts`, während
 * `DialogEditQuestion`/`EditQuestion` das API-Format `model/Question.ts` erwartet.
 * Beide Modelle halten `questionType`/`questionConfiguration` inzwischen 1:1 identisch,
 * diese Adapter-Funktionen übernehmen daher nur noch das Umformen der übrigen Felder
 * (competencyIds/competencyLinks etc.), ohne beide Modelle dauerhaft vermischen zu müssen.
 */
export function toEditableQuestion(question: Question): EditableQuestion {
  return {
    id: question.id,
    text: question.text,
    title: question.title,
    competencyIds: getQuestionCompetencyIds(question),
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
  const competencyIds = [...new Set(edited.competencyIds ?? original.competencyIds)]
  const existingLinks = new Map(
    [...(edited.competencyLinks ?? original.competencyLinks ?? [])].map((link) => [
      link.competencyId,
      link
    ])
  )

  return {
    ...original,
    text: edited.text ?? original.text,
    title: edited.title ?? original.title,
    competencyIds,
    competencyLinks: competencyIds.map(
      (competencyId) =>
        existingLinks.get(competencyId) ?? {
          competencyId,
          relation: 'required' as const,
          weight: 1
        }
    ),
    questionType: edited.questionType ?? original.questionType,
    questionConfiguration:
      (edited.questionConfiguration as Choice | FillInTheBlanks | Matching | undefined) ??
      original.questionConfiguration,
    difficulty: edited.difficulty ?? original.difficulty,
    excludeFromAlgorithm: edited.excludeFromAlgorithm ?? original.excludeFromAlgorithm
  }
}

/**
 * Baut aus einer im Dialog neu angelegten `EditableQuestion` eine vollständige
 * `Question` für den Create-Aufruf, bei dem keine bestehende Aufgabe zum
 * Zusammenführen existiert.
 */
export function fromNewEditableQuestion(edited: EditableQuestion): Question {
  return {
    id: edited.id ?? `local-${crypto.randomUUID()}`,
    text: edited.text ?? '',
    title: edited.title,
    competencyIds: [...(edited.competencyIds ?? [])],
    competencyLinks: edited.competencyLinks?.map((link) => ({ ...link })),
    questionType: edited.questionType,
    questionConfiguration: edited.questionConfiguration as Choice | FillInTheBlanks | Matching,
    difficulty: edited.difficulty ?? 0.5,
    excludeFromAlgorithm: edited.excludeFromAlgorithm
  }
}
