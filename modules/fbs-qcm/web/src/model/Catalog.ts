<<<<<<< HEAD
import type Question from './Question'

=======
>>>>>>> 8187ab839fdd5b11d400f093911e71aaf935f28f
export default interface Catalog {
  id: string
  name: string
  questions?: Question[]
  course?: number
  reqirements?: number[]
}
