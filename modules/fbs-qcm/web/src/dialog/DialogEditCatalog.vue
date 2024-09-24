<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type Catalog from '@/model/Catalog'
import axios from 'axios'
import type Course from '@/model/Course'
import type Question from '@/model/Question'

const editCatalogDialog = ref(false)

const catalog = ref<Catalog>({} as Catalog)
const allCourses = ref<Course[]>([])
const allCatalogs = ref<Catalog[]>([])
const isNew = ref<boolean>(true)

onMounted(() => {
  getCourses()
    .then((response) => {
      allCourses.value = response.data as Course[]
      console.log(allCourses.value)
    })
    .catch((error) => {
      console.log(error)
    })

  updateCatalogs()
})

const getCourses = () => {
  return axios.get('core/courses', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('jsessionid')}`
    }
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
  catalog.value.reqirements = [] as number[]

  updateCatalogs()
}

const createCatalog = () => {
  axios
    .post('api_v1/catalog', catalog.value, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('jsessionid')}`
      }
    })
    .then((response) => {
      console.log(response)
      _confirm()
    })
    .catch((error) => {
      console.log(error)
    })
}

// Promise resolve
const resolvePromise = ref<Function | undefined>(undefined)

const openDialog = (courseId: number, editCatalog?: Catalog) => {
  if (editCatalog !== undefined) {
    catalog.value = editCatalog
    isNew.value = false
  } else {
    isNew.value = true
    catalog.value.course = courseId
  }
  editCatalogDialog.value = true

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

<template>
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
                v-model="catalog.reqirements"
                :items="allCatalogs"
                item-title="name"
                item-value="id"
                label="Requirements"
              ></v-select>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="_cancel">Cancel</v-btn>
        <v-btn @click="createCatalog">Create</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
