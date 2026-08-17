import type { LearningAttempt, SessionState } from '@/model/types'

/**
 * Port für die Persistenz des adaptiven Lernmodells.
 *
 * Der Store kennt nur diese Schnittstelle. Ein späterer HTTP-Adapter muss
 * daher dieselben Datensätze übertragen, ohne die Auswahl- oder
 * Fortschrittslogik zu verändern.
 */
export interface LearningProgressRepository {
  createSession(session: SessionState): Promise<void>
  saveSessionState(session: SessionState): Promise<void>
  saveAttempt(attempt: LearningAttempt): Promise<void>
  getSession(sessionId: string): Promise<SessionState | null>
  getAttempts(sessionId: string): Promise<LearningAttempt[]>
}

type StoredLearningProgress = {
  sessions: Record<string, SessionState>
  attempts: LearningAttempt[]
}

const STORAGE_KEY = 'fbs-qcm.learning-progress.v1'

function emptyStorage(): StoredLearningProgress {
  return { sessions: {}, attempts: [] }
}

function readStorage(): StoredLearningProgress {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyStorage()

    const parsed = JSON.parse(raw) as Partial<StoredLearningProgress>
    return {
      sessions: parsed.sessions ?? {},
      attempts: parsed.attempts ?? []
    }
  } catch {
    // Beschädigte lokale Demodaten dürfen den Lernmodus nicht blockieren.
    return emptyStorage()
  }
}

function writeStorage(storage: StoredLearningProgress): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(storage))
}

/**
 * Temporärer Browser-Adapter. Er implementiert dieselbe Schnittstelle wie der
 * spätere Backend-Adapter und ist ausschließlich für die lokale Demo gedacht.
 */
export class BrowserLearningProgressRepository implements LearningProgressRepository {
  async createSession(session: SessionState): Promise<void> {
    const storage = readStorage()
    storage.sessions[session.id] = session
    writeStorage(storage)
  }

  async saveSessionState(session: SessionState): Promise<void> {
    const storage = readStorage()
    storage.sessions[session.id] = session
    writeStorage(storage)
  }

  async saveAttempt(attempt: LearningAttempt): Promise<void> {
    const storage = readStorage()
    storage.attempts.push(attempt)
    writeStorage(storage)
  }

  async getSession(sessionId: string): Promise<SessionState | null> {
    return readStorage().sessions[sessionId] ?? null
  }

  async getAttempts(sessionId: string): Promise<LearningAttempt[]> {
    return readStorage()
      .attempts
      .filter((attempt) => attempt.sessionId === sessionId)
      .sort((a, b) => a.submittedAt - b.submittedAt)
  }
}

export const learningProgressRepository = new BrowserLearningProgressRepository()
