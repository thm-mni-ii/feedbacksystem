<template>
  <div class="session-results">
    <header class="text-center mb-8">
      <v-avatar color="success" variant="tonal" size="64" class="mb-4">
        <v-icon icon="mdi-check" size="36" />
      </v-avatar>
      <h1 class="text-h4 mb-2">Lernsession abgeschlossen</h1>
      <p class="text-body-1 text-medium-emphasis">
        Deine Ergebnisse für die {{ sessionCompetencies.length }} geübten Kompetenzen
      </p>
    </header>

    <v-alert
      v-if="completionMessage"
      type="info"
      variant="tonal"
      class="mx-auto mb-6 competency-results"
    >
      {{ completionMessage }}
    </v-alert>

    <section
      v-if="sessionCompetencies.length"
      class="mx-auto competency-results"
      aria-label="Kompetenzergebnisse"
    >
      <v-row>
        <v-col v-for="item in sessionCompetencies" :key="item.competencyId" cols="12" sm="6" md="4">
          <v-card class="competency-card h-100" variant="outlined">
            <v-card-text class="d-flex align-center ga-4 pa-5">
              <v-progress-circular
                :model-value="item.sessionScore * 100"
                :size="76"
                :width="7"
                color="primary"
              >
                <span class="text-subtitle-1 font-weight-bold">
                  {{ Math.round(item.sessionScore * 100) }}%
                </span>
              </v-progress-circular>

              <div class="min-w-0">
                <div class="text-overline text-medium-emphasis">Sessionsergebnis</div>
                <h2 class="text-subtitle-1 font-weight-bold competency-name">
                  {{ item.name }}
                </h2>
                <div class="text-body-2 text-medium-emphasis mt-1">
                  {{ item.questionCount }} Aufgabe{{ item.questionCount === 1 ? '' : 'n' }}
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </section>

    <p v-else class="text-center text-body-2 text-medium-emphasis">
      In dieser Session wurden keine Kompetenzen erfasst.
    </p>

    <div class="text-center">
      <v-btn class="mt-8" color="primary" @click="$emit('restart')">{{ actionLabel }}</v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AnswerRecord, Competency } from '@/model/types'

interface Props {
  competencies: Competency[]
  history: AnswerRecord[]
  completionMessage?: string
  actionLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  completionMessage: '',
  actionLabel: 'Zur Kursübersicht'
})

defineEmits<{
  (e: 'restart'): void
}>()

const sessionCompetencies = computed(() => {
  const scoresByCompetency = new Map<string, number[]>()
  for (const answer of props.history) {
    for (const competencyId of new Set(answer.competencyIds)) {
      const scores = scoresByCompetency.get(competencyId) ?? []
      scores.push(answer.score)
      scoresByCompetency.set(competencyId, scores)
    }
  }

  const competencyById = new Map(
    props.competencies.map((competency) => [competency.id, competency])
  )

  return [...scoresByCompetency]
    .map(([competencyId, scores]) => {
      const competency = competencyById.get(competencyId)
      return {
        competencyId,
        name: competency?.name ?? competencyId,
        questionCount: scores.length,
        sessionScore: scores.reduce((total, score) => total + score, 0) / scores.length
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name))
})
</script>

<style scoped>
.competency-results {
  max-width: 1040px;
}

.competency-card {
  border-color: rgba(var(--v-theme-on-surface), 0.12);
  transition:
    transform 160ms ease,
    box-shadow 160ms ease;
}

.competency-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(var(--v-theme-on-surface), 0.08);
}

.competency-name {
  overflow-wrap: anywhere;
}
</style>
