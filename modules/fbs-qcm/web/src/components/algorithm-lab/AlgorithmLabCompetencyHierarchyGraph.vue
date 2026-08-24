<template>
  <div class="competency-graph-card">
    <div class="graph-legend mb-4">
      <v-chip size="small" color="primary" variant="tonal">Linien = Parent-Child</v-chip>
      <v-chip size="small" color="success" variant="tonal">Gruen = stark</v-chip>
      <v-chip size="small" color="warning" variant="tonal">Gelb = im Aufbau</v-chip>
      <v-chip size="small" color="error" variant="tonal">Rot = unsicher</v-chip>
      <v-chip size="small" color="default" variant="outlined">Grau = nicht bewertet</v-chip>
    </div>

    <v-network-graph
      v-model:zoom-level="zoomLevel"
      class="competency-graph"
      :nodes="graphNodes"
      :edges="graphEdges"
      :layouts="layouts"
      :configs="configs"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import * as vNG from 'v-network-graph'
import type { Competency, ProgressItem } from '@/model/types'

interface Props {
  competencies: Competency[]
  progress: ProgressItem[]
}

type GraphNodeData = {
  name: string
  color: string
  radius: number
  isRoot: boolean
  scoreLabel: string
}

type GraphEdgeData = {
  source: string
  target: string
  color: string
  width: number
}

const props = defineProps<Props>()

const zoomLevel = ref(1)
const HORIZONTAL_UNIT = 150
const ROOT_GAP_UNITS = 0.8
const LEVEL_SPACING = 145

const progressById = computed(
  () => new Map(props.progress.map((item) => [item.competencyId, item]))
)

const competencyIds = computed(() => new Set(props.competencies.map((competency) => competency.id)))

const childrenByParent = computed(() => {
  const children = new Map<string, Competency[]>()

  for (const competency of props.competencies) {
    if (!competency.parentId || !competencyIds.value.has(competency.parentId)) {
      continue
    }

    const siblings = children.get(competency.parentId) ?? []
    siblings.push(competency)
    children.set(competency.parentId, siblings)
  }

  for (const entry of children.values()) {
    entry.sort((a, b) => a.name.localeCompare(b.name))
  }

  return children
})

const rootCompetencies = computed(() =>
  props.competencies
    .filter((competency) => !competency.parentId || !competencyIds.value.has(competency.parentId))
    .sort((a, b) => a.name.localeCompare(b.name))
)

function getScoreColor(score: number, timesAssessed: number): string {
  if (timesAssessed === 0) return '#B0BEC5'
  if (score < 0.35) return '#EF5350'
  if (score < 0.7) return '#FFB300'
  return '#43A047'
}

function getScoreLabel(score: number, timesAssessed: number): string {
  if (timesAssessed === 0) return 'Nicht bewertet'
  return `${Math.round(score * 100)}%`
}

function subtreeWidth(nodeId: string): number {
  const children = childrenByParent.value.get(nodeId) ?? []
  if (children.length === 0) {
    return 1
  }

  return children.reduce((sum, child) => sum + subtreeWidth(child.id), 0)
}

const graphNodes = computed<Record<string, GraphNodeData>>(() => {
  const nodes: Record<string, GraphNodeData> = {}

  for (const competency of props.competencies) {
    const progress = progressById.value.get(competency.id)
    const timesAssessed = progress?.timesAssessed ?? 0
    const score = progress?.score ?? 0
    const isRoot = !competency.parentId || !competencyIds.value.has(competency.parentId)

    nodes[competency.id] = {
      name: competency.name,
      color: getScoreColor(score, timesAssessed),
      radius: isRoot ? 22 : 16,
      isRoot,
      scoreLabel: getScoreLabel(score, timesAssessed)
    }
  }

  return nodes
})

const graphEdges = computed<Record<string, GraphEdgeData>>(() => {
  const edges: Record<string, GraphEdgeData> = {}

  for (const competency of props.competencies) {
    if (!competency.parentId || !competencyIds.value.has(competency.parentId)) {
      continue
    }

    edges[`edge-${competency.parentId}-${competency.id}`] = {
      source: competency.parentId,
      target: competency.id,
      color: 'rgba(25, 118, 210, 0.28)',
      width: 2
    }
  }

  return edges
})

const layouts = computed(() => {
  const positions: Record<string, { x: number; y: number; fixed: boolean }> = {}

  const rootWidths = rootCompetencies.value.map((root) => subtreeWidth(root.id))
  const totalUnits =
    rootWidths.reduce((sum, width) => sum + width, 0) +
    Math.max(0, rootWidths.length - 1) * ROOT_GAP_UNITS

  let cursor = -totalUnits / 2

  const placeNode = (competency: Competency, startUnit: number, widthUnits: number, depth: number) => {
    positions[competency.id] = {
      x: (startUnit + widthUnits / 2) * HORIZONTAL_UNIT,
      y: depth * LEVEL_SPACING,
      fixed: true
    }

    const children = childrenByParent.value.get(competency.id) ?? []
    let childCursor = startUnit

    for (const child of children) {
      const childWidth = subtreeWidth(child.id)
      placeNode(child, childCursor, childWidth, depth + 1)
      childCursor += childWidth
    }
  }

  for (let index = 0; index < rootCompetencies.value.length; index += 1) {
    const root = rootCompetencies.value[index]
    const width = rootWidths[index]
    placeNode(root, cursor, width, 0)
    cursor += width + ROOT_GAP_UNITS
  }

  return { nodes: positions }
})

const configs = vNG.defineConfigs<GraphNodeData, GraphEdgeData>({
  view: {
    autoPanAndZoomOnLoad: 'fit-content',
    fitContentMargin: '12%',
    minZoomLevel: 0.4,
    maxZoomLevel: 2
  },
  node: {
    normal: {
      type: 'circle',
      color: (node) => node.color,
      radius: (node) => node.radius,
      borderWidth: (node) => (node.isRoot ? 4 : 2),
      borderColor: (node) => (node.isRoot ? '#0D47A1' : 'rgba(13, 71, 161, 0.25)')
    },
    hover: {
      radius: (node) => node.radius + 3
    },
    label: {
      visible: true,
      direction: 'south',
      fontSize: 12,
      lineHeight: 1.25,
      color: '#1F2937',
      background: {
        visible: true,
        color: 'rgba(255, 255, 255, 0.92)',
        borderRadius: 8,
        padding: {
          horizontal: 6,
          vertical: 4
        }
      }
    },
    selectable: false,
    focusring: {
      visible: false
    }
  },
  edge: {
    normal: {
      color: (edge) => edge.color,
      width: (edge) => edge.width
    },
    marker: {
      target: {
        type: 'none'
      }
    }
  }
})
</script>

<style scoped>
.competency-graph-card {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  border-radius: 18px;
  padding: 16px;
  background: linear-gradient(
    180deg,
    rgba(var(--v-theme-primary), 0.03) 0%,
    rgba(var(--v-theme-surface), 1) 100%
  );
}

.graph-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.competency-graph {
  width: 100%;
  height: 620px;
  border-radius: 14px;
  background:
    radial-gradient(circle at top, rgba(var(--v-theme-primary), 0.06), transparent 32%),
    rgba(var(--v-theme-surface), 1);
}
</style>
