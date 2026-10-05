<template>
  <DialogEditQuestion v-if="isAdmin" ref="dialogEditQuestion" />
  <DialogEditCompetency v-if="isAdmin" ref="dialogEditCompetency" />
  <DialogLinkExistingQuestion v-if="isAdmin" ref="dialogLinkExistingQuestion" />
  <DialogConfirm v-if="isAdmin" ref="dialogConfirm" />

  <section class="competency-graph-view">
    <v-container fluid class="pa-2 pa-md-3 competency-graph-content">
      <v-alert type="warning" variant="tonal" density="comfortable" class="mb-2">
        Lokale Demo: Dieser Kompetenzgraph verwendet Beispieldaten. Änderungen werden nicht im
        Backend gespeichert und gehen beim Neuladen verloren.
      </v-alert>
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
            v-model:view-mode="viewMode"
            :graph-nodes="graphNodes"
            :graph-edges="graphEdges"
            :layouts="layouts"
            :configs="configs"
            :event-handlers="eventHandlers"
            :competencies="competencies"
            :questions="questions"
            :selected-node-id="selectedNodeId"
            :readonly="!isAdmin"
            :node-icon="nodeIcon"
            @select-node="selectedNodeId = $event"
            @add-root-competency="editCompetency()"
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
          :delete-question="confirmDeleteQuestion"
          :delete-competency="confirmDeleteCompetency"
          :link-existing-question="linkExistingQuestion"
        />
      </v-row>
    </v-container>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import DialogEditQuestion from '@/dialog/DialogEditQuestion.vue'
import DialogEditCompetency from '@/dialog/DialogEditCompetency.vue'
import DialogLinkExistingQuestion from '@/dialog/DialogLinkExistingQuestion.vue'
import DialogConfirm from '@/dialog/DialogConfirm.vue'
import CompetencyGraphContainer from '@/components/CompetencyGraphContainer.vue'
import CompetencyGraphDetailPanel from '@/components/CompetencyGraphDetailPanel.vue'
import { useCompetencyGraph } from '@/composables/useCompetencyGraph'
import type { Competency, Question } from '@/model/types'
import type EditableQuestion from '@/model/Question'
import {
  toEditableQuestion,
  fromEditableQuestion,
  fromNewEditableQuestion
} from '@/composables/competencyGraphQuestionAdapter'
import {
  competencies as mockCompetencies,
  questions as mockQuestions
} from '@/composables/competencyGraph.mock'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()
const isAdmin = computed(() => authStore.decodedToken?.globalRole === 'ADMIN')

const VIEW_MODE_STORAGE_KEY = 'qcm.competencyGraph.viewMode'
const viewMode = ref<'graph' | 'list'>(
  localStorage.getItem(VIEW_MODE_STORAGE_KEY) === 'list' ? 'list' : 'graph'
)
watch(viewMode, (value) => localStorage.setItem(VIEW_MODE_STORAGE_KEY, value))

const dialogEditQuestion = ref<typeof DialogEditQuestion>()
const dialogEditCompetency = ref<typeof DialogEditCompetency>()
const dialogLinkExistingQuestion = ref<typeof DialogLinkExistingQuestion>()
const dialogConfirm = ref<typeof DialogConfirm>()

/**
 * Der Kompetenzgraph verwaltet Aufgaben bislang nur lokal (Mock-Daten, siehe
 * useCompetencyGraph). Der Bearbeiten-Dialog wird deshalb mit `persist: false`
 * geöffnet, damit kein (fehlschlagender) Backend-Call gegen eine nicht
 * existierende Mock-Aufgabe ausgelöst wird; stattdessen wird das Ergebnis lokal
 * über `updateQuestion`/`addQuestion` übernommen.
 *
 * @param question Zu bearbeitende Aufgabe, oder undefined für "neu erstellen".
 * @param presetCompetencyId Vorbelegte Kompetenz für eine neue Aufgabe, z.B. beim
 * kontextsensitiven "Aufgabe zu dieser Kompetenz hinzufügen" aus dem Panel heraus.
 */
const editQuestion = (question?: Question, presetCompetencyId?: string) => {
  if (!dialogEditQuestion.value) return

  const editable = question ? toEditableQuestion(question) : undefined

  dialogEditQuestion.value
    .openDialog(editable, {
      persist: false,
      presetCompetencyIds: presetCompetencyId ? [presetCompetencyId] : undefined
    })
    .then((result: EditableQuestion | false) => {
      if (!result) return
      if (question) {
        updateQuestion(fromEditableQuestion(result, question))
      } else {
        addQuestion(fromNewEditableQuestion(result))
      }
    })
}

/**
 * @param competencyId Zu bearbeitende Kompetenz, oder undefined für "neu erstellen".
 * @param presetParentId Vorbelegter Parent für eine neue Kompetenz, z.B. beim
 * kontextsensitiven "Unterkompetenz hinzufügen" aus dem Panel heraus.
 */
const editCompetency = (competencyId?: string, presetParentId?: string) => {
  if (!dialogEditCompetency.value) return

  const editable = competencyId ? getCompetency(competencyId) : undefined

  dialogEditCompetency.value
    .openDialog(editable, { persist: false, competencies: competencies.value, presetParentId })
    .then((result: Competency | false) => {
      if (result) {
        upsertCompetency(result)
      }
    })
}

/**
 * Öffnet den Dialog zum Verknüpfen bestehender Pool-Aufgaben mit einer
 * Kompetenz und ordnet nach Bestätigung alle ausgewählten Aufgaben dieser
 * Kompetenz zu (statt sie als Duplikate neu anzulegen).
 *
 * @param competencyId Kompetenz, der bestehende Aufgaben zugeordnet werden sollen.
 */
const linkExistingQuestion = (competencyId: string) => {
  if (!dialogLinkExistingQuestion.value) return

  const competency = getCompetency(competencyId)
  if (!competency) return

  dialogLinkExistingQuestion.value
    .openDialog(competency, questions.value)
    .then((result: string[] | false) => {
      if (!result) return
      for (const questionId of result) {
        addCompetencyToQuestion(questionId, competencyId)
      }
    })
}

const confirmDeleteQuestion = async (id: string) => {
  if (!dialogConfirm.value) return

  const question = questions.value.find((q) => q.id === id)
  const confirmed = await dialogConfirm.value.openDialog(
    'Aufgabe löschen',
    `Aufgabe "${question?.title || question?.text || id}" wirklich löschen?`,
    'Löschen'
  )
  if (confirmed) {
    deleteQuestion(id)
  }
}

const confirmDeleteCompetency = async (competencyId: string) => {
  if (!dialogConfirm.value) return

  const competency = getCompetency(competencyId)
  const impact = getCompetencyDeletionImpact(competencyId)
  const impactParts: string[] = []
  if (impact.subCompetencyCount > 0) {
    impactParts.push(`${impact.subCompetencyCount} Unterkompetenz(en) werden mit gelöscht`)
  }
  if (impact.affectedQuestionCount > 0) {
    impactParts.push(`${impact.affectedQuestionCount} Aufgabe(n) verlieren diese Zuordnung`)
  }
  const message = impactParts.length
    ? `Kompetenz "${competency?.name}" wirklich löschen? ${impactParts.join('. ')}.`
    : `Kompetenz "${competency?.name}" wirklich löschen?`

  const confirmed = await dialogConfirm.value.openDialog('Kompetenz löschen', message, 'Löschen')
  if (confirmed) {
    deleteCompetency(competencyId)
  }
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
  addQuestion,
  removeCompetencyFromQuestion,
  addCompetencyToQuestion,
  saveCompetencyPrerequisites,
  upsertCompetency,
  deleteCompetency,
  getCompetencyDeletionImpact,
  selectCourse
} = useCompetencyGraph(mockCompetencies, mockQuestions)
</script>

<style scoped>
.competency-graph-view {
  height: calc(88dvh - var(--v-layout-top, 0px));
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
