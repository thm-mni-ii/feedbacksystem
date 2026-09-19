export default interface FillInTheBlanks {
  showBlanks: boolean
  textParts: Part[]
}

interface Part {
  order: number
  text: string
  isBlank: boolean
  acceptedAlternatives?: string[]
  /**
   * Plausible falsche Antwortoptionen, die zusammen mit `text` als Auswahlmöglichkeiten
   * angezeigt werden, wenn `showBlanks` aktiv ist (Word-Bank-/Dropdown-Modus).
   * Nur relevant für Parts mit isBlank === true.
   */
  distractors?: string[]
}
