<template>
  <div
    v-if="
      selectedNode?.type?.startsWith('competency-root') ||
      selectedNode?.type?.startsWith('competency-sub')
    "
    class="competency-panel"
  >
    <v-card variant="flat" class="mb-4 section-card" :style="sectionCardStyle">
      <v-card-text class="pa-4">
        <p class="text-overline mb-1 section-label">Kompetenz</p>
        <h3 class="text-h6 font-weight-bold mb-0 competency-title">
          {{ selectedNode.data.name }}
        </h3>
      </v-card-text>
    </v-card>

    <!-- Competency area (for root level) -->
    <template v-if="selectedNode.type?.startsWith('competency-root')">
      <v-card variant="flat" class="mb-4 section-card" :style="sectionCardStyle">
        <v-card-text class="pa-4">
          <p class="text-overline mb-2 section-label">Kompetenzbereich</p>
          <v-chip size="small" :color="getCompetencyColor(selectedNode.data)" variant="tonal">
            {{ selectedNode.data.category || 'Ohne Kompetenzbereich' }}
          </v-chip>
        </v-card-text>
      </v-card>
    </template>

    <!-- Parent Competency (for sub level) -->
    <template v-if="selectedNode.type?.startsWith('competency-sub') && selectedNode.data.parentId">
      <v-card variant="flat" class="mb-4 section-card" :style="sectionCardStyle">
        <v-card-text class="pa-4">
          <p class="text-overline mb-2 section-label">Parent-Kompetenz</p>
          <v-chip
            size="small"
            :color="getCompetencyColor(getCompetency(selectedNode.data.parentId))"
            variant="tonal"
          >
            {{ getCompetency(selectedNode.data.parentId)?.name }}
          </v-chip>
        </v-card-text>
      </v-card>
    </template>

    <!-- Description (for sub level) -->
    <template
      v-if="selectedNode.type?.startsWith('competency-sub') && selectedNode.data.description"
    >
      <v-card variant="flat" class="mb-4 section-card" :style="sectionCardStyle">
        <v-card-text class="pa-4">
          <p class="text-overline mb-2 section-label">Beschreibung</p>
          <p class="text-body-2 description-text mb-0">{{ selectedNode.data.description }}</p>
        </v-card-text>
      </v-card>
    </template>

    <!-- Sub-Competencies (for root level) -->
    <template v-if="selectedNode.type?.startsWith('competency-root')">
      <v-card variant="flat" class="mb-4 section-card" :style="sectionCardStyle">
        <v-card-text class="pa-4">
          <div class="d-flex align-center justify-space-between mb-2">
            <p class="text-overline section-label mb-0">Sub-Kompetenzen</p>
            <v-chip size="x-small" variant="tonal">{{
              childCompetencies(selectedNode.data.id).length
            }}</v-chip>
          </div>

          <v-list
            v-if="childCompetencies(selectedNode.data.id).length"
            density="comfortable"
            class="pa-0"
          >
            <v-list-item
              v-for="cc in childCompetencies(selectedNode.data.id)"
              :key="cc.id"
              rounded="lg"
              class="mb-2 sub-competency-item"
              :style="{ borderLeftColor: getCompetencyColor(cc) }"
            >
              <template #prepend>
                <v-icon size="16" :color="getCompetencyColor(cc)">mdi-circle-small</v-icon>
              </template>
              <v-list-item-title class="text-body-2">{{ cc.name }}</v-list-item-title>
            </v-list-item>
          </v-list>

          <p v-else class="text-body-2 text-medium-emphasis mb-0">Keine</p>
        </v-card-text>
      </v-card>
    </template>

    <!-- Questions -->
    <v-card variant="flat" class="section-card" :style="sectionCardStyle">
      <v-card-text class="pa-4">
        <div class="d-flex align-center justify-space-between mb-2">
          <p class="text-overline section-label mb-0">Fragen</p>
          <v-chip size="x-small" variant="tonal">
            {{ questionsWithCompetency(selectedNode.data.id).length }}
          </v-chip>
        </div>

        <v-list density="comfortable" class="pa-0">
          <v-list-item
            v-for="q in questionsWithCompetency(selectedNode.data.id)"
            :key="q.id"
            :title="q.text"
            prepend-icon="mdi-help-circle-outline"
            rounded="lg"
            class="mb-2"
            :style="questionItemStyle"
          />
        </v-list>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Competency, Question } from '@/model/types'
import { skillGraphPalette } from '@/plugins/vuetify'

interface Props {
  selectedNode: any
  getCompetency: (id: string) => Competency | undefined
  getCompetencyColor: (comp?: Competency) => string
  childCompetencies: (parentId: string) => Competency[]
  questionsWithCompetency: (compId: string) => Question[]
}

defineProps<Props>()

const sectionCardStyle = computed(() => ({
  backgroundColor: skillGraphPalette.surface,
  border: `1px solid ${skillGraphPalette.panelBorder}`
}))

const questionItemStyle = computed(() => ({
  backgroundColor: skillGraphPalette.surface,
  border: `1px solid ${skillGraphPalette.panelBorder}`
}))
</script>

<style scoped>
.competency-title {
  color: v-bind('skillGraphPalette.textPrimary');
  line-height: 1.25;
}

.section-label {
  color: v-bind('skillGraphPalette.textSecondary');
  letter-spacing: 0.08em;
}

.description-text {
  color: v-bind('skillGraphPalette.textPrimary');
}

.sub-competency-item {
  border-left: 4px solid transparent;
  background: v-bind('skillGraphPalette.surfaceMuted');
}
</style>
