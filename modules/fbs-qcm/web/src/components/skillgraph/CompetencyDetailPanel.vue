<template>
  <div v-if="selectedNode?.type?.startsWith('competency-root') || selectedNode?.type?.startsWith('competency-sub')">
    <!-- Competency Name -->
    <code
      class="text-caption d-block pa-2 rounded mb-3"
      style="background: rgba(0, 0, 0, 0.05)"
    >
      {{ selectedNode.data.name }}
    </code>

    <!-- Category (for root level) -->
    <template v-if="selectedNode.type?.startsWith('competency-root')">
      <div class="text-caption font-weight-bold text-uppercase mb-1">
        {{ selectedNode.data.category ? 'Kategorie' : 'Keine Kategorie' }}
      </div>
      <v-chip size="x-small" color="blue" variant="tonal" class="mb-3">
        {{ selectedNode.data.category || 'Uncategorized' }}
      </v-chip>
    </template>

    <!-- Parent Competency (for sub level) -->
    <template v-if="selectedNode.type?.startsWith('competency-sub') && selectedNode.data.parentId">
      <div class="text-caption font-weight-bold text-uppercase mb-1">
        Parent-Kompetenz
      </div>
      <v-chip
        size="x-small"
        :color="getCompetencyColor(getCompetency(selectedNode.data.parentId))"
        variant="tonal"
        class="mb-3"
      >
        {{ getCompetency(selectedNode.data.parentId)?.name }}
      </v-chip>
    </template>

    <!-- Description (for sub level) -->
    <template v-if="selectedNode.type?.startsWith('competency-sub') && selectedNode.data.description">
      <div class="text-caption font-weight-bold text-uppercase mb-1">Beschreibung</div>
      <p class="text-caption text-medium-emphasis mb-3">
        {{ selectedNode.data.description }}
      </p>
    </template>

    <!-- Sub-Competencies (for root level) -->
    <template v-if="selectedNode.type?.startsWith('competency-root')">
      <div class="text-caption font-weight-bold text-uppercase mb-1">
        Sub-Kompetenzen ({{ childCompetencies(selectedNode.data.id).length }})
      </div>
      <div
        v-if="childCompetencies(selectedNode.data.id).length"
        class="d-flex flex-wrap gap-1 mb-3"
      >
        <v-chip
          v-for="cc in childCompetencies(selectedNode.data.id)"
          :key="cc.id"
          size="x-small"
          :color="getCompetencyColor(cc)"
          variant="outlined"
        >
          {{ cc.name }}
        </v-chip>
      </div>
      <p v-else class="text-caption text-medium-emphasis mb-3">Keine</p>
    </template>

    <!-- Questions -->
    <div class="text-caption font-weight-bold text-uppercase mb-1">
      Fragen ({{ questionsWithCompetency(selectedNode.data.id).length }})
    </div>
    <v-list density="compact" class="pa-0">
      <v-list-item
        v-for="q in questionsWithCompetency(selectedNode.data.id)"
        :key="q.id"
        :title="q.text"
        prepend-icon="mdi-help-circle-outline"
        rounded="lg"
        class="mb-1"
        style="background: rgba(0, 0, 0, 0.03)"
      />
    </v-list>
  </div>
</template>

<script setup lang="ts">
import type { Competency, Question } from '@/model/types'

interface Props {
  selectedNode: any
  getCompetency: (id: string) => Competency | undefined
  getCompetencyColor: (comp?: Competency) => string
  childCompetencies: (parentId: string) => Competency[]
  questionsWithCompetency: (compId: string) => Question[]
}

defineProps<Props>()
</script>

<style scoped></style>
