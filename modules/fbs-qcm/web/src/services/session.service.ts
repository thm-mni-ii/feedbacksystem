import type Question from '@/model/Question'
import axios, { type AxiosResponse } from 'axios'

class SessionService {
  startSession(courseId: number, catalogId: string): Promise<AxiosResponse<Question>> {
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
  submitAnswer(question: string, answers: any): Promise<AxiosResponse<any>> {
    return axios
      .post(
        '/api_v1/submission',
        { question, answers },
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
