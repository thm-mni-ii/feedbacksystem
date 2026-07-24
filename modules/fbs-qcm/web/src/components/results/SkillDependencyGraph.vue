<template>
  <div class="dependency-graph-container">
    <v-network-graph
      class="graph"
      :nodes="graphNodes"
      :edges="graphEdges"
      :layouts="layouts"
      :configs="configs"
      :event-handlers="eventHandlers"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import * as vNG from 'v-network-graph'
import type { SkillVisualization } from '@/composables/types'

const props = defineProps<{
  skills: SkillVisualization[]
}>()

const emit = defineEmits<{
  select: [skill: SkillVisualization]
}>()

// ─── State ────────────────────────────────────────────────────────
const selectedNodeId = ref<string | null>(null)

// ─── Graph Nodes ──────────────────────────────────────────────────
const graphNodes = computed(() => {
  const nodes: Record<string, any> = {}

  props.skills.forEach((skill) => {
    const statusColor = skill.mastered ? '#2563EB' : skill.unlocked ? '#FFA726' : '#BDBDBD'

    nodes[skill.skillId] = {
      name: skill.label,
      skillId: skill.skillId,
      pLearned: skill.pLearned,
      status: skill.status,
      color: statusColor,
      radius: 24,
      data: skill
    }
  })

  return nodes
})

// ─── Graph Edges ──────────────────────────────────────────────────
const graphEdges = computed(() => {
  const edges: Record<string, any> = {}
  let edgeIndex = 0

  props.skills.forEach((skill) => {
    // Edges zu allen Prerequisites
    skill.prerequisites.forEach((prereqId) => {
      edges[`edge-${edgeIndex++}`] = {
        source: prereqId,
        target: skill.skillId,
        color: '#ccc',
        width: 2,
        dashed: false
      }
    })
  })

  return edges
})

// ─── Layouts ──────────────────────────────────────────────────────
const layouts = computed(() => {
  const positions: Record<string, any> = {}

  // Hierarchisches Layout basierend auf Prerequisites
  const getDepth = (skillId: string, visited = new Set()): number => {
    if (visited.has(skillId)) return 0
    visited.add(skillId)

    const skill = props.skills.find((s) => s.skillId === skillId)
    if (!skill || skill.prerequisites.length === 0) return 0

    return 1 + Math.max(...skill.prerequisites.map((prereqId) => getDepth(prereqId, visited)), 0)
  }

  // Gruppiere Skills nach Tiefe
  const depthMap = new Map<number, string[]>()
  props.skills.forEach((skill) => {
    const depth = getDepth(skill.skillId)
    if (!depthMap.has(depth)) depthMap.set(depth, [])
    depthMap.get(depth)!.push(skill.skillId)
  })

  // Positioniere nach Tiefe und Horizontalposition
  let yOffset = 0
  depthMap.forEach((skillIds, depth) => {
    const xSpacing = 200
    const ySpacing = 150
    const totalWidth = skillIds.length * xSpacing
    const startX = -totalWidth / 2

    skillIds.forEach((skillId, index) => {
      positions[skillId] = {
        x: startX + index * xSpacing,
        y: depth * ySpacing,
        fixed: true
      }
    })
  })

  return { nodes: positions }
})

// ─── Configs ──────────────────────────────────────────────────────
const configs = vNG.defineConfigs({
  view: {
    autoPanAndZoomOnLoad: 'fit-content',
    fitContentMargin: '15%'
  },
  node: {
    normal: {
      color: (n) => n.color,
      radius: (n) => n.radius,
      borderWidth: (n) => (selectedNodeId.value === n.id ? 3 : 0),
      borderColor: '#333'
    },
    hover: {
      color: (n) => n.color,
      radius: (n) => n.radius + 4
    },
    selected: {
      color: (n) => n.color,
      borderWidth: 3,
      borderColor: '#333'
    },
    label: {
      visible: true,
      direction: 'south',
      fontSize: 12,
      fontWeight: 'bold',
      color: '#333',
      background: {
        visible: true,
        color: 'rgba(255, 255, 255, 0.9)',
        padding: {
          vertical: 4,
          horizontal: 8
        },
        borderRadius: 4
      }
    }
  },
  edge: {
    normal: {
      color: (e) => e.color,
      width: (e) => e.width,
      dashed: (e) => e.dashed
    }
  }
})

// ─── Event Handlers ───────────────────────────────────────────────
const eventHandlers: vNG.EventHandlers = {
  'node:click': ({ node }) => {
    selectedNodeId.value = node
    const selectedSkill = props.skills.find((s) => s.skillId === node)
    if (selectedSkill) {
      emit('select', selectedSkill)
    }
  }
}
</script>

<style scoped>
.dependency-graph-container {
  width: 100%;
}

.graph {
  width: 100%;
  height: 600px;
  border-radius: 12px;
  background: linear-gradient(135deg, #f5f7fa, #ffffff);
  border: 1px solid #e0e0e0;
}
</style>
