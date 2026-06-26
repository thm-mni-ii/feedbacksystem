<template>
  <DialogEditQuestion ref="dialogEditQuestion" />

  <section style="background: linear-gradient(135deg, #81ba24, #36c78e); color: white" class="mb-4">
    <v-container class="text-center py-4">
      <v-avatar size="64" class="mb-2" style="background-color: rgba(255, 255, 255, 0.2)">
        <v-icon size="36">mdi-brain</v-icon>
      </v-avatar>
      <h1 class="text-h3 font-weight-bold mb-2">Kompetenz Graph</h1>
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

              <!-- Competencies by Category -->
              <div v-for="category in getCategories()" :key="category" class="mb-3">
                <v-card variant="tonal">
                  <v-card-title class="text-subtitle-2 text-capitalize">
                    {{ category || 'Ohne Kategorie' }}
                  </v-card-title>
                  <v-card-text>
                    <v-chip
                      v-for="comp in competenciesByCategory(category)"
                      :key="comp.id"
                      size="small"
                      :color="getCompetencyColor(comp)"
                      variant="tonal"
                      class="ma-1"
                    >
                      {{ comp.name }}
                    </v-chip>
                  </v-card-text>
                </v-card>
              </div>

              <v-card variant="outlined" class="mt-3">
                <v-card-text class="d-flex justify-space-between align-center">
                  <div>
                    <div class="text-caption text-medium-emphasis">Fragen</div>
                    <div class="text-h6">{{ questions.length }}</div>
                  </div>
                  <v-icon color="primary">mdi-help-circle-outline</v-icon>
                </v-card-text>
              </v-card>
            </template>

            <!-- Competency (Root Level) -->
            <template v-else-if="selectedNode?.type?.startsWith('competency-root')">
              <code
                class="text-caption d-block pa-2 rounded mb-3"
                style="background: rgba(0, 0, 0, 0.05)"
              >
                {{ selectedNode.data.name }}
              </code>

              <div class="text-caption font-weight-bold text-uppercase mb-1">
                {{ selectedNode.data.category ? 'Kategorie' : 'Keine Kategorie' }}
              </div>
              <v-chip size="x-small" color="blue" variant="tonal" class="mb-3">
                {{ selectedNode.data.category || 'Uncategorized' }}
              </v-chip>

              <div class="text-caption font-weight-bold text-uppercase mb-1">
                Sub-Kompetenzen ({{ childCompetencies(selectedNode.data.id).length }})
              </div>
              <div
                v-if="childCompetencies(selectedNode.data.id).length"
                class="d-flex flex-wrap gap-1 mb-3"
              >
                <v-chip
                  v-for="cc in childCompetencies(selectedNode.data.id)"
                  :key="cc.id"
                  size="x-small"
                  :color="getCompetencyColor(cc)"
                  variant="outlined"
                >
                  {{ cc.name }}
                </v-chip>
              </div>
              <p v-else class="text-caption text-medium-emphasis mb-3">Keine</p>

              <div class="text-caption font-weight-bold text-uppercase mb-1">
                Fragen ({{ questionsWithCompetency(selectedNode.data.id).length }})
              </div>
              <v-list density="compact" class="pa-0">
                <v-list-item
                  v-for="q in questionsWithCompetency(selectedNode.data.id)"
                  :key="q.id"
                  :title="q.text"
                  prepend-icon="mdi-help-circle-outline"
                  rounded="lg"
                  class="mb-1"
                  style="background: rgba(0, 0, 0, 0.03)"
                />
              </v-list>
            </template>

            <!-- Competency (Sub Level) -->
            <template v-else-if="selectedNode?.type?.startsWith('competency-sub')">
              <code
                class="text-caption d-block pa-2 rounded mb-3"
                style="background: rgba(0, 0, 0, 0.05)"
              >
                {{ selectedNode.data.name }}
              </code>

              <template v-if="selectedNode.data.parentId">
                <div class="text-caption font-weight-bold text-uppercase mb-1">
                  Parent-Kompetenz
                </div>
                <v-chip
                  size="x-small"
                  :color="getCompetencyColor(getCompetency(selectedNode.data.parentId))"
                  variant="tonal"
                  class="mb-3"
                >
                  {{ getCompetency(selectedNode.data.parentId)?.name }}
                </v-chip>
              </template>

              <template v-if="selectedNode.data.description">
                <div class="text-caption font-weight-bold text-uppercase mb-1">Beschreibung</div>
                <p class="text-caption text-medium-emphasis mb-3">
                  {{ selectedNode.data.description }}
                </p>
              </template>

              <div class="text-caption font-weight-bold text-uppercase mb-1">
                Fragen ({{ questionsWithCompetency(selectedNode.data.id).length }})
              </div>
              <v-list density="compact" class="pa-0">
                <v-list-item
                  v-for="q in questionsWithCompetency(selectedNode.data.id)"
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

              <div class="text-caption font-weight-bold text-uppercase mb-1">
                Kompetenzen ({{ selectedNode.data.competencyIds.length }})
              </div>
              <div class="d-flex flex-wrap gap-1 mb-4">
                <v-chip
                  v-for="compId in selectedNode.data.competencyIds"
                  :key="compId"
                  size="x-small"
                  :color="getCompetencyColor(getCompetency(compId))"
                  variant="tonal"
                  closable
                  @click:close="removeCompetencyFromQuestion(selectedNode.data.id, compId)"
                >
                  {{ getCompetency(compId)?.name }}
                </v-chip>
                <v-chip size="x-small" variant="outlined" prepend-icon="mdi-plus">
                  Kompetenz hinzufügen
                </v-chip>
              </div>

              <div class="text-caption font-weight-bold text-uppercase mb-1">Schwierigkeit</div>
              <v-progress-linear :model-value="selectedNode.data.difficulty * 100" class="mb-3" />

              <div class="d-flex gap-2">
                <v-btn
                  size="small"
                  variant="tonal"
                  prepend-icon="mdi-pencil"
                  class="flex-1-1"
                  @click="editQuestion(selectedNode.data)"
                >
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
                <v-list-item prepend-icon="mdi-help-circle-outline" @click="editQuestion()">
                  <v-list-item-title>Frage hinzufügen</v-list-item-title>
                </v-list-item>

                <v-list-item prepend-icon="mdi-brain">
                  <v-list-item-title>Kompetenz hinzufügen</v-list-item-title>
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

import type { Competency, Question } from '@/model/types'
import {
  competencies as mockCompetencies,
  questions as mockQuestions
} from '@/composables/skillgraph.mock'

const dialogEditQuestion = ref<typeof DialogEditQuestion>()

const editQuestion = (question?: Question) => {
  if (dialogEditQuestion.value) {
    dialogEditQuestion.value.openDialog(question).then((result: boolean) => {
      if (result) {
        console.log('Create / Edit Question Successful')
      } else {
        console.log('Create / Edit Question Cancelled')
      }
    })
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface Course {
  id: string
  name: string
  description: string
}

// ─── Dummy Data ───────────────────────────────────────────────────────────────

const course = ref<Course>({
  id: 'course1',
  name: 'Datenbanken & OOP',
  description:
    'Umfassendes Kurs-Kompetenzmodell für Datenbanken und objektorientierte Programmierung'
})

const competencies = ref<Competency[]>(mockCompetencies)
const questions = ref<Question[]>(mockQuestions)

// ─── UI State ─────────────────────────────────────────────────────────────────
const selectedNodeId = ref<string | null>(course.value.id)
const zoomLevel = ref(1)

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Finde eine Kompetenz nach ID
 */
const getCompetency = (id: string): Competency | undefined =>
  competencies.value.find((c) => c.id === id)

/**
 * Alle Kategorien die in den Competencies verwendet werden
 */
const getCategories = (): string[] => {
  const cats = new Set(competencies.value.filter((c) => !c.parentId).map((c) => c.category || ''))
  return Array.from(cats)
}

/**
 * Kompetenzen nach Kategorie filtern
 */
const competenciesByCategory = (category: string): Competency[] =>
  competencies.value.filter((c) => !c.parentId && c.category === category)

/**
 * Farbe basierend auf Kategorie und Hierarchie-Tiefe
 */
const getCompetencyColor = (comp?: Competency): string => {
  if (!comp) return '#999999'

  // Root-Level (kein parentId) nach Kategorie färben
  if (!comp.parentId) {
    switch (comp.category) {
      case 'database':
        return '#43C57C'
      case 'programming':
        return '#7B68EE'
      case 'modeling':
        return '#FF6B6B'
      default:
        return '#999999'
    }
  }

  // Sub-Level: hellere Varianten
  const parent = getCompetency(comp.parentId)
  if (!parent) return '#CCCCCC'

  switch (parent.category) {
    case 'database':
      return '#7DDBA3'
    case 'programming':
      return '#B19CD9'
    case 'modeling':
      return '#FFB3B3'
    default:
      return '#DDDDDD'
  }
}

/**
 * Rekursive Tiefe einer Kompetenz in der Hierarchie
 */
function getCompetencyDepth(compId: string): number {
  const comp = competencies.value.find((c) => c.id === compId)
  if (!comp?.parentId) return 0
  return 1 + getCompetencyDepth(comp.parentId)
}

/**
 * Spezifischste (tiefste) Kompetenz aus einer Liste finden
 */
const getMostSpecificCompetency = (compIds: string[]): string =>
  compIds.reduce((deepest, id) =>
    getCompetencyDepth(id) > getCompetencyDepth(deepest) ? id : deepest
  )

/**
 * Alle Kind-Kompetenzen einer Parent-Kompetenz
 */
const childCompetencies = (parentId: string): Competency[] =>
  competencies.value.filter((c) => c.parentId === parentId)

/**
 * Alle Fragen, die eine Kompetenz referenzieren (direkt oder indirekt)
 */
const questionsWithCompetency = (compId: string): Question[] =>
  questions.value.filter((q) => q.competencyIds.includes(compId))

/**
 * Icon basierend auf Node-Typ
 */
const nodeIcon = (type?: string) => {
  if (type === 'course') return 'mdi-school'
  if (type?.startsWith('competency-root')) return 'mdi-brain'
  if (type?.startsWith('competency-sub')) return 'mdi-puzzle'
  return 'mdi-help-circle'
}

// ─── Graph Nodes ──────────────────────────────────────────────────────────────
const graphNodes = computed(() => {
  const nodes: Record<string, any> = {}

  // Kurs-Node
  nodes[course.value.id] = {
    name: course.value.name,
    type: 'course',
    color: '#ffa700',
    radius: 17,
    data: course.value
  }

  // Competency-Nodes — Größe/Farbe je nach Hierarchietiefe
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

  // Frage-Nodes
  questions.value.forEach((q) => {
    const short = q.text.length > 28 ? q.text.slice(0, 28) + '…' : q.text
    nodes[q.id] = {
      name: short,
      type: 'question',
      color: '#a3c1f4',
      radius: 5,
      data: q
    }
  })

  return nodes
})

// ─── Graph Edges ──────────────────────────────────────────────────────────────
const graphEdges = computed(() => {
  const edges: Record<string, any> = {}

  // Kurs → Root-Kompetenzen
  competencies.value
    .filter((c) => !c.parentId)
    .forEach((c) => {
      edges[`e-course-${c.id}`] = {
        source: course.value.id,
        target: c.id,
        color: '#292929',
        width: 2
      }
    })

  // Parent-Kompetenz → Child-Kompetenz (gesamte Hierarchie)
  competencies.value
    .filter((c) => c.parentId)
    .forEach((c) => {
      edges[`e-${c.parentId}-${c.id}`] = {
        source: c.parentId!,
        target: c.id,
        color: '#292929',
        width: 1.5
      }
    })

  // Spezifischste Kompetenz → Frage (ein Edge pro Frage)
  questions.value.forEach((q) => {
    const primaryCompId = getMostSpecificCompetency(q.competencyIds)
    edges[`e-${primaryCompId}-${q.id}`] = {
      source: primaryCompId,
      target: q.id,
      color: '#25252577',
      width: 1
    }
  })

  return edges
})

// ─── Radiales Layout ──────────────────────────────────────────────────────────
const BASE_R = 60 // Radius für Root-Kompetenzen
const STEP_R = 50 // Zusätzlicher Radius pro Kompetenz-Ebene
const Q_OFFSET = 50 // Abstand der Fragen über der tiefsten Kompetenz-Ebene

/**
 * Positioniert eine Kompetenz und rekursiv alle ihre Kinder.
 * Kinder werden relativ vom Parent mit konstantem Abstand positioniert.
 */
function layoutCompetencyRecursive(
  compId: string,
  parentPos: { x: number; y: number } | null,
  parentAngle: number,
  sectorWidth: number,
  positions: Record<string, { x: number; y: number }>
) {
  // Aktuelle Node-Position setzen
  positions[compId] = {
    x: parentPos?.x ?? 0,
    y: parentPos?.y ?? 0
  }

  const children = childCompetencies(compId)
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

  // Kurs in der Mitte (fixiert)
  nodes[course.value.id] = { x: 0, y: 0, fixed: true }

  // Kompetenz-Baum aufbauen (mit relativen Positionen vom Parent)
  const rootComps = competencies.value.filter((c) => !c.parentId)
  rootComps.forEach((rc, ri) => {
    const angle = (ri / rootComps.length) * 2 * Math.PI - Math.PI / 2
    const sector = (2 * Math.PI) / rootComps.length
    // Root-Kompetenzen mit BASE_R vom Kurs-Node positionieren
    const rootPos = {
      x: BASE_R * Math.cos(angle),
      y: BASE_R * Math.sin(angle)
    }
    layoutCompetencyRecursive(rc.id, rootPos, angle, sector, nodes)
  })

  // Fragen: jenseits des tiefsten Kompetenz-Rings positionieren
  const maxDepth = Math.max(...competencies.value.map((c) => getCompetencyDepth(c.id)))
  const questionR = BASE_R + maxDepth * STEP_R + Q_OFFSET

  // Fragen nach ihrer primären Kompetenz gruppieren
  const compQMap = new Map<string, Question[]>()
  questions.value.forEach((q) => {
    const pCompId = getMostSpecificCompetency(q.competencyIds)
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

// ─── v-network-graph Configs ──────────────────────────────────────────────────
const configs = vNG.defineConfigs({
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
        // d3-force parameters
        const forceLink = d3.forceLink<ForceNodeDatum, ForceEdgeDatum>(edges).id((d) => d.id)
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
        color: '#ccd7c76f',
        padding: {
          vertical: 2,
          horizontal: 6
        },
        borderRadius: 4
      },
      fontSize: (n) => (n.type === 'course' ? 13 : n.type?.startsWith('competency-root') ? 12 : 10),
      fontWeight: (n) =>
        n.type === 'course' || n.type?.startsWith('competency-root') ? 'bold' : 'normal',
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

const removeCompetencyFromQuestion = (questionId: string, compId: string) => {
  const q = questions.value.find((q) => q.id === questionId)
  if (q) q.competencyIds = q.competencyIds.filter((c) => c !== compId)
}
</script>

<style scoped>
.graph {
  width: 100%;
  height: 680px;
}
</style>
