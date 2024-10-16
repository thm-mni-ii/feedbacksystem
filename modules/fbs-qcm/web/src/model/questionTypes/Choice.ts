import type Question from '../Question.ts'

export interface Choice extends Question {
  multipleRow: boolean
  multipleColumn: boolean
  answerColumns: OptionColumn[] // 1 = true/false, mehr = matrix
  optionRows: OptionRow[]
}

export interface OptionColumn {
  id: number
  name: string
  correctAnswers: number[]
}

interface OptionRow {
  id: number
  text: string
}
