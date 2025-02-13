<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CatalogSession from '../components/CatalogSession.vue'
import sessionService from '@/services/session.service'

import type Catalog from '../model/Catalog'
import type Question from '@/model/Question'
const route = useRoute()
const router = useRouter()

const showErrorPage = ref<Boolean>(false)
const catalogStatus = ref<string | null>(null)
const questionData = ref<Question>()
const progressBar = ref<number>(1)
const showFeedback = ref<boolean>(false)
const currentQuestionScore = ref<number>(0)
const formattedScore = computed(() => (currentQuestionScore.value * 100).toFixed(2))

const scoreEmoji = computed(() => {
  if (currentQuestionScore.value < 0.2) return '💀'
  if (currentQuestionScore.value < 0.4) return '😐'
  if (currentQuestionScore.value < 0.6) return '🙂'
  return '😎'
})

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
    console.log('QUESION DATA SUBMITANSWER:', questionData)
    const submitResponse = await sessionService.submitAnswer(questionData.value._id, answer)
    currentQuestionScore.value = submitResponse.data.correct.score
    showFeedback.value = true
    console.log('CATALOG ID: ', route.params.catalogId)
    // erst feedback geben
    sessionService
      .getCurrentQuestion(route.params.catalogId)
      .then((res) => {
        console.log('CURRENT QUESTION:', res)
        if (res.data.catalog === 'over') {
          catalogStatus.value = 'over'
        } else {
          catalogStatus.value = null
        }
        questionData.value = res.data
      })
      .catch((error) => console.error('Error fetching question:', error))
  } catch (error) {
    console.error('Error submitting answer:', error)
  } finally {
    progressBar.value++
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
      const currentQuestionResponse = await sessionService.getCurrentQuestion(
        route.params.catalogId
      )
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
            :model-value="progressBar"
            stream
            rounded
          ></v-progress-linear>
        </div>
        <div v-if="catalogStatus == 'over' && !showFeedback">
          <h4 class="text-h4 my-8 font-weight-black text-blue-grey-darken-2">Finished!🎉</h4>
          <p class="text-blue-grey-darken-2">evaluation......</p>
          <v-btn
            variant="tonal"
            class="mx-auto my-8"
            type="button"
            append-icon="mdi-arrow-right-bold-outline"
            @click="router.push('/')"
          >
            Go back
          </v-btn>
        </div>
        <div v-if="showFeedback">
          <h4 class="text-h4 my-8 font-weight-black text-blue-grey-darken-2">You scored:</h4>
          <p class="text-blue-grey-darken-2">{{ formattedScore }} % {{ scoreEmoji }}</p>
          <v-btn
            variant="tonal"
            class="mx-auto my-8"
            type="button"
            append-icon="mdi-arrow-right-bold-outline"
            @click="showFeedback = false"
          >
            next
          </v-btn>
        </div>
        <CatalogSession
          v-if="questionData && catalogStatus == null && !showFeedback"
          :question="questionData"
          @submit-answer="submitAnswer"
        />
      </v-responsive>
    </v-sheet>
  </v-form>
</template>
