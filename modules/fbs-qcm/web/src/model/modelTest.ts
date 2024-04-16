export default interface ModelTest {
  id: number
  name: string
  description: string | null
  children: ModelTest[]
}
