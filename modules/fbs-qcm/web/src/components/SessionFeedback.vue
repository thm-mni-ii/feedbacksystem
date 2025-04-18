<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import questionService from '@/services/question.service'

const props = defineProps({
  questionReport: {
    type: Array,
    required: true
  }
})

const { questionReport } = props
const questionTexts = ref<{ [key: string]: string }>({})

onMounted(async () => {
  await getQuestionTexts()
})

async function getQuestionTexts() {
  const promises = questionReport.map(async (report) => {
    try {
      const response = await questionService.getQuestion(report.questionId)
      questionTexts.value[report.questionId] = response.data.questiontext
      report.correctAnswer.textParts = response.data.questionconfiguration.textParts
    } catch (error) {
      console.error(`Fehler beim Abrufen des Fragetextes für ${report.questionId}:`, error)
      questionTexts.value[report.questionId] = 'Fehler beim Laden der Frage'
    }
  })
  await Promise.all(promises)
}

function getGivenAnswer(givenAnswers, order) {
  if (givenAnswers && Array.isArray(givenAnswers)) {
    const found = givenAnswers.find((a) => a.order === order)
    if (found) {
      return found.text
    }
  }
  return null
}

function isUserAnswered(givenAnswers, rowId, colId) {
  if (givenAnswers && Array.isArray(givenAnswers)) {
    return givenAnswers.some((answer) => {
      if (answer.id === rowId) {
        return answer.entries.some((entry) => entry.id === colId)
      }
      return false
    })
  }
  return false
}

function isAnswerCorrect(givenAnswers, correctAnswer, order) {
  if (givenAnswers && Array.isArray(givenAnswers)) {
    const userAnswer = givenAnswers.find((a) => a.order === order)?.text
    const correct = correctAnswer.find((part) => part.order === order)?.text
    return userAnswer === correct
  }
  return false
}

defineExpose({
  getGivenAnswer
})
</script>

<template>
  <v-container>
    <v-card v-for="(report, index) in questionReport" :key="index" class="mb-4">
      <v-card-title class="text-blue-grey-darken-2">
        {{ index + 1 }}. {{ questionTexts[report.questionId] }}
      </v-card-title>
      <v-card-text>
        <div v-if="report.correctAnswer.multipleColumn" class="text-blue-grey-darken-2">
          <v-table class="text-blue-grey-darken-2">
            <thead>
              <tr>
                <th>Option</th>
                <th v-for="col in report.correctAnswer.answerColumns" :key="col.id">
                  {{ col.name }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in report.correctAnswer.optionRows" :key="row.id">
                <td>{{ row.text }}</td>
                <td v-for="col in report.correctAnswer.answerColumns" :key="col.id">
                  <div class="d-flex align-center">
                    <v-icon v-if="row.correctAnswers.includes(col.id - 1)" color="primary">
                      mdi-check-circle-outline
                    </v-icon>
                    <v-icon v-else color="orange"> mdi-close-circle-outline </v-icon>
                    <v-checkbox
                      :model-value="isUserAnswered(report.givenAnswer, row.id, col.id)"
                      disabled
                      hide-details
                      class="ml-2"
                    ></v-checkbox>
                  </div>
                </td>
              </tr>
            </tbody>
          </v-table>

          <div class="mt-4">
            <span class="text-blue-grey-darken-2 text-subtitle-1">
              <b>score: {{ (report.score * 100).toFixed(2) }} %</b>
            </span>
          </div>
        </div>
        <div v-else-if="report.correctAnswer.textParts">
          <div class="text-container">
            <template v-for="part in report.correctAnswer.textParts" :key="part.order">
              <span v-if="!part.isBlank">{{ part.text }}&#160;</span>
              <span
                v-else
                :class="
                  isAnswerCorrect(
                    report.givenAnswer?.answers,
                    report.correctAnswer.textParts,
                    part.order
                  )
                    ? 'text-primary'
                    : 'text-orange'
                "
              >
                <strong>
                  {{ getGivenAnswer(report.givenAnswer?.answers, part.order) || 'Leer' }}&#160;
                </strong>
                <span
                  v-if="
                    !isAnswerCorrect(
                      report.givenAnswer?.answers,
                      report.correctAnswer.textParts,
                      part.order
                    )
                  "
                >
                  [Correct Answer:
                  <span class="text-primary">
                    {{ part.text }}
                  </span>
                  ]
                </span>
              </span>
            </template>
            <br />
            <span class="text-blue-grey-darken-2 text-subtitle-1">
              <b>score: {{ (report.score * 100).toFixed(2) }} %</b>
            </span>
          </div>
        </div>
        <div v-else>
          <div v-for="row in report.correctAnswer.optionRows" :key="row.id">
            {{ row.text }}:
            <v-icon v-if="row.correctAnswers.includes(row.id)" color="primary">
              mdi-check-circle-outline
            </v-icon>
            <v-icon v-else color="orange"> mdi-close-circle-outline </v-icon>
          </div>
          <div class="mt-4"></div>
          <span class="text-blue-grey-darken-2 text-subtitle-1">
            <b>score: {{ (report.score * 100).toFixed(2) }} %</b>
          </span>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>
