import type Question from './Question'

export default interface Catalog {
  id: string
  name?: string
  questions?: any[]
  course?: string
  requirements?: number[]
}
