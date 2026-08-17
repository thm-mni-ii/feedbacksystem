<template>
  <v-container class="pa-6">
    <div class="algorithm-lab-main">
      <AlgorithmLabStartScreen v-if="!store.session" @start="store.startSession()" />

      <AlgorithmLabQuestionSection
        v-else-if="store.currentQuestion && !store.isComplete"
        :current-question="store.currentQuestion"
        :slider-score="sliderScore"
        :expanded-panel="expandedPanel"
        :hierarchical-progress="hierarchicalProgress"
        :show-feedback="showFeedback"
        :score-color="scoreColor"
        :score-label="scoreLabel"
        @update:slider-score="sliderScore = $event"
        @update:expanded-panel="expandedPanel = $event"
        @submit-answer="submitAnswer"
      />

      <AlgorithmLabNoQuestions
        v-else-if="store.session && !store.currentQuestion && !store.isComplete"
        @restart="store.resetSession()"
      />

      <AlgorithmLabResults
        v-else
        :progress="store.progress"
        :history-count="store.historyCount"
        @restart="store.resetSession()"
      />
    </div>
  </v-container>
</template>

<script setup lang="ts">
import AlgorithmLabStartScreen from '@/components/algorithm-lab/AlgorithmLabStartScreen.vue'
import AlgorithmLabQuestionSection from '@/components/algorithm-lab/AlgorithmLabQuestionSection.vue'
import AlgorithmLabNoQuestions from '@/components/algorithm-lab/AlgorithmLabNoQuestions.vue'
import AlgorithmLabResults from '@/components/algorithm-lab/AlgorithmLabResults.vue'
import { useAlgorithmLabView } from '@/composables/useAlgorithmLabView'

const {
  store,
  sliderScore,
  expandedPanel,
  showFeedback,
  hierarchicalProgress,
  scoreColor,
  scoreLabel,
  submitAnswer
} = useAlgorithmLabView()
</script>
