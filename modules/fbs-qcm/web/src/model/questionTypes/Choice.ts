import type Question from '../Question.ts'

export default interface Choice extends Question {
  multiple: boolean
  optionColumns: OptionColumn[]
}

interface OptionColumn {
  id: string
  name: string
  multiple: boolean
  options: Option[]
  correctAnswers: number[]
}

interface Option {
  id: string
  text: string
}
