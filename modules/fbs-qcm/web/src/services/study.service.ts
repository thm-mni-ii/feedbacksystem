import axios, { type AxiosResponse } from 'axios'

interface IcheckSession {
  courseId: number
  status: string
  time: string
  user: string
}

class StudyService {
  checkOngoingStudySession(): Promise<AxiosResponse<IcheckSession[]>> {
    return axios
      .get('/api_v1/getOngoingStudySession', {
        headers: { authorization: `Bearer ${localStorage.getItem('jsessionid')}` }
      })
      .then((res) => {
        console.log('getOngoingStudySession: ', res.data)
        return res
      })
      .catch((err) => {
        console.log(err)
        throw err
      })
  }
  startStudySession(courseId: number, catalogId: string): Promise<AxiosResponse<Question>> {
    return axios
      .post(
        '/api_v1/startStudySession',
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
  getCurrentQuestion(sessionId: string): Promise<AxiosResponse<any>> {
    return axios
      .get(`/api_v1/currentQuestion/${sessionId}`, {
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

export default new StudyService()
