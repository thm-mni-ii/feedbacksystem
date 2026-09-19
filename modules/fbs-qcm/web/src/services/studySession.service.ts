import apiV2 from '@/services/apiV2Client'
import type { QuestionAttempt, StudySession } from '@/model/types'
import type { AxiosResponse } from 'axios'

type StudySessionInput = Omit<StudySession, 'id' | 'history' | 'algorithm'>
type StudySessionReplacement = Omit<StudySession, 'id' | 'studentId' | 'history' | 'algorithm'>

/**
 * Service für die v2-StudySession-/QuestionAttempt-API
 * (`api/backend/v2/src/session`). Kapselt ausschließlich den HTTP-Zugriff;
 * die eigentliche Persistenz-Logik (was/wann gespeichert wird) bleibt im
 * `StudyProgressRepository`-Adapter (`studyProgress.repository.ts`).
 *
 * Der Service kapselt ausschließlich die HTTP-Kommunikation der produktiven
 * Study-Sessions.
 */
class StudySessionService {
  getSession(sessionId: string): Promise<AxiosResponse<StudySession>> {
    return apiV2.get(`/sessions/${sessionId}`)
  }

  getSessions(studentId: string): Promise<AxiosResponse<StudySession[]>> {
    return apiV2.get('/sessions', { params: { studentId } })
  }

  createSession(session: StudySessionInput): Promise<AxiosResponse<StudySession>> {
    return apiV2.post('/sessions', session)
  }

  /** Ersetzt den kompletten Session-Zustand (kein partielles Update). */
  replaceSession(
    sessionId: string,
    session: StudySessionReplacement
  ): Promise<AxiosResponse<StudySession>> {
    return apiV2.put(`/sessions/${sessionId}`, session)
  }

  createAttempt(
    sessionId: string,
    attempt: Omit<QuestionAttempt, 'id'>
  ): Promise<AxiosResponse<QuestionAttempt>> {
    return apiV2.post(`/sessions/${sessionId}/attempts`, attempt)
  }

  getAttempts(sessionId: string): Promise<AxiosResponse<QuestionAttempt[]>> {
    return apiV2.get(`/sessions/${sessionId}/attempts`)
  }
}

export default new StudySessionService()
