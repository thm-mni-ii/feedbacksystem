import axios from 'axios'
import type { QuestionAttempt, StudySession } from '@/model/types'
import studySessionService from '@/services/studySession.service'

/**
 * Port für die Persistenz des adaptiven Lernmodells.
 *
 * Der Store kennt nur diese Schnittstelle. `createSession`/`saveAttempt`
 * erhalten ein clientseitig vorbefülltes Objekt (inkl. temporärer, lokal
 * generierter id), geben aber den tatsächlich persistierten Datensatz
 * zurück: Adapter, die serverseitig IDs vergeben (z.B. Mongo `_id`), können
 * die Client-ID beim Senden verwerfen und die echte ID im Rückgabewert
 * liefern; rein lokale Adapter (Demo) geben das Objekt unverändert zurück.
 */
export interface StudyProgressRepository {
  createSession(session: StudySession): Promise<StudySession>
  saveSession(session: StudySession): Promise<void>
  saveAttempt(attempt: QuestionAttempt): Promise<QuestionAttempt>
  getSession(sessionId: string): Promise<StudySession | null>
  getStudentSessions(studentId: string): Promise<StudySession[]>
  getAttempts(sessionId: string): Promise<QuestionAttempt[]>
  getStudentHistory(studentId: string): Promise<QuestionAttempt[]>
}

type StoredStudyProgress = {
  sessions: Record<string, StudySession>
  attempts: QuestionAttempt[]
}

const STORAGE_KEY = 'fbs-qcm.learning-progress.v1'

function emptyStorage(): StoredStudyProgress {
  return { sessions: {}, attempts: [] }
}

function readStorage(): StoredStudyProgress {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyStorage()

    const parsed = JSON.parse(raw) as Partial<StoredStudyProgress>
    return {
      sessions: parsed.sessions ?? {},
      attempts: parsed.attempts ?? []
    }
  } catch {
    // Beschädigte lokale Demodaten dürfen den Lernmodus nicht blockieren.
    return emptyStorage()
  }
}

function writeStorage(storage: StoredStudyProgress): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(storage))
}

/**
 * Temporärer Browser-Adapter. Er implementiert dieselbe Schnittstelle wie der
 * spätere Backend-Adapter und ist ausschließlich für die lokale Demo gedacht.
 */
export class BrowserStudyProgressRepository implements StudyProgressRepository {
  async createSession(session: StudySession): Promise<StudySession> {
    const storage = readStorage()
    storage.sessions[session.id] = session
    writeStorage(storage)
    return session
  }

  async saveSession(session: StudySession): Promise<void> {
    const storage = readStorage()
    storage.sessions[session.id] = session
    writeStorage(storage)
  }

  async saveAttempt(attempt: QuestionAttempt): Promise<QuestionAttempt> {
    const storage = readStorage()
    storage.attempts.push(attempt)
    writeStorage(storage)
    return attempt
  }

  async getSession(sessionId: string): Promise<StudySession | null> {
    return readStorage().sessions[sessionId] ?? null
  }

  async getStudentSessions(studentId: string): Promise<StudySession[]> {
    return Object.values(readStorage().sessions)
      .filter((session) => session.studentId === studentId)
      .sort((a, b) => b.updatedAt - a.updatedAt)
  }

  async getAttempts(sessionId: string): Promise<QuestionAttempt[]> {
    return readStorage()
      .attempts
      .filter((attempt) => attempt.sessionId === sessionId)
      .sort((a, b) => a.submittedAt - b.submittedAt)
  }

  async getStudentHistory(studentId: string): Promise<QuestionAttempt[]> {
    return readStorage()
      .attempts
      .filter((attempt) => attempt.studentId === studentId)
      .sort((a, b) => a.submittedAt - b.submittedAt)
  }
}

/**
 * HTTP-Adapter gegen das v2-Backend (`api/backend/v2/src/session`).
 *
 * IDs werden serverseitig vergeben: Die lokal generierte `id` aus
 * `createSession`/`saveAttempt` wird beim Senden verworfen, die Antwort des
 * Servers (mit echter Mongo-`_id`) wird zurückgegeben und muss vom Aufrufer
 * übernommen werden (siehe `studySessionStore.ts`).
 */
export class HttpStudyProgressRepository implements StudyProgressRepository {
  async createSession(session: StudySession): Promise<StudySession> {
    const { id, history, algorithm, ...sessionInput } = session
    void id
    void history
    void algorithm
    const response = await studySessionService.createSession(sessionInput)
    return { ...response.data, history: [] }
  }

  async saveSession(session: StudySession): Promise<void> {
    const { id, studentId, history, algorithm, ...replacement } = session
    void studentId
    void history
    void algorithm
    const sessionId = id
    await studySessionService.replaceSession(sessionId, replacement)
  }

  async saveAttempt(attempt: QuestionAttempt): Promise<QuestionAttempt> {
    const { id, ...attemptInput } = attempt
    void id
    const response = await studySessionService.createAttempt(attempt.sessionId, attemptInput)
    return response.data
  }

  async getSession(sessionId: string): Promise<StudySession | null> {
    try {
      const [sessionResponse, attemptsResponse] = await Promise.all([
        studySessionService.getSession(sessionId),
        studySessionService.getAttempts(sessionId)
      ])
      const attempts = attemptsResponse.data
      return this.withHistory(sessionResponse.data, attempts)
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null
      }
      throw error
    }
  }

  async getStudentSessions(studentId: string): Promise<StudySession[]> {
    const response = await studySessionService.getSessions(studentId)
    return Promise.all(
      response.data.map(async (session) => {
        const attempts = await this.getAttempts(session.id)
        return this.withHistory(session, attempts)
      })
    )
  }

  async getAttempts(sessionId: string): Promise<QuestionAttempt[]> {
    const response = await studySessionService.getAttempts(sessionId)
    return response.data
  }

  async getStudentHistory(studentId: string): Promise<QuestionAttempt[]> {
    const sessionsResponse = await studySessionService.getSessions(studentId)
    const attempts = await Promise.all(
      sessionsResponse.data.map(async (session) => {
        const response = await studySessionService.getAttempts(session.id)
        return response.data
      })
    )
    return attempts
      .flat()
      .filter((attempt) => attempt.studentId === studentId)
      .sort((a, b) => a.submittedAt - b.submittedAt)
  }

  private withHistory(session: StudySession, attempts: QuestionAttempt[]): StudySession {
    return {
      ...session,
      history: attempts.map((attempt) => ({
        questionId: attempt.questionId,
        competencyIds: attempt.competencyIds,
        score: attempt.evaluation.score,
        answeredAt: attempt.submittedAt
      }))
    }
  }
}

/** Aktiver Adapter für die Backend-Persistenz des Lernfortschritts. */
export const studyProgressRepository = new HttpStudyProgressRepository()
