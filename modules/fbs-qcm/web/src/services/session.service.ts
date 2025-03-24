import type Question from '@/model/Question'
import axios, { type AxiosResponse } from 'axios'

interface IcheckSession {
  catalogId: string
  courseId: number
  status: string
  time: string
  user: string
}

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
  checkOngoingSession(): Promise<AxiosResponse<IcheckSession[]>> {
    return axios
      .get('/api_v1/getOngoingSession', {
        headers: { authorization: `Bearer ${localStorage.getItem('jsessionid')}` }
      })
      .then((res) => {
        console.log('getOngoingSession: ', res.data)
        return res
      })
      .catch((err) => {
        console.log(err)
        throw err
      })
  }
  endSession(catalog: string, course: number): Promise<AxiosResponse<any>> {
    return axios
      .put(
        '/api_v1/endSession',
        { catalog, course },
        {
          headers: { authorization: `Bearer ${localStorage.getItem('jsessionid')}` }
        }
      )
      .then((res) => {
        console.log(res.data)
        return res
      })
      .catch((err) => {
        console.log(err)
        throw err
      })
  }
  getCurrentQuestion(id: string): Promise<AxiosResponse<any>> {
    return axios
      .get(`/api_v1/current_question/${id}`, {
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
