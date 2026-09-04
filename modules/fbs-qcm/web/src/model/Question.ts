import type QuestionType from '../enums/QuestionType.ts'

/**
 * Einheitliches Question-Modell für Frontend UND Backend v2
 * (siehe `api/backend/v2/src/question/question.model.ts`).
 * Bewusst 1:1 identisch zum Wire-Format, damit es keine zwei parallel
 * gepflegten Interfaces (Legacy-DTO vs. v2-DTO) mehr gibt.
 */
export default interface Question {
  id?: string
  text?: string
  title?: string
  /** IDs der Competencies, die diese Frage abprüft (ersetzt das alte "Tags"-Konzept). */
  competencyIds: string[]
  /** Erweiterte Q-Matrix-Form mit Mehrfach-Attributen und optionalen Gewichten. */
  competencyLinks?: { competencyId: string; weight?: number; relation?: 'required' | 'supporting' }[]
  questionType: QuestionType
  questionConfiguration: any
  difficulty: number
  excludeFromAlgorithm?: boolean
}

