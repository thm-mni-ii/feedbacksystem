import type { Choice } from '@/model/questionTypes/Choice'
import type FillInTheBlanks from '@/model/questionTypes/FillInTheBlanks'
import type { Matching } from '@/model/questionTypes/Matching'
import { levenshteinSimilarity } from '@/utils/textSimilarity'

export interface MatrixSelection {
  rowId: number
  colId: number
}

export function scoreChoice(
  configuration: Choice,
  selectedOptionIds: number[],
  matrixPairs: MatrixSelection[]
): number {
  const rows = configuration.optionRows
  if (rows.length === 0) throw new Error('Die Auswahlaufgabe enthält keine Antwortoptionen.')
  const mode = configuration.answerMode ?? (configuration.multipleRow ? 'multiple' : 'single')
  if (!configuration.multipleColumn && mode === 'single') {
    const selectedRow = rows.find((row) => row.id === selectedOptionIds[0])
    return selectedRow && selectedRow.correctAnswers.length > 0 ? 1 : 0
  }
  const correctRows = rows.filter((row) => {
    if (!configuration.multipleColumn) {
      return row.correctAnswers.length > 0 === selectedOptionIds.includes(row.id)
    }
    const expected = new Set(row.correctAnswers)
    const actual = new Set(
      matrixPairs.filter((pair) => pair.rowId === row.id).map((pair) => pair.colId)
    )
    return expected.size === actual.size && [...expected].every((id) => actual.has(id))
  })
  return correctRows.length / rows.length
}

export function scoreBlank(given: string, text: string, alternatives: string[] = []): number {
  return Math.max(
    ...[text, ...alternatives].map((accepted) => levenshteinSimilarity(given, accepted))
  )
}

export function scoreFillInTheBlanks(
  configuration: FillInTheBlanks,
  answers: Record<number, string>
): number {
  const blanks = configuration.textParts.filter((part) => part.isBlank)
  if (blanks.length === 0) throw new Error('Der Lückentext enthält keine Lücken.')
  return (
    blanks.reduce(
      (sum, blank) =>
        sum + scoreBlank(answers[blank.order] ?? '', blank.text, blank.acceptedAlternatives),
      0
    ) / blanks.length
  )
}

export function scoreMatching(configuration: Matching, answers: Record<string, string>): number {
  if (!configuration.items?.length) throw new Error('Die Zuordnungsaufgabe enthält keine Elemente.')
  return (
    configuration.items.filter((item) => answers[item.id] === item.correctCategoryId).length /
    configuration.items.length
  )
}
