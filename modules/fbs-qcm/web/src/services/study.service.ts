import axios, { type AxiosResponse } from 'axios'

interface IcheckSession {
  courseId: number
  status: string
  time: string
  user: string
  type?: string
  _id?: string
}

class StudyService {
  // Prüft, ob eine laufende Study Session für einen Kurs existiert
  checkOngoingStudySession(courseId?: number): Promise<AxiosResponse<IcheckSession[]>> {
    const params: any = {}
    if (courseId !== undefined) params.courseId = courseId
    return axios.get('/api_v1/getOngoingLearnSession', {
      params,
      headers: { authorization: `Bearer ${localStorage.getItem('jsessionid')}` }
    })
  }

  // Startet eine neue Study Session für einen Kurs
  startStudySession(courseId: number): Promise<AxiosResponse<any>> {
    console.log(`Starting study session for course ID: ${courseId}`)
    return axios.post(
      '/api_v1/startLearnSession',
      { course: courseId },
      {
        headers: {
          authorization: `Bearer ${localStorage.getItem('jsessionid')}`
        }
      }
    )
  }

  // Holt die aktuelle Frage für eine Session
  getCurrentQuestion(sessionId: string): Promise<AxiosResponse<any>> {
    return axios.get(`/api_v1/currentLearnQuestion/${sessionId}`, {
      headers: { authorization: `Bearer ${localStorage.getItem('jsessionid')}` }
    })
  }

  // Antwort absenden
  submitAnswer(sessionId: string, answer: any): Promise<AxiosResponse<any>> {
    return axios.post(
      `/api_v1/submitLearnAnswer/${sessionId}`,
      { answer },
      {
        headers: {
          authorization: `Bearer ${localStorage.getItem('jsessionid')}`
        }
      }
    )
  }

  // Session beenden
  endStudySession(sessionId: string): Promise<AxiosResponse<any>> {
    return axios.put(
      `/api_v1/endLearnSession/${sessionId}`,
      {},
      {
        headers: {
          authorization: `Bearer ${localStorage.getItem('jsessionid')}`
        }
      }
    )
  }
}

export default new StudyService()
