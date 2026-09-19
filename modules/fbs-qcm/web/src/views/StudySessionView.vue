<template>
  <v-container class="py-6">
    <v-btn
      variant="text"
      prepend-icon="mdi-arrow-left"
      class="mb-4"
      @click="returnToCourse"
    >
      Zur Kursübersicht
    </v-btn>

    <v-alert v-if="loadError" type="error" variant="tonal">
      {{ loadError }}
    </v-alert>

    <div v-else-if="isLoading" class="d-flex justify-center py-16">
      <v-progress-circular indeterminate color="primary" size="48" />
    </div>

    <template v-else-if="store.currentQuestion && !store.isComplete">
      <StudyQuestionSection
        :current-question="store.currentQuestion"
        :progress="store.sessionProgress"
        :progress-label="store.sessionProgressLabel"
        :show-feedback="showFeedback"
        @submit-answer="submitAnswer"
      />
    </template>

    <AlgorithmLabNoQuestions
      v-else-if="store.session && !store.currentQuestion && !store.isComplete"
      action-label="Zur Kursübersicht"
      @restart="returnToCourse"
    />

    <AlgorithmLabResults
      v-else-if="store.session"
      :competencies="store.competencies"
      :progress="store.progress"
      :history-count="store.historyCount"
      action-label="Zur Kursübersicht"
      @restart="returnToCourse"
    />
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AlgorithmLabNoQuestions from '@/components/algorithm-lab/AlgorithmLabNoQuestions.vue'
import AlgorithmLabResults from '@/components/algorithm-lab/AlgorithmLabResults.vue'
import StudyQuestionSection from '@/components/StudyQuestionSection.vue'
import { useAlgorithmLabView } from '@/composables/useAlgorithmLabView'

const route = useRoute()
const router = useRouter()
const { store, showFeedback, submitAnswer } = useAlgorithmLabView()
const isLoading = ref(false)
const loadError = ref<string | null>(null)

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
    if (!resumed || store.session?.courseId !== courseId) {
      setInvalidSessionError()
    }
  } catch (error) {
    console.error('Lernsitzung konnte nicht geladen werden.', error)
    loadError.value = 'Die Lernsitzung konnte nicht geladen werden.'
  } finally {
    isLoading.value = false
  }
})

function setInvalidSessionError() {
  store.resetSession()
  loadError.value = 'Die Lernsitzung wurde nicht gefunden oder gehört nicht zu diesem Kurs.'
}

function returnToCourse() {
  store.resetSession()
  router.push({ name: 'studyCourse', params: { courseId } })
}
</script>
