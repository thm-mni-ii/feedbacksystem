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
          :get-competency-color="getCompetencyColor"
        />

        <!-- Competency Panel -->
        <CompetencyDetailPanel
          :selected-node="selectedNode"
          :get-competency="getCompetency"
          :get-competency-color="getCompetencyColor"
          :child-competencies="childCompetencies"
          :get-available-prerequisites="getAvailablePrerequisites"
          :questions-with-competency="questionsWithCompetency"
          :save-competency-prerequisites="saveCompetencyPrerequisites"
        />

        <!-- Question Panel -->
        <QuestionDetailPanel
          :selected-node="selectedNode"
          :get-competency="getCompetency"
          :get-competency-color="getCompetencyColor"
          :remove-competency-from-question="removeCompetencyFromQuestion"
          :edit-question="editQuestion"
          :delete-question="deleteQuestion"
        />
      </v-card-text>
    </v-card>

    <!-- Action Menu -->
    <v-card class="mt-3 action-card" elevation="0" rounded="lg">
      <v-card-text>
        <v-menu>
          <template #activator="{ props: activatorProps }">
            <v-btn block color="app-graph-primary" prepend-icon="mdi-plus" v-bind="activatorProps">
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
</template>

<script setup lang="ts">
import CourseDetailPanel from './skillgraph/CourseDetailPanel.vue'
import CompetencyDetailPanel from './skillgraph/CompetencyDetailPanel.vue'
import QuestionDetailPanel from './skillgraph/QuestionDetailPanel.vue'
import type { Competency, CompetencyPrerequisite, Question } from '@/model/types'
import { skillGraphPalette } from '@/plugins/vuetify'
import { computed } from 'vue'

interface Props {
  selectedNodeId: string | null
  selectedNode: any
  questions: Question[]
  nodeIcon: (type?: string) => string
  rootCompetencies: Competency[]
  getCompetencyColor: (comp?: Competency) => string
  getCompetency: (id: string) => Competency | undefined
  childCompetencies: (parentId: string) => Competency[]
  getAvailablePrerequisites: (competencyId: string) => Competency[]
  questionsWithCompetency: (compId: string) => Question[]
  removeCompetencyFromQuestion: (questionId: string, compId: string) => void
  saveCompetencyPrerequisites: (
    competencyId: string,
    prerequisites: CompetencyPrerequisite[]
  ) => Promise<void>
  selectCourse: () => void
  editQuestion: (question?: Question) => void
  deleteQuestion: (id: string) => void
}

const props = defineProps<Props>()

const detailHeaderLabel = computed(() => {
  return props.selectedNode?.name ?? ''
})

const panelStyles = {
  '--sg-panel-bg': skillGraphPalette.panelBackground,
  '--sg-panel-border': skillGraphPalette.panelBorder,
  '--sg-panel-shadow': skillGraphPalette.panelShadow,
  '--sg-panel-header': skillGraphPalette.surfaceMuted,
  '--sg-text-primary': skillGraphPalette.textPrimary,
  '--sg-text-secondary': skillGraphPalette.textSecondary,
  '--sg-accent': skillGraphPalette.accent
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

.action-card {
  border: 1px solid var(--sg-panel-border);
  background: var(--sg-panel-bg);
  box-shadow: 0 8px 24px var(--sg-panel-shadow);
}
</style>
