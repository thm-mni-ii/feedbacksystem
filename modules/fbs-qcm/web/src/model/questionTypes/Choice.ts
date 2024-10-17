import type Question from '../Question.ts'

export interface Choice extends Question {
  multipleRow: boolean // false = single Choice, true = multiple Choice
  multipleColumn: boolean
  answerColumns: OptionColumn[] // 1 = true/false, mehr = matrix
  optionRows: OptionRow[]
}

export interface OptionColumn {
  id: number
  name: string
}

interface OptionRow {
  id: number
  text: string
  correctAnswers: number[]
}
