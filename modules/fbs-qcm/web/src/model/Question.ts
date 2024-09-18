import type QuestionType from '../enums/QuestionType.ts'

export default interface Question {
  _id: string
  owner: number
  questiontext?: string
  questiontags: string[]
  questiontype: QuestionType
  questionconfiguration: Choice | FillInTheBlanks | SQL
}
