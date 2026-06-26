<template>
  <v-card elevation="1" rounded="lg">
    <div class="d-flex gap-1 pa-1">
      <v-btn
        density="compact"
        color="grey"
        icon="mdi-plus"
        @click="zoomLevel += 0.1"
      ></v-btn>
      <v-btn
        density="compact"
        icon="mdi-minus"
        color="grey"
        @click="zoomLevel -= 0.1"
      ></v-btn>
    </div>
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
</template>

<script setup lang="ts">
import { computed } from 'vue'
import * as vNG from 'v-network-graph'

interface Props {
  zoomLevel: number
  graphNodes: Record<string, any>
  graphEdges: Record<string, any>
  layouts: vNG.Layouts
  configs: vNG.Configs
  eventHandlers: vNG.EventHandlers
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
</script>

<style scoped>
.graph {
  width: 100%;
  height: 680px;
}
</style>
