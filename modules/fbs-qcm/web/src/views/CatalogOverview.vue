<template>
  <DialogEditCatalog ref="dialogEditCatalog" />
  <DialogConfirmVue ref="dialogConfirm" />
  <v-container class="text-center pt-8">
    <div class="pa-8 elevation-2 rounded-lg" style="background-color: #f5f5f5">
      <v-icon icon="mdi-lightbulb-on-outline" size="48" color="primary" class="mb-4" />
      <h1 class="text-h4 font-weight-bold mb-2">Question Catalogs</h1>
      <h2 class="text-subtitle-1 text-grey-darken-1 mb-4">Scientific Learning Made Simple</h2>
      <p class="text-body-1 text-grey-darken-2 mx-auto" style="max-width: 700px">
        Answer Questions in a Catalog and get adaptive feedback to your answers
      </p>
    </div>
  </v-container>

  <v-sheet class="pa-10">
    <v-expansion-panels>
      <v-expansion-panel
        v-for="course in myCourses"
        :key="course.id"
        @group:selected="loadCatalogsFromCourse(course.id)"
      >
        <v-expansion-panel-title style="background-color: #f5f5f5">
          {{ course.name }}
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-list>
            <v-list-subheader>Catalogs</v-list-subheader>
            <v-list-item v-for="catalog in course.catalogs" :key="catalog.id">
              <v-list-item-title class="d-flex align-center justify-space-between">
                <span>{{ catalog.name }}</span>

                <v-spacer></v-spacer>

                <v-btn color="primary" variant="tonal" class="mr-2" @click="startSession(catalog)">
                  Start Session
                </v-btn>
                <span v-if="authStore.decodedToken?.globalRole == 'ADMIN'">
                  <v-btn
                    prepend-icon="mdi-cog"
                    color="dark-grey"
                    variant="outlined"
                    class="mr-2"
                    @click="manageQuestions(catalog)"
                  >
                    Manage Questions
                  </v-btn>
                  <v-btn
                    icon="mdi-pencil"
                    color="dark-grey"
                    variant="outlined"
                    size="x-small"
                    class="mr-2"
                    @click="editCatalog(course.id, catalog)"
                  >
                  </v-btn>
                  <v-btn
                    icon="mdi-delete"
                    color="error"
                    variant="outlined"
                    size="x-small"
                    class="mr-2"
                    @click="deleteCatalog(course.id, catalog)"
                  >
                  </v-btn>
                </span>
              </v-list-item-title>

              <v-list-item-action> </v-list-item-action>
            </v-list-item>
            <v-list-item v-if="authStore.decodedToken?.globalRole == 'ADMIN'">
              <v-list-item-title class="d-flex align-center justify-space-between">
                <v-btn color="primary" variant="outlined" @click="createNewCatalog(course.id)"
                  >Add new Catalog</v-btn
                >
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-sheet>
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

const createNewCatalog = (courseId: number) => {
  if (dialogEditCatalog.value) {
    dialogEditCatalog.value.openDialog(courseId).then((result: boolean) => {
      if (result) {
        console.log('Create new catalog')
        loadCatalogsFromCourse(courseId)
      } else {
        console.log('Cancel')
      }
    })
  }
}
const editCatalog = (courseId: number, catalog: Catalog) => {
  if (dialogEditCatalog.value) {
    dialogEditCatalog.value.openDialog(courseId, catalog).then((result: boolean) => {
      if (result) {
        console.log('Edit catalog')
        loadCatalogsFromCourse(courseId)
      } else {
        console.log('Cancel')
      }
    })
  }
}

const deleteCatalog = (courseId: number, catalog: Catalog) => {
  if (dialogConfirm.value) {
    dialogConfirm.value
      .openDialog(
        `Do you want to delete catalog ${catalog.name}?`,
        'With the confirmation you will delete the catalog.',
        'Confirm'
      )
      .then((result: boolean) => {
        if (result) {
          console.log('Delete catalog')
          catalogService.deleteCatalog(catalog.id).then(() => {
            loadCatalogsFromCourse(courseId)
          })
        } else {
          console.log('Cancel')
        }
      })
  }
}

const manageQuestions = (catalog: Catalog) => {
  console.log(catalog.id)
  console.log(catalog)
  router.push(`/manageCatalog/${catalog.id}/open`)
}

const startSession = (catalog: Catalog) => {
  if (dialogConfirm.value) {
    dialogConfirm.value
      .openDialog(
        `Do you want to start catalog ${catalog.name}?`,
        'With the confirmation you will start a new session.',
        'Confirm'
      )
      .then((result: boolean) => {
        if (result) {
          router.push(`/catalogSession/${catalog.course}/${catalog.id}`)
        } else {
          console.log('Cancel')
        }
      })
  }
}
</script>

<style scoped lang="scss"></style>
