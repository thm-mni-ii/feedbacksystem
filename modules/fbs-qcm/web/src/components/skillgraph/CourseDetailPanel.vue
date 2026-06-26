<template>
  <div v-if="selectedNode?.type === 'course'" class="course-panel">
    <p class="text-body-2 text-medium-emphasis mb-4">
      {{ selectedNode.data.description }}
    </p>

    <!-- Competencies by Category -->
    <div v-for="category in getCategories()" :key="category" class="mb-3">
      <v-card variant="tonal">
        <v-card-title class="text-subtitle-2 text-capitalize">
          {{ category || 'Ohne Kategorie' }}
        </v-card-title>
        <v-card-text>
          <v-chip
            v-for="comp in competenciesByCategory(category)"
            :key="comp.id"
            size="small"
            :color="getCompetencyColor(comp)"
            variant="tonal"
            class="ma-1"
          >
            {{ comp.name }}
          </v-chip>
        </v-card-text>
      </v-card>
    </div>

    <v-card variant="outlined" class="mt-3">
      <v-card-text class="d-flex justify-space-between align-center">
        <div>
          <div class="text-caption text-medium-emphasis">Fragen</div>
          <div class="text-h6">{{ questions.length }}</div>
        </div>
        <v-icon color="primary">mdi-help-circle-outline</v-icon>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import type { Competency, Question } from '@/model/types'

interface Props {
  selectedNode: any
  questions: Question[]
  getCategories: () => string[]
  competenciesByCategory: (category: string) => Competency[]
  getCompetencyColor: (comp?: Competency) => string
}

defineProps<Props>()
</script>

<style scoped></style>
