// stores/studySessionStore.ts
// ============================================================
// REFACTORED: Nutzt konsolidierte Competencies
// ============================================================

import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { AdaptiveQuizAlgorithm, createSession } from '@/composables/algorithm'
import { getAuthenticatedStudentId } from '@/services/apiV2Client'
import studyContentService from '@/services/studyContent.service'
import {
  studyProgressRepository,
  algorithmLabProgressRepository,
  type StudyProgressRepository
} from '@/services/studyProgress.repository'
import studyConfigurationService from '@/services/studyConfiguration.service'
import { DEFAULT_STUDY_ALGORITHM_CONFIG } from '@/model/StudyAlgorithmConfig'
import { getOpenCourseSession } from '@/composables/studyProgress'

import type {
  AnswerEvaluation,
  AnswerResult,
  Competency,
  QuestionAttempt,
  NextQuestion,
  Question,
  StudySession
} from '@/model/types'

function createStudySessionState(
  repository: StudyProgressRepository,
  defaultStudentId: () => string
) {
  let algo = new AdaptiveQuizAlgorithm()

  const competencies_ref = ref<Competency[]>([])
  const questions_ref = ref<Question[]>([])
  const isLoadingStudyContent = ref(false)
  const studyContentLoadError = ref<string | null>(null)
  const savedSessions = ref<StudySession[]>([])
  const isLoadingSavedSessions = ref(false)

  const session = ref<StudySession | null>(null)

  const currentQuestion = ref<NextQuestion | null>(null)

  const lastResult = ref<AnswerResult | null>(null)

  const isComplete = ref(false)
  const attempts = ref<QuestionAttempt[]>([])
  const questionPresentedAt = ref<number | null>(null)
  const isSavingAnswer = ref(false)
  const needsRecovery = ref(false)

  const completionMessage = computed(() => {
    if (!session.value || !isComplete.value) return ''
    if (
      session.value.history.length >=
      session.value.algorithm.configuration.session.maxQuestionsPerSession
    ) {
      return 'Das Aufgabenlimit dieser Session ist erreicht.'
    }
    const completion = algo.getCompletionStatus(
      competencies_ref.value,
      questions_ref.value,
      session.value
    )
    return completion.isComplete
      ? 'Für die verfügbaren Kompetenzen liegt ausreichend Evidenz vor. Das bedeutet nicht automatisch, dass alle Kompetenzen beherrscht werden.'
      : 'Es steht aktuell keine weitere geeignete Aufgabe zur Verfügung. Deine bisherigen Antworten bleiben erhalten.'
  })

  const progress = computed(() => {
    if (!session.value) return []

    return algo.getProgress(competencies_ref.value, session.value)
  })

  const excludedQuestionIds = computed(() => session.value?.excludedQuestionIds ?? [])

  const overallScore = computed(() => {
    if (!session.value) return 0

    return algo.getOverallScore(competencies_ref.value, session.value)
  })

  const overallProgress = computed(() => overallScore.value)

  const sessionProgress = computed(() => {
    if (!session.value) return 0
    const maximum = session.value.algorithm.configuration.session.maxQuestionsPerSession
    return Math.min(100, (session.value.history.length / maximum) * 100)
  })

  const sessionProgressLabel = computed(() => {
    const maximum =
      session.value?.algorithm.configuration.session.maxQuestionsPerSession ??
      DEFAULT_STUDY_ALGORITHM_CONFIG.session.maxQuestionsPerSession
    if (!session.value) return `0 / ${maximum} Aufgaben`
    return `${session.value.history.length} / ${maximum} Aufgaben`
  })

  const historyCount = computed(() => session.value?.history.length ?? 0)

  function setCompetencies(values: Competency[]) {
    competencies_ref.value = values
  }

  function setQuestions(values: Question[]) {
    questions_ref.value = values
  }

  async function loadStudyContent(courseId?: string): Promise<boolean> {
    isLoadingStudyContent.value = true
    studyContentLoadError.value = null

    try {
      const { competencies: loadedCompetencies, questions: loadedQuestions } =
        await studyContentService.getStudyContent(courseId)
      competencies_ref.value = loadedCompetencies
      questions_ref.value = loadedQuestions
      return true
    } catch (error) {
      console.error('Lerninhalte konnten nicht geladen werden.', error)
      studyContentLoadError.value =
        'Lerninhalte konnten nicht geladen werden. Stelle sicher, dass das v2-Backend läuft und seed-Daten vorhanden sind.'
      return false
    } finally {
      isLoadingStudyContent.value = false
    }
  }

  async function startSession(
    courseId?: string,
    studentId = defaultStudentId()
  ): Promise<StudySession | null> {
    if (isSavingAnswer.value) {
      throw new Error('Die aktuelle Antwort wird noch gespeichert.')
    }
    if (courseId) {
      const studentSessions = await repository.getStudentSessions(studentId)
      savedSessions.value = studentSessions
      const openSession = getOpenCourseSession(studentSessions, courseId)
      if (openSession) {
        if (!(await resumeSession(openSession.id))) {
          studyContentLoadError.value =
            studyContentLoadError.value ?? 'Die offene Lernsitzung konnte nicht geladen werden.'
          return null
        }
        return session.value
      }
    }

    if (!(await loadStudyContent(courseId))) {
      return null
    }

    if (competencies_ref.value.length === 0) {
      studyContentLoadError.value = 'Es sind keine Kompetenzen für eine Lernsitzung verfügbar.'
      return null
    }

    if (questions_ref.value.length === 0) {
      studyContentLoadError.value = 'Für diesen Kurs sind keine Lernaufgaben verfügbar.'
      return null
    }

    let courseConfiguration
    try {
      courseConfiguration = courseId
        ? await studyConfigurationService.get(courseId)
        : {
            effectiveConfig: DEFAULT_STUDY_ALGORITHM_CONFIG,
            revision: 0
          }
    } catch (error) {
      console.error('Kurskonfiguration konnte nicht geladen werden.', error)
      studyContentLoadError.value = 'Die Kurskonfiguration konnte nicht geladen werden.'
      return null
    }

    const historicalAttempts = await repository.getStudentHistory(studentId)
    algo = new AdaptiveQuizAlgorithm(courseConfiguration.effectiveConfig)
    const newSession = {
      ...createSession(
        studentId,
        competencies_ref.value,
        courseConfiguration.effectiveConfig,
        courseConfiguration.revision
      ),
      courseId: courseId ?? null
    }
    attempts.value = []
    needsRecovery.value = false

    currentQuestion.value = null
    lastResult.value = null
    isComplete.value = false

    // Persistente Adapter (z.B. HTTP) können eine andere id zurückgeben, als
    // lokal generiert wurde (serverseitig vergebene id) – die Session
    // übernimmt daher den vom Repository zurückgegebenen Datensatz.
    session.value = await repository.createSession(newSession)
    algo = new AdaptiveQuizAlgorithm(session.value.algorithm.configuration)

    for (const attempt of historicalAttempts) {
      const question = questions_ref.value.find((item) => item.id === attempt.questionId)
      if (!question || !session.value) continue

      const ageInDays = Math.max(0, (Date.now() - attempt.submittedAt) / 86_400_000)
      const forgettingFactor = 2 ** (-ageInDays / 30)
      session.value = algo.applyHistoricalEvidence(
        question,
        attempt.evaluation.score,
        session.value,
        forgettingFactor
      )
    }

    if (historicalAttempts.length > 0 && session.value) {
      await repository.saveSession(session.value)
    }
    await advance()
    return session.value
  }

  async function loadSavedSessions(studentId = defaultStudentId()): Promise<boolean> {
    isLoadingSavedSessions.value = true
    studyContentLoadError.value = null
    try {
      savedSessions.value = await repository.getStudentSessions(studentId)
      return true
    } catch (error) {
      console.error('Gespeicherte Lernsitzungen konnten nicht geladen werden.', error)
      studyContentLoadError.value = 'Gespeicherte Lernsitzungen konnten nicht geladen werden.'
      return false
    } finally {
      isLoadingSavedSessions.value = false
    }
  }

  async function restartCourseSession(courseId: string): Promise<StudySession | null> {
    assertSessionMutable()
    const studentId = defaultStudentId()
    const studentSessions = await repository.getStudentSessions(studentId)
    for (const openSession of studentSessions.filter(
      (item) => item.courseId === courseId && item.completedAt == null
    )) {
      const now = Date.now()
      const completedSession = { ...openSession, completedAt: now, updatedAt: now }
      await repository.saveSession(completedSession)
      if (session.value?.id === openSession.id) {
        resetSession()
      }
    }
    return startSession(courseId, studentId)
  }

  async function pauseSession(): Promise<void> {
    if (!session.value) {
      throw new Error('Es ist keine Lernsitzung zum Pausieren vorhanden.')
    }
    if (isSavingAnswer.value || needsRecovery.value) {
      throw new Error('Die Antwort muss zuerst gespeichert oder die Session neu geladen werden.')
    }
    await repository.saveSession(session.value)
    resetSession()
  }

  async function advance() {
    if (!session.value) return

    const nextQuestion = algo.nextQuestion(
      competencies_ref.value,
      questions_ref.value,
      session.value
    )
    if (!nextQuestion && session.value.completedAt == null) {
      const now = Math.max(Date.now(), session.value.updatedAt + 1)
      const completedSession = { ...session.value, completedAt: now, updatedAt: now }
      try {
        await repository.saveSession(completedSession)
      } catch (error) {
        needsRecovery.value = true
        throw error
      }
      session.value = completedSession
      isComplete.value = true
    }
    currentQuestion.value = nextQuestion
    questionPresentedAt.value = nextQuestion ? Date.now() : null
  }

  async function submitAnswer(
    evaluation: AnswerEvaluation,
    responsePayload?: unknown
  ): Promise<void> {
    if (!session.value || !currentQuestion.value || isSavingAnswer.value || needsRecovery.value) {
      throw new Error('Aktuell kann keine Antwort gespeichert werden.')
    }
    if (!Number.isFinite(evaluation.score)) {
      throw new Error('Die Bewertung muss eine endliche Zahl sein.')
    }
    isSavingAnswer.value = true
    try {
      const normalizedScore = Math.min(1, Math.max(0, evaluation.score))
      const current = currentQuestion.value
      const submittedAt = Math.max(Date.now(), session.value.updatedAt + 1)
      const mastery =
        session.value.competencies[current.targetCompetency.id]?.score ??
        session.value.algorithm.configuration.model.initialMastery
      const model = session.value.algorithm.configuration.model
      const predictionBefore = mastery * (1 - model.slipRate) + (1 - mastery) * model.guessRate

      // Stickiness-Logik: Aktualisiere currentCompetencyId und questionsInCurrentCompetency
      const targetCompetencyId = current.targetCompetency.id
      const sessionWithStickiness: StudySession =
        session.value.currentCompetencyId === targetCompetencyId
          ? {
              // Gleiche Kompetenz: Counter incrementieren
              ...session.value,
              questionsInCurrentCompetency: session.value.questionsInCurrentCompetency + 1
            }
          : {
              // Neue Kompetenz: Reset auf 1
              ...session.value,
              currentCompetencyId: targetCompetencyId,
              questionsInCurrentCompetency: 1
            }
      const { updatedState, result } = algo.submitAnswer(
        current.question,
        normalizedScore,
        sessionWithStickiness,
        competencies_ref.value,
        questions_ref.value
      )
      updatedState.updatedAt = Math.max(updatedState.updatedAt, submittedAt)
      updatedState.history[updatedState.history.length - 1].answeredAt = submittedAt

      const nextQuestion = result.sessionComplete
        ? null
        : algo.nextQuestion(competencies_ref.value, questions_ref.value, updatedState)
      if (!nextQuestion && updatedState.completedAt == null) {
        updatedState.completedAt = submittedAt
        result.sessionComplete = true
      }
      const { id, studentId, history, algorithm, ...sessionStateAfter } = updatedState
      void id
      void studentId
      void history
      void algorithm
      const attempt: QuestionAttempt = {
        id: crypto.randomUUID(),
        sessionId: updatedState.id,
        studentId: updatedState.studentId,
        questionId: current.question.id,
        targetCompetencyId,
        competencyIds: result.updatedCompetencies,
        evaluation: { ...evaluation, score: normalizedScore },
        responsePayload,
        submittedAt,
        responseTimeMs: Math.max(0, submittedAt - (questionPresentedAt.value ?? submittedAt)),
        predictionBefore,
        sessionStateAfter
      }

      // Persistente Adapter können eine andere id zurückgeben (serverseitig
      // vergeben) – der lokale Verlauf übernimmt daher den zurückgegebenen
      // Datensatz statt der lokal generierten id.
      const savedAttempt = await repository.saveAttempt(attempt)
      attempts.value = [...attempts.value, savedAttempt]
      await repository.saveSession(updatedState)
      session.value = updatedState

      lastResult.value = result
      isComplete.value = result.sessionComplete
      if (result.sessionComplete) {
        currentQuestion.value = null
        questionPresentedAt.value = null
        return
      }

      currentQuestion.value = nextQuestion
      questionPresentedAt.value = nextQuestion ? Date.now() : null
    } catch (error) {
      needsRecovery.value = true
      throw error
    } finally {
      isSavingAnswer.value = false
    }
  }

  /** Lädt einen zuvor gespeicherten Lernstand und setzt die Sitzung fort. */
  async function resumeSession(sessionId: string): Promise<boolean> {
    if (isSavingAnswer.value) {
      throw new Error('Die aktuelle Antwort wird noch gespeichert.')
    }
    const savedSession = await repository.getSession(sessionId)
    if (!savedSession) {
      return false
    }

    if (!(await loadStudyContent(savedSession.courseId ?? undefined))) {
      return false
    }

    const normalizedSession: StudySession = savedSession.algorithm
      ? savedSession
      : {
          ...savedSession,
          algorithm: {
            configuration: DEFAULT_STUDY_ALGORITHM_CONFIG,
            courseConfigurationRevision: 0
          }
        }
    const initialStates = createSession(
      savedSession.studentId,
      competencies_ref.value,
      normalizedSession.algorithm.configuration
    ).competencies
    const savedAttempts = await repository.getAttempts(sessionId)
    session.value = {
      ...normalizedSession,
      competencies: { ...initialStates, ...normalizedSession.competencies }
    }
    algo = new AdaptiveQuizAlgorithm(normalizedSession.algorithm.configuration)
    attempts.value = savedAttempts
    needsRecovery.value = false
    currentQuestion.value = null
    lastResult.value = null
    isComplete.value = savedSession.completedAt != null
    if (isComplete.value) {
      questionPresentedAt.value = null
      return true
    }
    await advance()
    return true
  }

  async function excludeQuestion(questionId: string) {
    assertSessionMutable()
    if (!session.value) {
      return
    }

    if (session.value.excludedQuestionIds.includes(questionId)) {
      return
    }

    const updatedSession = {
      ...session.value,
      excludedQuestionIds: [...session.value.excludedQuestionIds, questionId],
      updatedAt: Math.max(Date.now(), session.value.updatedAt + 1)
    }

    await repository.saveSession(updatedSession)
    session.value = updatedSession

    if (currentQuestion.value?.question.id === questionId) {
      await advance()
    }
  }

  async function includeQuestion(questionId: string) {
    assertSessionMutable()
    if (!session.value) {
      return
    }

    if (!session.value.excludedQuestionIds.includes(questionId)) {
      return
    }

    const updatedSession = {
      ...session.value,
      excludedQuestionIds: session.value.excludedQuestionIds.filter((id) => id !== questionId),
      updatedAt: Math.max(Date.now(), session.value.updatedAt + 1)
    }

    await repository.saveSession(updatedSession)
    session.value = updatedSession
  }

  async function setExcludedQuestions(questionIds: string[]) {
    assertSessionMutable()
    if (!session.value) {
      return
    }

    const uniqueQuestionIds = [...new Set(questionIds)]

    const updatedSession = {
      ...session.value,
      excludedQuestionIds: uniqueQuestionIds,
      updatedAt: Math.max(Date.now(), session.value.updatedAt + 1)
    }

    await repository.saveSession(updatedSession)
    session.value = updatedSession

    if (currentQuestion.value && uniqueQuestionIds.includes(currentQuestion.value.question.id)) {
      await advance()
    }
  }

  // Reset
  function resetSession() {
    if (isSavingAnswer.value) {
      throw new Error('Die aktuelle Antwort wird noch gespeichert.')
    }
    session.value = null
    currentQuestion.value = null
    lastResult.value = null
    isComplete.value = false
    attempts.value = []
    questionPresentedAt.value = null
    needsRecovery.value = false
  }

  function assertSessionMutable() {
    if (isSavingAnswer.value || needsRecovery.value) {
      throw new Error('Die Antwort muss zuerst gespeichert oder die Session neu geladen werden.')
    }
  }

  return {
    // state
    competencies: competencies_ref,
    questions: questions_ref,
    isLoadingStudyContent,
    isLoadingSavedSessions,
    studyContentLoadError,

    session,
    savedSessions,
    currentQuestion,
    lastResult,
    isComplete,
    attempts,
    isSavingAnswer,
    needsRecovery,

    // computed
    progress,
    completionMessage,
    overallScore,
    overallProgress,
    sessionProgress,
    sessionProgressLabel,
    historyCount,
    excludedQuestionIds,

    // actions
    setCompetencies,
    setQuestions,
    loadStudyContent,
    loadSavedSessions,
    setExcludedQuestions,
    excludeQuestion,
    includeQuestion,

    startSession,
    restartCourseSession,
    pauseSession,
    resumeSession,
    submitAnswer,
    resetSession
  }
}

export const useStudySessionStore = defineStore('studySession', () =>
  createStudySessionState(studyProgressRepository, getAuthenticatedStudentId)
)

export const useAlgorithmLabSessionStore = defineStore('algorithmLabSession', () =>
  createStudySessionState(algorithmLabProgressRepository, () => 'algorithm-lab')
)
