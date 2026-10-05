import axios from 'axios'
import type { QuestionAttempt, StudySession, StudySessionReplacement } from '@/model/types'
import studySessionService from '@/services/studySession.service'

/**
 * Port für die Persistenz des adaptiven Lernmodells.
 *
 * Der Store kennt nur diese Schnittstelle. `createSession`/`saveAttempt`
 * erhalten ein clientseitig vorbefülltes Objekt (inkl. temporärer, lokal
 * generierter id), geben aber den tatsächlich persistierten Datensatz
 * zurück: Adapter, die serverseitig IDs vergeben (z.B. Mongo `_id`), können
 * die Client-ID als Retry-Schlüssel senden und die echte ID im Rückgabewert
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

function isRecord(value: unknown): boolean {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function isTimestamp(value: unknown): boolean {
  return typeof value === 'number' && Number.isFinite(value)
    && value >= 0 && Number.isFinite(new Date(value).getTime())
}

function isScore(value: unknown): boolean {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1
}

function isCount(value: unknown): boolean {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0
}

function isStringArray(value: unknown): boolean {
  return Array.isArray(value) && value.every((entry) => typeof entry === 'string')
}

function isSessionState(state: StudySessionReplacement): boolean {
  return isRecord(state)
    && isTimestamp(state.startedAt) && isTimestamp(state.updatedAt)
    && (state.completedAt == null || isTimestamp(state.completedAt))
    && (state.courseId == null || typeof state.courseId === 'string')
    && isRecord(state.competencies)
    && Object.values(state.competencies).every((competency) => isRecord(competency)
      && typeof competency.competencyId === 'string' && isScore(competency.score)
      && isCount(competency.timesAssessed)
      && (competency.lastAssessedAt === null || isTimestamp(competency.lastAssessedAt)))
    && isStringArray(state.recentQuestionIds) && isStringArray(state.excludedQuestionIds)
    && (state.currentCompetencyId === null || typeof state.currentCompetencyId === 'string')
    && isCount(state.questionsInCurrentCompetency)
}

function isStoredSession(session: StudySession): boolean {
  return isSessionState(session)
    && typeof session.id === 'string' && typeof session.studentId === 'string'
    && isRecord(session.algorithm) && isRecord(session.algorithm.configuration)
    && isCount(session.algorithm.courseConfigurationRevision)
    && Array.isArray(session.history)
}

function isStoredAttempt(attempt: QuestionAttempt): boolean {
  return isRecord(attempt)
    && [attempt.id, attempt.sessionId, attempt.studentId, attempt.questionId, attempt.targetCompetencyId]
      .every((value) => typeof value === 'string' && value.length > 0)
    && isStringArray(attempt.competencyIds) && isTimestamp(attempt.submittedAt)
    && typeof attempt.responseTimeMs === 'number' && Number.isFinite(attempt.responseTimeMs)
    && attempt.responseTimeMs >= 0 && isRecord(attempt.evaluation) && isScore(attempt.evaluation.score)
    && ['automatic', 'manual-self-assessment', 'teacher-review'].includes(attempt.evaluation.source)
    && (attempt.evaluation.isCorrect === undefined || typeof attempt.evaluation.isCorrect === 'boolean')
    && (attempt.clientAttemptId === undefined
      || (typeof attempt.clientAttemptId === 'string' && attempt.clientAttemptId.length > 0))
    && (attempt.predictionBefore === undefined || isScore(attempt.predictionBefore))
    && (attempt.sessionStateAfter === undefined || isSessionState(attempt.sessionStateAfter))
}

function readStorage(storageKey: string): StoredStudyProgress {
  try {
    const raw = window.localStorage.getItem(storageKey)
    if (raw === null) return emptyStorage()

    const parsed = JSON.parse(raw) as Partial<StoredStudyProgress>
    if (!isRecord(parsed)
      || !isRecord(parsed.sessions)
      || !Array.isArray(parsed.attempts)
      || Object.values(parsed.sessions!).some((session) => !isStoredSession(session))
      || parsed.attempts.some((attempt) => !isStoredAttempt(attempt))) {
      throw new Error('Invalid sessions or attempts structure')
    }
    return parsed as StoredStudyProgress
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error)
    throw new Error(`Cannot read study progress from localStorage "${storageKey}": ${detail}. Stored data was not reset.`)
  }
}

function writeStorage(storageKey: string, storage: StoredStudyProgress): void {
  window.localStorage.setItem(storageKey, JSON.stringify(storage))
}

function sortedAttempts(attempts: QuestionAttempt[]): QuestionAttempt[] {
  return [...attempts].sort((a, b) => a.submittedAt - b.submittedAt || a.id.localeCompare(b.id))
}

function withHistory(session: StudySession, attempts: QuestionAttempt[]): StudySession {
  const ordered = sortedAttempts(attempts)
  const snapshots = ordered
    .filter((attempt) => {
      const snapshot = attempt.sessionStateAfter
      if (!snapshot || (session.completedAt != null && snapshot.completedAt == null)) return false
      return snapshot.updatedAt > session.updatedAt
        || (snapshot.updatedAt === session.updatedAt && session.completedAt == null)
    })
    .sort((a, b) => a.sessionStateAfter!.updatedAt - b.sessionStateAfter!.updatedAt
      || a.submittedAt - b.submittedAt || a.id.localeCompare(b.id))
  const latest = snapshots[snapshots.length - 1]?.sessionStateAfter
  return {
    ...session,
    ...latest,
    courseId: latest ? latest.courseId : session.courseId,
    completedAt: latest ? latest.completedAt : session.completedAt,
    // Retry snapshots never replace identity or the server's algorithm configuration.
    id: session.id,
    studentId: session.studentId,
    algorithm: session.algorithm,
    history: ordered.map((attempt) => ({
      questionId: attempt.questionId,
      competencyIds: attempt.competencyIds,
      score: attempt.evaluation.score,
      answeredAt: attempt.submittedAt
    }))
  }
}

function canonicalAttempt(attempt: QuestionAttempt): string {
  const { id, ...payload } = attempt
  return JSON.stringify({ ...payload, clientAttemptId: attempt.clientAttemptId ?? id }, (_key, entry) => {
    if (entry !== null && typeof entry === 'object' && !Array.isArray(entry)) {
      return Object.fromEntries(Object.keys(entry).sort().map((key) => [key, entry[key]]))
    }
    return entry
  })
}

/**
 * Temporärer Browser-Adapter. Er implementiert dieselbe Schnittstelle wie der
 * spätere Backend-Adapter und ist ausschließlich für die lokale Demo gedacht.
 */
export class BrowserStudyProgressRepository implements StudyProgressRepository {
  constructor(private readonly storageKey = STORAGE_KEY) {}

  async createSession(session: StudySession): Promise<StudySession> {
    const storage = readStorage(this.storageKey)
    storage.sessions[session.id] = session
    writeStorage(this.storageKey, storage)
    return session
  }

  async saveSession(session: StudySession): Promise<void> {
    const storage = readStorage(this.storageKey)
    storage.sessions[session.id] = session
    writeStorage(this.storageKey, storage)
  }

  async saveAttempt(attempt: QuestionAttempt): Promise<QuestionAttempt> {
    const storage = readStorage(this.storageKey)
    const existing = storage.attempts.find((stored) => stored.id === attempt.id
      || (stored.sessionId === attempt.sessionId && stored.studentId === attempt.studentId
        && (stored.clientAttemptId ?? stored.id) === (attempt.clientAttemptId ?? attempt.id)))
    if (existing) {
      if (canonicalAttempt(existing) !== canonicalAttempt(attempt)) {
        throw new Error('Attempt retry conflicts with an already stored payload')
      }
      return existing
    }
    storage.attempts.push(attempt)
    writeStorage(this.storageKey, storage)
    return attempt
  }

  async getSession(sessionId: string): Promise<StudySession | null> {
    const storage = readStorage(this.storageKey)
    const session = storage.sessions[sessionId]
    return session ? withHistory(session, storage.attempts.filter((attempt) => attempt.sessionId === sessionId)) : null
  }

  async getStudentSessions(studentId: string): Promise<StudySession[]> {
    const storage = readStorage(this.storageKey)
    return Object.values(storage.sessions)
      .filter((session) => session.studentId === studentId)
      .map((session) => withHistory(session, storage.attempts.filter((attempt) => attempt.sessionId === session.id)))
      .sort((a, b) => b.updatedAt - a.updatedAt)
  }

  async getAttempts(sessionId: string): Promise<QuestionAttempt[]> {
    return sortedAttempts(readStorage(this.storageKey)
      .attempts
      .filter((attempt) => attempt.sessionId === sessionId))
  }

  async getStudentHistory(studentId: string): Promise<QuestionAttempt[]> {
    return sortedAttempts(readStorage(this.storageKey)
      .attempts
      .filter((attempt) => attempt.studentId === studentId))
  }
}

/**
 * HTTP-Adapter gegen das v2-Backend (`api/backend/v2/src/session`).
 *
 * IDs werden serverseitig vergeben: Die lokal generierte `id` aus
 * `createSession` wird verworfen, `saveAttempt` nutzt sie als Retry-Schlüssel.
 * Die Antwort des
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
    const response = await studySessionService.createAttempt(attempt.sessionId, {
      ...attemptInput,
      clientAttemptId: attempt.clientAttemptId ?? id
    })
    return response.data
  }

  async getSession(sessionId: string): Promise<StudySession | null> {
    try {
      const [sessionResponse, attemptsResponse] = await Promise.all([
        studySessionService.getSession(sessionId),
        studySessionService.getAttempts(sessionId)
      ])
      const attempts = attemptsResponse.data
      return withHistory(sessionResponse.data, attempts)
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
        return withHistory(session, attempts)
      })
    )
  }

  async getAttempts(sessionId: string): Promise<QuestionAttempt[]> {
    const response = await studySessionService.getAttempts(sessionId)
    return sortedAttempts(response.data)
  }

  async getStudentHistory(studentId: string): Promise<QuestionAttempt[]> {
    const sessionsResponse = await studySessionService.getSessions(studentId)
    const attempts = await Promise.all(
      sessionsResponse.data.map(async (session) => {
        const response = await studySessionService.getAttempts(session.id)
        return response.data
      })
    )
    return sortedAttempts(attempts
      .flat()
      .filter((attempt) => attempt.studentId === studentId))
  }
}

/** Aktiver Adapter für die Backend-Persistenz des Lernfortschritts. */
export const studyProgressRepository = new HttpStudyProgressRepository()

/** Isolated, browser-only experiment data; never persisted to productive sessions. */
export const algorithmLabProgressRepository = new BrowserStudyProgressRepository('fbs-qcm.algorithm-lab.v1')
