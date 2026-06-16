<template>
  <DialogEditQuestion ref="dialogEditQuestion" />

  <section style="background: linear-gradient(135deg, #81ba24, #36c78e); color: white" class="mb-4">
    <v-container class="text-center py-4">
      <v-avatar size="64" class="mb-2" style="background-color: rgba(255, 255, 255, 0.2)">
        <v-icon size="36">mdi-brain</v-icon>
      </v-avatar>
      <h1 class="text-h3 font-weight-bold mb-2">Skill Graph</h1>
      <p class="text-subtitle-1 opacity-75">Kurs-Kompetenzmodell verwalten</p>
    </v-container>
  </section>

  <v-container fluid class="pa-4">
    <v-row>
      <!-- Graph -->
      <v-col cols="12" :md="selectedNodeId ? 8 : 12">
        <v-card elevation="1" rounded="lg">
          <v-btn
            density="compact"
            color="grey"
            class="mx-1 mt-1"
            icon="mdi-plus"
            @click="zoomLevel += 0.1"
          ></v-btn>
          <v-btn
            density="compact"
            icon="mdi-minus"
            color="grey"
            class="mx-1 mt-1"
            @click="zoomLevel -= 0.1"
          ></v-btn>
          <v-network-graph
            class="graph"
            v-model:zoom-level="zoomLevel"
            :nodes="graphNodes"
            :edges="graphEdges"
            :layouts="layouts"
            :configs="configs"
            :event-handlers="eventHandlers"
          />
        </v-card>
      </v-col>

      <!-- Detail Panel -->
      <v-col v-if="selectedNodeId" cols="12" md="4">
        <v-card elevation="1" rounded="lg">
          <v-card-title class="d-flex align-center pa-3">
            <v-icon class="mr-2" :color="selectedNode?.color" size="18">
              {{ nodeIcon(selectedNode?.type) }}
            </v-icon>
            <span
              class="text-body-1 font-weight-medium"
              style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap"
            >
              {{ selectedNode?.name }}
            </span>
            <v-spacer />
          </v-card-title>
          <v-divider />

          <v-card-text class="pa-3">
            <!-- Kurs -->
            <template v-if="selectedNode?.type === 'course'">
              <p class="text-body-2 text-medium-emphasis mb-4">
                {{ selectedNode.data.description }}
              </p>

              <v-card variant="tonal" class="mb-3">
                <v-card-title class="text-subtitle-2">Tags</v-card-title>
                <v-card-text>
                  <v-chip
                    v-for="tag in tags.filter((t) => !t.parentId)"
                    :key="tag.id"
                    size="small"
                    color="orange"
                    variant="tonal"
                    class="ma-1"
                  >
                    {{ tag.label.replace('#', '') }}
                  </v-chip>
                </v-card-text>
              </v-card>

              <v-card variant="tonal" class="mb-3">
                <v-card-title class="text-subtitle-2">Skills</v-card-title>
                <v-card-text>
                  <v-chip
                    v-for="skill in skills"
                    :key="skill.id"
                    size="small"
                    color="green"
                    variant="tonal"
                    class="ma-1"
                  >
                    {{ skill.name }}
                  </v-chip>
                </v-card-text>
              </v-card>

              <v-card variant="outlined">
                <v-card-text class="d-flex justify-space-between align-center">
                  <div>
                    <div class="text-caption text-medium-emphasis">Fragen</div>
                    <div class="text-h6">{{ questions.length }}</div>
                  </div>
                  <v-icon color="primary">mdi-help-circle-outline</v-icon>
                </v-card-text>
              </v-card>
            </template>

            <!-- Tag -->
            <template v-else-if="selectedNode?.type?.startsWith('tag')">
              <code
                class="text-caption d-block pa-2 rounded mb-3"
                style="background: rgba(0, 0, 0, 0.05)"
              >
                {{ selectedNode.data.label }}
              </code>

              <template v-if="selectedNode.data.parentId">
                <div class="text-caption font-weight-bold text-uppercase mb-1">Eltern-Tag</div>
                <v-chip size="x-small" color="orange" variant="tonal" class="mb-3">
                  {{ getTagLabel(selectedNode.data.parentId) }}
                </v-chip>
              </template>

              <div class="text-caption font-weight-bold text-uppercase mb-1">
                Unter-Tags ({{ childTags(selectedNode.data.id).length }})
              </div>
              <div
                v-if="childTags(selectedNode.data.id).length"
                class="d-flex flex-wrap gap-1 mb-3"
              >
                <v-chip
                  v-for="ct in childTags(selectedNode.data.id)"
                  :key="ct.id"
                  size="x-small"
                  color="orange"
                  variant="outlined"
                >
                  {{ ct.label.split('/').pop() }}
                </v-chip>
              </div>
              <p v-else class="text-caption text-medium-emphasis mb-3">Keine</p>

              <div class="text-caption font-weight-bold text-uppercase mb-1">
                Fragen ({{ questionsWithTag(selectedNode.data.id).length }})
              </div>
              <v-list density="compact" class="pa-0">
                <v-list-item
                  v-for="q in questionsWithTag(selectedNode.data.id)"
                  :key="q.id"
                  :title="q.text"
                  prepend-icon="mdi-help-circle-outline"
                  rounded="lg"
                  class="mb-1"
                  style="background: rgba(0, 0, 0, 0.03)"
                />
              </v-list>
            </template>

            <!-- Frage -->
            <template v-else-if="selectedNode?.type === 'question'">
              <p class="text-body-2 mb-3">{{ selectedNode.data.text }}</p>

              <div class="text-caption font-weight-bold text-uppercase mb-1">Skill</div>
              <v-chip size="x-small" color="green" variant="tonal" class="mb-3">
                {{ getSkillName(selectedNode.data.skillId) }}
              </v-chip>

              <div class="text-caption font-weight-bold text-uppercase mb-1">Tags</div>
              <div class="d-flex flex-wrap gap-1 mb-4">
                <v-chip
                  v-for="tagId in selectedNode.data.tags"
                  :key="tagId"
                  size="x-small"
                  color="orange"
                  variant="tonal"
                  closable
                  @click:close="removeTagFromQuestion(selectedNode.data.id, tagId)"
                >
                  {{ getTagLabel(tagId) }}
                </v-chip>
                <v-chip size="x-small" variant="outlined" prepend-icon="mdi-plus">
                  Tag hinzufügen
                </v-chip>
              </div>

              <div class="d-flex gap-2">
                <v-btn size="small" variant="tonal" prepend-icon="mdi-pencil" class="flex-1-1">
                  Bearbeiten
                </v-btn>
                <v-btn
                  size="small"
                  variant="tonal"
                  color="error"
                  prepend-icon="mdi-delete-outline"
                  @click="deleteQuestion(selectedNode.data.id)"
                >
                  Löschen
                </v-btn>
              </div>
            </template>
          </v-card-text>
        </v-card>
        <v-card class="mt-3" elevation="1">
          <v-card-text>
            <v-menu>
              <template #activator="{ props }">
                <v-btn block color="primary" prepend-icon="mdi-plus" v-bind="props">
                  Neu erstellen
                </v-btn>
              </template>

              <v-list>
                <v-list-item prepend-icon="mdi-help-circle-outline" @click="editQuestion">
                  <v-list-item-title>Frage hinzufügen</v-list-item-title>
                </v-list-item>

                <v-list-item prepend-icon="mdi-brain">
                  <v-list-item-title>Skill hinzufügen</v-list-item-title>
                </v-list-item>

                <v-list-item prepend-icon="mdi-tag-plus">
                  <v-list-item-title>Tag hinzufügen</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import * as vNG from 'v-network-graph'
import { ForceLayout, ForceNodeDatum, ForceEdgeDatum } from 'v-network-graph/lib/force-layout'
import DialogEditQuestion from '@/dialog/DialogEditQuestion.vue'

const dialogEditQuestion = ref<typeof DialogEditQuestion>()
const editQuestion = () => {
  if (dialogEditQuestion.value) {
    dialogEditQuestion.value.openDialog().then((result: boolean) => {
      if (result) {
        console.log('Create / Edit Question Successful')
      } else {
        console.log('Create / Edit Question Cancelled')
      }
    })
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface Tag {
  id: string
  label: string
  parentId?: string
}
interface Question {
  id: string
  text: string
  skillId: string
  tags: string[]
}
interface Skill {
  id: string
  name: string
  description: string
}
interface Course {
  id: string
  name: string
  description: string
}

// ─── Dummy Data ───────────────────────────────────────────────────────────────

import { mockSkills, mockTags, mockQuestions } from '@/composables/skillgraph.mock.ts'

const course = ref<Course>({
  id: 'course1',
  name: 'Datenbanken WS24/25',
  description: 'Grundlagen der relationalen Datenbanktheorie und -praxis'
})

const skills = ref(mockSkills)
const tags = ref(mockTags)
const questions = ref(mockQuestions)

// ─── UI State ─────────────────────────────────────────────────────────────────
const selectedNodeId = ref<string | null>(course.value.id)
const zoomLevel = ref(1)
const editQuestionDialog = ref(false)

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getTagLabel = (id: string) => tags.value.find((t) => t.id === id)?.label ?? id
const getSkillName = (id: string) => skills.value.find((s) => s.id === id)?.name ?? id
const childTags = (pid: string) => tags.value.filter((t) => t.parentId === pid)
const questionsWithTag = (tagId: string) => questions.value.filter((q) => q.tags.includes(tagId))

const nodeIcon = (type?: string) => {
  if (type === 'course') return 'mdi-school'
  if (type?.startsWith('tag')) return 'mdi-tag'
  return 'mdi-help-circle'
}

/** Rekursive Tiefe eines Tags in der Hierarchie */
function getTagDepth(tagId: string): number {
  const tag = tags.value.find((t) => t.id === tagId)
  if (!tag?.parentId) return 0
  return 1 + getTagDepth(tag.parentId)
}

/** Spezifischsten (tiefsten) Tag aus einer Liste finden */
const getMostSpecificTag = (tagIds: string[]): string =>
  tagIds.reduce((deepest, id) => (getTagDepth(id) > getTagDepth(deepest) ? id : deepest), tagIds[0])

// ─── Graph Nodes ──────────────────────────────────────────────────────────────
const graphNodes = computed(() => {
  const nodes: Record<string, any> = {}

  // Kurs-Node
  nodes[course.value.id] = {
    name: course.value.name,
    type: 'course',
    color: '#ffa700',
    radius: 20,
    data: course.value
  }

  // Tag-Nodes — Größe/Farbe je nach Hierarchietiefe
  tags.value.forEach((t) => {
    const depth = getTagDepth(t.id)
    nodes[t.id] = {
      name: t.label.split('/').pop()!,
      type: `tag-${depth}`,
      color: ['#43C57C', '#7DDBA3', '#B7EDCB'][depth] ?? '#DDF8E7',
      radius: [14, 11, 10][depth] ?? 9,
      data: t
    }
  })

  // Frage-Nodes
  questions.value.forEach((q) => {
    const short = q.text.length > 26 ? q.text.slice(0, 26) + '…' : q.text
    nodes[q.id] = {
      name: short,
      type: 'question',
      color: '#F4F1A3',
      radius: 7,
      data: q
    }
  })

  return nodes
})

// ─── Graph Edges ──────────────────────────────────────────────────────────────
const graphEdges = computed(() => {
  const edges: Record<string, any> = {}

  // Kurs → Root-Tags
  tags.value
    .filter((t) => !t.parentId)
    .forEach((t) => {
      edges[`e-course-${t.id}`] = {
        source: course.value.id,
        target: t.id,
        color: '#292929',
        width: 2
      }
    })

  // Parent-Tag → Child-Tag (gesamte Hierarchie)
  tags.value
    .filter((t) => t.parentId)
    .forEach((t) => {
      edges[`e-${t.parentId}-${t.id}`] = {
        source: t.parentId!,
        target: t.id,
        color: '#292929',
        width: 1.5
      }
    })

  // Spezifischster Tag → Frage (ein Edge pro Frage für Übersichtlichkeit)
  questions.value.forEach((q) => {
    const primaryTagId = getMostSpecificTag(q.tags)
    edges[`e-${primaryTagId}-${q.id}`] = {
      source: primaryTagId,
      target: q.id,
      color: '#25252577',
      width: 1.5
    }
  })

  return edges
})

// ─── Radiales Layout ──────────────────────────────────────────────────────────
const BASE_R = 60 // Radius für Root-Tags
const STEP_R = 50 // Zusätzlicher Radius pro Tag-Ebene
const Q_OFFSET = 50 // Abstand der Fragen über der tiefsten Tag-Ebene

/**
 * Positioniert einen Tag und rekursiv alle seine Kinder.
 * Kinder werden relativ vom Parent mit konstantem Abstand positioniert.
 */
function layoutTagRecursive(
  tagId: string,
  parentPos: { x: number; y: number } | null,
  parentAngle: number,
  sectorWidth: number,
  positions: Record<string, { x: number; y: number }>
) {
  // Aktuelle Node-Position setzen
  positions[tagId] = {
    x: parentPos?.x ?? 0,
    y: parentPos?.y ?? 0
  }

  const children = tags.value.filter((t) => t.parentId === tagId)
  if (children.length === 0) return

  // Auffächerung: max. 75 % des Sektors oder pro Kind 0.38 rad
  const spread = Math.min(sectorWidth * 0.75, children.length * 0.38)

  children.forEach((child, ci) => {
    // Kinderwinkel relativ zur Parent-Position
    const childAngle =
      children.length > 1
        ? parentAngle - spread / 2 + (spread * ci) / (children.length - 1)
        : parentAngle

    // Kind mit konstantem Abstand (STEP_R) vom Parent positionieren
    const currentPos = positions[tagId]
    const childPos = {
      x: currentPos.x + STEP_R * Math.cos(childAngle),
      y: currentPos.y + STEP_R * Math.sin(childAngle)
    }

    layoutTagRecursive(child.id, childPos, childAngle, spread / children.length, positions)
  })
}

const layouts = computed((): vNG.Layouts => {
  const nodes: Record<string, any> = {}

  // Kurs in der Mitte (fixiert)
  nodes[course.value.id] = { x: 0, y: 0, fixed: true }

  // Tag-Baum aufbauen (mit relativen Positionen vom Parent)
  const rootTags = tags.value.filter((t) => !t.parentId)
  rootTags.forEach((rt, ri) => {
    const angle = (ri / rootTags.length) * 2 * Math.PI - Math.PI / 2
    const sector = (2 * Math.PI) / rootTags.length
    // Root-Tags mit BASE_R vom Kurs-Node positionieren
    const rootPos = {
      x: BASE_R * Math.cos(angle),
      y: BASE_R * Math.sin(angle)
    }
    layoutTagRecursive(rt.id, rootPos, angle, sector, nodes)
  })

  // Fragen: jenseits des tiefsten Tag-Rings positionieren
  const maxDepth = Math.max(...tags.value.map((t) => getTagDepth(t.id)))
  const questionR = BASE_R + maxDepth * STEP_R + Q_OFFSET

  // Fragen nach ihrem primären Tag gruppieren, um Überlappungen zu vermeiden
  const tagQMap = new Map<string, Question[]>()
  questions.value.forEach((q) => {
    const pid = getMostSpecificTag(q.tags)
    if (!tagQMap.has(pid)) tagQMap.set(pid, [])
    tagQMap.get(pid)!.push(q)
  })

  tagQMap.forEach((qs, tagId) => {
    const tagPos = nodes[tagId]
    if (!tagPos) return
    const baseAngle = Math.atan2(tagPos.y, tagPos.x)
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

// ─── v-network-graph Configs ──────────────────────────────────────────────────
const configs = vNG.defineConfigs({
  view: {
    onBeforeInitialDisplay: async () => {
      // Warte bis ForceLayout Simulation stabilisiert
      return new Promise((resolve) => setTimeout(resolve, 400))
    },
    autoPanAndZoomOnLoad: 'fit-content',
    fitContentMargin: '2%',
    layoutHandler: new ForceLayout({
      positionFixedByDrag: false,
      positionFixedByClickWithAltKey: true,
      createSimulation: (d3, nodes, edges) => {
        // d3-force parameters
        const forceLink = d3.forceLink<ForceNodeDatum, ForceEdgeDatum>(edges).id((d) => d.id)
        const simulation = d3
          .forceSimulation(nodes)
          .force('edge', forceLink.distance(40).strength(0.5))
          .force('charge', d3.forceManyBody().strength(-800))
          .force(
            'collide',
            d3.forceCollide().radius((d: any) => d.radius + 15)
          ) // Min. Abstand: radius + 15px
          .force('center', d3.forceCenter().strength(0.05))
          .alphaMin(0.001)

        // Pre-ticks für schnellere Stabilisierung vor fit-content
        simulation.tick(50)

        return simulation

        // * The following are the default parameters for the simulation.
        // const forceLink = d3.forceLink<ForceNodeDatum, ForceEdgeDatum>(edges).id(d => d.id)
        // return d3
        //   .forceSimulation(nodes)
        //   .force("edge", forceLink.distance(100))
        //   .force("charge", d3.forceManyBody())
        //   .force("collide", d3.forceCollide(50).strength(0.2))
        //   .force("center", d3.forceCenter().strength(0.05))
        //   .alphaMin(0.001)
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
        color: '#dafacbab',
        padding: {
          vertical: 2,
          horizontal: 6
        },
        borderRadius: 4
      },
      fontSize: (n) => (n.type === 'course' ? 13 : n.type === 'tag-0' ? 12 : 10),
      fontWeight: (n) => (n.type === 'course' || n.type === 'tag-0' ? 'bold' : 'normal'),
      color: '#444444'
    }
  },
  edge: {
    normal: {
      color: (e) => e.color ?? '#aaaaaa',
      width: (e) => e.width ?? 1.5
    }
  }
})

// ─── Event Handlers ───────────────────────────────────────────────────────────
const eventHandlers: vNG.EventHandlers = {
  'node:click': ({ node }) => {
    selectedNodeId.value = node
  }
}

// ─── Selektierter Node ────────────────────────────────────────────────────────
const selectedNode = computed(() =>
  selectedNodeId.value ? graphNodes.value[selectedNodeId.value] : null
)

// ─── Actions ──────────────────────────────────────────────────────────────────
const deleteQuestion = (id: string) => {
  questions.value = questions.value.filter((q) => q.id !== id)
  if (selectedNodeId.value === id) selectedNodeId.value = null
}

const removeTagFromQuestion = (questionId: string, tagId: string) => {
  const q = questions.value.find((q) => q.id === questionId)
  if (q) q.tags = q.tags.filter((t) => t !== tagId)
}
</script>

<style scoped>
.graph {
  width: 100%;
  height: 680px;
}
</style>
