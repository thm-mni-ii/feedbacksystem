export interface Choice {
  answerMode?: ChoiceAnswerMode
  /** @deprecated Use `answerMode`; retained for compatibility with saved questions. */
  multipleRow: boolean // false = single Choice, true = multiple Choice
  multipleColumn: boolean
  answerColumns: OptionColumn[] // 1 = true/false, mehr = matrix
  optionRows: OptionRow[]
}

export type ChoiceAnswerMode = 'single' | 'multiple'

export interface OptionColumn {
  id: number
  name: string
}

interface OptionRow {
  id: number
  text: string
  correctAnswers: number[]
}
