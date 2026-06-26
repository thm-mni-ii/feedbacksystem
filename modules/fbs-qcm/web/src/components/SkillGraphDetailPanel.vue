<template>
  <v-col v-if="selectedNodeId" cols="12" md="4">
    <v-card elevation="1" rounded="lg">
      <!-- Header -->
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

      <!-- Content -->
      <v-card-text class="pa-3">
        <!-- Course Panel -->
        <CourseDetailPanel
          :selected-node="selectedNode"
          :questions="questions"
          :get-categories="getCategories"
          :competencies-by-category="competenciesByCategory"
          :get-competency-color="getCompetencyColor"
        />

        <!-- Competency Panel -->
        <CompetencyDetailPanel
          :selected-node="selectedNode"
          :get-competency="getCompetency"
          :get-competency-color="getCompetencyColor"
          :child-competencies="childCompetencies"
          :questions-with-competency="questionsWithCompetency"
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
    <v-card class="mt-3" elevation="1">
      <v-card-text>
        <v-menu>
          <template #activator="{ props }">
            <v-btn block color="primary" prepend-icon="mdi-plus" v-bind="props">
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
import { computed } from 'vue'
import CourseDetailPanel from './CourseDetailPanel.vue'
import CompetencyDetailPanel from './CompetencyDetailPanel.vue'
import QuestionDetailPanel from './QuestionDetailPanel.vue'
import type { Competency, Question } from '@/model/types'

interface Props {
  selectedNodeId: string | null
  selectedNode: any
  questions: Question[]
  nodeIcon: (type?: string) => string
  getCategories: () => string[]
  competenciesByCategory: (category: string) => Competency[]
  getCompetencyColor: (comp?: Competency) => string
  getCompetency: (id: string) => Competency | undefined
  childCompetencies: (parentId: string) => Competency[]
  questionsWithCompetency: (compId: string) => Question[]
  removeCompetencyFromQuestion: (questionId: string, compId: string) => void
  editQuestion: (question?: Question) => void
  deleteQuestion: (id: string) => void
}

defineProps<Props>()
</script>

<style scoped></style>
