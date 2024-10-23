<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import CatalogSession from '../components/CatalogSession.vue'
import questionService from '@/services/question.service'

import type Catalog from '../model/Catalog'
import type { Choice } from '@/model/questionTypes/Choice'
import type Question from '@/model/Question'
import type QuestionType from '@/enums/QuestionType'

const route = useRoute()

const secondQuestion = questionService.getQuestion('6711ef0ac939e62058234a2c')

export interface SelectedAnswers {
  rowId: number
  colId: number | string
}

const questionData = ref<Question>({
  _id: '6638fbdb7cbf615381a90abe',
  owner: 1,
  questiontext: 'Was ist 2 + 57?',
  questiontags: ['komplex', 'frage'],
  questiontype: 'Choice' as QuestionType,
  questionconfiguration: {
    multipleRow: true,
    multipleColumn: true,
    answerColumns: [
      {
        id: 1,
        name: 'first col',
        correctAnswers: [0, 2]
      },
      {
        id: 2,
        name: 'second col',
        correctAnswers: [1]
      },
      {
        id: 3,
        name: 'third Col',
        correctAnswers: [1, 2]
      }
    ],
    optionRows: [
      {
        id: 0,
        text: 'erste Antwort'
      },
      {
        id: 1,
        text: 'zweite Antwort'
      },
      {
        id: 2,
        text: 'dritte antworttt'
      }
    ]
  } as Choice
})

const catalog = ref<Catalog>({
  id: route.params.catalogId,
  name: 'Datenbanken - SQL',
  difficulty: 1,
  passed: false,
  requirements: null
})

const submitAnswer = (answer: SelectedAnswers[]) => {
  console.log('Selected Answers:', answer)
  // axios.post('/api_v1/submitSessionAnswer', selectedAnswers, config)
  //     .then((res) => console.log(res))
  //     .catch((err) => console.log(err))
}

onMounted(() => {
  console.log(route.params.catalogId)
  console.log(secondQuestion)
  questionService.getQuestion('6710d767c939e62058234a2b')
})
</script>

<template>
  <v-form class="mt-12" @submit.prevent="submitAnswer">
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
          @submit-answer="(a) => submitAnswer(a)"
        />
      </v-responsive>
    </v-sheet>
  </v-form>
</template>
