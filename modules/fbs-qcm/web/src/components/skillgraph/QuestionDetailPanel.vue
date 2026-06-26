<template>
  <div v-if="selectedNode?.type === 'question'" class="question-panel">
    <!-- Question Text -->
    <p class="text-body-2 mb-3">{{ selectedNode.data.text }}</p>

    <!-- Competencies -->
    <div class="text-caption font-weight-bold text-uppercase mb-1">
      Kompetenzen ({{ selectedNode.data.competencyIds.length }})
    </div>
    <div class="d-flex flex-wrap gap-1 mb-4">
      <v-chip
        v-for="compId in selectedNode.data.competencyIds"
        :key="compId"
        size="x-small"
        :color="getCompetencyColor(getCompetency(compId))"
        variant="tonal"
        closable
        @click:close="removeCompetencyFromQuestion(selectedNode.data.id, compId)"
      >
        {{ getCompetency(compId)?.name }}
      </v-chip>
      <v-chip size="x-small" variant="outlined" prepend-icon="mdi-plus">
        Kompetenz hinzufügen
      </v-chip>
    </div>

    <!-- Difficulty -->
    <div class="text-caption font-weight-bold text-uppercase mb-1">Schwierigkeit</div>
    <v-progress-linear
      :model-value="selectedNode.data.difficulty * 100"
      class="mb-3"
    />

    <!-- Actions -->
    <div class="d-flex gap-2">
      <v-btn
        size="small"
        variant="tonal"
        prepend-icon="mdi-pencil"
        class="flex-1-1"
        @click="editQuestion(selectedNode.data)"
      >
        Bearbeiten
      </v-btn>
      <v-btn
        size="small"
        variant="tonal"
        color="error"
        prepend-icon="mdi-delete-outline"
        @click="deleteQuestion(selectedNode.data.id)"
      >
        Löschen
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Competency, Question } from '@/model/types'

interface Props {
  selectedNode: any
  getCompetency: (id: string) => Competency | undefined
  getCompetencyColor: (comp?: Competency) => string
  removeCompetencyFromQuestion: (questionId: string, compId: string) => void
  editQuestion: (question: Question) => void
  deleteQuestion: (id: string) => void
}

defineProps<Props>()
</script>

<style scoped></style>
