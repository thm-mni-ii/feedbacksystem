<script setup lang="ts">
import { useRoute } from 'vue-router'
import { ref, computed, onMounted } from 'vue'
import courseService from '@/services/course.service'
import questionService from '@/services/question.service'
// import studyService from '@/services/study.service' // Later for queue logic
import CatalogSession from '../components/CatalogSession.vue'

const route = useRoute()
const courseId = Number(route.params.courseId)
const courseInformation = ref<{ name?: string }>({})

// Question queue simulation
const questionData = ref<any>(null)
const progressBar = ref<number>(1)

// Feedback state
const showFeedback = ref<boolean>(false)
const currentQuestionScore = ref<number>(0)
const formattedScore = computed(() => (currentQuestionScore.value * 100).toFixed(2))
const scoreEmoji = computed(() => {
  if (currentQuestionScore.value < 0.1) return '💀'
  if (currentQuestionScore.value < 0.4) return '😐'
  if (currentQuestionScore.value < 0.6) return '🙂'
  return '😎'
})

const sessionOver = ref<boolean>(false)

async function loadCourseInformation(courseId: number) {
  const { data } = await courseService.getCoreCourse(courseId)
  courseInformation.value = data
}

async function loadQuestion() {
  // Later: use studyService.currentQuestion()
  const { data } = await questionService.getQuestion('67f7f553d93fb13cd308e80c')
  questionData.value = data
}

const submitAnswer = async (answer: any) => {
  console.log('Submitted answer:', answer)

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

      const catalogScoreRes = await catalogService.getCatalogScore(sessionId.value)
      catalogScore.value = catalogScoreRes.data.score
      catalogEvaluation.value = catalogScoreRes.data

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

const nextQuestion = async () => {
  showFeedback.value = false
  progressBar.value++

  if (progressBar.value > 10) {
    sessionOver.value = true
    return
  }

  await loadQuestion()
}

onMounted(async () => {
  await loadCourseInformation(courseId)
  await loadQuestion()
})
</script>

<template>
  <v-sheet
    class="d-flex align-center justify-center flex-wrap flex-column text-center mx-auto my-14 px-4"
    elevation="4"
    height="auto"
    width="80%"
    rounded
  >
    <v-responsive class="mx-auto" width="85%">
      <h3 class="text-h3 mt-8 font-weight-black text-blue-grey-darken-2">
        {{ courseInformation.name }}
      </h3>

      <v-progress-linear
        class="my-6"
        :model-value="progressBar"
        :max="10"
        height="8"
        color="primary"
        rounded
        stream
      />

      <div v-if="sessionOver && !showFeedback">
        <h4 class="text-h4 my-8 font-weight-black text-primary">Session finished 🎉</h4>
        <v-btn variant="tonal" @click="$router.push('/')">Go back</v-btn>
      </div>

      <!-- Feedback -->
      <div v-if="showFeedback">
        <h4 class="text-h4 my-8 font-weight-black text-primary">You scored:</h4>
        <p class="text-blue-grey-darken-2">
          <b>{{ formattedScore }} % {{ scoreEmoji }}</b>
        </p>
        <v-btn variant="tonal" class="my-4" @click="nextQuestion"> Next </v-btn>
      </div>

      <!-- Current Question -->
      <CatalogSession
        v-if="questionData && !showFeedback && !sessionOver"
        :question="questionData"
        @submit-answer="submitAnswer"
      />
    </v-responsive>
  </v-sheet>
</template>
