export default interface ChoiceQuestionConfiguration {
  multipleRow: boolean
  multipleColumn: boolean
  answerColumns: { id: number; name: string }[]
  optionRows: { id: number; text: string; correctAnswers: number[] }[]
}
