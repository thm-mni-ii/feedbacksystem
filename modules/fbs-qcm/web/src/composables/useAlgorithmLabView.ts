import { computed, ref, watch } from 'vue'
import { buildProfileGroups } from '@/composables/competencyHierarchy'
import { getQuestionCompetencyIds } from '@/composables/qMatrix'
import { useQuizSessionStore } from '@/stores/quizSessionStore'

export function useAlgorithmLabView() {
  const store = useQuizSessionStore()

  const sliderScore = ref(0.5)
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

  const algorithmInsight = computed<AlgorithmLabRealtimeInsight | null>(() => {
    const session = store.session
    const currentQuestion = store.currentQuestion

    if (!session || !currentQuestion) {
      return null
    }

    const excludedQuestionIds = new Set(session.excludedQuestionIds)
    const relevantCompetencies = getRelevantCompetencies(
      store.competencies,
      store.questions,
      excludedQuestionIds
    )
    const completion = insightAlgorithm.getCompletionStatus(
      store.competencies,
      store.questions,
      session
    )
    const competencyNameById = new Map(
      store.competencies.map((competency) => [competency.id, competency.name])
    )
    const targetCompetencyId = currentQuestion.targetCompetency.id
    const targetState = session.competencies[targetCompetencyId]
    const linkedCompetencies = getQuestionCompetencyLinks(currentQuestion.question)
      .map((link) => {
        const state = session.competencies[link.competencyId]
        return {
          competencyId: link.competencyId,
          label: competencyNameById.get(link.competencyId) ?? link.competencyId,
          relationLabel: link.relation === 'supporting' ? 'Unterstützend' : 'Direkt bewertet',
          weight: link.weight ?? 1,
          score: state?.score ?? 0,
          timesAssessed: state?.timesAssessed ?? 0,
          isTarget: link.competencyId === targetCompetencyId
        }
      })
      .sort((a, b) => Number(b.isTarget) - Number(a.isTarget) || b.weight - a.weight)

    const pendingCompetencyIds = new Set(completion.pendingCompetencyIds)
    const rankedCompetencies = (
      pendingCompetencyIds.size > 0 ? relevantCompetencies : store.competencies
    )
      .filter(
        (competency) => pendingCompetencyIds.size === 0 || pendingCompetencyIds.has(competency.id)
      )
      .map((competency) => {
        const state = session.competencies[competency.id]
        return {
          competencyId: competency.id,
          priority: (1 / ((state?.timesAssessed ?? 0) + 1)) * (1 - (state?.score ?? 0))
        }
      })
      .sort((a, b) => b.priority - a.priority)

    const targetPriorityRankIndex = rankedCompetencies.findIndex(
      (competency) => competency.competencyId === targetCompetencyId
    )
    const targetPriorityRank = targetPriorityRankIndex >= 0 ? targetPriorityRankIndex + 1 : null
    const prerequisites = (currentQuestion.targetCompetency.prerequisites ?? []).map(
      (prerequisite) => {
        const state = session.competencies[prerequisite.competencyId]
        return {
          competencyId: prerequisite.competencyId,
          label: competencyNameById.get(prerequisite.competencyId) ?? prerequisite.competencyId,
          score: state?.score ?? 0,
          minimumMastery: prerequisite.minimumMastery,
          isMet: (state?.score ?? 0) >= prerequisite.minimumMastery
        }
      }
    )

    const prerequisiteSummary =
      prerequisites.length === 0
        ? `${currentQuestion.targetCompetency.name} hat keine fachlichen Voraussetzungen und kann direkt beobachtet werden.`
        : prerequisites.every((prerequisite) => prerequisite.isMet)
          ? `Alle fachlichen Voraussetzungen für ${currentQuestion.targetCompetency.name} sind aktuell erfüllt.`
          : `Mindestens eine fachliche Voraussetzung für ${currentQuestion.targetCompetency.name} ist noch nicht sicher erfüllt.`

    const baseUnlockedCompetencies = getUnlockedCompetencyIds(store.competencies, session)
    const answerPreviews: AlgorithmLabInsightAnswerPreview[] = [
      {
        id: 'low',
        label: 'Niedrige Einschätzung',
        helperText: 'simuliert eine eher unsichere Antwort',
        score: LOW_PREVIEW_SCORE
      },
      {
        id: 'current',
        label: 'Dein aktueller Slider',
        helperText: 'aktualisiert sich live während du den Regler bewegst',
        score: sliderScore.value
      },
      {
        id: 'high',
        label: 'Hohe Einschätzung',
        helperText: 'simuliert eine sehr sichere Antwort',
        score: HIGH_PREVIEW_SCORE
      }
    ].map((preview) => {
      const { updatedState } = insightAlgorithm.submitAnswer(
        currentQuestion.question,
        preview.score,
        session,
        store.competencies,
        store.questions
      )
      const updatedCompletion = insightAlgorithm.getCompletionStatus(
        store.competencies,
        store.questions,
        updatedState
      )
      const updatedUnlockedCompetencies = getUnlockedCompetencyIds(store.competencies, updatedState)
      const unlockedCompetencies = updatedUnlockedCompetencies
        .filter((competencyId) => !baseUnlockedCompetencies.includes(competencyId))
        .map((competencyId) => competencyNameById.get(competencyId) ?? competencyId)
      const targetAfterState = updatedState.competencies[targetCompetencyId]
      const targetStillPending = updatedCompletion.pendingCompetencyIds.includes(targetCompetencyId)
      const competencyChanges = linkedCompetencies.map((competency) => {
        const updatedCompetency = updatedState.competencies[competency.competencyId]
        return {
          competencyId: competency.competencyId,
          label: competency.label,
          beforeScore: competency.score,
          afterScore: updatedCompetency?.score ?? competency.score,
          delta: (updatedCompetency?.score ?? competency.score) - competency.score,
          isTarget: competency.isTarget
        }
      })

      let selectionEffect = `${currentQuestion.targetCompetency.name} bekommt danach `
      if (updatedCompletion.isComplete) {
        selectionEffect +=
          'genug Evidenz für einen Session-Abschluss. Danach würde keine weitere Frage mehr benötigt.'
      } else if (unlockedCompetencies.length > 0) {
        selectionEffect += `mehr Konkurrenz durch neu freigeschaltete Kompetenzen wie ${unlockedCompetencies.join(', ')}.`
      } else if (targetStillPending) {
        selectionEffect +=
          'weiterhin Gewicht in der Auswahl, weil für diese Kompetenz noch unsichere oder zu wenige Beobachtungen vorliegen.'
      } else {
        selectionEffect +=
          'weniger Gewicht, weil für diese Kompetenz dann bereits genug Evidenz gesammelt wurde und andere offene Kompetenzen nach vorne rücken.'
      }

      return {
        id: preview.id,
        label: preview.label,
        helperText: preview.helperText,
        score: preview.score,
        targetAfterScore: targetAfterState?.score ?? targetState?.score ?? 0,
        targetAfterTimesAssessed:
          targetAfterState?.timesAssessed ?? targetState?.timesAssessed ?? 0,
        selectionEffect,
        difficultyEffect: buildDifficultyEffect(
          targetState?.score ?? 0,
          targetAfterState?.score ?? targetState?.score ?? 0
        ),
        unlockedCompetencies,
        competencyChanges
      }
    })

    return {
      targetCompetencyLabel: currentQuestion.targetCompetency.name,
      targetCompetencyScore: targetState?.score ?? 0,
      targetTimesAssessed: targetState?.timesAssessed ?? 0,
      targetPriorityRank,
      targetPriorityTotal: rankedCompetencies.length,
      currentAction: `Der Algorithmus sammelt gerade Evidenz für ${currentQuestion.targetCompetency.name}.`,
      selectionReason:
        targetPriorityRank && rankedCompetencies.length > 0
          ? `${currentQuestion.targetCompetency.name} steht aktuell auf Platz ${targetPriorityRank} der offenen Kompetenzen, weil hier noch wenig sichere Beobachtungen vorliegen.`
          : `${currentQuestion.targetCompetency.name} bleibt im Schwerpunkt, weil diese Kompetenz für die nächste Auswahl noch zusätzliche Evidenz braucht.`,
      prerequisiteSummary,
      completionSummary: `${completion.completedCompetencyIds.length}/${completion.relevantCompetencyIds.length} Kompetenzen sind bereits ausreichend abgesichert.`,
      selectionSummary:
        targetPriorityRank && rankedCompetencies.length > 0
          ? `${currentQuestion.targetCompetency.name} liegt aktuell bei Priorität ${targetPriorityRank} von ${rankedCompetencies.length}. Niedrige Schätzwerte und wenig Evidenz erhöhen die Chance, dass diese Kompetenz erneut ausgewählt wird. ${prerequisiteSummary}`
          : `${currentQuestion.targetCompetency.name} wird gerade beobachtet, weil hier noch nützliche Evidenz für die nächste Auswahl gesammelt werden kann. ${prerequisiteSummary}`,
      difficultySummary: buildDifficultySummary(
        targetState?.score ?? 0,
        currentQuestion.question.difficulty
      ),
      recentQuestionSummary:
        session.recentQuestionIds.length > 0
          ? `Die letzten ${session.recentQuestionIds.length} Frage(n) bleiben auf der Sperrliste, damit nach Möglichkeit nicht sofort wieder dieselbe Frage erscheint.`
          : 'Sobald erste Antworten vorliegen, werden zuletzt gezeigte Fragen nach Möglichkeit ausgelassen.',
      linkedCompetencies,
      prerequisites,
      answerPreviews
    }
  })

  watch(
    () => store.currentQuestion?.question.id,
    () => {
      sliderScore.value = 0.5
    },
    { immediate: true }
  )

  const submitAnswer = async (score: number) => {
    if (!store.currentQuestion) {
      console.warn('Keine aktuelle Frage vorhanden')
      return
    }

    await store.submitAnswer({
      score,
      source: 'manual-self-assessment'
    })
    showFeedback.value = true
    setTimeout(() => {
      showFeedback.value = false
    }, 1000)
  }

  return {
    store,
    sliderScore,
    expandedPanel,
    showFeedback,
    hierarchicalProgress,
    scoreColor,
    scoreLabel,
    algorithmInsight,
    submitAnswer
  }
}
