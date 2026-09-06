<template>
  <div v-if="selectedNode?.type === 'question'" class="question-panel">
    <v-card class="profile-card" elevation="0" rounded="lg" :style="panelStyles">
      <v-card-text class="pa-4">
        <div class="d-flex align-start justify-space-between ga-3 mb-4 flex-wrap">
          <div class="min-w-0">
            <p class="mb-1 text-caption text-medium-emphasis">Fragendetails</p>
            <h3 class="text-body-1 font-weight-bold">{{ selectedQuestion?.text }}</h3>
          </div>
          <v-chip size="small" variant="flat" class="summary-chip">
            {{ selectedQuestion?.competencyIds.length ?? 0 }} Kompetenzen
          </v-chip>
        </div>

        <v-row class="mb-4">
          <v-col cols="6" md="6">
            <div class="overview-tile">
              <div class="text-caption text-medium-emphasis mb-1">Schwierigkeit</div>
              <v-progress-linear
                :model-value="(selectedQuestion?.difficulty ?? 0) * 100"
                height="8"
                rounded
                color="var(--sg-accent)"
                class="mb-1"
              />
              <div class="text-caption text-medium-emphasis">
                {{ difficultyLabel }}
              </div>
            </div>
          </v-col>

          <v-col cols="6" md="6">
            <div class="overview-tile">
              <div class="text-caption text-medium-emphasis mb-1">Kompetenzen</div>
              <div class="text-h6">{{ selectedQuestion?.competencyIds.length ?? 0 }}</div>
            </div>
          </v-col>
        </v-row>

        <div class="info-block mb-4">
          <div class="d-flex align-center justify-space-between mb-2">
            <div class="info-block-label mb-0">
              <v-icon size="16" color="var(--sg-accent)">mdi-brain</v-icon>
              <span>Kompetenzen dieser Frage</span>
            </div>
          </div>

          <div class="d-flex flex-wrap ga-1">
            <v-chip
              v-for="compId in selectedQuestion?.competencyIds"
              :key="compId"
              size="small"
              :color="getCompetencyColor(getCompetency(compId))"
              variant="tonal"
              closable
              @click:close="removeCompetencyFromQuestion(selectedQuestion!.id, compId)"
            >
              {{ getCompetency(compId)?.name ?? compId }}
            </v-chip>

            <v-menu v-model="isAddingCompetency">
              <template #activator="{ props: activatorProps }">
                <v-chip
                  size="small"
                  variant="outlined"
                  prepend-icon="mdi-plus"
                  v-bind="activatorProps"
                >
                  Kompetenz hinzufügen
                </v-chip>
              </template>

              <v-list density="compact">
                <v-list-item
                  v-for="competency in availableCompetencies"
                  :key="competency.id"
                  @click="handleAddCompetency(competency.id)"
                >
                  <v-list-item-title>{{ competency.name }}</v-list-item-title>
                </v-list-item>
                <v-list-item v-if="availableCompetencies.length === 0" disabled>
                  <v-list-item-title class="text-medium-emphasis">
                    Keine weiteren Kompetenzen verfügbar
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>
        </div>

        <div class="d-flex ga-2">
          <v-btn
            size="small"
            variant="tonal"
            color="primary"
            prepend-icon="mdi-pencil-outline"
            class="flex-1-1"
            @click="editQuestion(selectedQuestion)"
          >
            Bearbeiten
          </v-btn>
          <v-btn
            size="small"
            variant="tonal"
            color="error"
            prepend-icon="mdi-delete-outline"
            @click="deleteQuestion(selectedQuestion!.id)"
          >
            Löschen
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Competency, Question } from '@/model/types'
import { skillGraphPalette } from '@/plugins/vuetify'

interface Props {
  selectedNode: any
  competencies: Competency[]
  getCompetency: (id: string) => Competency | undefined
  getCompetencyColor: (comp?: Competency) => string
  removeCompetencyFromQuestion: (questionId: string, compId: string) => void
  addCompetencyToQuestion: (questionId: string, compId: string) => void
  editQuestion: (question: Question) => void
  deleteQuestion: (id: string) => void
}

const props = defineProps<Props>()

const isAddingCompetency = ref(false)

const selectedQuestion = computed(() => props.selectedNode?.data as Question | undefined)

const availableCompetencies = computed(() => {
  const assigned = new Set(selectedQuestion.value?.competencyIds ?? [])
  return props.competencies.filter((competency) => !assigned.has(competency.id))
})

const difficultyLabel = computed(() => {
  const difficulty = selectedQuestion.value?.difficulty ?? 0
  if (difficulty < 0.34) return 'Leicht'
  if (difficulty < 0.67) return 'Mittel'
  return 'Schwer'
})

function handleAddCompetency(competencyId: string) {
  if (!selectedQuestion.value) return
  props.addCompetencyToQuestion(selectedQuestion.value.id, competencyId)
  isAddingCompetency.value = false
}

const panelStyles = {
  '--sg-surface': skillGraphPalette.surface,
  '--sg-surface-muted': skillGraphPalette.surfaceMuted,
  '--sg-border': skillGraphPalette.panelBorder,
  '--sg-shadow': skillGraphPalette.panelShadow,
  '--sg-text-primary': skillGraphPalette.textPrimary,
  '--sg-text-secondary': skillGraphPalette.textSecondary,
  '--sg-accent': skillGraphPalette.accent
}
</script>

<style scoped>
.question-panel {
  color: var(--sg-text-primary);
}

.profile-card {
  background: linear-gradient(180deg, var(--sg-surface) 0%, var(--sg-surface-muted) 100%);
  border: 1px solid var(--sg-border);
  box-shadow: 0 8px 22px var(--sg-shadow);
}

.summary-chip {
  color: var(--sg-surface);
  background: var(--sg-accent);
}

.overview-tile {
  height: 100%;
  border: 1px solid var(--sg-border);
  border-radius: 14px;
  padding: 12px;
  background: color-mix(in srgb, var(--sg-surface-muted) 72%, white 28%);
}

.info-block {
  border: 1px solid var(--sg-border);
  border-radius: 12px;
  padding: 10px 12px;
  background: color-mix(in srgb, var(--sg-surface-muted) 75%, white 25%);
}

.info-block-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--sg-text-secondary);
}
</style>
