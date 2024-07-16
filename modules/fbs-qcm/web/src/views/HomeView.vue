<template>
  <DialogConfirmVue ref="dialogConfirm" />
  <v-sheet class="pa-10">
    <v-expansion-panels>
      <v-expansion-panel v-for="course in myCourses" :key="course.id">
        <v-expansion-panel-title> {{ course.name }} </v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-list>
            <v-list-subheader>Catalogs</v-list-subheader>
            <v-list-item v-for="catalog in getCatalogsFromCourse(course.id)" :key="catalog.id">
              <v-list-item-content>
                <v-list-item-title class="d-flex align-center justify-space-between">
                  <span>{{ catalog.name }}</span>

                  <v-chip class="ml-3" :color="getDifficultyColor(catalog.difficulty)">
                    {{ catalog.difficulty }}
                  </v-chip>

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
                  <v-btn color="primary" variant="outlined">Add new Catalog</v-btn>
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
import { ref } from 'vue'
// import axios from 'axios'
import DialogConfirmVue from '../dialog/DialogConfirm.vue'
import { useRouter } from 'vue-router'

import type Course from '../model/Course'
import type Catalog from '../model/Catalog'

const dialogConfirm = ref<typeof DialogConfirmVue>()
const router = useRouter()

const myCourses = ref<Course[]>([
  { id: 1, name: 'Course 1' },
  { id: 2, name: 'Course 2' },
  { id: 3, name: 'Course 3' }
])

const getCatalogsFromCourse = (courseId: number) => {
  // return axiox.get(`api_v1/catalogs/${courseId}`).then((response) => {
  //   return response.data as Catalog[]
  // })

  // TODO: Call API to get catalogs from course
  switch (courseId) {
    case 1:
      return [
        { id: 1, name: 'A-Catalog 1', requirements: [], difficulty: 1, passed: true },
        {
          id: 2,
          name: 'A-Catalog ich bin länger 2',
          requirements: [1],
          difficulty: 2,
          passed: false
        },
        { id: 3, name: 'A-Catalog 3', requirements: [2, 1], difficulty: 3, passed: false }
      ] as Catalog[]

    case 2:
      return [
        { id: 4, name: 'B-Catalog 1', requirements: [], difficulty: 1, passed: true },
        { id: 5, name: 'B-Catalog 2', requirements: [1], difficulty: 2, passed: true },
        { id: 6, name: 'B-Catalog 3', requirements: [2, 1], difficulty: 3, passed: false }
      ] as Catalog[]

    case 3:
      return [
        { id: 7, name: 'C-Catalog 1', requirements: [], difficulty: 1, passed: true },
        { id: 8, name: 'C-Catalog 2', requirements: [1], difficulty: 2, passed: true },
        { id: 9, name: 'C-Catalog 3', requirements: [2, 1], difficulty: 3, passed: true }
      ] as Catalog[]

    default:
      break
  }
}

const getDifficultyColor = (difficulty: number) => {
  switch (difficulty) {
    case 1:
      return 'green'
    case 2:
      return 'orange'
    case 3:
      return 'red'
    default:
      return 'grey'
  }
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

// const testRequest = async () => {
//   await axios
//     .post('api_v1/allquestions', {
//       headers: {
//         Authorization:
//           'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb3Vyc2VSb2xlcyI6IntcIjE4N1wiOlwiVFVUT1JcIn0iLCJpZCI6MSwiaWF0IjoxNzE1MDQ5MDIyfQ.HtvksRvlL3ttT5MuaZvh7D4NgfuscJ-ZJ5vuIa77EWM'
//       }
//     })
//     .then((response) => {
//       console.log(response)
//     })
// }
</script>

<style scoped lang="scss"></style>
