import type Question from '@/model/Question'
import axios, { type AxiosResponse } from 'axios'

class SessionService {
  startSession(catalogId: string, courseId: number): Promise<AxiosResponse<Question>> {
    console.log(localStorage.getItem('jsessionid'))
    console.log(localStorage.getItem('token'))
    return axios
      .post(
        '/api_v1/startSession',
        {},
        {
          headers: { authorization: `Bearer ${localStorage.getItem('jsessionid')}` }
        }
      )
      .then((res) => {
        console.log(res.data)
        console.log(res)
        return res
      })
  }
  submitAnswer(Answer: String[]): Promise<AxiosResponse<any>> {
    return axios
      .post(
        '/api_v1/submitSessionAnswer',
        {},
        {
          headers: { authorization: `Bearer ${localStorage.getItem('jsessionid')}` },
          params: { answers: Answer }
        }
      )
      .then((res) => {
        console.log(res.data)
        console.log(res)
      })
  }
}

export default new SessionService()
