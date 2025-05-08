import type { Question } from '../Question.ts'

export default interface FillInTheBlanks {
  showBlanks: boolean
  textParts: Part[]
}

interface Part {
  order: number
  text: string
  isBlank: boolean
}
