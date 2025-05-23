<template>
  <DialogEditCatalog ref="dialogEditCatalog" />
  <DialogConfirmVue ref="dialogConfirm" />

  <section style="background: linear-gradient(135deg, #81ba24, #36c78e); color: white" class="mb-4">
    <v-container class="text-center py-16">
      <v-avatar size="64" class="mb-4" style="background-color: rgba(255, 255, 255, 0.2)">
        <v-icon size="36">mdi-brain</v-icon>
      </v-avatar>
      <h1 class="text-h3 font-weight-bold mb-2">Questionary</h1>
      <h2 class="text-subtitle-1 mb-4">Scientific Learning Made Simple</h2>
      <p class="text-body-1 mx-auto" style="max-width: 720px">
        Our question-based system helps you to gain knowledge through spaced repetition, reflection,
        and relationships between ideas.
      </p>
    </v-container>
  </section>

  <v-row justify="center">
    <v-col v-for="course in courses" :key="course.id" cols="8" md="4" class="ma-2">
      <v-card :title="course.title" class="mx-auto" :subtitle="course.description">
        <v-card-actions>
          <v-btn class="bg-primary-light" @click="startStudy(course.id)">Study for course</v-btn>
          <v-btn
            v-if="authStore.decodedToken?.globalRole == 'ADMIN'"
            prepend-icon="mdi-cog"
            color="dark-grey"
            variant="tonal"
            >Edit course</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import courseService from '@/services/course.service'

import DialogConfirmVue from '../dialog/DialogConfirm.vue'
import DialogEditCatalog from '@/dialog/DialogEditCatalog.vue'

import type Course from '../model/Course'
import type Catalog from '../model/Catalog'
import catalogService from '@/services/catalog.service'
import { useAuthStore } from '@/stores/authStore'

const dialogConfirm = ref<typeof DialogConfirmVue>()
const dialogEditCatalog = ref<typeof DialogEditCatalog>()
const router = useRouter()
const authStore = useAuthStore()
const courses = [
  { id: 1, title: 'Datenbanken', description: 'Learn about relational databases' },
  { id: 2, title: 'Algorithmen', description: 'Understand algorithmic problem-solving' },
  { id: 1, title: 'Datenbanken', description: 'Learn about relational databases' },
  { id: 3, title: 'Betriebssysteme', description: 'Explore how operating systems work' },
  { id: 3, title: 'Betriebssysteme', description: 'Explore how operating systems work' },
  { id: 2, title: 'Algorithmen', description: 'Understand algorithmic problem-solving' }
]

// Setze den jsessionid-Token direkt nach der Initialisierung
const jsessionid = router.currentRoute.value.query.jsessionid?.toString()
if (jsessionid) {
  authStore.setToken(jsessionid)
} else {
  console.warn('No jsessionid found in query parameters')
}

const myCourses = ref<Course[]>([])

onMounted(async () => {
  courseService
    .getMyCourses()
    .then((response) => {
      myCourses.value = response.data as Course[]
    })
    .catch((error) => {
      console.log(error)
    })
})

const loadCatalogsFromCourse = (courseId: number) => {
  const course = myCourses.value.find((course) => course.id === courseId)
  if (course) {
    axios
      .get(`api_v1/catalogs/${course.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jsessionid')}`
        }
      })
      .then((response) => {
        course.catalogs = response.data as Catalog[]
      })
      .catch((error) => {
        console.log(error)
        course.catalogs = []
      })
  }
}

const startStudy = (courseId: number) => {
  router.push(`/study/${courseId}`)
}
</script>

<style scoped lang="scss"></style>
