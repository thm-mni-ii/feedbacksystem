<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import courseService from '@/services/course.service'
import studyService from '@/services/study.service'
import CatalogSession from '../components/CatalogSession.vue'

const route = useRoute()
const courseId = Number(route.params.courseId)
const sessionId = ref('')
const courseInformation = ref<{ name?: string }>({})

const questionData = ref<any>(null)
const progressBar = ref<number>(1)
const showFeedback = ref<boolean>(false)
const currentQuestionScore = ref<number>(0)
const formattedScore = computed(() => (currentQuestionScore.value * 100).toFixed(2))
const scoreEmoji = computed(() => {
  if (currentQuestionScore.value < 0.1) return '💀'
  if (currentQuestionScore.value < 0.4) return '😐'
  if (currentQuestionScore.value < 0.6) return '🙂'
  return '😎'
})
const sessionOver = ref<boolean>(false)

async function loadCourseInformation(courseId: number) {
  const { data } = await courseService.getCoreCourse(courseId)
  courseInformation.value = data
}

// Holt die aktuelle Frage aus der Study Session
async function loadCurrentQuestion() {
  const res = await studyService.getCurrentQuestion(sessionId.value)
  questionData.value = res.data
  // Optional: sessionOver.value = ... falls keine Frage mehr
  if (!res.data || res.data.sessionOver) {
    sessionOver.value = true
  }
}

// Antwort absenden und Feedback anzeigen
const submitAnswer = async (answer: any) => {
  try {
    const submitResponse = await studyService.submitAnswer(sessionId.value, answer)
    currentQuestionScore.value = submitResponse.data.score ?? 0
    showFeedback.value = true

    // Prüfe, ob die Session vorbei ist
    if (submitResponse.data.sessionOver) {
      sessionOver.value = true
      await studyService.endStudySession(sessionId.value)
    }
  } catch (error) {
    console.error('Error submitting Answer:', error)
  }
}

// Nächste Frage laden
const nextQuestion = async () => {
  showFeedback.value = false
  progressBar.value++
  await loadCurrentQuestion()
}

// Prüft, ob eine laufende Study Session existiert, sonst startet eine neue
async function checkOrStartSession() {
  const ongoingRes = await studyService.checkOngoingStudySession(courseId)
  const ongoingSession = Array.isArray(ongoingRes.data)
    ? ongoingRes.data.find(
        (s) => s.courseId === courseId && s.status !== 'ended' && s.type === 'study'
      )
    : ongoingRes.data && ongoingRes.data.type === 'study'
      ? ongoingRes.data
      : null
  if (ongoingSession) {
    sessionId.value = ongoingSession._id || ongoingSession.sessionId
    await loadCurrentQuestion()
  } else {
    const res = await studyService.startStudySession(courseId)
    sessionId.value = res.data.insertedId || res.data.sessionId || res.data._id
    await loadCurrentQuestion()
  }
}

onMounted(async () => {
  await loadCourseInformation(courseId)
  await checkOrStartSession()
})
</script>

<template>
  <v-sheet
    class="d-flex align-center justify-center flex-wrap flex-column text-center mx-auto my-14 px-4"
    elevation="4"
    height="auto"
    width="80%"
    rounded
  >
    <v-responsive class="mx-auto" width="85%">
      <h3 class="text-h3 mt-8 font-weight-black text-blue-grey-darken-2">
        {{ courseInformation.name }}
      </h3>

      <v-progress-linear
        class="my-6"
        :model-value="progressBar"
        :max="10"
        height="8"
        color="primary"
        rounded
        stream
      />

      <div v-if="sessionOver && !showFeedback">
        <h4 class="text-h4 my-8 font-weight-black text-primary">Session finished 🎉</h4>
        <v-btn variant="tonal" @click="$router.push('/')">Go back</v-btn>
      </div>

      <!-- Feedback -->
      <div v-if="showFeedback">
        <h4 class="text-h4 my-8 font-weight-black text-primary">You scored:</h4>
        <p class="text-blue-grey-darken-2">
          <b>{{ formattedScore }} % {{ scoreEmoji }}</b>
        </p>
        <v-btn variant="tonal" class="my-4" @click="nextQuestion"> Next </v-btn>
      </div>

      <!-- Current Question -->
      <CatalogSession
        v-if="questionData && !showFeedback && !sessionOver"
        :question="questionData"
        @submit-answer="submitAnswer"
      />
    </v-responsive>
  </v-sheet>
</template>
