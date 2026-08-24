<template>
  <v-card class="mt-6 pa-5 realtime-card">
    <div class="d-flex flex-column flex-md-row justify-space-between ga-3 mb-4">
      <div>
        <p class="text-overline text-primary mb-1">Algorithmus in Echtzeit</p>
        <h3 class="text-h6 mb-1">Kurz erklärt: Was jetzt passiert</h3>
        <p class="text-body-2 text-medium-emphasis mb-0">
          Bewege den Slider und vergleiche direkt, wie sich der Schwerpunkt des Algorithmus
          verändert.
        </p>
      </div>

      <div class="d-flex ga-2 flex-wrap">
        <v-chip color="primary" variant="flat" size="small">
          Schwerpunkt: {{ insight.targetCompetencyLabel }}
        </v-chip>
        <v-chip color="secondary" variant="tonal" size="small">
          {{ formatPercent(insight.targetCompetencyScore) }}
        </v-chip>
        <v-chip color="secondary" variant="tonal" size="small">
          {{ insight.targetTimesAssessed }} Bewertungen
        </v-chip>
      </div>
    </div>

    <v-row>
      <v-col cols="12" md="5">
        <v-sheet class="pa-4 info-panel h-100" rounded="xl">
          <div class="text-subtitle-2 mb-3">Jetzt gerade</div>

          <div class="compact-point">
            <div class="compact-point__title">1. Aktueller Schritt</div>
            <p class="text-body-2 mb-0">{{ insight.currentAction }}</p>
          </div>

          <div class="compact-point">
            <div class="compact-point__title">2. Warum diese Frage?</div>
            <p class="text-body-2 mb-0">{{ insight.selectionReason }}</p>
          </div>

          <div class="compact-point">
            <div class="compact-point__title">3. Welche Fragen passen als Nächstes?</div>
            <p class="text-body-2 mb-1">{{ insight.difficultySummary }}</p>
            <p class="text-body-2 text-medium-emphasis mb-0">{{ insight.recentQuestionSummary }}</p>
          </div>

          <div class="compact-point mb-0">
            <div class="compact-point__title">Diese Frage bewertet</div>
            <div class="d-flex flex-wrap ga-2">
              <v-chip
                v-for="competency in insight.linkedCompetencies"
                :key="competency.competencyId"
                :color="competency.isTarget ? 'primary' : 'secondary'"
                :variant="competency.isTarget ? 'flat' : 'tonal'"
                size="small"
              >
                {{ competency.label }}
              </v-chip>
            </div>
          </div>
        </v-sheet>
      </v-col>

      <v-col cols="12" md="7">
        <v-sheet class="pa-4 info-panel h-100" rounded="xl">
          <div class="d-flex align-center justify-space-between ga-3 mb-3 flex-wrap">
            <div>
              <div class="text-subtitle-2">Wenn du antwortest</div>
              <p class="text-body-2 text-medium-emphasis mb-0">
                Drei kompakte Vorschauen für die nächste Auswahl.
              </p>
            </div>
            <v-chip color="primary" variant="tonal" size="small">
              {{ insight.completionSummary }}
            </v-chip>
          </div>

          <div class="d-flex flex-column ga-3">
            <div
              v-for="preview in insight.answerPreviews"
              :key="preview.id"
              class="preview-row"
              :class="`preview-row--${preview.id}`"
            >
              <div class="d-flex align-center justify-space-between ga-3 flex-wrap mb-2">
                <div>
                  <div class="text-body-1 font-weight-medium">{{ preview.label }}</div>
                  <div class="text-caption text-medium-emphasis">{{ preview.helperText }}</div>
                </div>
                <div class="d-flex ga-2 flex-wrap">
                  <v-chip :color="previewColor(preview.id)" variant="flat" size="small">
                    {{ formatPercent(preview.score) }}
                  </v-chip>
                  <v-chip color="secondary" variant="tonal" size="small">
                    danach {{ formatPercent(preview.targetAfterScore) }}
                  </v-chip>
                </div>
              </div>

              <p class="text-body-2 mb-1">{{ preview.selectionEffect }}</p>
              <p class="text-caption text-medium-emphasis mb-2">{{ preview.difficultyEffect }}</p>

              <div class="d-flex align-center justify-space-between ga-3 flex-wrap">
                <v-chip
                  :color="previewScoreChange(preview) >= 0 ? 'success' : 'error'"
                  variant="tonal"
                  size="small"
                >
                  Schätzung {{ formatPercent(previewTargetBeforeScore(preview)) }} →
                  {{ formatPercent(preview.targetAfterScore) }}
                </v-chip>

                <div
                  v-if="preview.unlockedCompetencies.length > 0"
                  class="d-flex align-center ga-2 flex-wrap"
                >
                  <span class="text-caption text-medium-emphasis">Neu dabei:</span>
                  <v-chip
                    v-for="competency in preview.unlockedCompetencies"
                    :key="competency"
                    color="success"
                    variant="tonal"
                    size="x-small"
                  >
                    {{ competency }}
                  </v-chip>
                </div>
              </div>
            </div>
          </div>
        </v-sheet>
      </v-col>
    </v-row>

    <div class="mt-4">
      <v-alert variant="tonal" color="info" density="comfortable">
        <div class="text-body-2">
          <strong>Voraussetzungen:</strong> {{ insight.prerequisiteSummary }}
        </div>
      </v-alert>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import type { AlgorithmLabRealtimeInsight } from '@/composables/useAlgorithmLabView'

interface Props {
  insight: AlgorithmLabRealtimeInsight
}

defineProps<Props>()

function formatPercent(score: number): string {
  return `${Math.round(score * 100)}%`
}

function previewColor(previewId: string): string {
  if (previewId === 'low') return 'warning'
  if (previewId === 'high') return 'success'
  return 'primary'
}

function previewTargetBeforeScore(
  preview: AlgorithmLabRealtimeInsight['answerPreviews'][number]
): number {
  return preview.competencyChanges.find((change) => change.isTarget)!.beforeScore
}

function previewScoreChange(
  preview: AlgorithmLabRealtimeInsight['answerPreviews'][number]
): number {
  return preview.targetAfterScore - previewTargetBeforeScore(preview)
}
</script>

<style scoped>
.realtime-card {
  background: linear-gradient(
    180deg,
    rgba(var(--v-theme-surface), 1) 0%,
    rgba(var(--v-theme-primary), 0.03) 100%
  );
}

.info-panel,
.preview-row {
  border: 1px solid rgba(var(--v-theme-app-text-primary), 0.08);
  background: rgba(var(--v-theme-surface), 0.9);
}

.compact-point {
  margin-bottom: 16px;
}

.compact-point__title {
  margin-bottom: 4px;
  font-size: 0.85rem;
  font-weight: 600;
  color: rgba(var(--v-theme-app-text-primary), 0.7);
}

.preview-row {
  padding: 12px 14px;
  border-radius: 16px;
}

.preview-row--low {
  border-color: rgba(var(--v-theme-warning), 0.25);
}

.preview-row--current {
  border-color: rgba(var(--v-theme-primary), 0.25);
}

.preview-row--high {
  border-color: rgba(var(--v-theme-success), 0.25);
}
</style>
