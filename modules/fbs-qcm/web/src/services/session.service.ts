import type Question from '@/model/Question'
import axios, { type AxiosResponse } from 'axios'

class SessionService {
  startSession(courseId: number, catalogId: string): Promise<AxiosResponse<Question>> {
    console.log(localStorage.getItem('jsessionid'))
    console.log(localStorage.getItem('token'))
    return axios
      .post(
        '/api_v1/startSession',
        { course: courseId, catalog: catalogId },
        {
          headers: {
            authorization: `Bearer ${localStorage.getItem('jsessionid')}`
          }
        }
      )
      .then((res) => {
        console.log(res.data)
        console.log(res)
        return res
      })
  }
  submitAnswer(Answer: Object): Promise<AxiosResponse<any>> {
    return axios
      .post(
        '/api_v1/submission',
        { Answer },
        {
          headers: { authorization: `Bearer ${localStorage.getItem('jsessionid')}` }
        }
      )
      .then((res) => {
        console.log(res.data)
        console.log(res)
        return res
      })
      .catch((err) => {
        console.log(err)
        throw err
      })
  }
}

export default new SessionService()
