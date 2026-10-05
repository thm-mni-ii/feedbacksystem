import QuestionType from '@/enums/QuestionType'
import type { NextQuestion, Question } from '@/model/types'
import type { Choice } from '@/model/questionTypes/Choice'
import type FillInTheBlanks from '@/model/questionTypes/FillInTheBlanks'
import type { Matching } from '@/model/questionTypes/Matching'
import { scoreBlank } from '@/composables/answerScoring'

/**
 * Elaboriertes Feedback nach einer Antwort (Knowledge of Correct Response plus
 * Rückmeldung je Teilantwort, vgl. Shute 2008). Die Bewertung je Teil folgt
 * denselben Regeln wie die Score-Berechnung in `QuestionInteraction.vue`, damit
 * Anzeige und an den Algorithmus übergebener Score übereinstimmen.
 */
export type AnswerOutcome = 'correct' | 'partial' | 'incorrect'

/**
 * - `correct`: Teil richtig beantwortet bzw. richtige Option gewählt
 * - `incorrect`: Teil falsch beantwortet bzw. falsche Option gewählt
 * - `missed`: richtige Option wurde nicht gewählt
 * - `partial`: Freitext nahe an der Lösung, aber nicht exakt (Teilpunkte)
 * - `neutral`: falsche Option wurde korrekt nicht gewählt
 */
export type AnswerFeedbackItemStatus = 'correct' | 'incorrect' | 'missed' | 'partial' | 'neutral'

export interface AnswerFeedbackItem {
  id: string
  label: string
  status: AnswerFeedbackItemStatus
  givenAnswer: string | null
  expectedAnswer: string | null
}

export interface AnswerFeedback {
  questionId: string
  questionText: string
  competencyName: string
  score: number
  outcome: AnswerOutcome
  items: AnswerFeedbackItem[]
  /** Lückentext mit eingesetzter Lösung; `null` bei anderen Aufgabentypen. */
  solutionParts: AnswerFeedbackSolutionPart[] | null
  /** Matrix-Auflösung Zelle für Zelle; `null` bei anderen Aufgabentypen. */
  matrix: AnswerFeedbackMatrix | null
  /** Zuordnung gruppiert nach richtiger Kategorie; `null` bei anderen Aufgabentypen. */
  matchingGroups: AnswerFeedbackMatchingGroup[] | null
}

export interface AnswerFeedbackSolutionPart {
  text: string
  isBlank: boolean
}

/** Gleiche Bedeutung wie bei Choice-Optionen, nur je Matrixzelle. */
export type AnswerFeedbackCellStatus = 'correct' | 'incorrect' | 'missed' | 'neutral'

export interface AnswerFeedbackMatrix {
  columns: Array<{ id: number; name: string }>
  rows: Array<{
    id: number
    label: string
    isCorrect: boolean
    cells: Array<{ columnId: number; status: AnswerFeedbackCellStatus }>
  }>
}

export interface AnswerFeedbackMatchingGroup {
  id: string
  label: string
  items: Array<{
    id: string
    label: string
    isCorrect: boolean
    /** Kategorie, in die das Element gelegt wurde; `null` = nicht zugeordnet. */
    givenCategoryLabel: string | null
  }>
}

const NO_ANSWER = 'keine Angabe'

export function getAnswerOutcome(score: number): AnswerOutcome {
  if (score >= 1) return 'correct'
  if (score <= 0) return 'incorrect'
  return 'partial'
}

export function buildAnswerFeedback(
  answered: NextQuestion,
  score: number,
  responsePayload: unknown
): AnswerFeedback {
  const { question, targetCompetency } = answered
  const isFillInTheBlanks = question.questionType === QuestionType.FillInTheBlanks
  const choiceConfiguration =
    question.questionType === QuestionType.Choice ? (question.questionConfiguration as Choice) : null
  const isMatrix = choiceConfiguration?.multipleColumn === true

  return {
    questionId: question.id,
    questionText: question.title || question.text,
    competencyName: targetCompetency.name,
    score,
    outcome: getAnswerOutcome(score),
    items: buildItems(question, responsePayload),
    solutionParts: isFillInTheBlanks
      ? buildFillInTheBlanksSolution(question.questionConfiguration as FillInTheBlanks)
      : null,
    matrix:
      isMatrix && choiceConfiguration ? buildMatrix(choiceConfiguration, responsePayload) : null,
    matchingGroups:
      question.questionType === QuestionType.Matching
        ? buildMatchingGroups(question.questionConfiguration as Matching, responsePayload)
        : null
  }
}

function buildItems(question: Question, responsePayload: unknown): AnswerFeedbackItem[] {
  switch (question.questionType) {
    case QuestionType.Choice: {
      const configuration = question.questionConfiguration as Choice
      return configuration.multipleColumn
        ? buildMatrixItems(configuration, responsePayload)
        : buildChoiceItems(configuration, responsePayload)
    }
    case QuestionType.FillInTheBlanks:
      return buildFillInTheBlanksItems(
        question.questionConfiguration as FillInTheBlanks,
        responsePayload
      )
    case QuestionType.Matching:
      return buildMatchingItems(question.questionConfiguration as Matching, responsePayload)
    default:
      return []
  }
}

function buildChoiceItems(configuration: Choice, responsePayload: unknown): AnswerFeedbackItem[] {
  const selected = new Set(Array.isArray(responsePayload) ? (responsePayload as number[]) : [])

  return configuration.optionRows.map((row) => {
    const isExpected = row.correctAnswers.length > 0
    const isSelected = selected.has(row.id)
    const status: AnswerFeedbackItemStatus =
      isExpected && isSelected
        ? 'correct'
        : isExpected
          ? 'missed'
          : isSelected
            ? 'incorrect'
            : 'neutral'

    return {
      id: String(row.id),
      label: row.text,
      status,
      givenAnswer: null,
      expectedAnswer: null
    }
  })
}

function buildMatrixItems(configuration: Choice, responsePayload: unknown): AnswerFeedbackItem[] {
  const pairs = Array.isArray(responsePayload)
    ? (responsePayload as Array<{ rowId: number; colId: number }>)
    : []
  const columnName = (columnId: number) =>
    configuration.answerColumns.find((column) => column.id === columnId)?.name ?? String(columnId)

  return configuration.optionRows.map((row) => {
    const expected = new Set(row.correctAnswers)
    const actual = new Set(pairs.filter((pair) => pair.rowId === row.id).map((pair) => pair.colId))
    const isCorrect = expected.size === actual.size && [...expected].every((id) => actual.has(id))

    return {
      id: String(row.id),
      label: row.text,
      status: isCorrect ? 'correct' : 'incorrect',
      givenAnswer: actual.size > 0 ? [...actual].map(columnName).join(', ') : NO_ANSWER,
      expectedAnswer: expected.size > 0 ? [...expected].map(columnName).join(', ') : NO_ANSWER
    }
  })
}

function buildFillInTheBlanksItems(
  configuration: FillInTheBlanks,
  responsePayload: unknown
): AnswerFeedbackItem[] {
  const answers = isRecord(responsePayload) ? responsePayload : {}
  const blanks = configuration.textParts
    .filter((part) => part.isBlank)
    .sort((a, b) => a.order - b.order)

  return blanks.map((blank, index) => {
    const given = String(answers[blank.order] ?? '').trim()
    const acceptedAnswers = [blank.text, ...(blank.acceptedAlternatives ?? [])]
    const similarity = scoreBlank(given, blank.text, blank.acceptedAlternatives)
    const status: AnswerFeedbackItemStatus =
      similarity >= 1 ? 'correct' : similarity > 0 ? 'partial' : 'incorrect'

    return {
      id: String(blank.order),
      label: `Lücke ${index + 1}`,
      status,
      givenAnswer: given.length > 0 ? given : NO_ANSWER,
      expectedAnswer: acceptedAnswers.join(' / ')
    }
  })
}

function buildMatchingItems(configuration: Matching, responsePayload: unknown): AnswerFeedbackItem[] {
  const answers = isRecord(responsePayload) ? responsePayload : {}
  const categoryLabel = (categoryId: unknown) =>
    (configuration.categories ?? []).find((category) => category.id === categoryId)?.label ?? null

  return (configuration.items ?? []).map((item) => ({
    id: item.id,
    label: item.text,
    status: answers[item.id] === item.correctCategoryId ? 'correct' : 'incorrect',
    givenAnswer: categoryLabel(answers[item.id]) ?? NO_ANSWER,
    expectedAnswer: categoryLabel(item.correctCategoryId) ?? item.correctCategoryId
  }))
}

function buildMatrix(configuration: Choice, responsePayload: unknown): AnswerFeedbackMatrix {
  const pairs = Array.isArray(responsePayload)
    ? (responsePayload as Array<{ rowId: number; colId: number }>)
    : []

  return {
    columns: configuration.answerColumns.map(({ id, name }) => ({ id, name })),
    rows: configuration.optionRows.map((row) => {
      const expected = new Set(row.correctAnswers)
      const actual = new Set(
        pairs.filter((pair) => pair.rowId === row.id).map((pair) => pair.colId)
      )
      const cells = configuration.answerColumns.map((column) => {
        const isExpected = expected.has(column.id)
        const isSelected = actual.has(column.id)
        const status: AnswerFeedbackCellStatus =
          isExpected && isSelected
            ? 'correct'
            : isExpected
              ? 'missed'
              : isSelected
                ? 'incorrect'
                : 'neutral'
        return { columnId: column.id, status }
      })

      return {
        id: row.id,
        label: row.text,
        isCorrect: cells.every((cell) => cell.status === 'correct' || cell.status === 'neutral'),
        cells
      }
    })
  }
}

function buildMatchingGroups(
  configuration: Matching,
  responsePayload: unknown
): AnswerFeedbackMatchingGroup[] {
  const answers = isRecord(responsePayload) ? responsePayload : {}
  const categories = configuration.categories ?? []
  const items = configuration.items ?? []
  const categoryLabel = (categoryId: unknown) =>
    categories.find((category) => category.id === categoryId)?.label ?? null

  const toGroupItem = (item: (typeof items)[number]) => ({
    id: item.id,
    label: item.text,
    isCorrect: answers[item.id] === item.correctCategoryId,
    givenCategoryLabel: categoryLabel(answers[item.id])
  })

  const groups: AnswerFeedbackMatchingGroup[] = categories.map((category) => ({
    id: category.id,
    label: category.label,
    items: items.filter((item) => item.correctCategoryId === category.id).map(toGroupItem)
  }))

  // Elemente mit unbekannter Zielkategorie nicht stillschweigend verlieren.
  const orphans = items.filter(
    (item) => !categories.some((category) => category.id === item.correctCategoryId)
  )
  if (orphans.length > 0) {
    groups.push({ id: '__unknown__', label: 'Ohne gültige Kategorie', items: orphans.map(toGroupItem) })
  }

  return groups.filter((group) => group.items.length > 0)
}

function buildFillInTheBlanksSolution(
  configuration: FillInTheBlanks
): AnswerFeedbackSolutionPart[] {
  return [...configuration.textParts]
    .sort((a, b) => a.order - b.order)
    .map((part) => ({ text: part.text, isBlank: part.isBlank }))
}

function isRecord(value: unknown): value is Record<string | number, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
