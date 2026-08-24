<template>
  <v-card
    elevation="0"
    rounded="lg"
    class="graph-card d-flex flex-column overflow-hidden"
    :style="graphCardStyle"
  >
    <div class="graph-toolbar d-flex gap-2 pa-2" :style="graphToolbarStyle">
      <v-btn
        density="comfortable"
        variant="tonal"
        icon="mdi-plus"
        :style="toolbarButtonStyle"
        @click="zoomLevel += 0.1"
      ></v-btn>
      <v-btn
        density="comfortable"
        variant="tonal"
        icon="mdi-minus"
        :style="toolbarButtonStyle"
        @click="zoomLevel -= 0.1"
      ></v-btn>
    </div>
    <div class="graph-toolbar-right pa-2" :style="graphToolbarStyle">
      <QMatrixDialog
        :competencies="competencies"
        :questions="questions"
        title="Q-Matrix: SkillGraph"
        button-label="Q-Matrix"
      />
    </div>
    <v-network-graph
      v-model:zoom-level="zoomLevel"
      class="graph"
      :nodes="graphNodes"
      :edges="graphEdges"
      :layouts="layouts"
      :configs="configs"
      :event-handlers="eventHandlers"
    />
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import * as vNG from 'v-network-graph'
import { skillGraphPalette } from '@/plugins/vuetify'
import QMatrixDialog from '@/dialog/DialogQMatrix.vue'
import type { SkillGraphEdgeData, SkillGraphNodeData } from '@/composables/useSkillGraphLogic'
import type { Competency, Question } from '@/model/types'

interface Props {
  zoomLevel: number
  graphNodes: Record<string, SkillGraphNodeData>
  graphEdges: Record<string, SkillGraphEdgeData>
  layouts: vNG.Layouts
  configs: ReturnType<typeof vNG.defineConfigs<SkillGraphNodeData, SkillGraphEdgeData>>
  eventHandlers: vNG.EventHandlers
  competencies: Competency[]
  questions: Question[]
}

interface Emits {
  (e: 'update:zoomLevel', value: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const zoomLevel = computed({
  get: () => props.zoomLevel,
  set: (value) => emit('update:zoomLevel', value)
})

const graphCardStyle = {
  backgroundColor: skillGraphPalette.surface,
  border: `1px solid ${skillGraphPalette.panelBorder}`,
  boxShadow: `0 10px 28px ${skillGraphPalette.panelShadow}`
}

const graphToolbarStyle = {
  backgroundColor: `${skillGraphPalette.surface}DE`,
  border: `1px solid ${skillGraphPalette.panelBorder}`
}

const toolbarButtonStyle = {
  color: skillGraphPalette.accent
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
  z-index: 2;
  border-radius: 12px;
  backdrop-filter: blur(4px);
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
</style>
