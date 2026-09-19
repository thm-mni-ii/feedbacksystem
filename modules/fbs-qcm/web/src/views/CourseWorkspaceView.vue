<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { getCourseById } from '@/composables/course.mock'
import { useAuthStore } from '@/stores/authStore'

/**
 * Gemeinsamer Rahmen für alle Ansichten, die zu genau einem Kurs gehören
 * (Lernen, Kompetenzen, Fragen, Einstellungen). Stellt die kursbezogene
 * Unternavigation bereit, damit Dozent:innen nicht mehr zwischen getrennten
 * Top-Level-Seiten springen müssen, um an einem Kurs zu arbeiten.
 */
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const courseId = computed(() => String(route.params.courseId))
const course = computed(() => getCourseById(courseId.value))
const isAdmin = computed(() => authStore.decodedToken?.globalRole === 'ADMIN')

// Während einer laufenden Lernsitzung wird die Unternavigation ausgeblendet,
// damit der Fokus vollständig auf der aktuellen Frage liegt.
const showSubnav = computed(() => route.name !== 'studySession')

const tabs = computed(() => {
  const baseTabs = [
    { title: 'Lernen', icon: 'mdi-school-outline', to: { name: 'studyCourse' } },
    { title: 'Kompetenzen', icon: 'mdi-graph-outline', to: { name: 'courseCompetencies' } }
  ]
  const adminTabs = [
    { title: 'Fragen', icon: 'mdi-help-circle-outline', to: { name: 'courseQuestions' } },
    { title: 'Einstellungen', icon: 'mdi-tune', to: { name: 'courseSettings' } }
  ]
  return isAdmin.value ? [...baseTabs, ...adminTabs] : baseTabs
})
</script>

<template>
  <div class="course-workspace">
    <v-container class="pt-4 pb-0" style="max-width: 1100px">
      <v-btn
        variant="text"
        size="small"
        prepend-icon="mdi-arrow-left"
        class="mb-2"
        @click="router.push('/')"
      >
        Meine Kurse
      </v-btn>
      <h1 class="text-h5 font-weight-bold mb-2">{{ course?.name ?? `Kurs ${courseId}` }}</h1>
    </v-container>

    <template v-if="showSubnav">
      <v-tabs class="course-subnav" color="primary" density="comfortable" center-active>
        <v-tab
          v-for="tab in tabs"
          :key="tab.title"
          :to="{ ...tab.to, params: { courseId } }"
          :prepend-icon="tab.icon"
        >
          {{ tab.title }}
        </v-tab>
      </v-tabs>
      <v-divider />
    </template>

    <RouterView />
  </div>
</template>

<style scoped>
.course-subnav {
  max-width: 1100px;
  margin: 0 auto;
}
</style>
