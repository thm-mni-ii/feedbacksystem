<template>
  <v-card
    elevation="0"
    rounded="lg"
    class="graph-card d-flex flex-column overflow-hidden"
    :style="graphCardStyle"
  >
    <div class="graph-toolbar d-flex align-center gap-2 pa-2" :style="graphToolbarStyle">
      <v-btn-toggle
        :model-value="viewMode"
        density="comfortable"
        variant="tonal"
        mandatory
        @update:model-value="emit('update:viewMode', $event)"
      >
        <v-btn id="graph-view-toggle" value="graph" icon="mdi-graph-outline" title="Graphansicht">
        </v-btn>
        <v-tooltip activator="#graph-view-toggle" location="right">Graphansicht</v-tooltip>
        <v-btn
          id="list-view-toggle"
          value="list"
          icon="mdi-format-list-bulleted-square"
          title="Listenansicht"
        >
        </v-btn>
        <v-tooltip activator="#list-view-toggle" location="right">Listenansicht</v-tooltip>
      </v-btn-toggle>

      <template v-if="viewMode === 'graph'">
        <v-btn
          density="comfortable"
          variant="tonal"
          class="ml-2"
          icon="mdi-plus"
          :style="toolbarButtonStyle"
          @click="zoomLevel += 0.1"
        ></v-btn>
        <v-btn
          density="comfortable"
          variant="tonal"
          class="ml-2"
          icon="mdi-minus"
          :style="toolbarButtonStyle"
          @click="zoomLevel -= 0.1"
        ></v-btn>
      </template>

      <v-btn
        v-if="!readonly"
        density="comfortable"
        variant="tonal"
        prepend-icon="mdi-plus-circle-outline"
        :style="toolbarButtonStyle"
        class="ml-4"
        @click="emit('add-root-competency')"
      >
        Neue Hauptkompetenz
      </v-btn>
    </div>
    <v-network-graph
      v-if="viewMode === 'graph'"
      v-model:zoom-level="zoomLevel"
      class="graph"
      :nodes="graphNodes"
      :edges="graphEdges"
      :layouts="layouts"
      :configs="configs"
      :event-handlers="eventHandlers"
    />
    <CompetencyListView
      v-else
      :root-competencies="rootCompetencies"
      :child-competencies="childCompetenciesOf"
      :questions-with-competency="questionsWithCompetencyOf"
      :node-icon="nodeIcon"
      :selected-node-id="selectedNodeId"
      class="list-view-body"
      @select-node="emit('select-node', $event)"
    />
  </v-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import * as vNG from 'v-network-graph'
import { competencyGraphPalette } from '@/plugins/vuetify'
import CompetencyListView from '@/components/CompetencyListView.vue'
import { getQuestionCompetencyIds } from '@/composables/qMatrix'
import type {
  CompetencyGraphEdgeData,
  CompetencyGraphNodeData
} from '@/composables/useCompetencyGraph'
import type { Competency, Question } from '@/model/types'

interface Props {
  zoomLevel: number
  viewMode: 'graph' | 'list'
  graphNodes: Record<string, CompetencyGraphNodeData>
  graphEdges: Record<string, CompetencyGraphEdgeData>
  layouts: vNG.Layouts
  configs: ReturnType<typeof vNG.defineConfigs<CompetencyGraphNodeData, CompetencyGraphEdgeData>>
  eventHandlers: vNG.EventHandlers
  competencies: Competency[]
  questions: Question[]
  selectedNodeId: string | null
  readonly?: boolean
  nodeIcon: (type?: string) => string
}

interface Emits {
  (e: 'update:zoomLevel', value: number): void
  (e: 'update:viewMode', value: 'graph' | 'list'): void
  (e: 'select-node', nodeId: string): void
  (e: 'add-root-competency'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const zoomLevel = computed({
  get: () => props.zoomLevel,
  set: (value) => emit('update:zoomLevel', value)
})

const rootCompetencies = computed(() => props.competencies.filter((c) => !c.parentId))

const childCompetenciesOf = (parentId: string): Competency[] =>
  props.competencies.filter((c) => c.parentId === parentId)

const questionsWithCompetencyOf = (competencyId: string): Question[] =>
  props.questions.filter((q) => getQuestionCompetencyIds(q).includes(competencyId))

const graphCardStyle = {
  backgroundColor: competencyGraphPalette.surface,
  border: `1px solid ${competencyGraphPalette.panelBorder}`,
  boxShadow: `0 10px 28px ${competencyGraphPalette.panelShadow}`
}

const graphToolbarStyle = {
  backgroundColor: `${competencyGraphPalette.surface}DE`,
  border: `1px solid ${competencyGraphPalette.panelBorder}`
}

const toolbarButtonStyle = {
  color: competencyGraphPalette.accent
}
</script>

<style scoped>
.graph-card {
  flex: 1;
  min-height: 0;
}

.graph-toolbar {
  position: absolute;
  top: 6px;
  left: 6px;
  right: 6px;
  z-index: 2;
  border-radius: 12px;
  backdrop-filter: blur(4px);
}

.graph-search {
  max-width: 260px;
}

.graph-toolbar-right {
  position: absolute;
  top: 6px;
  right: 6px;
  z-index: 2;
  border-radius: 12px;
  backdrop-filter: blur(4px);
}

.graph {
  width: 100%;
  height: 100%;
  min-height: 0;
}

.list-view-body {
  padding-top: 56px;
  box-sizing: border-box;
}
</style>
