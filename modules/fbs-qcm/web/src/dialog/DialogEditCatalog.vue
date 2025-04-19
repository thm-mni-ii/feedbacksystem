<template>
  <v-snackbar
    v-model="snackbar.show"
    :timeout="snackbar.timeout"
    :color="snackbar.color"
    multi-line
  >
    {{ snackbar.text }}

    <template #actions>
      <v-btn color="gray" variant="text" @click="snackbar.show = false"> Close </v-btn>
    </template>
  </v-snackbar>

  <v-dialog v-model="editCatalogDialog" width="500px">
    <v-card>
      <v-card-title>
        <span v-if="isNew">Create Catalog</span>
        <span v-else>Edit Catalog</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12">
              <v-select
                v-model="catalog.course"
                :items="allCourses"
                item-title="name"
                item-value="id"
                label="Course"
                @change="changeCourse"
              ></v-select>

              <v-text-field v-model="catalog.name" label="Name"></v-text-field>

              <v-select
                v-model="catalog.requirements"
                :items="allCatalogs"
                item-title="name"
                item-value="id"
                label="Requirements"
              ></v-select>
              <v-switch v-model="catalog.isPublic" label="is Public" color="primary"></v-switch>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="_cancel">Cancel</v-btn>
        <v-btn v-if="isNew" @click="createCatalog">Create</v-btn>
        <v-btn v-else @click="updateCatalog">Update</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type Catalog from '@/model/Catalog'
import axios from 'axios'
import type Course from '@/model/Course'
import courseService from '@/services/course.service'
import catalogService from '@/services/catalog.service'

const editCatalogDialog = ref(false)

const catalog = ref<Catalog>({} as Catalog)
const allCourses = ref<Course[]>([])
const allCatalogs = ref<Catalog[]>([])
const isNew = ref<boolean>(true)

const snackbar = ref({
  show: false,
  text: '',
  color: 'red',
  timeout: 5000
})

const getMyCourses = () => {
  courseService
    .getMyCourses()
    .then((response) => {
      allCourses.value = response.data as Course[]
    })
    .catch((error) => {
      console.log(error)
    })
}

const updateCatalogs = () => {
  // get all catalogs from the course selected
  if (catalog.value.course) {
    axios
      .get(`api_v1/catalogs/${catalog.value.course}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jsessionid')}`
        }
      })
      .then((response) => {
        allCatalogs.value = response.data as Catalog[]
      })
      .catch((error) => {
        console.log(error)
      })
  }
}

const changeCourse = () => {
  catalog.value.requirements = [] as number[]

  updateCatalogs()
}

const createCatalog = () => {
  catalogService
    .postCatalog(catalog.value)
    .then(() => {
      _confirm()
    })
    .catch((error) => {
      console.log(error)
      openSnackbar('Error creating catalog: ' + error.response.data)
    })
}

const updateCatalog = () => {
  catalogService
    .putCatalog(catalog.value)
    .then(() => {
      _confirm()
    })
    .catch((error) => {
      console.log(error)
      openSnackbar('Error updating catalog: ' + error.response.data)
    })
}

const openSnackbar = (text: string) => {
  snackbar.value.text = text
  snackbar.value.show = true
}

// Promise resolve
const resolvePromise = ref<Function | undefined>(undefined)

const openDialog = (courseId: number, editCatalog?: Catalog) => {
  if (editCatalog !== undefined) {
    //as new instance
    catalog.value = { ...editCatalog }
    isNew.value = false
  } else {
    isNew.value = true
    catalog.value.course = courseId
  }
  editCatalogDialog.value = true

  getMyCourses()
  updateCatalogs()

  return new Promise((resolve) => {
    resolvePromise.value = resolve
  })
}

const _confirm = () => {
  editCatalogDialog.value = false
  resolvePromise.value && resolvePromise.value(true)
}

const _cancel = () => {
  editCatalogDialog.value = false
  resolvePromise.value && resolvePromise.value(false)
}

// define expose
defineExpose({
  openDialog
})
</script>
