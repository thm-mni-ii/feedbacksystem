<template>
  <v-container class="py-6">
    <v-btn
      variant="text"
      prepend-icon="mdi-arrow-left"
      class="mb-4"
      :loading="isReturning"
      :disabled="isLoading || isSubmitting || hasSubmissionError"
      @click="returnToCourse"
    >
      {{ store.session && !store.isComplete ? 'Pausieren & zurück' : 'Zur Kursübersicht' }}
    </v-btn>

    <p v-if="store.session && !store.isComplete" class="text-caption text-medium-emphasis mb-4">
      Beantwortete Aufgaben bleiben gespeichert. Noch nicht abgeschickte Antworten werden nicht
      gespeichert.
    </p>
    <v-alert v-if="actionError" type="error" variant="tonal" class="mb-4">
      {{ actionError }}
    </v-alert>
    <v-alert v-else-if="hasSubmissionError" type="error" variant="tonal" class="mb-4">
      Die letzte Antwort konnte nicht vollständig gespeichert werden. Bitte lade die gespeicherte
      Session erneut, bevor du fortfährst.
    </v-alert>
    <v-alert v-if="loadError" type="error" variant="tonal">
      {{ loadError }}
    </v-alert>

    <div v-else-if="isLoading" class="d-flex justify-center py-16">
      <v-progress-circular indeterminate color="primary" size="48" />
    </div>

    <div v-else-if="hasSubmissionError" class="text-center py-6">
      <v-btn color="primary" :loading="isReloading" @click="reloadSession">
        Gespeicherte Session neu laden
      </v-btn>
    </div>

    <v-row v-else-if="answerFeedback" justify="center">
      <v-col cols="12" md="10" lg="8">
        <StudyAnswerFeedback
          :key="answerFeedback.questionId + store.historyCount"
          :feedback="answerFeedback"
          :is-session-complete="store.isComplete || !store.currentQuestion"
          @continue="continueAfterFeedback"
        />
      </v-col>
    </v-row>

    <template v-else-if="store.currentQuestion && !store.isComplete">
      <StudyQuestionSection
        :current-question="store.currentQuestion"
        :progress="store.sessionProgress"
        :progress-label="store.sessionProgressLabel"
        @submit-answer="submitSessionAnswer"
      />
    </template>

    <AlgorithmLabNoQuestions
      v-else-if="store.session && !store.currentQuestion && !store.isComplete"
      action-label="Zur Kursübersicht"
      @restart="returnToCourse"
    />

    <StudySessionResults
      v-else-if="store.session"
      :competencies="store.competencies"
      :history="store.session.history"
      :completion-message="store.completionMessage"
      action-label="Zur Kursübersicht"
      @restart="returnToCourse"
    />
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'
import AlgorithmLabNoQuestions from '@/components/algorithm-lab/AlgorithmLabNoQuestions.vue'
import StudyAnswerFeedback from '@/components/StudyAnswerFeedback.vue'
import StudyQuestionSection from '@/components/StudyQuestionSection.vue'
import StudySessionResults from '@/components/StudySessionResults.vue'
import { useAlgorithmLabView } from '@/composables/useAlgorithmLabView'

const route = useRoute()
const router = useRouter()
const { store, answerFeedback, submitAnswer, continueAfterFeedback } = useAlgorithmLabView()
const isLoading = ref(false)
const loadError = ref<string | null>(null)
const actionError = ref<string | null>(null)
const isReturning = ref(false)
const isSubmitting = ref(false)
const submissionFailed = ref(false)
const hasSubmissionError = computed(() => submissionFailed.value || store.needsRecovery)
const isReloading = ref(false)

const courseId = String(route.params.courseId)
const sessionId = String(route.params.sessionId)

onMounted(async () => {
  if (store.session?.id === sessionId) {
    if (store.session.courseId !== courseId) {
      setInvalidSessionError()
    }
    return
  }

  isLoading.value = true
  try {
    const resumed = await store.resumeSession(sessionId)
    if (!resumed && store.studyContentLoadError) {
      loadError.value = store.studyContentLoadError
    } else if (!resumed || store.session?.courseId !== courseId) {
      setInvalidSessionError()
    }
  } catch (error) {
    console.error('Lernsitzung konnte nicht geladen werden.', error)
    loadError.value = store.studyContentLoadError ?? 'Die Lernsitzung konnte nicht geladen werden.'
  } finally {
    isLoading.value = false
  }
})

function setInvalidSessionError() {
  store.resetSession()
  loadError.value = 'Die Lernsitzung wurde nicht gefunden oder gehört nicht zu diesem Kurs.'
}

onBeforeRouteLeave(() =>
  !isSubmitting.value && !isLoading.value && !isReloading.value && !store.isSavingAnswer
)

async function submitSessionAnswer(answer: Parameters<typeof submitAnswer>[0]) {
  if (isSubmitting.value || isReturning.value || hasSubmissionError.value) return
  isSubmitting.value = true
  actionError.value = null
  try {
    await submitAnswer(answer)
  } catch (error) {
    console.error('Antwort konnte nicht gespeichert werden.', error)
    submissionFailed.value = true
    actionError.value =
      'Deine Antwort konnte nicht vollständig gespeichert werden. Bitte lade die Session erneut, bevor du fortfährst.'
  } finally {
    isSubmitting.value = false
  }
}

async function reloadSession() {
  if (isReloading.value) return
  isReloading.value = true
  try {
    if (!(await store.resumeSession(sessionId))) {
      throw new Error('Die gespeicherte Session konnte nicht geladen werden.')
    }
    continueAfterFeedback()
    submissionFailed.value = false
    actionError.value = null
  } catch (error) {
    console.error('Gespeicherte Lernsitzung konnte nicht neu geladen werden.', error)
    actionError.value =
      store.studyContentLoadError ??
      'Die gespeicherte Session konnte nicht geladen werden. Bitte versuche es erneut.'
  } finally {
    isReloading.value = false
  }
}

async function returnToCourse() {
  if (isReturning.value || isSubmitting.value || isLoading.value || hasSubmissionError.value) return
  isReturning.value = true
  actionError.value = null
  try {
    if (store.session) {
      await store.pauseSession()
    }
    await router.push({ name: 'studyCourse', params: { courseId } })
  } catch (error) {
    console.error('Lernsitzung konnte nicht verlassen werden.', error)
    actionError.value =
      'Die Session konnte nicht gespeichert oder verlassen werden. Bitte versuche es erneut.'
  } finally {
    isReturning.value = false
  }
}
</script>
