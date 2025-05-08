import axios, { type AxiosResponse } from 'axios'

interface Cat {
  name: string
  age: number
}

class CatService {
  postCat(cat: Cat): Promise<AxiosResponse<Cat>> {
    return axios.post('/api_v1/cats', cat)
  }
}

export default new CatService()
