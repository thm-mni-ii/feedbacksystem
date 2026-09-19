<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Competency, ProgressItem } from '@/model/types'
import CourseCompetencyOverview from '@/components/CourseCompetencyOverview.vue'
import StudyCourseHeader from '@/components/StudyCourseHeader.vue'
import { courseMocks } from '@/composables/course.mock'
import { getCourseProgress, getLatestCourseSession } from '@/composables/studyProgress'
import { AdaptiveQuizAlgorithm } from '@/composables/algorithm'
import studyContentService from '@/services/studyContent.service'
import { useStudySessionStore } from '@/stores/studySessionStore'

const route = useRoute()
const router = useRouter()
const studySessionStore = useStudySessionStore()
const courseId = String(route.params.courseId)
const courseInformation = ref<{ name?: string; description?: string }>({})
const competencies = ref<Competency[]>([])
const totalQuestions = ref(0)
const isStartingSession = ref(false)
const sessionStartError = ref<string | null>(null)

const latestSession = computed(() =>
  getLatestCourseSession(studySessionStore.savedSessions, courseId)
)
const averageProgress = computed(() => getCourseProgress(latestSession.value, competencies.value))
const encounteredQuestions = computed(() => {
  const courseSessions = studySessionStore.savedSessions.filter(
    (session) => session.courseId === courseId
  )
  const encounteredQuestionIds = new Set(
    courseSessions.flatMap((session) => session.history.map((answer) => answer.questionId))
  )

  return Math.min(encounteredQuestionIds.size, totalQuestions.value)
})
const learningProgress = computed<ProgressItem[]>(() => {
  if (!latestSession.value) return []
  return new AdaptiveQuizAlgorithm(latestSession.value.algorithm.configuration).getProgress(
    competencies.value,
    latestSession.value
  )
})
const lastStudySession = computed(() =>
  latestSession.value ? new Date(latestSession.value.updatedAt) : undefined
)

function loadCourseInformation() {
  // Es gibt noch keine echte Kurs-Anbindung, daher wird der
  // Dummy-Kurs aus `course.mock.ts` verwendet - dieselbe Quelle wie in HomeView.
  courseInformation.value =
    courseMocks.find((course) => String(course.id) === courseId) ?? {}
}

onMounted(async () => {
  loadCourseInformation()
  const [{ competencies: loadedCompetencies, questions }] = await Promise.all([
    studyContentService.getStudyContent(courseId),
    studySessionStore.loadSavedSessions()
  ])
  competencies.value = loadedCompetencies
  totalQuestions.value = questions.length
})

async function startStudySession() {
  isStartingSession.value = true
  sessionStartError.value = null

  try {
    const session = await studySessionStore.startSession(courseId)
    if (!session) {
      sessionStartError.value =
        studySessionStore.studyContentLoadError ??
        'Die Lernsitzung konnte nicht gestartet werden.'
      return
    }

    await router.push({
      name: 'studySession',
      params: { courseId, sessionId: session.id }
    })
  } catch (error) {
    console.error('Lernsitzung konnte nicht gestartet werden.', error)
    sessionStartError.value = 'Die Lernsitzung konnte nicht gestartet werden.'
  } finally {
    isStartingSession.value = false
  }
}

function openCourseSettings() {
  void router.push({ name: 'courseSettings', params: { courseId } })
}
</script>

<template>
  <v-container class="study-course-page py-8">
    <StudyCourseHeader
      :name="courseInformation.name ?? ''"
      :description="courseInformation.description ?? ''"
      :progress="averageProgress"
      :last-study-session="lastStudySession"
      :total-competencies="competencies.length"
      :total-questions="totalQuestions"
      :is-starting-session="isStartingSession"
      @start-session="startStudySession"
      @open-settings="openCourseSettings"
    />
    <v-alert v-if="sessionStartError" type="error" variant="tonal" class="mb-6">
      {{ sessionStartError }}
    </v-alert>
    <CourseCompetencyOverview
      :competencies="competencies"
      :progress="learningProgress"
      :has-session="Boolean(latestSession)"
      :encountered-questions="encounteredQuestions"
    />
  </v-container>
</template>

<style scoped>
.study-course-page {
  max-width: 1100px;
  margin: 0 auto;
}
</style>
