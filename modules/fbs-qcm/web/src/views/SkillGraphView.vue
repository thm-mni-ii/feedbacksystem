<template>
  <DialogEditQuestion ref="dialogEditQuestion" />

  <section style="background: linear-gradient(135deg, #81ba24, #36c78e); color: white" class="mb-4">
    <v-container class="text-center py-10">
      <v-avatar size="64" class="mb-4" style="background-color: rgba(255, 255, 255, 0.2)">
        <v-icon size="36">mdi-brain</v-icon>
      </v-avatar>
      <h1 class="text-h3 font-weight-bold mb-2">Skill Graph</h1>
      <p class="text-subtitle-1 opacity-75">Kurs-Kompetenzmodell verwalten</p>
    </v-container>
  </section>

  <v-container fluid class="pa-4">
    <!-- Toolbar -->
    <v-row align="center" class="mb-3">
      <v-spacer />
      <v-col cols="auto" class="d-flex gap-2"> </v-col>
    </v-row>

    <v-row>
      <!-- Graph -->
      <v-col cols="12" :md="selectedNodeId ? 8 : 12">
        <v-card elevation="1" rounded="lg">
          <v-network-graph
            class="graph"
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
              <v-row dense>
                <v-col cols="4">
                  <v-card variant="tonal" color="#36C78E" class="text-center pa-2">
                    <div class="text-h6">{{ tags.filter((t) => !t.parentId).length }}</div>
                    <div class="text-caption">Root-Tags</div>
                  </v-card>
                </v-col>
                <v-col cols="4">
                  <v-card variant="tonal" color="#36C78E" class="text-center pa-2">
                    <div class="text-h6">{{ skills.length }}</div>
                    <div class="text-caption">Skills</div>
                  </v-card>
                </v-col>
                <v-col cols="4">
                  <v-card variant="tonal" color="#36C78E" class="text-center pa-2">
                    <div class="text-h6">{{ questions.length }}</div>
                    <div class="text-caption">Fragen</div>
                  </v-card>
                </v-col>
              </v-row>
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
        <div class="d-flex gap-2 mt-3">
          <v-btn size="small" variant="tonal" class="mx-1" prepend-icon="mdi-tag-plus"
            >Neuer Tag</v-btn
          >
          <v-btn size="small" color="success" prepend-icon="mdi-plus" @click="editQuestion">
            Neue Frage
          </v-btn>
        </div>
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
const course = ref<Course>({
  id: 'course1',
  name: 'Datenbanken WS24/25',
  description: 'Grundlagen der relationalen Datenbanktheorie und -praxis'
})

const skills = ref<Skill[]>([
  { id: 's1', name: 'SQL Grundlagen', description: 'Grundlegende SQL-Abfragen' },
  { id: 's2', name: 'Datenbankdesign', description: 'ER-Modellierung' },
  { id: 's3', name: 'OOP Konzepte', description: 'Objektorientierung' },
  { id: 's4', name: 'ER-Modellierung', description: 'ER-Modellierung' },
  { id: 's5', name: 'SQL Fortgeschritten', description: 'Komplexe SQL-Abfragen' },
  { id: 's6', name: 'Normalisierung', description: 'Datenbanknormalisierung' },
  { id: 's7', name: 'Transaktionen', description: 'ACID und Transaktionsmanagement' },
  { id: 's8', name: 'Indizes', description: 'Performanceoptimierung durch Indizes' },
  { id: 's9', name: 'Datenbankarchitektur', description: 'Architektur relationaler Datenbanken' },
  {
    id: 's10',
    name: 'Objektorientiertes Design',
    description: 'Entwurf objektorientierter Systeme'
  }
])

const tags = ref<Tag[]>([
  { id: 't1', label: '#SQL' },
  { id: 't2', label: '#SQL/select', parentId: 't1' },
  { id: 't3', label: '#SQL/join', parentId: 't1' },
  { id: 't4', label: '#SQL/delete', parentId: 't1' },
  { id: 't5', label: '#SQL/update', parentId: 't1' },
  { id: 't6', label: '#SQL/insert', parentId: 't1' },
  { id: 't7', label: '#SQL/group-by', parentId: 't1' },
  { id: 't8', label: '#SQL/subqueries', parentId: 't1' },

  { id: 't9', label: '#Normalisierung' },
  { id: 't10', label: '#Normalisierung/1NF', parentId: 't9' },
  { id: 't11', label: '#Normalisierung/2NF', parentId: 't9' },
  { id: 't12', label: '#Normalisierung/3NF', parentId: 't9' },
  { id: 't13', label: '#Normalisierung/BCNF', parentId: 't9' },

  { id: 't14', label: '#ER-Modellierung' },
  { id: 't15', label: '#ER-Modellierung/Entitäten', parentId: 't14' },
  { id: 't16', label: '#ER-Modellierung/Beziehungen', parentId: 't14' },
  { id: 't17', label: '#ER-Modellierung/Kardinalitäten', parentId: 't14' },

  { id: 't18', label: '#Transaktionen' },
  { id: 't19', label: '#Transaktionen/ACID', parentId: 't18' },
  { id: 't20', label: '#Transaktionen/Locks', parentId: 't18' },
  { id: 't21', label: '#Transaktionen/Deadlocks', parentId: 't18' },

  { id: 't22', label: '#Indizes' },
  { id: 't23', label: '#Indizes/B-Tree', parentId: 't22' },
  { id: 't24', label: '#Indizes/Hash', parentId: 't22' },

  { id: 't25', label: '#Schlüssel' },
  { id: 't26', label: '#Schlüssel/Primärschlüssel', parentId: 't25' },
  { id: 't27', label: '#Schlüssel/Fremdschlüssel', parentId: 't25' },
  { id: 't28', label: '#Schlüssel/Kandidatschlüssel', parentId: 't25' },

  { id: 't29', label: '#Integrität' },
  { id: 't30', label: '#Integrität/Referenzielle-Integrität', parentId: 't29' }
])

const questions = ref<Question[]>([
  { id: 'q1', text: 'Was ist ein SELECT Statement?', skillId: 's1', tags: ['t3'] },
  { id: 'q2', text: 'Wie funktioniert INNER JOIN?', skillId: 's1', tags: ['t4'] },
  { id: 'q3', text: 'DELETE vs. TRUNCATE?', skillId: 's1', tags: ['t5'] },
  { id: 'q4', text: 'Was ist die 3. Normalform?', skillId: 's2', tags: ['t6', 't16'] },
  { id: 'q5', text: 'Wie erstellt man ein ER-Diagramm?', skillId: 's2', tags: ['t24'] },
  { id: 'q6', text: 'Was ist eine Klasse in OOP?', skillId: 's3', tags: ['t9'] },
  { id: 'q7', text: 'Was ist Polymorphismus?', skillId: 's3', tags: ['t28'] },
  { id: 'q8', text: 'Wie funktioniert OUTER JOIN?', skillId: 's5', tags: ['t4'] },

  { id: 'q9', text: 'Wofür wird UPDATE verwendet?', skillId: 's1', tags: ['t10'] },
  { id: 'q10', text: 'Wie funktioniert INSERT INTO?', skillId: 's1', tags: ['t11'] },
  { id: 'q11', text: 'Wann verwendet man GROUP BY?', skillId: 's5', tags: ['t12'] },
  { id: 'q12', text: 'Was sind Unterabfragen (Subqueries)?', skillId: 's5', tags: ['t13'] },
  {
    id: 'q13',
    text: 'Was ist der Unterschied zwischen WHERE und HAVING?',
    skillId: 's5',
    tags: ['t12']
  },
  { id: 'q14', text: 'Wie funktioniert ein CROSS JOIN?', skillId: 's5', tags: ['t4'] },

  { id: 'q15', text: 'Was ist die 1. Normalform?', skillId: 's6', tags: ['t14'] },
  { id: 'q16', text: 'Was ist die 2. Normalform?', skillId: 's6', tags: ['t15'] },
  { id: 'q17', text: 'Wann verletzt ein Schema die BCNF?', skillId: 's6', tags: ['t17'] },
  { id: 'q18', text: 'Warum wird normalisiert?', skillId: 's6', tags: ['t6'] },

  { id: 'q19', text: 'Was bedeutet ACID?', skillId: 's7', tags: ['t19'] },
  { id: 'q20', text: 'Was ist eine Datenbanktransaktion?', skillId: 's7', tags: ['t18'] },
  { id: 'q21', text: 'Wozu dienen Locks?', skillId: 's7', tags: ['t20'] },
  { id: 'q22', text: 'Was ist ein Deadlock?', skillId: 's7', tags: ['t20'] },

  { id: 'q23', text: 'Was ist ein Index?', skillId: 's8', tags: ['t21'] },
  { id: 'q24', text: 'Wann verbessert ein Index die Performance?', skillId: 's8', tags: ['t21'] },
  { id: 'q25', text: 'Wie funktioniert ein B-Tree Index?', skillId: 's8', tags: ['t22'] },
  { id: 'q26', text: 'Wann eignet sich ein Hash-Index?', skillId: 's8', tags: ['t23'] },

  { id: 'q27', text: 'Was ist eine Entität?', skillId: 's4', tags: ['t25'] },
  { id: 'q28', text: 'Was ist eine Beziehung im ER-Modell?', skillId: 's4', tags: ['t26'] },
  { id: 'q29', text: 'Was ist eine n:m-Beziehung?', skillId: 's4', tags: ['t26'] },
  { id: 'q30', text: 'Wie werden Kardinalitäten dargestellt?', skillId: 's4', tags: ['t26'] },

  { id: 'q31', text: 'Was versteht man unter Vererbung?', skillId: 's10', tags: ['t27'] },
  { id: 'q32', text: 'Was ist Kapselung?', skillId: 's10', tags: ['t30'] },
  { id: 'q33', text: 'Was bedeutet Abstraktion?', skillId: 's10', tags: ['t29'] },
  { id: 'q34', text: 'Was ist Methodenüberschreibung?', skillId: 's10', tags: ['t27', 't28'] },
  {
    id: 'q35',
    text: 'Was ist der Unterschied zwischen Klasse und Objekt?',
    skillId: 's3',
    tags: ['t9']
  },

  { id: 'q36', text: 'Was ist ein Primärschlüssel?', skillId: 's2', tags: ['t1'] },
  { id: 'q37', text: 'Was ist ein Fremdschlüssel?', skillId: 's2', tags: ['t1'] },
  {
    id: 'q38',
    text: 'Was versteht man unter referenzieller Integrität?',
    skillId: 's9',
    tags: ['t1']
  },
  { id: 'q39', text: 'Was ist eine relationale Datenbank?', skillId: 's9', tags: ['t1'] },
  {
    id: 'q40',
    text: 'Welche Vorteile bieten relationale Datenbanken?',
    skillId: 's9',
    tags: ['t1']
  }
])
// ─── UI State ─────────────────────────────────────────────────────────────────
const selectedNodeId = ref<string | null>(course.value.id)
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
