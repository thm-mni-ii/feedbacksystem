import { computed, ref, watch } from 'vue'
import { buildProfileGroups } from '@/composables/competencyHierarchy'
import { useStudySessionStore } from '@/stores/studySessionStore'

interface AnswerSubmission {
  score: number
  isCorrect: boolean
  responsePayload: unknown
}

export function useAlgorithmLabView() {
  const store = useStudySessionStore()
  const expandedPanel = ref<string | null>(null)
  const showFeedback = ref(false)

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
    if (!store.currentQuestion) {
      console.warn('Keine aktuelle Frage vorhanden')
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
    showFeedback.value = true
    setTimeout(() => {
      showFeedback.value = false
    }, 1000)
  }

  return {
    store,
    expandedPanel,
    showFeedback,
    hierarchicalProgress,
    scoreColor,
    scoreLabel,
    submitAnswer
  }
}
