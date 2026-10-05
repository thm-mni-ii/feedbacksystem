<template>
  <div class="competency-list-view">
    <v-list v-if="rootCompetencies.length" density="compact" class="pa-2" color="primary">
      <CompetencyListNode
        v-for="root in rootCompetencies"
        :key="root.id"
        :competency="root"
        :child-competencies="childCompetencies"
        :questions-with-competency="questionsWithCompetency"
        :node-icon="nodeIcon"
        :selected-node-id="selectedNodeId"
        :on-select="(id: string) => emit('select-node', id)"
      />
    </v-list>
    <div v-else class="d-flex flex-column align-center justify-center pa-8 text-medium-emphasis">
      <v-icon size="40" class="mb-2">mdi-brain</v-icon>
      <span>Noch keine Kompetenzen vorhanden.</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import CompetencyListNode from '@/components/competency-graph/CompetencyListNode.vue'
import type { Competency, Question } from '@/model/types'

interface Props {
  rootCompetencies: Competency[]
  childCompetencies: (parentId: string) => Competency[]
  questionsWithCompetency: (competencyId: string) => Question[]
  nodeIcon: (type?: string) => string
  selectedNodeId: string | null
}

interface Emits {
  (e: 'select-node', nodeId: string): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()
</script>

<style scoped>
.competency-list-view {
  width: 100%;
  height: 100%;
  overflow-y: auto;
}
</style>
