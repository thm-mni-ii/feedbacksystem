<template>
  <DialogEditCatalog ref="dialogEditCatalog" />
  <DialogConfirmVue ref="dialogConfirm" />
  <v-sheet class="pa-10">
    <v-expansion-panels>
      <v-expansion-panel
        v-for="course in myCourses"
        :key="course.id"
        @group:selected="loadCatalogsFromCourse(course.id)"
      >
        <v-expansion-panel-title> {{ course.name }} </v-expansion-panel-title>
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
                <!-- manage questions with icon -->
                <v-btn
                  prepend-icon="mdi-cog"
                  color="dark-grey"
                  variant="outlined"
                  class="mr-2"
                  @click="manageQuestions(catalog)"
                >
                  Manage
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
              </v-list-item-title>

              <v-list-item-action> </v-list-item-action>
            </v-list-item>
            <v-list-item>
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

const dialogConfirm = ref<typeof DialogConfirmVue>()
const dialogEditCatalog = ref<typeof DialogEditCatalog>()
const router = useRouter()

const myCourses = ref<Course[]>([])

onMounted(async () => {
  await writeJsessionidToLocalStorage()

  courseService
    .getMyCourses()
    .then((response) => {
      myCourses.value = response.data as Course[]
    })
    .catch((error) => {
      console.log(error)
    })
})

// async func to write jsessionid to local storage
const writeJsessionidToLocalStorage = async () => {
  //get jsessionid from params
  const jsessionid = router.currentRoute.value.query.jsessionid?.toString()
  if (jsessionid) {
    // write jsessionid to local storage
    localStorage.setItem('jsessionid', jsessionid)
    // write userId to local storage from jwt token

    localStorage.setItem('userId', parseJwt(jsessionid).id)
  } else {
    console.log('No jsessionid found in params')
  }
}

const parseJwt = (token: string) => {
  var base64Url = token.split('.')[1]
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
  var jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split('')
      .map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      })
      .join('')
  )

  return JSON.parse(jsonPayload)
}

const loadCatalogsFromCourse = (courseId: number) => {
  const course = myCourses.value.find((course) => course.id === courseId)
  if (course) {
    axios
      .get(`api_v1/catalogs/${courseId}`, {
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
  router.push(`/manageCatalog/${catalog.id}`)
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
          router.push(`/catalogSession/${catalog.id}`)
        } else {
          console.log('Cancel')
        }
      })
  }
}
</script>

<style scoped lang="scss"></style>
