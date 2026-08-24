import type { Competency, ProgressItem } from '@/model/types'

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

export type RadarItem = {
  axisIndex: number
  competencyId: string
  label: string
  score: number
  timesAssessed: number
  groupLabel: string
  groupColor: string
}

export const radarGroupColors = ['#5B6CFF', '#7A6FF0', '#4F8CC9', '#2F9C95', '#6BA37A', '#C79442']

export function buildProfileGroups(
  competencies: Competency[],
  progress: ProgressItem[],
  currentCompetencyId: string | null = null
): ProfileGroup[] {
  const progressById = new Map(progress.map((item) => [item.competencyId, item]))
  const competencyIds = new Set(competencies.map((competency) => competency.id))
  const parentById = new Map(competencies.map((competency) => [competency.id, competency.parentId ?? null]))

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

  const nameById = new Map(competencies.map((competency) => [competency.id, competency.name]))
  const toItem = (competencyId: string, depth: number): ProfileItem => {
    const progressItem = progressById.get(competencyId)

    return {
      competencyId,
      label: nameById.get(competencyId) ?? competencyId,
      score: progressItem?.score ?? 0,
      timesAssessed: progressItem?.timesAssessed ?? 0,
      depth,
      isCurrent: competencyId === currentCompetencyId,
      isInCurrentPath: currentPathIds.has(competencyId)
    }
  }

  const roots = competencies
    .filter((competency) => !competency.parentId || !competencyIds.has(competency.parentId))
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
}

export function buildRadarItems(
  competencies: Competency[],
  progress: ProgressItem[]
): RadarItem[] {
  const groups = buildProfileGroups(competencies, progress)
  const competenciesWithChildren = new Set(
    competencies.filter((competency) => competency.parentId).map((competency) => competency.parentId as string)
  )

  let axisIndex = 1

  return groups.flatMap((group, index) => {
    const groupColor = radarGroupColors[index % radarGroupColors.length]
    const leafItems = group.items.filter((item) => !competenciesWithChildren.has(item.competencyId))
    const items = leafItems.length > 0 ? leafItems : [group.root]

    return items.map((item) => ({
      axisIndex: axisIndex++,
      competencyId: item.competencyId,
      label: item.label,
      score: item.score,
      timesAssessed: item.timesAssessed,
      groupLabel: group.root.label,
      groupColor
    }))
  })
}
