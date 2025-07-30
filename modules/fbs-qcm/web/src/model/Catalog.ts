import type Question from './Question'

export default interface Catalog {
  id: string
  name: string
  isPublic: boolean
  questions?: any[]
  course?: string
  requirements?: number[]
}
