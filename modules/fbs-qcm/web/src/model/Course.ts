import type Catalog from './Catalog'

export default interface Course {
  id: number
  name: string
  description: string
  visibility: boolean
  catalogs: Catalog[]
}
