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
  submitAnswer(questionId: string, answers: any, sessionId: string): Promise<AxiosResponse<any>> {
    return axios
      .post(
        '/api_v1/submission',
        { questionId, answers, sessionId },
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
  endSession(sessionId: string): Promise<AxiosResponse<any>> {
    return axios
      .put(
        `/api_v1/endSession/${sessionId}`,
        {},
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
  getCurrentQuestion(sessionId: string): Promise<AxiosResponse<any>> {
    return axios
      .get(`/api_v1/current_question/${sessionId}`, {
        headers: { authorization: `Bearer ${localStorage.getItem('jsessionid')}` }
      })
      .then((res) => {
        console.log('GET CURRENT QUESTION WITH SESSIONID: ', res.data)
        return res
      })
      .catch((err) => {
        console.log(err)
        return err
      })
  }
}

export default new SessionService()
