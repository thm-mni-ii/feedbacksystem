<template>
  <v-container class="pa-6">
    <v-tabs v-model="activeMode" color="primary" class="mb-4">
      <v-tab value="simulation" prepend-icon="mdi-account-cog-outline">
        Simulierter Lernender
      </v-tab>
      <v-tab value="manual" prepend-icon="mdi-account-edit-outline">
        Manueller Test
      </v-tab>
    </v-tabs>

    <v-window v-model="activeMode">
      <v-window-item value="simulation">
        <AlgorithmLabSimulation />
      </v-window-item>

      <v-window-item value="manual">
        <div class="algorithm-lab-main">
      <v-alert type="info" variant="tonal" density="comfortable" class="mb-4">
        Testmodus für Dozent:innen – simuliert Algorithmus und Aufgabenpool, wirkt sich nicht auf
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

      <v-alert v-if="actionError" type="error" variant="tonal" class="mb-4">
        {{ actionError }}
      </v-alert>
      <v-alert v-else-if="hasSubmissionError" type="error" variant="tonal" class="mb-4">
        Die letzte Antwort konnte nicht vollständig gespeichert werden. Bitte lade den gespeicherten
        Test erneut, bevor du fortfährst.
      </v-alert>
      <v-progress-linear v-if="isBusy" indeterminate color="primary" class="mb-4" />

      <AlgorithmLabStartScreen
        v-if="!store.session"
        :sessions="store.savedSessions"
        :loading="isBusy || store.isLoadingStudyContent || store.isLoadingSavedSessions"
        @start="startSession"
        @resume="resumeSession"
      />

      <div v-else-if="hasSubmissionError" class="text-center py-6">
        <v-btn color="primary" :loading="isBusy" @click="resumeSession(store.session.id)">
          Gespeicherte Session neu laden
        </v-btn>
      </div>

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
          @submit-answer="submitLabAnswer"
        />

        <!-- <AlgorithmLabRealtimeExplanation v-if="algorithmInsight" :insight="algorithmInsight" /> -->
      </template>

      <AlgorithmLabNoQuestions
        v-else-if="store.session && !store.currentQuestion && !store.isComplete"
        @restart="resetSession"
      />

      <template v-else>
        <v-alert v-if="store.completionMessage" type="info" variant="tonal" class="mb-4">
          {{ store.completionMessage }}
        </v-alert>
        <AlgorithmLabResults
          :competencies="store.competencies"
          :progress="store.progress"
          :history-count="store.historyCount"
          @restart="resetSession"
        />
      </template>
        </div>
      </v-window-item>
    </v-window>
  </v-container>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import AlgorithmLabStartScreen from '@/components/algorithm-lab/AlgorithmLabStartScreen.vue'
import AlgorithmLabQuestionSection from '@/components/algorithm-lab/AlgorithmLabQuestionSection.vue'
import AlgorithmLabSimulation from '@/components/algorithm-lab/AlgorithmLabSimulation.vue'
// import AlgorithmLabRealtimeExplanation from '@/components/algorithm-lab/AlgorithmLabRealtimeExplanation.vue'
import AlgorithmLabNoQuestions from '@/components/algorithm-lab/AlgorithmLabNoQuestions.vue'
import AlgorithmLabResults from '@/components/algorithm-lab/AlgorithmLabResults.vue'
import { useAlgorithmLabView } from '@/composables/useAlgorithmLabView'
import { useAlgorithmLabSessionStore } from '@/stores/studySessionStore'

const {
  store,
  expandedPanel,
  showFeedback,
  hierarchicalProgress,
  scoreColor,
  scoreLabel,
  submitAnswer,
  continueAfterFeedback,
  resetFeedback
} = useAlgorithmLabView(useAlgorithmLabSessionStore())

const activeMode = ref<'simulation' | 'manual'>('simulation')
const isBusy = ref(false)
const actionError = ref<string | null>(null)
const submissionFailed = ref(false)
const hasSubmissionError = computed(() => submissionFailed.value || store.needsRecovery)

watch(activeMode, async (mode) => {
  if (mode !== 'manual' || store.savedSessions.length > 0) return
  isBusy.value = true
  try {
    if (!(await store.loadSavedSessions())) {
      actionError.value =
        store.studyContentLoadError ?? 'Gespeicherte Tests konnten nicht geladen werden.'
    }
  } catch (error) {
    console.error('Gespeicherte Tests konnten nicht geladen werden.', error)
    actionError.value = 'Gespeicherte Tests konnten nicht geladen werden.'
  } finally {
    isBusy.value = false
  }
})

async function startSession() {
  if (isBusy.value) return
  isBusy.value = true
  actionError.value = null
  resetFeedback()
  try {
    if (!(await store.startSession())) {
      actionError.value = store.studyContentLoadError ?? 'Der Test konnte nicht gestartet werden.'
      return
    }
    submissionFailed.value = false
    if (!(await store.loadSavedSessions())) {
      actionError.value =
        store.studyContentLoadError ?? 'Gespeicherte Tests konnten nicht geladen werden.'
    }
  } catch (error) {
    console.error('Test konnte nicht gestartet werden.', error)
    actionError.value = 'Der Test konnte nicht gestartet werden. Bitte versuche es erneut.'
  } finally {
    isBusy.value = false
  }
}

async function resumeSession(sessionId: string) {
  if (isBusy.value) return
  isBusy.value = true
  actionError.value = null
  resetFeedback()
  try {
    if (!(await store.resumeSession(sessionId))) {
      actionError.value = store.studyContentLoadError ?? 'Der gespeicherte Test wurde nicht gefunden.'
      return
    }
    submissionFailed.value = false
  } catch (error) {
    console.error('Test konnte nicht geladen werden.', error)
    actionError.value = 'Der Test konnte nicht geladen werden. Bitte versuche es erneut.'
  } finally {
    isBusy.value = false
  }
}

async function submitLabAnswer(answer: Parameters<typeof submitAnswer>[0]) {
  if (isBusy.value || hasSubmissionError.value) return
  isBusy.value = true
  actionError.value = null
  try {
    await submitAnswer(answer)
    continueAfterFeedback()
  } catch (error) {
    console.error('Testantwort konnte nicht gespeichert werden.', error)
    submissionFailed.value = true
    actionError.value =
      'Die Antwort konnte nicht vollständig gespeichert werden. Bitte lade den gespeicherten Test erneut.'
  } finally {
    isBusy.value = false
  }
}

function resetSession() {
  if (isBusy.value) return
  resetFeedback()
  actionError.value = null
  submissionFailed.value = false
  store.resetSession()
}
</script>
