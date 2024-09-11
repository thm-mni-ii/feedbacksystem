import type QuestionType from '../enums/QuestionType.ts'
import Choice from './questionTypes/Choice.js'
import FillInTheBlanks from './questionTypes/FillInTheBlanks.js'

export interface Question {
  id: number
  owner: number
  questiontext?: string
  questiontags: string[]
  questiontype: QuestionType
  questionconfiguration: Choice | FillInTheBlanks | QuestionType.SQL
}
