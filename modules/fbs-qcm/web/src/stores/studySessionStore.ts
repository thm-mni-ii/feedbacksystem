// stores/studySessionStore.ts
// ============================================================
// REFACTORED: Nutzt konsolidierte Competencies
// ============================================================

import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { AdaptiveQuizAlgorithm, createSession } from '@/composables/algorithm'
import { getAuthenticatedStudentId } from '@/services/apiV2Client'
import studyContentService from '@/services/studyContent.service'
import { studyProgressRepository } from '@/services/studyProgress.repository'
import studyConfigurationService from '@/services/studyConfiguration.service'
import { DEFAULT_STUDY_ALGORITHM_CONFIG } from '@/model/StudyAlgorithmConfig'

import type {
  AnswerEvaluation,
  AnswerResult,
  Competency,
  QuestionAttempt,
  NextQuestion,
  Question,
  StudySession
} from '@/model/types'

export const useStudySessionStore = defineStore('studySession', () => {
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
    if (!session.value) return `0 / ${maximum} Fragen`
    return `${session.value.history.length} / ${maximum} Fragen`
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
    studentId = getAuthenticatedStudentId()
  ): Promise<StudySession | null> {
    if (!(await loadStudyContent(courseId))) {
      return null
    }

    if (competencies_ref.value.length === 0) {
      studyContentLoadError.value = 'Es sind keine Kompetenzen für eine Lernsitzung verfügbar.'
      return null
    }

    if (questions_ref.value.length === 0) {
      studyContentLoadError.value = 'Für diesen Kurs sind keine Lernfragen verfügbar.'
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

    currentQuestion.value = null
    lastResult.value = null
    isComplete.value = false

    // Persistente Adapter (z.B. HTTP) können eine andere id zurückgeben, als
    // lokal generiert wurde (serverseitig vergebene id) – die Session
    // übernimmt daher den vom Repository zurückgegebenen Datensatz.
    session.value = await studyProgressRepository.createSession(newSession)
    algo = new AdaptiveQuizAlgorithm(session.value.algorithm.configuration)

    const historicalAttempts = await studyProgressRepository.getStudentHistory(studentId)
    for (const attempt of historicalAttempts) {
      const question = questions_ref.value.find((item) => item.id === attempt.questionId)
      if (!question || !session.value) continue

      const ageInDays = Math.max(0, (Date.now() - attempt.submittedAt) / 86_400_000)
      const forgettingFactor = 2 ** (-ageInDays / 30)
      const decayedScore = 0.5 + (attempt.evaluation.score - 0.5) * forgettingFactor
      session.value = algo.applyHistoricalEvidence(question, decayedScore, session.value)
    }

    if (historicalAttempts.length > 0 && session.value) {
      await studyProgressRepository.saveSession(session.value)
    }
    advance()
    return session.value
  }

  async function loadSavedSessions(studentId = getAuthenticatedStudentId()): Promise<void> {
    isLoadingSavedSessions.value = true
    try {
      savedSessions.value = await studyProgressRepository.getStudentSessions(studentId)
    } catch (error) {
      console.error('Gespeicherte Lernsitzungen konnten nicht geladen werden.', error)
      studyContentLoadError.value = 'Gespeicherte Lernsitzungen konnten nicht geladen werden.'
    } finally {
      isLoadingSavedSessions.value = false
    }
  }

  function advance() {
    if (!session.value) return

    currentQuestion.value = algo.nextQuestion(
      competencies_ref.value,
      questions_ref.value,
      session.value
    )
    questionPresentedAt.value = currentQuestion.value ? Date.now() : null
  }

  async function submitAnswer(
    evaluation: AnswerEvaluation,
    responsePayload?: unknown
  ): Promise<void> {
    if (!session.value || !currentQuestion.value) {
      return
    }

    const normalizedScore = Math.min(1, Math.max(0, evaluation.score))
    const current = currentQuestion.value
    const submittedAt = Date.now()

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
    session.value = sessionWithStickiness

    const { updatedState, result } = algo.submitAnswer(
      current.question,
      normalizedScore,
      sessionWithStickiness,
      competencies_ref.value,
      questions_ref.value
    )

    session.value = updatedState
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
      responseTimeMs: Math.max(0, submittedAt - (questionPresentedAt.value ?? submittedAt))
    }

    // Persistente Adapter können eine andere id zurückgeben (serverseitig
    // vergeben) – der lokale Verlauf übernimmt daher den zurückgegebenen
    // Datensatz statt der lokal generierten id.
    const savedAttempt = await studyProgressRepository.saveAttempt(attempt)
    attempts.value = [...attempts.value, savedAttempt]
    await studyProgressRepository.saveSession(updatedState)

    lastResult.value = result
    isComplete.value = result.sessionComplete
    if (result.sessionComplete) {
      currentQuestion.value = null
      questionPresentedAt.value = null
      return
    }

    advance()
  }

  /** Lädt einen zuvor gespeicherten Lernstand und setzt die Sitzung fort. */
  async function resumeSession(sessionId: string): Promise<boolean> {
    const savedSession = await studyProgressRepository.getSession(sessionId)
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
    session.value = normalizedSession
    algo = new AdaptiveQuizAlgorithm(normalizedSession.algorithm.configuration)
    attempts.value = await studyProgressRepository.getAttempts(sessionId)
    currentQuestion.value = null
    lastResult.value = null
    isComplete.value = !!savedSession.completedAt
    if (isComplete.value) {
      questionPresentedAt.value = null
      return true
    }
    advance()
    return true
  }

  async function excludeQuestion(questionId: string) {
    if (!session.value) {
      return
    }

    if (session.value.excludedQuestionIds.includes(questionId)) {
      return
    }

    session.value = {
      ...session.value,
      excludedQuestionIds: [...session.value.excludedQuestionIds, questionId],
      updatedAt: Date.now()
    }

    await studyProgressRepository.saveSession(session.value)

    if (currentQuestion.value?.question.id === questionId) {
      advance()
    }
  }

  async function includeQuestion(questionId: string) {
    if (!session.value) {
      return
    }

    if (!session.value.excludedQuestionIds.includes(questionId)) {
      return
    }

    session.value = {
      ...session.value,
      excludedQuestionIds: session.value.excludedQuestionIds.filter((id) => id !== questionId),
      updatedAt: Date.now()
    }

    await studyProgressRepository.saveSession(session.value)
  }

  async function setExcludedQuestions(questionIds: string[]) {
    if (!session.value) {
      return
    }

    const uniqueQuestionIds = [...new Set(questionIds)]

    session.value = {
      ...session.value,
      excludedQuestionIds: uniqueQuestionIds,
      updatedAt: Date.now()
    }

    await studyProgressRepository.saveSession(session.value)

    if (currentQuestion.value && uniqueQuestionIds.includes(currentQuestion.value.question.id)) {
      advance()
    }
  }

  // Reset
  function resetSession() {
    session.value = null
    currentQuestion.value = null
    lastResult.value = null
    isComplete.value = false
    attempts.value = []
    questionPresentedAt.value = null
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

    // computed
    progress,
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
    resumeSession,
    submitAnswer,
    resetSession
  }
})
