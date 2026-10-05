import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { AxiosResponse } from 'axios'
import type { QuestionAttempt, StudySession, StudySessionReplacement } from '@/model/types'
import { DEFAULT_STUDY_ALGORITHM_CONFIG } from '@/model/StudyAlgorithmConfig'
import studySessionService from '@/services/studySession.service'
import {
  algorithmLabProgressRepository,
  BrowserStudyProgressRepository,
  HttpStudyProgressRepository
} from '@/services/studyProgress.repository'

vi.mock('@/services/studySession.service', () => ({
  default: {
    getSession: vi.fn(), getSessions: vi.fn(), getAttempts: vi.fn(),
    createSession: vi.fn(), replaceSession: vi.fn(), createAttempt: vi.fn()
  }
}))

const session = (): StudySession => ({
  id: 'session', studentId: 'student', courseId: 'course',
  algorithm: { configuration: DEFAULT_STUDY_ALGORITHM_CONFIG, courseConfigurationRevision: 7 },
  startedAt: 1000, updatedAt: 1000, completedAt: null,
  competencies: { skill: { competencyId: 'skill', score: 0.35, timesAssessed: 0, lastAssessedAt: null } },
  history: [], recentQuestionIds: [], excludedQuestionIds: [],
  currentCompetencyId: null, questionsInCurrentCompetency: 0
})

const snapshot = (): StudySessionReplacement => ({
  courseId: 'course', startedAt: 1000, updatedAt: 3000, completedAt: 3000,
  competencies: { skill: { competencyId: 'skill', score: 0.95, timesAssessed: 2, lastAssessedAt: 3000 } },
  recentQuestionIds: ['question'], excludedQuestionIds: ['excluded'],
  currentCompetencyId: 'skill', questionsInCurrentCompetency: 2
})

const attempt = (): QuestionAttempt => ({
  id: 'client-id', sessionId: 'session', studentId: 'student', questionId: 'question',
  targetCompetencyId: 'skill', competencyIds: ['skill'],
  evaluation: { score: 1, source: 'automatic' }, submittedAt: 3000, responseTimeMs: 100,
  sessionStateAfter: snapshot()
})

function response<T>(data: T): AxiosResponse<T> {
  return { data } as AxiosResponse<T>
}

describe('HTTP study progress recovery', () => {
  afterEach(() => vi.clearAllMocks())

  it('sends the generated client id and roundtrips the snapshot', async () => {
    const input = attempt()
    vi.mocked(studySessionService.createAttempt).mockResolvedValue(response({ ...input, id: 'mongo-id' }))
    const repository = new HttpStudyProgressRepository()
    const stored = await repository.saveAttempt(input)
    expect(stored.id).toBe('mongo-id')
    const { id, ...payload } = input
    expect(studySessionService.createAttempt).toHaveBeenCalledWith('session', { ...payload, clientAttemptId: id })
    await repository.saveAttempt({ ...input, clientAttemptId: 'stable-retry' })
    expect(studySessionService.createAttempt).toHaveBeenLastCalledWith(
      'session', { ...payload, clientAttemptId: 'stable-retry' }
    )
  })

  it('recovers every adaptive field and sorted history without losing the backend algorithm', async () => {
    const original = session()
    const oldAttempt = { ...attempt(), id: 'old', submittedAt: 2000, sessionStateAfter: undefined }
    vi.mocked(studySessionService.getSession).mockResolvedValue(response(original))
    vi.mocked(studySessionService.getSessions).mockResolvedValue(response([original]))
    vi.mocked(studySessionService.getAttempts).mockResolvedValue(response([attempt(), oldAttempt]))
    const repository = new HttpStudyProgressRepository()
    const loaded = await repository.getSession(original.id)
    expect(loaded).toMatchObject({ ...snapshot(), id: original.id, studentId: original.studentId })
    expect(loaded?.algorithm).toEqual(original.algorithm)
    expect(loaded?.history.map((entry) => entry.answeredAt)).toEqual([2000, 3000])
    expect(await repository.getStudentSessions(original.studentId)).toEqual([loaded])
  })

  it('keeps a newer saved session and supports old attempts without snapshots', async () => {
    const original = { ...session(), updatedAt: 4000, currentCompetencyId: 'newer' }
    vi.mocked(studySessionService.getSession).mockResolvedValue(response(original))
    vi.mocked(studySessionService.getAttempts).mockResolvedValue(response([
      attempt(), { ...attempt(), id: 'legacy', submittedAt: 2000, sessionStateAfter: undefined }
    ]))
    const loaded = await new HttpStudyProgressRepository().getSession(original.id)
    expect(loaded?.currentCompetencyId).toBe('newer')
    expect(loaded?.updatedAt).toBe(4000)
    expect(loaded?.history).toHaveLength(2)
  })

  it('chooses the newest snapshot, breaking timestamp ties deterministically', async () => {
    vi.mocked(studySessionService.getSession).mockResolvedValue(response(session()))
    vi.mocked(studySessionService.getAttempts).mockResolvedValue(response([
      { ...attempt(), id: 'a', sessionStateAfter: { ...snapshot(), currentCompetencyId: 'a' } },
      { ...attempt(), id: 'b', sessionStateAfter: { ...snapshot(), currentCompetencyId: 'b' } },
      { ...attempt(), id: 'c', submittedAt: 4000, sessionStateAfter: { ...snapshot(), updatedAt: 2000 } }
    ]))
    expect((await new HttpStudyProgressRepository().getSession('session'))?.currentCompetencyId).toBe('b')
  })

  it('uses full replacement semantics for omitted optional snapshot fields', async () => {
    const state = snapshot()
    delete state.courseId
    delete state.completedAt
    vi.mocked(studySessionService.getSession).mockResolvedValue(response(session()))
    vi.mocked(studySessionService.getAttempts).mockResolvedValue(response([{ ...attempt(), sessionStateAfter: state }]))
    const loaded = await new HttpStudyProgressRepository().getSession('session')
    expect(loaded?.courseId).toBeUndefined()
    expect(loaded?.completedAt).toBeUndefined()
  })

  it('recovers a same-millisecond completion snapshot', async () => {
    vi.mocked(studySessionService.getSession).mockResolvedValue(response({ ...session(), updatedAt: 3000 }))
    vi.mocked(studySessionService.getAttempts).mockResolvedValue(response([attempt()]))
    expect(await new HttpStudyProgressRepository().getSession('session')).toMatchObject(snapshot())
  })

  it('never reopens a completed session from an incomplete attempt snapshot', async () => {
    const completed = { ...session(), completedAt: 2500, updatedAt: 2500 }
    vi.mocked(studySessionService.getSession).mockResolvedValue(response(completed))
    vi.mocked(studySessionService.getAttempts).mockResolvedValue(response([
      { ...attempt(), sessionStateAfter: { ...snapshot(), completedAt: null } }
    ]))
    const loaded = await new HttpStudyProgressRepository().getSession('session')
    expect(loaded?.completedAt).toBe(2500)
    expect(loaded?.updatedAt).toBe(2500)
    expect(loaded?.history).toHaveLength(1)
  })
})

describe('isolated browser study progress', () => {
  let data: Map<string, string>
  beforeEach(() => {
    data = new Map()
    vi.stubGlobal('window', {
      localStorage: {
        getItem: (key: string) => data.get(key) ?? null,
        setItem: (key: string, value: string) => data.set(key, value)
      }
    })
  })
  afterEach(() => vi.unstubAllGlobals())

  it('isolates algorithm lab data from the default adapter', async () => {
    await algorithmLabProgressRepository.createSession(session())
    expect(data.has('fbs-qcm.algorithm-lab.v1')).toBe(true)
    expect(await new BrowserStudyProgressRepository().getSession('session')).toBeNull()
    expect(await new BrowserStudyProgressRepository('fbs-qcm.algorithm-lab.v1').getSession('session')).toEqual(session())
  })

  it('deduplicates id/clientAttemptId and rejects changed requests without discarding data', async () => {
    const repository = new BrowserStudyProgressRepository('isolated')
    const input = { ...attempt(), clientAttemptId: 'retry' }
    await repository.saveAttempt(input)
    expect(await repository.saveAttempt(input)).toEqual(input)
    expect(await repository.saveAttempt({ ...input, id: 'different-local-id' })).toEqual(input)
    await expect(repository.saveAttempt({ ...input, responseTimeMs: 200 })).rejects.toThrow(/conflict/)
    expect(await repository.getAttempts('session')).toEqual([input])
  })

  it('recovers a saved attempt snapshot if saving the browser session failed', async () => {
    const repository = new BrowserStudyProgressRepository('isolated')
    await repository.createSession(session())
    await repository.saveAttempt(attempt())
    expect(await repository.getSession('session')).toMatchObject(snapshot())
    expect((await repository.getStudentSessions('student'))[0]).toMatchObject(snapshot())
  })

  it.each([
    '{invalid', '{}', '{"sessions":{},"attempts":{}}', '{"sessions":{},"attempts":[null]}',
    '{"sessions":{"broken":{"id":"broken"}},"attempts":[]}',
    JSON.stringify({ sessions: { session: { ...session(), recentQuestionIds: null } }, attempts: [] }),
    JSON.stringify({ sessions: {}, attempts: [{ ...attempt(), evaluation: { score: 2 } }] })
  ])(
    'reports corrupt data explicitly and retains the original storage: %s', async (corrupt) => {
      data.set('isolated', corrupt)
      const repository = new BrowserStudyProgressRepository('isolated')
      await expect(repository.getSession('session')).rejects.toThrow(/localStorage "isolated".*not reset/)
      await expect(repository.createSession(session())).rejects.toThrow(/not reset/)
      expect(data.get('isolated')).toBe(corrupt)
    }
  )
})
