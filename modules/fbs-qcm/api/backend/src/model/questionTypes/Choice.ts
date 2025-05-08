import { Question } from '../Question'

export default interface Choice {
  multipleRow: boolean
  multipleColumn: boolean
  answerColumns: OptionColumn[] // 1 = true/false, mehr = matrix
  optionRows: OptionRow[]
}

interface OptionColumn {
  id: number
  name: string
}

interface OptionRow {
  id: number
  text: string
  correctAnswers: number[]
}
