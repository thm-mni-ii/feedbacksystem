<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import CatalogSession from '../components/CatalogSession.vue'
import questionService from '@/services/question.service'
import sessionService from '@/services/session.service'

import type Catalog from '../model/Catalog'
import type { Choice } from '@/model/questionTypes/Choice'
import type Question from '@/model/Question'
import type QuestionType from '@/enums/QuestionType'

const route = useRoute()

const showErrorPage = ref<Boolean>(false)

const questionData = ref<Question | undefined>(undefined)

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

const submitAnswer = (answer: any[]) => {
  console.log('Selected Answers:', answer)
  sessionService.submitAnswer(answer)
  // axios.post('/api_v1/submitSessionAnswer', selectedAnswers, config)
  //     .then((res) => console.log(res))
  //     .catch((err) => console.log(err))
}

onMounted(() => {
  // TODO: Check for ongoing session
  // TODO: no ongoing session > check parameter
  questionService
    .getQuestion('6736fcf441f1abde09dc8c88')
    .then((response) => {
      questionData.value = response.data
      console.log('Question Data set:', questionData.value)
    })
    .catch((error) => {
      console.error('Fehler beim Abrufen der Frage:', error)
    })
  sessionService
    .startSession('6720d5942e91a503a151e9ea', 1)
    .then((res) => console.log(res))
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
  <v-form v-else class="mt-12" @submit.prevent="submitAnswer">
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
          @submit-answer="(a) => submitAnswer(a.selectedAnswers)"
        />
      </v-responsive>
    </v-sheet>
  </v-form>
</template>
