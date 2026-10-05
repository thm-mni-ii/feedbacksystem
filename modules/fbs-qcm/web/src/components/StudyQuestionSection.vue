<template>
  <v-row justify="center">
    <v-col cols="12" md="10" lg="8">
      <QuestionInteraction
        :current-question="currentQuestion"
        :progress="progress"
        :progress-label="progressLabel"
        @submit-answer="$emit('submitAnswer', $event)"
      />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import QuestionInteraction from '@/components/QuestionInteraction.vue'
import type { NextQuestion } from '@/model/types'

interface AnswerSubmission {
  score: number
  isCorrect: boolean
  responsePayload: unknown
}

defineProps<{
  currentQuestion: NextQuestion
  progress: number
  progressLabel: string
}>()

defineEmits<{
  (event: 'submitAnswer', value: AnswerSubmission): void
}>()
</script>
