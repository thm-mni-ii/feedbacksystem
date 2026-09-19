<template>
  <DialogConfirmVue ref="dialogConfirm" />
  <v-container class="py-8" style="max-width: 1100px">
    <!-- Begrüßung + Gesamtfortschritt -->
    <v-card class="pa-6 mb-8" rounded="lg" elevation="2" :style="heroStyle">
      <v-row align="center">
        <v-col cols="12" md="8">
          <div class="d-flex align-center mb-3">
            <v-avatar size="48" class="mr-4" :style="heroAvatarStyle">
              <v-icon size="26">mdi-brain</v-icon>
            </v-avatar>
            <div>
              <h1 class="text-h4 font-weight-bold">Willkommen zurück</h1>
              <p class="text-body-2 mb-0" style="opacity: 0.85">
                Deine Aufgaben passen sich automatisch an deinen Kenntnisstand an.
              </p>
            </div>
          </div>
          <v-btn
            v-if="recommendedCourse"
            color="white"
            variant="flat"
            class="text-primary mt-2"
            prepend-icon="mdi-play"
            @click="startStudy(recommendedCourse.id)"
          >
            Weiter lernen: {{ recommendedCourse.name }}
          </v-btn>
        </v-col>
        <v-col cols="12" md="4" class="d-flex justify-center">
          <v-progress-circular :model-value="overallProgress" size="96" width="10" color="white">
            <span class="text-h6">{{ overallProgress }}%</span>
          </v-progress-circular>
        </v-col>
      </v-row>
    </v-card>

    <h2 class="text-h5 font-weight-bold mb-4">Meine Kurse</h2>

    <v-row>
      <v-col v-for="course in coursesWithProgress" :key="course.id" cols="12" sm="6" md="4">
        <v-card rounded="lg" elevation="1" class="h-100 d-flex flex-column">
          <v-card-item>
            <template v-if="isAdmin" #append>
              <v-menu>
                <template #activator="{ props: menuProps }">
                  <v-btn v-bind="menuProps" icon="mdi-dots-vertical" variant="text" size="small" />
                </template>
                <v-list density="compact">
                  <v-list-item
                    prepend-icon="mdi-cog"
                    title="Kurs bearbeiten"
                    @click="handleEditCourse(course.id)"
                  />
                </v-list>
              </v-menu>
            </template>
            <v-card-title>{{ course.name }}</v-card-title>
            <v-card-subtitle class="wrap-subtitle">{{ course.description }}</v-card-subtitle>
          </v-card-item>

          <v-card-text class="flex-grow-1">
            <div class="d-flex justify-space-between text-body-2 mb-1">
              <span class="text-medium-emphasis">Fortschritt</span>
              <span class="font-weight-bold">{{ course.progress }}%</span>
            </div>
            <v-progress-linear
              :model-value="course.progress"
              height="8"
              rounded="lg"
              color="primary"
            />
          </v-card-text>

          <v-card-actions>
            <v-btn
              color="primary"
              variant="flat"
              block
              prepend-icon="mdi-arrow-right"
              @click="startStudy(course.id)"
            >
              Weiter lernen
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import DialogConfirmVue from '../dialog/DialogConfirm.vue'

import { courseMocks } from '@/composables/course.mock'
import { useAuthStore } from '@/stores/authStore'
import { appPalette } from '@/plugins/vuetify'
import { getCourseProgress, getLatestCourseSession } from '@/composables/studyProgress'
import studyContentService from '@/services/studyContent.service'
import { useStudySessionStore } from '@/stores/studySessionStore'

const dialogConfirm = ref<typeof DialogConfirmVue>()
const router = useRouter()
const authStore = useAuthStore()
const studySessionStore = useStudySessionStore()
const heroStyle = computed(() => ({
  background: 'linear-gradient(135deg, #0d47a1, #42a5f5)',
  color: '#ffffff'
}))
const heroAvatarStyle = computed(() => ({
  backgroundColor: appPalette.headerAvatar
}))
const isAdmin = computed(() => authStore.decodedToken?.globalRole == 'ADMIN')

// Der echte Kurs-Backend-Zugriff (course.service.ts) ist noch nicht
// angebunden (siehe course.mock.ts) - bis dahin dient der Dummy-Kurs
// "Datenbanksysteme" als Kursauswahl auf der Startseite.
const myCourses = ref(courseMocks)
const courseProgressById = ref<Record<number, number>>({})

const coursesWithProgress = computed(() =>
  myCourses.value.map((course) => ({
    ...course,
    progress: courseProgressById.value[course.id] ?? 0
  }))
)

// Empfehlung: der Kurs mit dem geringsten Fortschritt braucht aktuell am
// meisten Aufmerksamkeit und wird deshalb als "Weiter lernen" vorgeschlagen.
const recommendedCourse = computed(() =>
  [...coursesWithProgress.value].sort((a, b) => a.progress - b.progress)[0]
)

const overallProgress = computed(() => {
  const values = Object.values(courseProgressById.value)
  if (!values.length) return 0
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
})

async function loadCourseProgress() {
  await studySessionStore.loadSavedSessions()
  const entries = await Promise.all(
    myCourses.value.map(async (course) => {
      const { competencies } = await studyContentService.getStudyContent(String(course.id))
      const latestSession = getLatestCourseSession(
        studySessionStore.savedSessions,
        String(course.id)
      )
      return [course.id, getCourseProgress(latestSession, competencies)] as const
    })
  )
  courseProgressById.value = Object.fromEntries(entries)
}

onMounted(loadCourseProgress)

const jsessionid = router.currentRoute.value.query.jsessionid?.toString()
if (jsessionid) {
  authStore.setToken(jsessionid)
}

const startStudy = (courseId: number) => {
  router.push({ name: 'studyCourse', params: { courseId } })
}

// "Kurs bearbeiten" führt direkt in den Einstellungen-Tab des Kurs-Workspace,
// da eine eigenständige Kursverwaltung (Name/Beschreibung) noch nicht existiert.
const handleEditCourse = (courseId: number) => {
  router.push({ name: 'courseSettings', params: { courseId } })
}
</script>

<style scoped>
.wrap-subtitle {
  white-space: normal;
}
</style>
