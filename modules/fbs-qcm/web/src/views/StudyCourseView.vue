<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import { format } from 'date-fns'
import { useRoute, useRouter } from 'vue-router'
import type { Competency, ProgressItem } from '@/model/types'
import CourseCompetencyOverview from '@/components/CourseCompetencyOverview.vue'
import StudyCourseHeader from '@/components/StudyCourseHeader.vue'
import { courseMocks } from '@/composables/course.mock'
import {
  getCourseProgress,
  getLatestCourseSession,
  getOpenCourseSession
} from '@/composables/studyProgress'
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
const isLoadingCourse = ref(true)
const courseLoaded = ref(false)
const restartDialog = ref(false)
const openSession = computed(() => getOpenCourseSession(studySessionStore.savedSessions, courseId))
const lastOpenSessionDate = computed(() =>
  openSession.value ? format(new Date(openSession.value.updatedAt), 'dd.MM.yyyy, HH:mm') : ''
)

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
  courseInformation.value = courseMocks.find((course) => String(course.id) === courseId) ?? {}
}

onMounted(async () => {
  loadCourseInformation()
  try {
    const [{ competencies: loadedCompetencies, questions }, sessionsLoaded] = await Promise.all([
      studyContentService.getStudyContent(courseId),
      studySessionStore.loadSavedSessions()
    ])
    competencies.value = loadedCompetencies
    totalQuestions.value = questions.length
    courseLoaded.value = sessionsLoaded
    if (!sessionsLoaded) {
      sessionStartError.value = studySessionStore.studyContentLoadError
    }
  } catch (error) {
    console.error('Kurs und Lernsitzungen konnten nicht geladen werden.', error)
    sessionStartError.value = 'Der Kurs konnte nicht geladen werden. Bitte lade die Seite erneut.'
  } finally {
    isLoadingCourse.value = false
  }
})

async function startStudySession(restart = false) {
  if (isStartingSession.value || !courseLoaded.value) return
  restartDialog.value = false
  isStartingSession.value = true
  sessionStartError.value = null

  try {
    const session = restart
      ? await studySessionStore.restartCourseSession(courseId)
      : await studySessionStore.startSession(courseId)
    if (!session) {
      sessionStartError.value =
        studySessionStore.studyContentLoadError ?? 'Die Lernsitzung konnte nicht gestartet werden.'
      return
    }

    await router.push({
      name: 'studySession',
      params: { courseId, sessionId: session.id }
    })
  } catch (error) {
    console.error('Lernsitzung konnte nicht gestartet werden.', error)
    sessionStartError.value = 'Die Lernsitzung konnte nicht gestartet werden.'
    await studySessionStore.loadSavedSessions()
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
      :has-open-session="Boolean(openSession)"
      :session-actions-disabled="isLoadingCourse || !courseLoaded"
      @start-session="startStudySession()"
      @open-settings="openCourseSettings"
    />
    <v-alert v-if="sessionStartError" type="error" variant="tonal" class="mb-6">
      {{ sessionStartError }}
    </v-alert>
    <v-card
      v-if="openSession && courseLoaded"
      color="primary"
      variant="tonal"
      class="mb-6"
      rounded="lg"
    >
      <v-card-text class="pa-6">
        <div class="d-flex align-start ga-3 mb-3">
          <v-icon icon="mdi-pause-circle-outline" size="32" />
          <div>
            <h2 class="text-h6">Deine Lernsession ist noch offen</h2>
            <p class="text-body-2 mt-1">
              {{ openSession.history.length }} Aufgaben bearbeitet · zuletzt
              {{ lastOpenSessionDate }}
            </p>
          </div>
        </div>
        <p class="text-body-2 mb-4">
          Deine bisherigen Antworten sind gespeichert. Setze deine Session fort, wann es dir passt.
        </p>
        <div class="d-flex flex-wrap ga-3">
          <v-btn
            color="primary"
            prepend-icon="mdi-play"
            :loading="isStartingSession"
            @click="startStudySession()"
          >
            Session fortsetzen
          </v-btn>
          <v-btn variant="text" :disabled="isStartingSession" @click="restartDialog = true">
            Neue Session
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
    <v-dialog v-model="restartDialog" max-width="500">
      <v-card title="Neue Lernsession starten?">
        <v-card-text>
          Die offene Session wird beendet. Deine bisherigen Antworten und dein Lernfortschritt
          bleiben erhalten. Danach startet eine neue Session.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="restartDialog = false">Abbrechen</v-btn>
          <v-btn color="primary" variant="tonal" @click="startStudySession(true)"
            >Neue Session starten</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
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
