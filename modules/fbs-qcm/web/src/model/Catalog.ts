import type Question from './Question'

export default interface Catalog {
  id: string
  name: string
  questions?: Question[]
  course?: number
  reqirements?: number[]
}
