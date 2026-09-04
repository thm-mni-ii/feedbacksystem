<template>
  <div>
    <v-row>
      <v-col cols="12" md="8">
        <div class="d-flex justify-end mb-2">
          <v-btn-toggle v-model="inputModeValue" color="primary" density="comfortable" mandatory>
            <v-btn value="slider" prepend-icon="mdi-tune">Slider</v-btn>
            <v-btn value="question" prepend-icon="mdi-format-list-checks">Frage</v-btn>
          </v-btn-toggle>
        </div>

        <AlgorithmLabAnswerQuestion
          v-if="inputModeValue === 'question'"
          :current-question="currentQuestion"
          @submit-answer="$emit('submitAnswer', $event)"
        />

        <v-card v-else class="pa-6">
          <div class="mb-4">
            <v-chip color="primary" variant="tonal">
              {{ currentQuestion.targetCompetency.name }}
            </v-chip>
          </div>

          <h2 class="mb-8">
            {{ currentQuestion.question.title || currentQuestion.question.text }}
          </h2>

          <p class="mb-1 text-medium-emphasis">Wie gut konntest du diese Frage beantworten?</p>
          <p class="mb-4 text-caption text-medium-emphasis">
            Demo: Diese Selbsteinschätzung wird als Lernereignis gespeichert. Später ersetzt die
            automatische Aufgabenbewertung sie durch ein echtes Ergebnis.
          </p>
          <div class="d-flex">
            <v-slider
              v-model="sliderScoreValue"
              thumb-color="warning"
              :max="1"
              :min="0"
              :step="0.1"
              thumb-label
            />
            <v-btn color="primary" class="ml-4" @click="$emit('submitAnswer', sliderScoreValue)">
              Antwort speichern
            </v-btn>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <AlgorithmLabProfilePanel
          :groups="hierarchicalProgress"
          :expanded-panel="expandedPanel"
          :score-color="scoreColor"
          :score-label="scoreLabel"
          @update:expanded-panel="$emit('update:expandedPanel', $event)"
        />
      </v-col>
    </v-row>

    <v-alert v-if="showFeedback" class="mt-4" color="success" variant="tonal">
      Antwort gespeichert
    </v-alert>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ProfileGroup } from '@/composables/competencyHierarchy'
import type { NextQuestion } from '@/model/types'
import AlgorithmLabProfilePanel from './AlgorithmLabProfilePanel.vue'
import AlgorithmLabAnswerQuestion from './AlgorithmLabAnswerQuestion.vue'

interface Props {
  currentQuestion: NextQuestion
  sliderScore: number
  expandedPanel: string | null
  hierarchicalProgress: ProfileGroup[]
  showFeedback: boolean
  scoreColor: (score: number, timesAssessed: number) => string
  scoreLabel: (score: number, timesAssessed: number) => string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:sliderScore', value: number): void
  (e: 'update:expandedPanel', value: string | null): void
  (e: 'submitAnswer', value: number): void
}>()

const inputModeValue = ref<'slider' | 'question'>('slider')

const sliderScoreValue = computed({
  get: () => props.sliderScore,
  set: (value) => emit('update:sliderScore', value)
})
</script>
