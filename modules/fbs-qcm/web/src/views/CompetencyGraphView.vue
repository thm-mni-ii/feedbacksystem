<template>
  <DialogEditQuestion v-if="isAdmin" ref="dialogEditQuestion" />
  <DialogEditCompetency v-if="isAdmin" ref="dialogEditCompetency" />
  <DialogLinkExistingQuestion v-if="isAdmin" ref="dialogLinkExistingQuestion" />
  <DialogConfirm v-if="isAdmin" ref="dialogConfirm" />

  <section class="competency-graph-view">
    <v-container fluid class="pa-2 pa-md-3 competency-graph-content">
      <v-snackbar v-model="snackbar.visible" :timeout="5000">
        {{ snackbar.message }}
        <template #actions>
          <v-btn variant="text" @click="snackbar.visible = false">Schließen</v-btn>
        </template>
      </v-snackbar>
      <v-alert v-if="mutationError" type="error" variant="tonal" class="mb-3">
        {{ mutationError }}
        <template #append>
          <v-btn variant="text" @click="mutationError = null">Schließen</v-btn>
        </template>
      </v-alert>
      <v-alert v-if="!isAdmin" type="info" variant="tonal" density="comfortable" class="mb-2">
        Diese Ansicht zeigt deinen Kompetenzstand. Bearbeiten können nur Dozent:innen.
      </v-alert>
      <v-progress-linear v-if="isLoading" indeterminate color="primary" class="mb-3" />
      <v-alert v-else-if="loadError" type="error" variant="tonal" class="mb-3">
        {{ loadError }}
        <template #append>
          <v-btn variant="text" @click="loadGraphData">Erneut laden</v-btn>
        </template>
      </v-alert>
      <v-alert v-else-if="competencies.length === 0" type="info" variant="tonal" class="mb-3">
        Für diesen Kurs sind im Backend keine Kompetenzen hinterlegt.
      </v-alert>
      <v-alert
        v-else-if="questions.length === 0"
        type="info"
        variant="tonal"
        class="mb-3"
      >
        Für die Kompetenzen dieses Kurses sind im Backend keine Aufgaben hinterlegt.
      </v-alert>
      <v-row
        v-if="!isLoading && !loadError"
        class="fill-height competency-graph-row"
        align="stretch"
      >
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
          :unlink-question="confirmDeleteQuestion"
          :delete-competency="confirmDeleteCompetency"
          :link-existing-question="linkExistingQuestion"
        />
      </v-row>
    </v-container>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import DialogEditQuestion from '@/dialog/DialogEditQuestion.vue'
import DialogEditCompetency from '@/dialog/DialogEditCompetency.vue'
import DialogLinkExistingQuestion from '@/dialog/DialogLinkExistingQuestion.vue'
import DialogConfirm from '@/dialog/DialogConfirm.vue'
import CompetencyGraphContainer from '@/components/CompetencyGraphContainer.vue'
import CompetencyGraphDetailPanel from '@/components/CompetencyGraphDetailPanel.vue'
import { useCompetencyGraph } from '@/composables/useCompetencyGraph'
import type { CompetencyPrerequisite, Question } from '@/model/types'
import {
  toEditableQuestion,
  fromEditableQuestion,
  fromNewEditableQuestion
} from '@/composables/competencyGraphQuestionAdapter'
import studyContentService from '@/services/studyContent.service'
import competencyService from '@/services/competency.service'
import questionService from '@/services/question.service'
import { getQuestionCompetencyIds } from '@/composables/qMatrix'
import { useAuthStore } from '@/stores/authStore'

const route = useRoute()
const authStore = useAuthStore()
const isAdmin = computed(() => authStore.decodedToken?.globalRole === 'ADMIN')
const courseId = computed(() => String(route.params.courseId ?? ''))

const VIEW_MODE_STORAGE_KEY = 'qcm.competencyGraph.viewMode'
const viewMode = ref<'graph' | 'list'>(
  localStorage.getItem(VIEW_MODE_STORAGE_KEY) === 'list' ? 'list' : 'graph'
)
watch(viewMode, (value) => localStorage.setItem(VIEW_MODE_STORAGE_KEY, value))

const isLoading = ref(true)
const loadError = ref<string | null>(null)
const mutationError = ref<string | null>(null)
const snackbar = ref({ visible: false, message: '' })
let loadRequestId = 0

const showMutationMessage = (message: string) => {
  snackbar.value = { visible: true, message }
  mutationError.value = null
}

const showMutationError = (message: string, error: unknown) => {
  console.error(message, error)
  mutationError.value = message
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
  getCompetencyDeletionImpact,
  getCompetencySubtreeIds,
  selectCourse,
  setGraphData
} = useCompetencyGraph([], [])

const loadGraphData = async () => {
  const requestId = ++loadRequestId
  isLoading.value = true
  loadError.value = null

  if (!courseId.value) {
    loadError.value = 'Der Kurs konnte nicht bestimmt werden.'
    isLoading.value = false
    return
  }

  try {
    const content = await studyContentService.getCompetencyGraphContent(courseId.value)
    if (requestId !== loadRequestId) return
    setGraphData(courseId.value, content.competencies, content.questions)
  } catch (error) {
    if (requestId !== loadRequestId) return
    console.error('Kompetenzen und Aufgaben des Kurses konnten nicht geladen werden.', error)
    loadError.value = 'Kompetenzen und Aufgaben konnten nicht geladen werden.'
  } finally {
    if (requestId === loadRequestId) {
      isLoading.value = false
    }
  }
}

watch(courseId, loadGraphData, { immediate: true })

const dialogEditQuestion = ref<typeof DialogEditQuestion>()
const dialogEditCompetency = ref<typeof DialogEditCompetency>()
const dialogLinkExistingQuestion = ref<typeof DialogLinkExistingQuestion>()
const dialogConfirm = ref<typeof DialogConfirm>()

/** @param question Zu bearbeitende Aufgabe, oder undefined für "neu erstellen". */
const editQuestion = async (question?: Question, presetCompetencyId?: string) => {
  if (!dialogEditQuestion.value) return

  const editable = question ? toEditableQuestion(question) : undefined

  const result = await dialogEditQuestion.value.openDialog(editable, {
    persist: false,
    presetCompetencyIds: presetCompetencyId ? [presetCompetencyId] : undefined
  })
  if (!result) return

  try {
    if (question) {
      const updatedQuestion = fromEditableQuestion(result, question)
      await questionService.updateQuestion(toEditableQuestion(updatedQuestion))
    } else {
      const newQuestion = fromNewEditableQuestion(result)
      await questionService.createQuestion(toEditableQuestion(newQuestion))
    }
    await loadGraphData()
    showMutationMessage(question ? 'Aufgabe gespeichert.' : 'Aufgabe im Backend angelegt.')
  } catch (error) {
    showMutationError(
      question ? 'Die Aufgabe konnte nicht gespeichert werden.' : 'Die Aufgabe konnte nicht angelegt werden.',
      error
    )
  }
}

/**
 * @param competencyId Zu bearbeitende Kompetenz, oder undefined für "neu erstellen".
 * @param presetParentId Vorbelegter Parent für eine neue Kompetenz, z.B. beim
 * kontextsensitiven "Unterkompetenz hinzufügen" aus dem Panel heraus.
 */
const editCompetency = async (competencyId?: string, presetParentId?: string) => {
  if (!dialogEditCompetency.value) return

  const editable = competencyId ? getCompetency(competencyId) : undefined

  const result = await dialogEditCompetency.value.openDialog(editable, {
    presetParentId,
    courseIds: competencyId ? undefined : [courseId.value],
    allowDelete: false
  })
  if (result) {
    await loadGraphData()
    showMutationMessage(competencyId ? 'Kompetenz gespeichert.' : 'Kompetenz im Backend angelegt.')
  }
}

/**
 * Öffnet den Dialog zum Verknüpfen bestehender Pool-Aufgaben mit einer
 * Kompetenz und ordnet nach Bestätigung alle ausgewählten Aufgaben dieser
 * Kompetenz zu (statt sie als Duplikate neu anzulegen).
 *
 * @param competencyId Kompetenz, der bestehende Aufgaben zugeordnet werden sollen.
 */
const linkExistingQuestion = async (competencyId: string) => {
  if (!dialogLinkExistingQuestion.value) return

  const competency = getCompetency(competencyId)
  if (!competency) return

  const result = await dialogLinkExistingQuestion.value.openDialog(competency, questions.value)
  if (!result) return

  try {
    for (const questionId of result) {
      const question = questions.value.find((item) => item.id === questionId)
      if (!question) continue
      const competencyIds = [...new Set([...getQuestionCompetencyIds(question), competencyId])]
      const updatedQuestion = fromEditableQuestion(
        { ...toEditableQuestion(question), competencyIds },
        question
      )
      await questionService.updateQuestion(toEditableQuestion(updatedQuestion))
    }
    await loadGraphData()
    showMutationMessage('Aufgabenzuordnung im Backend gespeichert.')
  } catch (error) {
    await loadGraphData()
    showMutationError(
      'Die Aufgabenzuordnung konnte nicht vollständig gespeichert werden. Der Graph wurde mit dem Backend-Stand aktualisiert.',
      error
    )
  }
}

const saveQuestionCompetencyAssignment = async (
  questionId: string,
  competencyId: string,
  shouldAdd: boolean
) => {
  const question = questions.value.find((item) => item.id === questionId)
  if (!question) return

  const currentIds = getQuestionCompetencyIds(question)
  const competencyIds = shouldAdd
    ? [...new Set([...currentIds, competencyId])]
    : currentIds.filter((id) => id !== competencyId)
  const updatedQuestion = fromEditableQuestion(
    { ...toEditableQuestion(question), competencyIds },
    question
  )

  try {
    await questionService.updateQuestion(toEditableQuestion(updatedQuestion))
    await loadGraphData()
    showMutationMessage('Aufgabenzuordnung im Backend gespeichert.')
  } catch (error) {
    await loadGraphData()
    showMutationError('Die Aufgabenzuordnung konnte nicht gespeichert werden.', error)
  }
}

const addCompetencyToQuestion = (questionId: string, competencyId: string) =>
  saveQuestionCompetencyAssignment(questionId, competencyId, true)

const removeCompetencyFromQuestion = (questionId: string, competencyId: string) =>
  saveQuestionCompetencyAssignment(questionId, competencyId, false)

const saveCompetencyPrerequisites = async (
  competencyId: string,
  prerequisites: CompetencyPrerequisite[]
) => {
  try {
    await competencyService.updateCompetency(competencyId, { prerequisites })
    await loadGraphData()
    showMutationMessage('Voraussetzungen im Backend gespeichert.')
  } catch (error) {
    showMutationError('Die Voraussetzungen konnten nicht gespeichert werden.', error)
    throw error
  }
}

const confirmDeleteQuestion = async (id: string) => {
  if (!dialogConfirm.value) return

  const question = questions.value.find((q) => q.id === id)
  const confirmed = await dialogConfirm.value.openDialog(
    'Aufgabe aus Kurs lösen',
    `Die Verknüpfungen der Aufgabe "${question?.title || question?.text || id}" zu Kompetenzen dieses Kurses entfernen? Die Aufgabe und ihre Verknüpfungen in anderen Kursen bleiben erhalten.`,
    'Lösen'
  )
  if (!confirmed || !question) return

  try {
    const courseCompetencyIds = new Set(competencies.value.map((item) => item.id))
    const remainingIds = getQuestionCompetencyIds(question).filter(
      (competencyId) => !courseCompetencyIds.has(competencyId)
    )
    const updatedQuestion = fromEditableQuestion(
      { ...toEditableQuestion(question), competencyIds: remainingIds },
      question
    )
    await questionService.updateQuestion(toEditableQuestion(updatedQuestion))
    await loadGraphData()
    showMutationMessage('Aufgabe aus diesem Kurs gelöst.')
  } catch (error) {
    showMutationError('Die Aufgabe konnte nicht aus diesem Kurs gelöst werden.', error)
  }
}

const confirmDeleteCompetency = async (competencyId: string) => {
  if (!dialogConfirm.value) return

  const competency = getCompetency(competencyId)
  if (!competency) return

  const impact = getCompetencyDeletionImpact(competencyId)
  const impactParts: string[] = []
  if (impact.subCompetencyCount > 0) {
    impactParts.push(`${impact.subCompetencyCount} Unterkompetenz(en) werden ebenfalls aus diesem Kurs entfernt`)
  }
  if (impact.affectedQuestionCount > 0) {
    impactParts.push('Aufgaben bleiben im Backend und anderen Kursen erhalten')
  }
  const message = impactParts.length
    ? `„${competency.name}“ wirklich aus diesem Kurs entfernen? ${impactParts.join('. ')}.`
    : `„${competency.name}“ wirklich aus diesem Kurs entfernen?`

  const confirmed = await dialogConfirm.value.openDialog(
    'Kompetenz aus Kurs entfernen',
    message,
    'Entfernen'
  )
  if (!confirmed) return

  const courseCompetencyIds = getCompetencySubtreeIds(competencyId)
  try {
    for (const id of courseCompetencyIds) {
      const item = getCompetency(id)
      if (!item) continue
      await competencyService.updateCompetency(id, {
        courseIds: (item.courseIds ?? []).filter((id) => id !== courseId.value)
      })
    }
    await loadGraphData()
    showMutationMessage('Kompetenz aus diesem Kurs entfernt.')
  } catch (error) {
    await loadGraphData()
    showMutationError(
      'Die Kompetenz konnte nicht vollständig aus dem Kurs entfernt werden. Der Graph wurde mit dem Backend-Stand aktualisiert.',
      error
    )
  }
}

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
