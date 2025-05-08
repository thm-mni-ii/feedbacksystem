export interface ChoiceAnswer {
  id: number
  text: string
  entries: Entry[]
}

interface Entry {
  id: number
  text: string
}
