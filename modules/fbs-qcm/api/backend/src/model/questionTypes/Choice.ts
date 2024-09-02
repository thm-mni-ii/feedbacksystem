import { Question } from '../Question'

export default interface Choice extends Question {
  multipleRow: boolean
  multipleColumn: boolean
  answerColumns: OptionColumn[] // 1 = true/false, mehr = matrix
  optionRows: OptionRow[]
}

interface OptionColumn {
  id: string
  name: string
  correctAnswers: number[]
}

interface OptionRow {
  id: string
  text: string
}