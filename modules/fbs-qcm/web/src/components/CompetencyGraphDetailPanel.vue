<template>
  <v-col
    v-if="selectedNodeId"
    cols="12"
    md="4"
    class="d-flex flex-column fill-height pl-md-2"
    :style="panelStyles"
  >
    <v-card elevation="1" rounded="lg" class="d-flex flex-column flex-grow-1 detail-main-card">
      <!-- Header -->
      <v-card-title class="d-flex align-center pa-3 detail-header">
        <v-icon class="mr-2" :color="selectedNode?.color" size="18">
          {{ nodeIcon(selectedNode?.type) }}
        </v-icon>
        <span
          class="text-body-1 font-weight-bold detail-title"
          style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap"
        >
          {{ detailHeaderLabel }}
        </span>
        <v-spacer />
        <v-btn
          v-if="selectedNode?.type !== 'course'"
          class="back-to-course-btn"
          size="small"
          variant="tonal"
          @click="selectCourse"
        >
          <v-icon size="18">mdi-arrow-left</v-icon>
          <v-tooltip activator="parent" location="left">Zurück zum Kurs</v-tooltip>
        </v-btn>
      </v-card-title>
      <v-divider />

      <!-- Content -->
      <v-card-text class="pa-3 pa-md-4 detail-content-scroll">
        <!-- Course Panel -->
        <CourseDetailPanel
          :selected-node="selectedNode"
          :questions="questions"
          :root-competencies="rootCompetencies"
          :child-competencies="childCompetencies"
          :questions-with-competency="questionsWithCompetency"
          :readonly="readonly"
          :edit-competency="editCompetency"
        />

        <!-- Competency Panel -->
        <CompetencyDetailPanel
          :selected-node="selectedNode"
          :get-competency="getCompetency"
          :get-competency-color="getCompetencyColor"
          :child-competencies="childCompetencies"
          :readonly="readonly"
          :get-available-prerequisites="getAvailablePrerequisites"
          :questions-with-competency="questionsWithCompetency"
          :save-competency-prerequisites="saveCompetencyPrerequisites"
          :edit-competency="editCompetency"
          :edit-question="editQuestion"
          :delete-competency="deleteCompetency"
          :link-existing-question="linkExistingQuestion"
        />

        <!-- Question Panel -->
        <QuestionDetailPanel
          :selected-node="selectedNode"
          :competencies="competencies"
          :get-competency="getCompetency"
          :get-competency-color="getCompetencyColor"
          :readonly="readonly"
          :remove-competency-from-question="removeCompetencyFromQuestion"
          :add-competency-to-question="addCompetencyToQuestion"
          :edit-question="editQuestion"
          :delete-question="deleteQuestion"
        />
      </v-card-text>
    </v-card>

  </v-col>
</template>

<script setup lang="ts">
import CourseDetailPanel from './competency-graph/CourseDetailPanel.vue'
import CompetencyDetailPanel from './competency-graph/CompetencyDetailPanel.vue'
import QuestionDetailPanel from './competency-graph/QuestionDetailPanel.vue'
import type { Competency, CompetencyPrerequisite, Question } from '@/model/types'
import { competencyGraphPalette } from '@/plugins/vuetify'
import { computed } from 'vue'

interface Props {
  selectedNodeId: string | null
  selectedNode: any
  questions: Question[]
  competencies: Competency[]
  nodeIcon: (type?: string) => string
  rootCompetencies: Competency[]
  readonly?: boolean
  getCompetencyColor: (comp?: Competency) => string
  getCompetency: (id: string) => Competency | undefined
  childCompetencies: (parentId: string) => Competency[]
  getAvailablePrerequisites: (competencyId: string) => Competency[]
  questionsWithCompetency: (compId: string) => Question[]
  removeCompetencyFromQuestion: (questionId: string, compId: string) => void
  addCompetencyToQuestion: (questionId: string, compId: string) => void
  saveCompetencyPrerequisites: (
    competencyId: string,
    prerequisites: CompetencyPrerequisite[]
  ) => Promise<void>
  selectCourse: () => void
  editQuestion: (question?: Question, presetCompetencyId?: string) => void
  editCompetency: (competencyId?: string, presetParentId?: string) => void
  deleteQuestion: (id: string) => void
  deleteCompetency: (id: string) => void
  linkExistingQuestion: (competencyId: string) => void
}

const props = defineProps<Props>()

const detailHeaderLabel = computed(() => {
  return props.selectedNode?.name ?? ''
})

const panelStyles = {
  '--sg-panel-bg': competencyGraphPalette.panelBackground,
  '--sg-panel-border': competencyGraphPalette.panelBorder,
  '--sg-panel-shadow': competencyGraphPalette.panelShadow,
  '--sg-panel-header': competencyGraphPalette.surfaceMuted,
  '--sg-text-primary': competencyGraphPalette.textPrimary,
  '--sg-text-secondary': competencyGraphPalette.textSecondary,
  '--sg-accent': competencyGraphPalette.accent
}
</script>

<style scoped>
.detail-main-card {
  min-height: 0;
  border: 1px solid var(--sg-panel-border);
  background: var(--sg-panel-bg);
  box-shadow: 0 8px 24px var(--sg-panel-shadow);
}

.detail-header {
  background: var(--sg-panel-header);
}

.detail-title {
  color: var(--sg-text-primary);
}

.detail-content-scroll {
  min-height: 0;
  overflow: auto;
  color: var(--sg-text-secondary);
}

.back-to-course-btn :deep(.v-icon) {
  color: var(--sg-accent);
}

</style>
