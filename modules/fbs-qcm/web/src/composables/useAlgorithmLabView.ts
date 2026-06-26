import { computed, ref, watch } from 'vue'
import { useQuizSessionStore } from '@/stores/quizSessionStore'

export type ProfileItem = {
  competencyId: string
  label: string
  score: number
  timesAssessed: number
  depth: number
  isCurrent: boolean
  isInCurrentPath: boolean
}

export type ProfileGroup = {
  root: ProfileItem
  items: ProfileItem[]
  isActive: boolean
}

export function useAlgorithmLabView() {
  const store = useQuizSessionStore()

  const sliderScore = ref(0.5)
  const expandedPanel = ref<string | null>(null)
  const showFeedback = ref(false)

  const hierarchicalProgress = computed<ProfileGroup[]>(() => {
    const competencies = [...store.competencies]
    const progressById = new Map(store.progress.map((item) => [item.competencyId, item]))
    const competencyIds = new Set(competencies.map((c) => c.id))
    const parentById = new Map(competencies.map((c) => [c.id, c.parentId ?? null]))
    const currentCompetencyId = store.currentQuestion?.targetCompetency.id ?? null

    const currentPathIds = new Set<string>()
    let cursor = currentCompetencyId
    while (cursor) {
      currentPathIds.add(cursor)
      cursor = parentById.get(cursor) ?? null
    }

    const childrenByParent = new Map<string, string[]>()
    for (const competency of competencies) {
      if (!competency.parentId || !competencyIds.has(competency.parentId)) {
        continue
      }

      const existing = childrenByParent.get(competency.parentId) ?? []
      existing.push(competency.id)
      childrenByParent.set(competency.parentId, existing)
    }

    const nameById = new Map(competencies.map((c) => [c.id, c.name]))
    const toItem = (competencyId: string, depth: number): ProfileItem => {
      const progress = progressById.get(competencyId)

      return {
        competencyId,
        label: nameById.get(competencyId) ?? competencyId,
        score: progress?.score ?? 0,
        timesAssessed: progress?.timesAssessed ?? 0,
        depth,
        isCurrent: competencyId === currentCompetencyId,
        isInCurrentPath: currentPathIds.has(competencyId)
      }
    }

    const roots = competencies
      .filter((c) => !c.parentId || !competencyIds.has(c.parentId))
      .sort((a, b) => a.name.localeCompare(b.name))

    const collectChildren = (parentId: string, depth: number, acc: ProfileItem[]) => {
      const childIds = (childrenByParent.get(parentId) ?? []).sort((a, b) =>
        (nameById.get(a) ?? '').localeCompare(nameById.get(b) ?? '')
      )

      for (const childId of childIds) {
        acc.push(toItem(childId, depth))
        collectChildren(childId, depth + 1, acc)
      }
    }

    return roots.map((root) => {
      const items: ProfileItem[] = []
      collectChildren(root.id, 1, items)
      return {
        root: toItem(root.id, 0),
        items,
        isActive: currentPathIds.has(root.id)
      }
    })
  })

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

  const submitAnswer = (score: number) => {
    if (!store.currentQuestion) {
      console.warn('Keine aktuelle Frage vorhanden')
      return
    }

    store.submitAnswer(score)
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
    submitAnswer
  }
}
