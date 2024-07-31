import type QuestionType from '../enums/QuestionType.ts'

export interface Question {
  id: number
  owner: number
  questiontext?: string
  questiontags: string[]
  questiontype: QuestionType
  questionconfiguration: Choice | FillInTheBlanks | SQL
}
