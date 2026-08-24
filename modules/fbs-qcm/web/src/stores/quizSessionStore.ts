// stores/quizSessionStore.ts
// ============================================================
// REFACTORED: Nutzt konsolidierte Competencies
// ============================================================

import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { AdaptiveQuizAlgorithm, createSession } from '@/composables/algorithm'
import { competencies, questions } from '@/composables/skillgraph.mock'
import { learningProgressRepository } from '@/services/learningProgress.repository'

import type {
  AnswerEvaluation,
  AnswerResult,
  Competency,
  LearningAttempt,
  NextQuestion,
  Question,
  SessionState
} from '@/model/types'

export const useQuizSessionStore = defineStore('quizSession', () => {
  const algo = new AdaptiveQuizAlgorithm()

  // REFACTORED: Nutze die konsolidierten competencies direkt
  const competencies_ref = ref<Competency[]>(competencies)
  const questions_ref = ref<Question[]>(questions)

  const session = ref<SessionState | null>(null)

  const currentQuestion = ref<NextQuestion | null>(null)

  const lastResult = ref<AnswerResult | null>(null)

  const isComplete = ref(false)
  const attempts = ref<LearningAttempt[]>([])
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

  const historyCount = computed(() => session.value?.history.length ?? 0)

  function setCompetencies(values: Competency[]) {
    competencies_ref.value = values
  }

  function setQuestions(values: Question[]) {
    questions_ref.value = values
  }

  async function startSession(studentId = 'student') {
    if (competencies_ref.value.length === 0) {
      console.warn('Keine Competencies geladen')
      return
    }

    const newSession = createSession(studentId, competencies_ref.value)
    session.value = newSession
    attempts.value = []

    currentQuestion.value = null
    lastResult.value = null
    isComplete.value = false

    await learningProgressRepository.createSession(newSession)
    advance()
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
    if (session.value.currentCompetencyId === targetCompetencyId) {
      // Gleiche Kompetenz: Counter incrementieren
      session.value.questionsInCurrentCompetency += 1
    } else {
      // Neue Kompetenz: Reset auf 1
      session.value.currentCompetencyId = targetCompetencyId
      session.value.questionsInCurrentCompetency = 1
    }

    const { updatedState, result } = algo.submitAnswer(
      current.question,
      normalizedScore,
      session.value,
      competencies_ref.value,
      questions_ref.value
    )

    session.value = updatedState
    const attempt: LearningAttempt = {
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

    attempts.value = [...attempts.value, attempt]
    await learningProgressRepository.saveAttempt(attempt)
    await learningProgressRepository.saveSessionState(updatedState)

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
    const savedSession = await learningProgressRepository.getSession(sessionId)
    if (!savedSession) {
      return false
    }

    session.value = savedSession
    attempts.value = await learningProgressRepository.getAttempts(sessionId)
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

    await learningProgressRepository.saveSessionState(session.value)

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

    await learningProgressRepository.saveSessionState(session.value)
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

    await learningProgressRepository.saveSessionState(session.value)

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
    skills: competencies_ref,
    questions: questions_ref,

    session,
    currentQuestion,
    lastResult,
    isComplete,
    attempts,

    // computed
    progress,
    overallScore,
    overallProgress,
    historyCount,
    excludedQuestionIds,

    // actions
    setCompetencies,
    setQuestions,
    setExcludedQuestions,
    excludeQuestion,
    includeQuestion,

    startSession,
    resumeSession,
    submitAnswer,
    resetSession
  }
})
