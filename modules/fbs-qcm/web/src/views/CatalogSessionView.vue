<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CatalogSession from '../components/CatalogSession.vue'
import sessionService from '@/services/session.service'
import catalogService from '@/services/catalog.service'

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
const catalogScore = ref<Number>()

const scoreEmoji = computed(() => {
  if (currentQuestionScore.value < 0.1) return '💀'
  if (currentQuestionScore.value < 0.4) return '😐'
  if (currentQuestionScore.value < 0.6) return '🙂'
  return '😎'
})
const sessionId = ref<string>('')
const catalog = ref<Catalog>({
  id: route.params.catalogId as string,
  course: route.params.courseId as string,
  name: ''
})

const submitAnswer = async (answer: any) => {
  if (!questionData.value?._id || !sessionId.value) {
    console.error('[submitAnswer]: questionData or sessionId is undefined.')
    return
  }

  try {
    const submitResponse = await sessionService.submitAnswer(
      questionData.value._id,
      answer,
      sessionId.value
    )
    currentQuestionScore.value = submitResponse.data.correct.score
    showFeedback.value = true

    const res = await sessionService.getCurrentQuestion(sessionId.value)
    console.log(res.data)

    if (res.data.catalog === 'over') {
      console.log('Catalog finished. Ending Session.')

      await sessionService.endSession(sessionId.value)
      catalogStatus.value = 'over'

      const catalogScoreRes = await catalogService.getCatalogScore(sessionId.value);
      catalogScore.value = catalogScoreRes.data.score
      console.log('Catalog Score:', catalogScoreRes.data)
    } else {
      catalogStatus.value = null
      questionData.value = res.data
    }

    progressBar.value++
  } catch (error) {
    console.error('Error submitting Answer:', error)
  }
}

onMounted(async () => {
  try {
    const catalogId = route.params.catalogId as string
    const courseId = Number(route.params.courseId)

    const catalogResponse = await catalogService.getCatalog(catalogId)
    catalog.value.name = catalogResponse.data.name

    let sessionResponse = await sessionService.checkOngoingSession()

    if (!sessionResponse.data) {
      const startSessionResponse = await sessionService.startSession(courseId, catalogId)
      sessionId.value = startSessionResponse.data.sessionId

      sessionResponse = await sessionService.getCurrentQuestion(sessionId.value)
    } else {
      sessionId.value = sessionResponse.data._id
      sessionResponse = await sessionService.getCurrentQuestion(sessionId.value)
    }

    questionData.value = sessionResponse.data

    if (questionData.value.catalog === 'over') {
      catalogStatus.value = 'over'
      const catalogScoreRes = await catalogService.getCatalogScore(courseId, catalogId)
      catalogScore.value = catalogScoreRes.data.score
      console.log('[onMounted] Catalog Score:', catalogScore.value)
    } else {
      catalogStatus.value = null
    }
  } catch (error) {
    console.error('[onMounted] Error fetching question:', error)
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
          <h3 class="text-blue-grey-darken-2">Total Score: {{ catalogScore * 100 }} %</h3>
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
