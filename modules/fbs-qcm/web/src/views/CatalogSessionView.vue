<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import CatalogSession from '../components/CatalogSession.vue'
import sessionService from '@/services/session.service'

import type Catalog from '../model/Catalog'
import type Question from '@/model/Question'
const route = useRoute()

const showErrorPage = ref<Boolean>(false)

const questionData = ref<Question>()

export interface SelectedAnswers {
  rowId: number
  selectedColumns: number[]
}

const catalog = ref<Catalog>({
  id: route.params.catalogId,
  name: 'Datenbanken - SQL',
  difficulty: 1,
  passed: false,
  requirements: null
})

const submitAnswer = (answer: any) => {
  if (!questionData.value || !questionData.value._id) {
    console.error('Question data or ID is undefined.')
    return
  }
  sessionService
    .submitAnswer(questionData.value?._id, answer)
    .then((res) => {
      console.log(res)
      questionData.value = res.data
    })
    .catch((err) => {
      console.log('Submit Answer Error: ', err)
    })
}

onMounted(() => {
  // TODO: Check for ongoing session
  // TODO: no ongoing session > check parameter
  sessionService
    .startSession(187, '663a51d228d8781d96050905')
    .then((res) => {
      console.log('START SESSION : ', res)
      questionData.value = res.data
    })
    .catch((error) => {
      console.error('Fehler beim Abrufen der Frage:', error)
    })

  console.log(questionData)
  if (route.params.catalogId && route.params.courseId) {
    console.log(route.params.catalogId)
    // Start-session
  } else {
    // show keine aktive session - starte session über katalog
    console.log('error view anzeigen')
    showErrorPage.value = true
  }
  console.log(route.params.courseId)
})
</script>

<template>
  <v-card v-if="showErrorPage" class="h-52 mx-auto">
    <h2>Error: Could not find the page you're looking for</h2>
  </v-card>
  <v-form v-else class="mt-12">
    <v-sheet
      class="d-flex align-center justify-center flex-wrap flex-column text-center mx-auto my-14 px-4"
      elevation="4"
      height="auto"
      width="80%"
      rounded
    >
      <v-responsive class="mx-auto" width="85%">
        <h2 class="text-h4 my-8 font-weight-black text-blue-grey-darken-2">
          {{ catalog.name }}
        </h2>
        <div class="d-flex flex-row mb-8">
          <v-progress-linear
            min="0"
            :max="8"
            color="primary"
            height="8"
            :model-value="1"
            stream
            rounded
          ></v-progress-linear>
        </div>

        <CatalogSession
          v-if="questionData"
          :question="questionData"
          @submit-answer="submitAnswer"
        />
      </v-responsive>
    </v-sheet>
  </v-form>
</template>
