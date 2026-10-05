<template>
  <v-slide-y-transition appear>
    <v-card class="answer-feedback">
      <div class="answer-feedback__accent" :class="`bg-${outcome.color}`" />

      <v-card-item class="pa-6 pb-4">
        <template #prepend>
          <v-avatar :color="outcome.color" variant="tonal" size="64" class="me-2">
            <v-icon :icon="outcome.icon" size="38" />
          </v-avatar>
        </template>

        <v-card-title class="text-h5 font-weight-bold text-wrap">
          {{ outcome.headline }}
        </v-card-title>
        <v-card-subtitle class="text-body-2 text-wrap opacity-100 text-medium-emphasis">
          {{ outcome.message }}
        </v-card-subtitle>

        <template #append>
          <v-progress-circular
            :model-value="scorePercent"
            :color="outcome.color"
            size="64"
            width="6"
            :aria-label="`Erreichte Punkte: ${scorePercent} Prozent`"
          >
            <span class="text-subtitle-2 font-weight-bold">{{ scorePercent }}%</span>
          </v-progress-circular>
        </template>
      </v-card-item>

      <v-card-text class="px-6 pt-0">
        <v-chip color="primary" variant="tonal" size="small" class="mb-3">
          {{ feedback.competencyName }}
        </v-chip>
        <p v-if="!feedback.solutionParts" class="text-body-1 font-weight-medium mb-4">
          {{ feedback.questionText }}
        </p>

        <v-sheet
          v-if="feedback.solutionParts"
          color="app-surface-muted"
          rounded="lg"
          class="pa-4 mb-4"
        >
          <div class="text-overline text-medium-emphasis mb-1">Lösung</div>
          <p class="text-body-1 answer-feedback__solution">
            <template v-for="(part, index) in feedback.solutionParts" :key="index">
              <span v-if="part.isBlank" class="font-weight-bold text-primary">{{ part.text }}</span>
              <template v-else>{{ part.text }}</template>
            </template>
          </p>
        </v-sheet>

        <div class="text-overline text-medium-emphasis">Auflösung</div>

        <template v-if="feedback.matrix">
          <v-sheet rounded="lg" border class="overflow-x-auto">
            <v-table density="comfortable" class="answer-feedback__matrix">
              <thead>
                <tr>
                  <th />
                  <th
                    v-for="column in feedback.matrix.columns"
                    :key="column.id"
                    class="text-center font-weight-bold"
                  >
                    {{ column.name }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in feedback.matrix.rows"
                  :key="row.id"
                  :class="{ 'answer-feedback__matrix-row--wrong': !row.isCorrect }"
                >
                  <td class="py-3">
                    <div class="d-flex align-center ga-2">
                      <v-icon
                        :icon="row.isCorrect ? 'mdi-check' : 'mdi-close'"
                        :color="row.isCorrect ? 'success' : 'error'"
                        size="small"
                      />
                      <span>{{ row.label }}</span>
                    </div>
                  </td>
                  <td
                    v-for="cell in row.cells"
                    :key="cell.columnId"
                    class="text-center"
                    :title="cellStatus[cell.status].label"
                  >
                    <v-icon
                      v-if="cellStatus[cell.status].icon"
                      :icon="cellStatus[cell.status].icon"
                      :color="cellStatus[cell.status].color"
                      :aria-label="cellStatus[cell.status].label"
                    />
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-sheet>
          <div class="d-flex flex-wrap ga-4 mt-3 text-caption text-medium-emphasis">
            <span
              v-for="status in matrixLegend"
              :key="status"
              class="d-flex align-center ga-1"
            >
              <v-icon
                :icon="cellStatus[status].icon"
                :color="cellStatus[status].color"
                size="small"
              />
              {{ cellStatus[status].label }}
            </span>
          </div>
        </template>

        <v-row v-else-if="feedback.matchingGroups" dense>
          <v-col
            v-for="group in feedback.matchingGroups"
            :key="group.id"
            cols="12"
            :md="feedback.matchingGroups.length > 1 ? 6 : 12"
          >
            <v-sheet rounded="lg" border class="pa-4 h-100">
              <div class="text-subtitle-2 font-weight-bold mb-3">{{ group.label }}</div>
              <div class="d-flex flex-column ga-2">
                <div
                  v-for="item in group.items"
                  :key="item.id"
                  class="answer-feedback__match d-flex align-start ga-2 pa-2 rounded-lg"
                  :class="item.isCorrect ? 'answer-feedback__match--ok' : 'answer-feedback__match--wrong'"
                >
                  <v-icon
                    :icon="item.isCorrect ? 'mdi-check-circle' : 'mdi-close-circle'"
                    :color="item.isCorrect ? 'success' : 'error'"
                    size="small"
                    class="mt-1"
                  />
                  <div>
                    <div class="text-body-2 font-weight-medium">{{ item.label }}</div>
                    <div v-if="!item.isCorrect" class="text-caption text-medium-emphasis">
                      {{
                        item.givenCategoryLabel
                          ? `Du hattest: ${item.givenCategoryLabel}`
                          : 'Nicht zugeordnet'
                      }}
                    </div>
                  </div>
                </div>
              </div>
            </v-sheet>
          </v-col>
        </v-row>

        <v-list v-else density="comfortable" class="py-0" bg-color="transparent">
          <v-list-item
            v-for="item in feedback.items"
            :key="item.id"
            rounded="lg"
            class="mb-1 answer-feedback__item"
            :class="{ 'answer-feedback__item--muted': item.status === 'neutral' }"
          >
            <template #prepend>
              <v-icon
                :icon="itemStatus[item.status].icon"
                :color="itemStatus[item.status].color"
                :class="{ 'text-medium-emphasis': !itemStatus[item.status].color }"
              />
            </template>

            <v-list-item-title class="text-wrap">{{ item.label }}</v-list-item-title>

            <div v-if="item.expectedAnswer !== null" class="text-body-2 mt-1">
              <div v-if="item.status !== 'correct'" class="text-medium-emphasis">
                Deine Antwort:
                <span class="text-decoration-line-through">{{ item.givenAnswer }}</span>
              </div>
              <div>
                Richtig:
                <span class="font-weight-bold text-primary">{{ item.expectedAnswer }}</span>
              </div>
            </div>

            <template v-if="itemStatus[item.status].label" #append>
              <v-chip
                :color="itemStatus[item.status].color"
                variant="tonal"
                size="small"
                class="ms-2"
              >
                {{ itemStatus[item.status].label }}
              </v-chip>
            </template>
          </v-list-item>
        </v-list>
      </v-card-text>

      <v-divider />

      <v-card-actions class="px-6 py-4">
        <v-spacer />
        <v-btn
          ref="continueButton"
          color="primary"
          variant="flat"
          size="large"
          :append-icon="isSessionComplete ? 'mdi-flag-checkered' : 'mdi-arrow-right'"
          @click="$emit('continue')"
        >
          {{ isSessionComplete ? 'Ergebnis ansehen' : 'Weiter' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-slide-y-transition>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import type {
  AnswerFeedback,
  AnswerFeedbackCellStatus,
  AnswerFeedbackItemStatus
} from '@/composables/answerFeedback'

const props = defineProps<{
  feedback: AnswerFeedback
  isSessionComplete: boolean
}>()

defineEmits<{
  (event: 'continue'): void
}>()

const continueButton = ref<{ $el: HTMLElement } | null>(null)

// Rückmeldungen beziehen sich bewusst auf die Aufgabe, nicht auf die Person
// (Kluger & DeNisi 1996; Hattie & Timperley 2007).
const OUTCOMES = {
  correct: {
    color: 'success',
    icon: 'mdi-check-bold',
    headline: 'Richtig gelöst!',
    message: 'Alle Teile der Aufgabe stimmen.'
  },
  partial: {
    color: 'warning',
    icon: 'mdi-progress-check',
    headline: 'Teilweise richtig',
    message: ''
  },
  incorrect: {
    color: 'error',
    icon: 'mdi-close-thick',
    headline: 'Noch nicht richtig',
    message: 'Vergleiche deine Antwort mit der Auflösung unten.'
  }
} as const

const itemStatus: Record<
  AnswerFeedbackItemStatus,
  { icon: string; color: string | undefined; label: string | null }
> = {
  correct: { icon: 'mdi-check-circle', color: 'success', label: 'Richtig' },
  incorrect: { icon: 'mdi-close-circle', color: 'error', label: 'Falsch' },
  missed: { icon: 'mdi-alert-circle', color: 'warning', label: 'Nicht gewählt' },
  partial: { icon: 'mdi-circle-half-full', color: 'warning', label: 'Fast' },
  neutral: { icon: 'mdi-circle-outline', color: undefined, label: null }
}

const cellStatus: Record<
  AnswerFeedbackCellStatus,
  { icon: string | null; color: string | undefined; label: string }
> = {
  correct: { icon: 'mdi-check-circle', color: 'success', label: 'Richtig angekreuzt' },
  incorrect: { icon: 'mdi-close-circle', color: 'error', label: 'Falsch angekreuzt' },
  missed: { icon: 'mdi-check-circle-outline', color: 'warning', label: 'Hätte angekreuzt werden müssen' },
  neutral: { icon: null, color: undefined, label: 'Richtig leer gelassen' }
}

// Legende nur für Symbole, die in dieser Matrix tatsächlich vorkommen.
const matrixLegend = computed(() => {
  const used = new Set(props.feedback.matrix?.rows.flatMap((row) => row.cells.map((c) => c.status)))
  return (['correct', 'incorrect', 'missed'] as const).filter((status) => used.has(status))
})

const scorePercent = computed(() => Math.round(props.feedback.score * 100))

const correctItemCount = computed(
  () =>
    props.feedback.items.filter((item) => item.status === 'correct' || item.status === 'neutral')
      .length
)

const outcome = computed(() => {
  const base = OUTCOMES[props.feedback.outcome]
  if (props.feedback.outcome !== 'partial') return base

  const itemCount = props.feedback.items.length
  const unit = props.feedback.matrix
    ? 'Zeilen'
    : props.feedback.matchingGroups
      ? 'Zuordnungen'
      : props.feedback.solutionParts
        ? 'Lücken'
        : 'Optionen'
  return {
    ...base,
    message:
      itemCount <= 1
        ? 'Knapp daneben. Vergleiche deine Antwort mit der Lösung.'
        : `${correctItemCount.value} von ${itemCount} ${unit} stimmen. Unten siehst du, wo es gehakt hat.`
  }
})

onMounted(async () => {
  await nextTick()
  continueButton.value?.$el.focus()
})
</script>

<style scoped>
.answer-feedback {
  position: relative;
  overflow: hidden;
}

.answer-feedback__accent {
  height: 6px;
}

.answer-feedback__item {
  background: rgb(var(--v-theme-app-surface-muted));
}

.answer-feedback__item--muted {
  opacity: 0.65;
}

.answer-feedback__solution {
  white-space: pre-wrap;
}

.answer-feedback__matrix {
  background: transparent;
}

.answer-feedback__matrix-row--wrong td {
  background: rgba(var(--v-theme-error), 0.05);
}

.answer-feedback__match--ok {
  background: rgba(var(--v-theme-success), 0.08);
}

.answer-feedback__match--wrong {
  background: rgba(var(--v-theme-error), 0.08);
}
</style>
