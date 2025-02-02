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

const submitAnswer = async (answer: any) => {
  if (!questionData.value || !questionData.value._id) {
    console.error('Question data or ID is undefined.')
    return
  }
  try {
    // Submit the answer and get the next question
    const submitResponse = await sessionService.submitAnswer(questionData.value._id, answer)
    // Update the question data with the next question from the response
    console.log(submitResponse)
    questionData.value = submitResponse.data
  } catch (error) {
    console.error('Error submitting answer:', error)
  }
}

onMounted(async () => {
  try {
    const checkSessionResponse = await sessionService.checkSession()
    if (checkSessionResponse.data.length === 0) {
      console.log('No active session found. Starting a new session.')
      const startSessionResponse = await sessionService.startSession(
        187,
        '663a51d228d8781d96050905'
      )
      questionData.value = startSessionResponse.data
    } else {
      console.log('Active session found:', checkSessionResponse.data)
      const currentQuestionResponse = await sessionService.getCurrentQuestion()
      questionData.value = currentQuestionResponse.data
    }
  } catch (error) {
    console.error('Error fetching session:', error)
    showErrorPage.value = true
  }
  if (!route.params.catalogId || !route.params.courseId) {
    console.log('Error: Missing required parameters.')
    showErrorPage.value = true
  }
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
