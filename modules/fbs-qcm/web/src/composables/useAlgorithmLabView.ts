import { computed, onScopeDispose, ref, watch } from 'vue'
import { buildAnswerFeedback, type AnswerFeedback } from '@/composables/answerFeedback'
import { buildProfileGroups } from '@/composables/competencyHierarchy'
import { useAlgorithmLabSessionStore, useStudySessionStore } from '@/stores/studySessionStore'

interface AnswerSubmission {
  score: number
  isCorrect: boolean
  responsePayload: unknown
}

type SessionStore =
  | ReturnType<typeof useStudySessionStore>
  | ReturnType<typeof useAlgorithmLabSessionStore>

export function useAlgorithmLabView(store: SessionStore = useStudySessionStore()) {
  const expandedPanel = ref<string | null>(null)
  const showFeedback = ref(false)
  // Feedback zur zuletzt beantworteten Aufgabe. Solange gesetzt, bleibt die
  // Auflösung sichtbar, obwohl der Store bereits zur nächsten Aufgabe gewechselt hat.
  const answerFeedback = ref<AnswerFeedback | null>(null)
  let feedbackTimeout: ReturnType<typeof setTimeout> | undefined

  const resetFeedback = () => {
    clearTimeout(feedbackTimeout)
    answerFeedback.value = null
    showFeedback.value = false
  }

  onScopeDispose(resetFeedback)

  const hierarchicalProgress = computed(() =>
    buildProfileGroups(
      [...store.competencies],
      store.progress,
      store.currentQuestion?.targetCompetency.id ?? null
    )
  )

  watch(
    hierarchicalProgress,
    (groups) => {
      const activeGroup = groups.find((group) => group.isActive)
      expandedPanel.value = activeGroup?.root.competencyId ?? null
    },
    { immediate: true }
  )

  const scoreColor = (score: number, timesAssessed: number): string => {
    if (timesAssessed === 0) return 'grey'
    if (score < 0.35) return 'low'
    if (score < 0.7) return 'medium'
    return 'success'
  }

  const scoreLabel = (score: number, timesAssessed: number): string => {
    if (timesAssessed === 0) return 'Nicht bewertet'
    return `${Math.round(score * 100)}%`
  }

  const submitAnswer = async (answer: AnswerSubmission) => {
    const answeredQuestion = store.currentQuestion
    if (!answeredQuestion) {
      console.warn('Keine aktuelle Aufgabe vorhanden')
      return
    }

    await store.submitAnswer(
      {
        score: answer.score,
        isCorrect: answer.isCorrect,
        source: 'automatic'
      },
      answer.responsePayload
    )
    answerFeedback.value = buildAnswerFeedback(
      answeredQuestion,
      Math.min(1, Math.max(0, answer.score)),
      answer.responsePayload
    )
    showFeedback.value = true
    clearTimeout(feedbackTimeout)
    feedbackTimeout = setTimeout(() => {
      showFeedback.value = false
    }, 1000)
  }

  const continueAfterFeedback = () => {
    answerFeedback.value = null
  }

  return {
    store,
    expandedPanel,
    showFeedback,
    answerFeedback,
    hierarchicalProgress,
    scoreColor,
    scoreLabel,
    submitAnswer,
    continueAfterFeedback,
    resetFeedback
  }
}
