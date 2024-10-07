<template>
  <DialogEditCatalog ref="dialogEditCatalog" />
  <DialogConfirmVue ref="dialogConfirm" />
  <v-sheet class="pa-10 mt-12">
    <v-expansion-panels>
      <v-expansion-panel
        v-for="course in myCourses"
        :key="course.id"
        @group:selected="loadCatalogs(course.id)"
      >
        <v-expansion-panel-title> {{ course.name }} </v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-list>
            <v-list-subheader>Catalogs</v-list-subheader>
            <v-list-item v-for="catalog in course.catalogs" :key="catalog.id">
              <v-list-item-content>
                <v-list-item-title class="d-flex align-center justify-space-between">
                  <span>{{ catalog.name }}</span>

                  <!-- <v-chip class="ml-3" :color="getDifficultyColor(catalog.difficulty)">
                    {{ catalog.difficulty }}
                  </v-chip> -->

                  <v-spacer></v-spacer>

                  <v-btn color="primary" variant="tonal" @click="startSession(catalog)"
                    >Start Session</v-btn
                  >
                </v-list-item-title>
              </v-list-item-content>
              <v-list-item-action> </v-list-item-action>
            </v-list-item>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title class="d-flex align-center justify-space-between">
                  <v-btn color="primary" variant="outlined" @click="createNewCatalog(course.id)"
                    >Add new Catalog</v-btn
                  >
                </v-list-item-title>
              </v-list-item-content>
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

const loadCatalogs = (courseId: number) => {
  const course = myCourses.value.find((course) => course.id === courseId)
  if (course && !course.catalogs) {
    axios
      .get(`api_v1/catalogs/${courseId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jsessionid')}`
        }
      })
      .then((response) => {
        console.log(response.data)
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
      } else {
        console.log('Cancel')
      }
    })
  }
}

// const getDifficultyColor = (difficulty: number) => {
//   switch (difficulty) {
//     case 1:
//       return 'green'
//     case 2:
//       return 'orange'
//     case 3:
//       return 'red'
//     default:
//       return 'grey'
//   }
// }

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
