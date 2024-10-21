import type QuestionType from '../enums/QuestionType.ts'
import type { Choice } from './questionTypes/Choice.js'
import type FillInTheBlanks from './questionTypes/FillInTheBlanks.js'

export default interface Question {
  _id?: string
  owner: number
  questiontext?: string
  questiontags: string[]
  questiontype: QuestionType
  questionconfiguration: Choice | FillInTheBlanks
}
