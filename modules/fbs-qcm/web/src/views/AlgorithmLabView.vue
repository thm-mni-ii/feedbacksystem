<template>
  <v-container class="pa-6">
    <div class="algorithm-lab-main">
      <v-alert type="info" variant="tonal" density="comfortable" class="mb-4">
        Testmodus für Dozent:innen – simuliert Algorithmus und Fragenpool, wirkt sich nicht auf
        echte Studierenden-Daten aus.
      </v-alert>

      <v-alert
        v-if="store.studyContentLoadError"
        type="error"
        variant="tonal"
        class="mb-4"
      >
        {{ store.studyContentLoadError }}
      </v-alert>

      <AlgorithmLabStartScreen
        v-if="!store.session"
        :sessions="store.savedSessions"
        :loading="store.isLoadingStudyContent || store.isLoadingSavedSessions"
        @start="startSession"
        @resume="resumeSession"
      />

      <template v-else-if="store.currentQuestion && !store.isComplete">
        <AlgorithmLabQuestionSection
          :current-question="store.currentQuestion"
          :progress="store.sessionProgress"
          :progress-label="store.sessionProgressLabel"
          :expanded-panel="expandedPanel"
          :hierarchical-progress="hierarchicalProgress"
          :show-feedback="showFeedback"
          :score-color="scoreColor"
          :score-label="scoreLabel"
          @update:expanded-panel="expandedPanel = $event"
          @submit-answer="submitAnswer"
        />

        <!-- <AlgorithmLabRealtimeExplanation v-if="algorithmInsight" :insight="algorithmInsight" /> -->
      </template>

      <AlgorithmLabNoQuestions
        v-else-if="store.session && !store.currentQuestion && !store.isComplete"
        @restart="store.resetSession()"
      />

      <AlgorithmLabResults
        v-else
        :competencies="store.competencies"
        :progress="store.progress"
        :history-count="store.historyCount"
        @restart="store.resetSession()"
      />
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import AlgorithmLabStartScreen from '@/components/algorithm-lab/AlgorithmLabStartScreen.vue'
import AlgorithmLabQuestionSection from '@/components/algorithm-lab/AlgorithmLabQuestionSection.vue'
// import AlgorithmLabRealtimeExplanation from '@/components/algorithm-lab/AlgorithmLabRealtimeExplanation.vue'
import AlgorithmLabNoQuestions from '@/components/algorithm-lab/AlgorithmLabNoQuestions.vue'
import AlgorithmLabResults from '@/components/algorithm-lab/AlgorithmLabResults.vue'
import { useAlgorithmLabView } from '@/composables/useAlgorithmLabView'

const {
  store,
  expandedPanel,
  showFeedback,
  hierarchicalProgress,
  scoreColor,
  scoreLabel,
  submitAnswer
} = useAlgorithmLabView()

onMounted(() => {
  store.loadSavedSessions()
})

async function startSession() {
  await store.startSession()
  await store.loadSavedSessions()
}

async function resumeSession(sessionId: string) {
  await store.resumeSession(sessionId)
}
</script>
