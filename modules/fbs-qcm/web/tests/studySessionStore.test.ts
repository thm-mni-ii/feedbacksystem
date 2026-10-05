import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { createSession } from '@/composables/algorithm'
import { DEFAULT_STUDY_ALGORITHM_CONFIG } from '@/model/StudyAlgorithmConfig'
import { useAlgorithmLabSessionStore, useStudySessionStore } from '@/stores/studySessionStore'
import QuestionType from '@/enums/QuestionType'
import type { Competency, Question, QuestionAttempt, StudySession } from '@/model/types'

const mocks = vi.hoisted(() => {
  const repository = () => ({
    createSession: vi.fn(),
    saveSession: vi.fn(),
    saveAttempt: vi.fn(),
    getSession: vi.fn(),
    getStudentSessions: vi.fn(),
    getAttempts: vi.fn(),
    getStudentHistory: vi.fn()
  })
  return { study: repository(), lab: repository(), content: vi.fn(), configuration: vi.fn() }
})

vi.mock('@/services/studyProgress.repository', () => ({
  studyProgressRepository: mocks.study,
  algorithmLabProgressRepository: mocks.lab
}))
vi.mock('@/services/apiV2Client', () => ({ getAuthenticatedStudentId: () => 'student' }))
vi.mock('@/services/studyContent.service', () => ({ default: { getStudyContent: mocks.content } }))
vi.mock('@/services/studyConfiguration.service', () => ({ default: { get: mocks.configuration } }))

const competency: Competency = { id: 'skill', name: 'Kompetenz' }
const question: Question = {
  id: 'q1',
  text: 'Aufgabe',
  competencyIds: ['skill'],
  questionType: QuestionType.Choice,
  questionConfiguration: {
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [{ id: 1, name: 'Antwort' }],
    optionRows: [{ id: 1, text: 'Richtig', correctAnswers: [1] }]
  },
  difficulty: 0.4
}
const copy = <T>(value: T): T => JSON.parse(JSON.stringify(value))

function useMemory(repository: typeof mocks.study) {
  const sessions = new Map<string, StudySession>()
  const attempts: QuestionAttempt[] = []
  repository.createSession.mockImplementation(async (state: StudySession) => {
    sessions.set(state.id, copy(state))
    return copy(state)
  })
  repository.saveSession.mockImplementation(async (state: StudySession) => {
    sessions.set(state.id, copy(state))
  })
  repository.saveAttempt.mockImplementation(async (attempt: QuestionAttempt) => {
    attempts.push(copy(attempt))
    return copy(attempt)
  })
  repository.getSession.mockImplementation(async (id: string) => {
    const state = sessions.get(id)
    if (!state) return null
    const records = attempts.filter((attempt) => attempt.sessionId === id)
    const snapshot = records.at(-1)?.sessionStateAfter
    return copy({
      ...state,
      ...(snapshot && snapshot.updatedAt > state.updatedAt ? snapshot : {}),
      history: records.length
        ? records.map((attempt) => ({
            questionId: attempt.questionId,
            competencyIds: attempt.competencyIds,
            score: attempt.evaluation.score,
            answeredAt: attempt.submittedAt
          }))
        : state.history
    })
  })
  repository.getStudentSessions.mockImplementation(async (id: string) =>
    [...sessions.values()].filter((session) => session.studentId === id).map(copy)
  )
  repository.getAttempts.mockImplementation(async (id: string) =>
    copy(attempts.filter((attempt) => attempt.sessionId === id))
  )
  repository.getStudentHistory.mockResolvedValue([])
  return { sessions, attempts }
}

beforeEach(() => {
  vi.resetAllMocks()
  setActivePinia(createPinia())
  mocks.content.mockResolvedValue({
    competencies: [competency],
    questions: [question, { ...question, id: 'q2' }]
  })
  mocks.configuration.mockResolvedValue({
    effectiveConfig: DEFAULT_STUDY_ALGORITHM_CONFIG,
    revision: 1
  })
})

describe('session lifecycle', () => {
  it('persists an end state when the only question cannot be repeated', async () => {
    const memory = useMemory(mocks.study)
    mocks.content.mockResolvedValue({ competencies: [competency], questions: [question] })
    const store = useStudySessionStore()
    const started = await store.startSession('1')
    await store.submitAnswer({ score: 0, source: 'automatic' })
    expect(store.isComplete).toBe(true)
    expect(store.currentQuestion).toBeNull()
    expect(memory.sessions.get(started!.id)?.completedAt).not.toBeNull()
    expect(memory.attempts[0].sessionStateAfter?.completedAt).not.toBeNull()
    expect(memory.attempts[0].predictionBefore).toBeCloseTo(0.445)
    expect(memory.attempts[0].submittedAt).toBeGreaterThan(started!.updatedAt)
    expect(store.completionMessage).toContain('keine weitere geeignete Aufgabe')
    store.resetSession()
    await store.resumeSession(started!.id)
    expect(store.isComplete).toBe(true)
  })

  it('finishes before the first task if historical evidence is sufficient', async () => {
    const memory = useMemory(mocks.study)
    const base = {
      sessionId: 'old',
      studentId: 'student',
      questionId: 'q1',
      targetCompetencyId: 'skill',
      competencyIds: ['skill'],
      evaluation: { score: 1, source: 'automatic' as const },
      submittedAt: Date.now(),
      responseTimeMs: 10
    }
    mocks.study.getStudentHistory.mockResolvedValue(
      Array.from({ length: 4 }, (_, index) => ({ ...base, id: `attempt-${index}` }))
    )
    const store = useStudySessionStore()
    const started = await store.startSession('1')
    expect(store.isComplete).toBe(true)
    expect(store.historyCount).toBe(0)
    expect(store.currentQuestion).toBeNull()
    expect(memory.sessions.get(started!.id)?.completedAt).not.toBeNull()
    expect(store.completionMessage).toContain('ausreichend Evidenz')
  })

  it('resumes the same paused session instead of creating another', async () => {
    useMemory(mocks.study)
    const store = useStudySessionStore()
    const started = await store.startSession('1')
    await store.submitAnswer({ score: 0, source: 'automatic' })
    await store.pauseSession()
    expect(store.session).toBeNull()
    const resumed = await store.startSession('1')
    expect(resumed!.id).toBe(started!.id)
    expect(store.historyCount).toBe(1)
    expect(mocks.study.createSession).toHaveBeenCalledTimes(1)
  })

  it('adds initial states for competencies introduced after session creation', async () => {
    const memory = useMemory(mocks.study)
    const state = { ...createSession('student', []), courseId: '1' }
    memory.sessions.set(state.id, state)
    const store = useStudySessionStore()
    expect(await store.resumeSession(state.id)).toBe(true)
    expect(store.session?.competencies.skill.score).toBe(0.35)
    expect(store.currentQuestion?.targetCompetency.id).toBe('skill')
  })

  it('blocks continued mutation after a partial save and recovers without another attempt', async () => {
    const memory = useMemory(mocks.study)
    const store = useStudySessionStore()
    const started = await store.startSession('1')
    mocks.study.saveSession.mockRejectedValueOnce(new Error('PUT failed'))
    await expect(store.submitAnswer({ score: 0, source: 'automatic' })).rejects.toThrow(
      'PUT failed'
    )
    expect(store.needsRecovery).toBe(true)
    expect(store.historyCount).toBe(0)
    expect(memory.attempts).toHaveLength(1)
    await expect(store.submitAnswer({ score: 0, source: 'automatic' })).rejects.toThrow()
    await expect(store.pauseSession()).rejects.toThrow()
    await expect(store.excludeQuestion('q2')).rejects.toThrow()
    expect(await store.resumeSession(started!.id)).toBe(true)
    expect(store.needsRecovery).toBe(false)
    expect(store.historyCount).toBe(1)
    expect(store.session?.competencies.skill.timesAssessed).toBe(1)
    expect(memory.attempts).toHaveLength(1)
  })

  it('keeps the active session if pausing fails', async () => {
    useMemory(mocks.study)
    const store = useStudySessionStore()
    const started = await store.startSession('1')
    mocks.study.saveSession.mockRejectedValueOnce(new Error('save failed'))
    await expect(store.pauseSession()).rejects.toThrow('save failed')
    expect(store.session?.id).toBe(started!.id)
  })

  it('does not create a session when loading historical attempts fails', async () => {
    useMemory(mocks.study)
    mocks.study.getStudentHistory.mockRejectedValueOnce(new Error('history unavailable'))
    const store = useStudySessionStore()
    await expect(store.startSession('1')).rejects.toThrow('history unavailable')
    expect(mocks.study.createSession).not.toHaveBeenCalled()
    expect(store.session).toBeNull()
  })

  it('rejects a second submission while the first save is pending', async () => {
    const memory = useMemory(mocks.study)
    const store = useStudySessionStore()
    await store.startSession('1')
    let finishSave!: () => void
    mocks.study.saveSession.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          finishSave = resolve
        })
    )
    const first = store.submitAnswer({ score: 0, source: 'automatic' })
    await vi.waitFor(() => expect(finishSave).toBeTypeOf('function'))
    expect(store.isSavingAnswer).toBe(true)
    await expect(store.submitAnswer({ score: 1, source: 'automatic' })).rejects.toThrow()
    await expect(store.pauseSession()).rejects.toThrow()
    finishSave()
    await first
    expect(memory.attempts).toHaveLength(1)
    expect(store.historyCount).toBe(1)
  })

  it('preserves memory and recovers if the attempt POST itself fails', async () => {
    const memory = useMemory(mocks.study)
    const store = useStudySessionStore()
    const started = await store.startSession('1')
    mocks.study.saveAttempt.mockRejectedValueOnce(new Error('POST failed'))
    await expect(store.submitAnswer({ score: 0, source: 'automatic' })).rejects.toThrow(
      'POST failed'
    )
    expect(store.historyCount).toBe(0)
    expect(memory.attempts).toHaveLength(0)
    expect(store.needsRecovery).toBe(true)
    await store.resumeSession(started!.id)
    await store.submitAnswer({ score: 0, source: 'automatic' })
    expect(memory.attempts).toHaveLength(1)
  })

  it('does not replace active state when reloading attempts fails', async () => {
    useMemory(mocks.study)
    const store = useStudySessionStore()
    const started = await store.startSession('1')
    const previous = copy(store.session)
    const previousQuestion = store.currentQuestion?.question.id
    mocks.study.getAttempts.mockRejectedValueOnce(new Error('attempts unavailable'))
    await expect(store.resumeSession(started!.id)).rejects.toThrow('attempts unavailable')
    expect(store.session).toEqual(previous)
    expect(store.currentQuestion?.question.id).toBe(previousQuestion)
  })

  it('persists a task-limit completion and does not offer it for resume as open', async () => {
    const memory = useMemory(mocks.study)
    const config = structuredClone(DEFAULT_STUDY_ALGORITHM_CONFIG)
    config.session.maxQuestionsPerSession = 1
    mocks.configuration.mockResolvedValue({ effectiveConfig: config, revision: 1 })
    const store = useStudySessionStore()
    const started = await store.startSession('1')
    await store.submitAnswer({ score: 0, source: 'automatic' })
    expect(store.completionMessage).toContain('Aufgabenlimit')
    await store.pauseSession()
    await store.resumeSession(started!.id)
    expect(store.isComplete).toBe(true)
    expect(store.historyCount).toBe(1)
    await store.startSession('1')
    expect(mocks.study.createSession).toHaveBeenCalledTimes(2)
    expect(memory.attempts).toHaveLength(1)
  })

  it('does not apply an exclusion to memory when persistence fails', async () => {
    useMemory(mocks.study)
    const store = useStudySessionStore()
    await store.startSession('1')
    mocks.study.saveSession.mockRejectedValueOnce(new Error('exclusion save failed'))
    await expect(store.excludeQuestion('q2')).rejects.toThrow('exclusion save failed')
    expect(store.excludedQuestionIds).toEqual([])
  })

  it('allows retrying terminal persistence after a reload', async () => {
    const memory = useMemory(mocks.study)
    const state = { ...createSession('student', [competency]), courseId: '1' }
    state.excludedQuestionIds = ['q1', 'q2']
    memory.sessions.set(state.id, state)
    const store = useStudySessionStore()
    mocks.study.saveSession.mockRejectedValueOnce(new Error('completion save failed'))
    await expect(store.resumeSession(state.id)).rejects.toThrow('completion save failed')
    expect(store.needsRecovery).toBe(true)
    expect(store.isComplete).toBe(false)
    expect(await store.resumeSession(state.id)).toBe(true)
    expect(store.isComplete).toBe(true)
    expect(memory.sessions.get(state.id)?.completedAt).not.toBeNull()
  })

  it('rejects non-finite scores before persistence', async () => {
    useMemory(mocks.study)
    const store = useStudySessionStore()
    await store.startSession('1')
    await expect(store.submitAnswer({ score: NaN, source: 'automatic' })).rejects.toThrow()
    expect(mocks.study.saveAttempt).not.toHaveBeenCalled()
  })

  it('isolates lab session identity, writes, resume history and student evidence', async () => {
    useMemory(mocks.study)
    useMemory(mocks.lab)
    const study = useStudySessionStore()
    const lab = useAlgorithmLabSessionStore()
    await study.startSession('1')
    const activeStudyId = study.session?.id
    const studyState = copy(study.session)
    const writesBefore = mocks.study.saveSession.mock.calls.length
    const started = await lab.startSession()
    await lab.submitAnswer({ score: 0, source: 'automatic' })
    expect(mocks.study.saveSession).toHaveBeenCalledTimes(writesBefore)
    expect(mocks.study.saveAttempt).not.toHaveBeenCalled()
    expect(study.session?.id).toBe(activeStudyId)
    expect(copy(study.session)).toEqual(studyState)
    expect(lab.session?.studentId).toBe('algorithm-lab')
    expect(mocks.lab.getStudentHistory).toHaveBeenCalledWith('algorithm-lab')
    expect(mocks.lab.saveAttempt).toHaveBeenCalledTimes(1)
    await lab.pauseSession()
    expect(await lab.resumeSession(started!.id)).toBe(true)
    expect(lab.historyCount).toBe(1)
    expect(study.historyCount).toBe(0)
  })
})
