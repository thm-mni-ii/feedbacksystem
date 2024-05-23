export interface Catalog {
  id: string
  name: string
  difficulty: number
  passed: boolean
  questions?: number[]
  requirements: number[]
}
