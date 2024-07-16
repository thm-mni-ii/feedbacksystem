<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import CatalogSession from '../components/CatalogSession.vue'

import type Catalog from '../model/Catalog'
import type Question from '../model/Question'
// import type UserAnswers from '../model/UserAnswers'

const route = useRoute()

const questions = ref<Question[]>([
  { id: 1, text: 'wieviel Bits hat 1 Byte?', answers: [14, 8, 64], type: 'multiple choice' },
  {
    id: 2,
    text: 'Welche SQL-Anweisung wird verwendet, um Daten in eine Datenbanktabelle einzufügen?',
    answers: ['INSERT', 'ADD', 'UPDATE', 'PUT'],
    type: 'multiple choice'
  },
  {
    id: 3,
    text: 'Was sind Vorteile der Normalisierung in Datenbanken?',
    answers: [
      'Minimierung von Datenredundanz',
      'Verbesserung der Abfragegeschwindigkeit',
      'Erleichterung der Wartung',
      'Vereinfachung der Datenbankstruktur'
    ],
    type: 'multiple choice'
  },
  {
    id: 4,
    text: 'Welche der folgenden SQL-Kommandos können genutzt werden, um Datenbankstrukturen zu ändern?',
    answers: ['CREATE', 'SELECT', 'DROP'],
    type: 'multiple choice'
  },
  {
    id: 5,
    text: 'Welche der folgenden Aussagen treffen auf Primärschlüssel zu? ',
    answers: [
      'Sie können NULL-Werte enthalten',
      'Sie müssen eindeutig sein',
      'Sie dienen als eindeutiger Identifikator für Datensätze',
      'Es kann mehrere Primärschlüssel in einer Tabelle geben'
    ],
    type: 'multiple choice'
  }
])
const currentQuestionIndex = ref(0)

const catalog = ref<Catalog>({
  id: route.params.catalogId,
  name: 'Catalog Questions',
  difficulty: 1,
  passed: false,
  questions: questions.value.map((question) => question.id),
  requirements: null
})

const submitAnswer = (selectedAnswers) => {
  // console.log('Selected Answers:' + selectedAnswers.value)
  if (currentQuestionIndex.value < catalog.value.questions.length - 1) {
    currentQuestionIndex.value += 1
  }
  console.log('current Index: ' + currentQuestionIndex.value)
  console.log('question length: ' + catalog.value.questions.length)
  console.log(selectedAnswers)
}

onMounted(() => {
  console.log(route.params.catalogId)
})
</script>

<template>
  <v-form @submit.prevent="submitAnswer">
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
            :max="questions.length"
            color="primary"
            height="8"
            :model-value="currentQuestionIndex + 1"
            stream
            rounded
          ></v-progress-linear>
        </div>

        <CatalogSession
          :question="questions[currentQuestionIndex]"
          :current-question-index="currentQuestionIndex"
        />
      </v-responsive>
    </v-sheet>
  </v-form>
</template>

<style scoped lang="scss"></style>
