export default interface ChoiceQuestionConfiguration {
  answerMode?: 'single' | 'multiple'
  /** @deprecated Use `answerMode`; retained for compatibility with saved questions. */
  multipleRow: boolean
  multipleColumn: boolean
  answerColumns: { id: number; name: string }[]
  optionRows: { id: number; text: string; correctAnswers: number[] }[]
}
