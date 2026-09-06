import { ref, computed } from 'vue'
import * as vNG from 'v-network-graph'
import { ForceLayout } from 'v-network-graph/lib/force-layout'
import type { ForceNodeDatum, ForceEdgeDatum } from 'v-network-graph/lib/layouts/force'
import type { Competency, CompetencyPrerequisite, Question } from '@/model/types'
import { skillGraphPalette } from '@/plugins/vuetify'
import { getQuestionCompetencyIds } from '@/composables/qMatrix'

interface Course {
  id: string
  name: string
  description: string
}

export interface SkillGraphNodeData {
  name: string
  type: string
  color: string
  radius: number
  data: Course | Competency | Question
}

export interface SkillGraphEdgeData {
  source: string
  target: string
  color?: string
  width?: number
}

// Layout Constants
const BASE_R = 30
const STEP_R = 30
const Q_OFFSET = 30

function cloneCompetency(competency: Competency): Competency {
  return {
    ...competency,
    prerequisites: competency.prerequisites?.map((prerequisite) => ({
      ...prerequisite
    }))
  }
}

function cloneQuestion(question: Question): Question {
  return {
    ...question,
    competencyIds: [...question.competencyIds],
    competencyLinks: question.competencyLinks?.map((link) => ({
      ...link
    }))
  }
}

export function useSkillGraphLogic(mockCompetencies: Competency[], mockQuestions: Question[]) {
  // ─── State ────────────────────────────────────────────────────────────
  const course = ref<Course>({
    id: 'course1',
    name: 'Datenbanken & OOP',
    description:
      'Umfassendes Kurs-Kompetenzmodell für Datenbanken und objektorientierte Programmierung'
  })

  const competencies = ref<Competency[]>(mockCompetencies.map(cloneCompetency))
  const questions = ref<Question[]>(mockQuestions.map(cloneQuestion))
  const selectedNodeId = ref<string | null>(course.value.id)
  const zoomLevel = ref(1)

  // ─── Helper Functions ────────────────────────────────────────────────
  const getCompetency = (id: string): Competency | undefined =>
    competencies.value.find((c) => c.id === id)

  const rootCompetencies = computed(() => competencies.value.filter((c) => !c.parentId))

  const getCompetencyColor = (comp?: Competency): string => {
    if (!comp) return skillGraphPalette.chipFallback
    return skillGraphPalette.accent
  }

  function getCompetencyDepth(compId: string): number {
    const comp = competencies.value.find((c) => c.id === compId)
    if (!comp?.parentId) return 0
    return 1 + getCompetencyDepth(comp.parentId)
  }

  const getMostSpecificCompetency = (compIds: string[]): string =>
    compIds.reduce((deepest, id) =>
      getCompetencyDepth(id) > getCompetencyDepth(deepest) ? id : deepest
    )

  const childCompetencies = (parentId: string): Competency[] =>
    competencies.value.filter((c) => c.parentId === parentId)

  const clampMastery = (value: number): number => Math.min(1, Math.max(0, value))

  const hasPrerequisitePath = (
    sourceCompetencyId: string,
    targetCompetencyId: string,
    visited = new Set<string>()
  ): boolean => {
    if (sourceCompetencyId === targetCompetencyId) {
      return true
    }

    if (visited.has(sourceCompetencyId)) {
      return false
    }

    visited.add(sourceCompetencyId)
    const sourceCompetency = getCompetency(sourceCompetencyId)

    return (sourceCompetency?.prerequisites ?? []).some(
      (prerequisite) =>
        prerequisite.competencyId === targetCompetencyId ||
        hasPrerequisitePath(prerequisite.competencyId, targetCompetencyId, visited)
    )
  }

  const getAvailablePrerequisites = (competencyId: string): Competency[] =>
    competencies.value.filter(
      (competency) =>
        competency.id !== competencyId && !hasPrerequisitePath(competency.id, competencyId)
    )

  const questionsWithCompetency = (compId: string): Question[] =>
    questions.value.filter((q) => getQuestionCompetencyIds(q).includes(compId))

  const nodeIcon = (type?: string) => {
    if (type === 'course') return 'mdi-school'
    if (type?.startsWith('competency-root')) return 'mdi-brain'
    if (type?.startsWith('competency-sub')) return 'mdi-puzzle'
    return 'mdi-help-circle'
  }

  // ─── Graph Nodes ──────────────────────────────────────────────────────
  const graphNodes = computed<Record<string, SkillGraphNodeData>>(() => {
    const nodes: Record<string, SkillGraphNodeData> = {}

    nodes[course.value.id] = {
      name: course.value.name,
      type: 'course',
      color: skillGraphPalette.courseNode,
      radius: 17,
      data: course.value
    }

    competencies.value.forEach((c) => {
      const depth = getCompetencyDepth(c.id)
      const color = getCompetencyColor(c)

      nodes[c.id] = {
        name: c.name,
        type: depth === 0 ? 'competency-root' : 'competency-sub',
        color: color,
        radius: depth === 0 ? 12 : 10,
        data: c
      }
    })

    questions.value.forEach((q) => {
      const short = q.text.length > 28 ? q.text.slice(0, 28) + '…' : q.text
      nodes[q.id] = {
        name: short,
        type: 'question',
        color: skillGraphPalette.questionNode,
        radius: 5,
        data: q
      }
    })

    return nodes
  })

  // ─── Graph Edges ──────────────────────────────────────────────────────
  const graphEdges = computed<Record<string, SkillGraphEdgeData>>(() => {
    const edges: Record<string, SkillGraphEdgeData> = {}

    competencies.value
      .filter((c) => !c.parentId)
      .forEach((c) => {
        edges[`e-course-${c.id}`] = {
          source: course.value.id,
          target: c.id,
          color: skillGraphPalette.edgeFocus,
          width: 2
        }
      })

    competencies.value
      .filter((c) => c.parentId)
      .forEach((c) => {
        edges[`e-${c.parentId}-${c.id}`] = {
          source: c.parentId!,
          target: c.id,
          color: skillGraphPalette.edgeFocus,
          width: 1.5
        }
      })

    questions.value.forEach((q) => {
      const qCompIds = getQuestionCompetencyIds(q)
      if (qCompIds.length === 0) {
        return
      }

      qCompIds.forEach((competencyId) => {
        edges[`e-${competencyId}-${q.id}`] = {
          source: competencyId,
          target: q.id,
          color: skillGraphPalette.edgeDefault,
          width: 1
        }
      })
    })

    return edges
  })

  // ─── Layout ───────────────────────────────────────────────────────────
  function layoutCompetencyRecursive(
    compId: string,
    parentPos: { x: number; y: number } | null,
    parentAngle: number,
    sectorWidth: number,
    positions: Record<string, { x: number; y: number }>
  ) {
    positions[compId] = {
      x: parentPos?.x ?? 0,
      y: parentPos?.y ?? 0
    }

    const children = childCompetencies(compId)
    if (children.length === 0) return

    const spread = Math.min(sectorWidth * 0.75, children.length * 0.38)

    children.forEach((child, ci) => {
      const childAngle =
        children.length > 1
          ? parentAngle - spread / 2 + (spread * ci) / (children.length - 1)
          : parentAngle

      const currentPos = positions[compId]
      const childPos = {
        x: currentPos.x + STEP_R * Math.cos(childAngle),
        y: currentPos.y + STEP_R * Math.sin(childAngle)
      }

      layoutCompetencyRecursive(child.id, childPos, childAngle, spread / children.length, positions)
    })
  }

  const layouts = computed((): vNG.Layouts => {
    const nodes: Record<string, any> = {}

    nodes[course.value.id] = { x: 0, y: 0, fixed: true }

    const rootComps = competencies.value.filter((c) => !c.parentId)
    rootComps.forEach((rc, ri) => {
      const angle = (ri / rootComps.length) * 2 * Math.PI - Math.PI / 2
      const sector = (2 * Math.PI) / rootComps.length
      const rootPos = {
        x: BASE_R * Math.cos(angle),
        y: BASE_R * Math.sin(angle)
      }
      layoutCompetencyRecursive(rc.id, rootPos, angle, sector, nodes)
    })

    const maxDepth = Math.max(...competencies.value.map((c) => getCompetencyDepth(c.id)))
    const questionR = BASE_R + maxDepth * STEP_R + Q_OFFSET

    const compQMap = new Map<string, Question[]>()
    questions.value.forEach((q) => {
      const qCompIds = getQuestionCompetencyIds(q)
      if (qCompIds.length === 0) {
        return
      }

      const pCompId = getMostSpecificCompetency(qCompIds)
      if (!compQMap.has(pCompId)) compQMap.set(pCompId, [])
      compQMap.get(pCompId)!.push(q)
    })

    compQMap.forEach((qs, compId) => {
      const compPos = nodes[compId]
      if (!compPos) return
      const baseAngle = Math.atan2(compPos.y, compPos.x)
      const spread = Math.min(0.38, (qs.length - 1) * 0.22)
      qs.forEach((q, qi) => {
        const qAngle =
          qs.length > 1 ? baseAngle - spread / 2 + (spread * qi) / (qs.length - 1) : baseAngle
        nodes[q.id] = {
          x: questionR * Math.cos(qAngle),
          y: questionR * Math.sin(qAngle)
        }
      })
    })

    return { nodes }
  })

  // ─── Graph Configs ────────────────────────────────────────────────────
  const configs = vNG.defineConfigs<SkillGraphNodeData, SkillGraphEdgeData>({
    view: {
      onBeforeInitialDisplay: async () => {
        return new Promise((resolve) => setTimeout(resolve, 400))
      },
      autoPanAndZoomOnLoad: 'fit-content',
      fitContentMargin: '2%',
      layoutHandler: new ForceLayout({
        positionFixedByDrag: false,
        positionFixedByClickWithAltKey: true,
        createSimulation: (d3, nodes, edges) => {
          const forceLink = d3.forceLink<ForceNodeDatum, ForceEdgeDatum>(edges).id((d: any) => d.id)
          const simulation = d3
            .forceSimulation(nodes)
            .force('edge', forceLink.distance(40).strength(0.5))
            .force('charge', d3.forceManyBody().strength(-800))
            .force(
              'collide',
              d3.forceCollide().radius((d: any) => d.radius + 15)
            )
            .force('center', d3.forceCenter().strength(0.05))
            .alphaMin(0.001)

          simulation.tick(50)
          return simulation
        }
      })
    },
    node: {
      selectable: true,
      normal: {
        color: (n) => n.color,
        radius: (n) => n.radius
      },
      hover: {
        color: (n) => n.color
      },
      label: {
        visible: (n) => n.type !== 'question',
        direction: 'south',
        background: {
          visible: true,
          color: skillGraphPalette.labelBackground,
          padding: {
            vertical: 2,
            horizontal: 6
          },
          borderRadius: 4
        },
        fontSize: (n) =>
          n.type === 'course' ? 13 : n.type?.startsWith('competency-root') ? 12 : 10,
        color: skillGraphPalette.textPrimary
      }
    },
    edge: {
      normal: {
        color: (e) => e.color ?? skillGraphPalette.edgeDefault,
        width: (e) => e.width ?? 1.5
      }
    }
  })

  // ─── Event Handlers ───────────────────────────────────────────────────
  const eventHandlers: vNG.EventHandlers = {
    'node:click': ({ node }) => {
      selectedNodeId.value = node
    }
  }

  // ─── Computed ─────────────────────────────────────────────────────────
  const selectedNode = computed(() =>
    selectedNodeId.value ? graphNodes.value[selectedNodeId.value] : null
  )

  // ─── Actions ──────────────────────────────────────────────────────────
  const deleteQuestion = (id: string) => {
    questions.value = questions.value.filter((q) => q.id !== id)
    if (selectedNodeId.value === id) selectedNodeId.value = null
  }

  const updateQuestion = (updatedQuestion: Question) => {
    questions.value = questions.value.map((q) =>
      q.id === updatedQuestion.id ? updatedQuestion : q
    )
  }

  const removeCompetencyFromQuestion = (questionId: string, compId: string) => {
    const q = questions.value.find((q) => q.id === questionId)
    if (!q) {
      return
    }

    q.competencyIds = q.competencyIds.filter((c) => c !== compId)

    if (q.competencyLinks && q.competencyLinks.length > 0) {
      q.competencyLinks = q.competencyLinks.filter((link) => link.competencyId !== compId)
    }

    const normalizedIds = getQuestionCompetencyIds(q)
    q.competencyIds = normalizedIds

    if (q.competencyLinks && q.competencyLinks.length > 0) {
      const normalizedLinkIds = new Set(q.competencyLinks.map((link) => link.competencyId))
      q.competencyLinks = q.competencyLinks.filter((link) =>
        normalizedLinkIds.has(link.competencyId)
      )
    }
  }

  const addCompetencyToQuestion = (questionId: string, compId: string) => {
    const q = questions.value.find((q) => q.id === questionId)
    if (!q || q.competencyIds.includes(compId)) {
      return
    }

    q.competencyIds = [...q.competencyIds, compId]

    if (q.competencyLinks && q.competencyLinks.length > 0) {
      q.competencyLinks = [...q.competencyLinks, { competencyId: compId, relation: 'required', weight: 1 }]
    }
  }

  const selectCourse = () => {
    selectedNodeId.value = course.value.id
  }

  async function saveCompetencyPrerequisites(
    competencyId: string,
    prerequisites: CompetencyPrerequisite[]
  ): Promise<void> {
    const availableCompetencyIds = new Set(
      getAvailablePrerequisites(competencyId).map((competency) => competency.id)
    )
    const normalizedPrerequisites: CompetencyPrerequisite[] = []
    const seenCompetencyIds = new Set<string>()

    for (const prerequisite of prerequisites) {
      if (
        !prerequisite.competencyId ||
        !availableCompetencyIds.has(prerequisite.competencyId) ||
        seenCompetencyIds.has(prerequisite.competencyId)
      ) {
        continue
      }

      seenCompetencyIds.add(prerequisite.competencyId)
      normalizedPrerequisites.push({
        competencyId: prerequisite.competencyId,
        minimumMastery: clampMastery(prerequisite.minimumMastery)
      })
    }

    competencies.value = competencies.value.map((competency) =>
      competency.id === competencyId
        ? {
            ...competency,
            prerequisites: normalizedPrerequisites
          }
        : competency
    )
  }

  return {
    // State
    course,
    competencies,
    questions,
    selectedNodeId,
    zoomLevel,
    selectedNode,
    // Graph
    graphNodes,
    graphEdges,
    layouts,
    configs,
    eventHandlers,
    // Helpers
    getCompetency,
    rootCompetencies,
    getCompetencyColor,
    getCompetencyDepth,
    childCompetencies,
    getAvailablePrerequisites,
    questionsWithCompetency,
    nodeIcon,
    // Actions
    deleteQuestion,
    updateQuestion,
    removeCompetencyFromQuestion,
    addCompetencyToQuestion,
    saveCompetencyPrerequisites,
    selectCourse
  }
}
