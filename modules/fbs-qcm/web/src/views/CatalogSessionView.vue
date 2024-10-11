<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import CatalogSession from '../components/CatalogSession.vue'

import type Catalog from '../model/Catalog'
import type Choice from '@/model/questionTypes/Choice'
import type Question from '@/model/Question'
import type QuestionType from '@/enums/QuestionType'
import axios from 'axios'

const questionId = ref('6638fbdb7cbf615381a90abe')
//const questionData = ref(null)
const route = useRoute()

const getQuestion = async () => {
  const token = localStorage.getItem('token')
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  }
  try {
    const res = await axios.get('/api_v1/question', { ...config, params: { ID: questionId.value } })
    console.log('One Question:', res)
    questionData.value = res.data
  } catch (err) {
    console.log(err)
  }
}

const questionData: Question = {
  _id: '6638fbdb7cbf615381a90abe',
  owner: 1,
  questiontext: 'Was ist 2 + 57?',
  questiontags: ['komplex', 'frage'],
  questiontype: 'Choice' as QuestionType,
  questionconfiguration: {
    multipleRow: true,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: ''
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
}

const catalog = ref<Catalog>({
  id: route.params.catalogId,
  name: 'Datenbanken - SQL',
  difficulty: 1,
  passed: false,
  requirements: null
})

const submitAnswer = (arr) => {
  getQuestion()
  console.log('selected Answers: ', arr)
}

onMounted(() => {
  console.log(route.params.catalogId)
  //  getQuestion()
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
          @submitAnswer="(a) => submitAnswer(a)"
        />
      </v-responsive>
    </v-sheet>
  </v-form>
</template>

<style scoped lang="scss"></style>
