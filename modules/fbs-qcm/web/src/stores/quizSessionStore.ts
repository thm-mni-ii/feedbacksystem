// stores/quizSessionStore.ts
// ============================================================
// REFACTORED: Nutzt konsolidierte Competencies
// ============================================================

import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { AdaptiveQuizAlgorithm, createSession } from '@/composables/algorithm'
import { competencies, questions } from '@/composables/skillgraph.mock'

import type { Competency, Question, SessionState, NextQuestion, AnswerResult } from '@/model/types'

export const useQuizSessionStore = defineStore('quizSession', () => {
  const algo = new AdaptiveQuizAlgorithm()

  // REFACTORED: Nutze die konsolidierten competencies direkt
  const competencies_ref = ref<Competency[]>(competencies)
  const questions_ref = ref<Question[]>(questions)

  const session = ref<SessionState | null>(null)

  const currentQuestion = ref<NextQuestion | null>(null)

  const lastResult = ref<AnswerResult | null>(null)

  const isComplete = ref(false)

  const progress = computed(() => {
    if (!session.value) return []

    return algo.getProgress(competencies_ref.value, session.value)
  })

  const excludedQuestionIds = computed(() => session.value?.excludedQuestionIds ?? [])

  const overallScore = computed(() => {
    if (!session.value) return 0

    return algo.getOverallScore(competencies_ref.value, session.value)
  })

  const historyCount = computed(() => session.value?.history.length ?? 0)

  function setCompetencies(values: Competency[]) {
    competencies_ref.value = values
  }

  function setQuestions(values: Question[]) {
    questions_ref.value = values
  }

  function startSession(studentId = 'student') {
    // REFACTORED: Nutze competencies_ref statt competencies
    if (competencies_ref.value.length === 0) {
      console.warn('Keine Competencies geladen')
      return
    }

    session.value = createSession(studentId, competencies_ref.value)

    currentQuestion.value = null
    lastResult.value = null
    isComplete.value = false

    advance()
  }

  function advance() {
    if (!session.value) return

    currentQuestion.value = algo.nextQuestion(
      competencies_ref.value,
      questions_ref.value,
      session.value
    )
  }

  function submitAnswer(score: number) {
    if (!session.value || !currentQuestion.value) {
      return
    }

    // Stickiness-Logik: Aktualisiere currentCompetencyId und questionsInCurrentCompetency
    const targetCompetencyId = currentQuestion.value.targetCompetency.id
    if (session.value.currentCompetencyId === targetCompetencyId) {
      // Gleiche Kompetenz: Counter incrementieren
      session.value.questionsInCurrentCompetency += 1
    } else {
      // Neue Kompetenz: Reset auf 1
      session.value.currentCompetencyId = targetCompetencyId
      session.value.questionsInCurrentCompetency = 1
    }

    const { updatedState, result } = algo.submitAnswer(
      currentQuestion.value.question,
      score,
      session.value
    )

    session.value = updatedState

    lastResult.value = result

    advance()
  }

  function excludeQuestion(questionId: string) {
    if (!session.value) {
      return
    }

    if (session.value.excludedQuestionIds.includes(questionId)) {
      return
    }

    session.value = {
      ...session.value,
      excludedQuestionIds: [...session.value.excludedQuestionIds, questionId]
    }

    if (currentQuestion.value?.question.id === questionId) {
      advance()
    }
  }

  function includeQuestion(questionId: string) {
    if (!session.value) {
      return
    }

    if (!session.value.excludedQuestionIds.includes(questionId)) {
      return
    }

    session.value = {
      ...session.value,
      excludedQuestionIds: session.value.excludedQuestionIds.filter((id) => id !== questionId)
    }
  }

  function setExcludedQuestions(questionIds: string[]) {
    if (!session.value) {
      return
    }

    const uniqueQuestionIds = [...new Set(questionIds)]

    session.value = {
      ...session.value,
      excludedQuestionIds: uniqueQuestionIds
    }

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
  }

  return {
    // state
    competencies: competencies_ref,
    questions: questions_ref,

    session,
    currentQuestion,
    lastResult,
    isComplete,

    // computed
    progress,
    overallScore,
    historyCount,
    excludedQuestionIds,

    // actions
    setCompetencies,
    setQuestions,
    setExcludedQuestions,
    excludeQuestion,
    includeQuestion,

    startSession,
    submitAnswer,
    resetSession
  }
})
