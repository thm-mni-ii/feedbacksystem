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
        return res
      })
  }
  submitAnswer(question: string, answers: any): Promise<AxiosResponse<any>> {
    console.log('QUESTION: ', question)
    console.log('SUBMITTED ANSWERS: ', JSON.parse(JSON.stringify(answers)))
    return axios
      .post(
        '/api_v1/submission',
        { question, answers },
        {
          headers: { authorization: `Bearer ${localStorage.getItem('jsessionid')}` }
        }
      )
      .then((res) => {
        console.log('SUBMIT ANSWER RESPONSE:', res.data)
        return res
      })
      .catch((err) => {
        console.log(err)
        throw err
      })
  }
  checkSession(): Promise<AxiosResponse<any>> {
    return axios
      .get('/api_v1/getOngoingSessions', {
        headers: { authorization: `Bearer ${localStorage.getItem('jsessionid')}` }
      })
      .then((res) => {
        console.log(res.data)
        return res
      })
      .catch((err) => {
        console.log(err)
        throw err
      })
  }
  getCurrentQuestion(catalogId: string): Promise<AxiosResponse<any>> {
    return axios
      .get(`/api_v1/current_question/${catalogId}`, {
        headers: { authorization: `Bearer ${localStorage.getItem('jsessionid')}` }
      })
      .then((res) => {
        console.log('GET CURRENT QUESTION: ', res.data)
        return res
      })
      .catch((err) => {
        console.log(err)
        return err
      })
  }
}

export default new SessionService()
