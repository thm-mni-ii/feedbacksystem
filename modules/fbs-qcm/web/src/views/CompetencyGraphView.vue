<template>
  <DialogEditQuestion v-if="isAdmin" ref="dialogEditQuestion" />
  <DialogEditCompetency v-if="isAdmin" ref="dialogEditCompetency" />

  <section class="competency-graph-view" :style="viewStyle">
    <v-container fluid class="pa-2 pa-md-3 competency-graph-content">
      <v-alert v-if="!isAdmin" type="info" variant="tonal" density="comfortable" class="mb-2">
        Diese Ansicht zeigt deinen Kompetenzstand. Bearbeiten können nur Dozent:innen.
      </v-alert>
      <v-row class="fill-height competency-graph-row" align="stretch">
        <!-- Graph -->
        <v-col
          cols="12"
          :md="selectedNodeId ? 8 : 12"
          class="d-flex flex-column fill-height pr-md-2"
        >
          <CompetencyGraphContainer
            v-model:zoom-level="zoomLevel"
            :graph-nodes="graphNodes"
            :graph-edges="graphEdges"
            :layouts="layouts"
            :configs="configs"
            :event-handlers="eventHandlers"
            :competencies="competencies"
            :questions="questions"
          />
        </v-col>

        <!-- Detail Panel -->
        <CompetencyGraphDetailPanel
          :selected-node-id="selectedNodeId"
          :selected-node="selectedNode"
          :questions="questions"
          :competencies="competencies"
          :node-icon="nodeIcon"
          :root-competencies="rootCompetencies"
          :readonly="!isAdmin"
          :get-competency-color="getCompetencyColor"
          :get-competency="getCompetency"
          :child-competencies="childCompetencies"
          :get-available-prerequisites="getAvailablePrerequisites"
          :questions-with-competency="questionsWithCompetency"
          :remove-competency-from-question="removeCompetencyFromQuestion"
          :add-competency-to-question="addCompetencyToQuestion"
          :save-competency-prerequisites="saveCompetencyPrerequisites"
          :select-course="selectCourse"
          :edit-question="editQuestion"
          :edit-competency="editCompetency"
          :delete-question="deleteQuestion"
        />
      </v-row>
    </v-container>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import DialogEditQuestion from '@/dialog/DialogEditQuestion.vue'
import DialogEditCompetency from '@/dialog/DialogEditCompetency.vue'
import CompetencyGraphContainer from '@/components/CompetencyGraphContainer.vue'
import CompetencyGraphDetailPanel from '@/components/CompetencyGraphDetailPanel.vue'
import { useCompetencyGraph } from '@/composables/useCompetencyGraph'
import type { Competency, Question } from '@/model/types'
import type EditableQuestion from '@/model/Question'
import {
  toEditableQuestion,
  fromEditableQuestion
} from '@/composables/competencyGraphQuestionAdapter'
import { competencyGraphPalette } from '@/plugins/vuetify'
import {
  competencies as mockCompetencies,
  questions as mockQuestions
} from '@/composables/competencyGraph.mock'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()
const isAdmin = computed(() => authStore.decodedToken?.globalRole === 'ADMIN')

const dialogEditQuestion = ref<typeof DialogEditQuestion>()
const dialogEditCompetency = ref<typeof DialogEditCompetency>()

const viewStyle = computed(() => ({
  background: `linear-gradient(180deg, ${competencyGraphPalette.viewBackground} 0%, ${competencyGraphPalette.viewBackgroundAlt} 100%)`
}))

/**
 * Der Kompetenzgraph verwaltet Fragen bislang nur lokal (Mock-Daten, siehe
 * useCompetencyGraph). Der Bearbeiten-Dialog wird deshalb mit `persist: false`
 * geöffnet, damit kein (fehlschlagender) Backend-Call gegen eine nicht
 * existierende Mock-Frage ausgelöst wird; stattdessen wird das Ergebnis lokal
 * über `updateQuestion` übernommen.
 */
const editQuestion = (question?: Question) => {
  if (!dialogEditQuestion.value) return

  const editable = question ? toEditableQuestion(question) : undefined

  dialogEditQuestion.value
    .openDialog(editable, { persist: false })
    .then((result: EditableQuestion | false) => {
      if (result && question) {
        updateQuestion(fromEditableQuestion(result, question))
      }
    })
}

const editCompetency = (competencyId?: string) => {
  if (!dialogEditCompetency.value) return

  const editable = competencyId ? getCompetency(competencyId) : undefined

  dialogEditCompetency.value
    .openDialog(editable, { persist: false, competencies: competencies.value })
    .then((result: Competency | false) => {
      if (result) {
        upsertCompetency(result)
      }
    })
}

const {
  competencies,
  zoomLevel,
  selectedNodeId,
  selectedNode,
  questions,
  graphNodes,
  graphEdges,
  layouts,
  configs,
  eventHandlers,
  getCompetency,
  rootCompetencies,
  getCompetencyColor,
  childCompetencies,
  getAvailablePrerequisites,
  questionsWithCompetency,
  nodeIcon,
  deleteQuestion,
  updateQuestion,
  removeCompetencyFromQuestion,
  addCompetencyToQuestion,
  saveCompetencyPrerequisites,
  upsertCompetency,
  selectCourse
} = useCompetencyGraph(mockCompetencies, mockQuestions)
</script>

<style scoped>
.competency-graph-view {
  height: calc(100dvh - var(--v-layout-top, 0px));
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.competency-graph-content {
  flex: 1;
  min-height: 0;
}

.competency-graph-row {
  margin: 0;
}
</style>
