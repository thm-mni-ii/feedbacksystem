<template>
  <div>
    <v-row>
      <v-col cols="12" md="8">
        <QuestionInteraction
          :current-question="currentQuestion"
          :progress="progress"
          :progress-label="progressLabel"
          @submit-answer="$emit('submitAnswer', $event)"
        />
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
import type { ProfileGroup } from '@/composables/competencyHierarchy'
import type { NextQuestion } from '@/model/types'
import AlgorithmLabProfilePanel from './AlgorithmLabProfilePanel.vue'
import QuestionInteraction from '@/components/QuestionInteraction.vue'

interface Props {
  currentQuestion: NextQuestion
  progress: number
  progressLabel: string
  expandedPanel: string | null
  hierarchicalProgress: ProfileGroup[]
  showFeedback: boolean
  scoreColor: (score: number, timesAssessed: number) => string
  scoreLabel: (score: number, timesAssessed: number) => string
}

defineProps<Props>()
defineEmits<{
  (e: 'update:expandedPanel', value: string | null): void
  (
    e: 'submitAnswer',
    value: { score: number; isCorrect: boolean; responsePayload: unknown }
  ): void
}>()
</script>
