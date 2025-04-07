<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import questionService from '@/services/question.service' // Pfad anpassen

const props = defineProps({
  questionReport: {
    type: Array,
    required: true
  },
  score: {
    type: Number,
    required: true
  }
})

const { questionReport, score } = props
const questionTexts = ref<{ [key: string]: string }>({})

onMounted(async () => {
  await fetchQuestionTexts()
})

async function fetchQuestionTexts() {
  const promises = questionReport.map(async (report) => {
    try {
      const response = await questionService.getQuestion(report.questionId)
      questionTexts.value[report.questionId] = response.data.questiontext
    } catch (error) {
      console.error(`Fehler beim Abrufen des Fragetextes für ${report.questionId}:`, error)
      questionTexts.value[report.questionId] = 'Fehler beim Laden der Frage'
    }
  })

  await Promise.all(promises)
}
</script>
<template>
  <v-container>
    <v-card v-for="(report, index) in questionReport" :key="index" class="mb-4">
      <v-card-title>{{ questionTexts[report.questionId] || 'Frage wird geladen...' }}</v-card-title>
      <v-card-text>
        <div v-if="report.correctAnswer.multipleColumn">
          <v-table>
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
                  <v-icon v-if="row.correctAnswers.includes(col.id)"
                    >mdi-check-circle-outline</v-icon
                  >
                  <v-icon v-else>mdi-close-circle-outline</v-icon>
                </td>
              </tr>
            </tbody>
          </v-table>

          <div class="mt-4">
            <strong>Deine Antworten:</strong>
            <div v-for="given in report.givenAnswer" :key="given.id">
              {{ given.text }}: {{ given.entries.map((e) => e.text).join(', ') }}
            </div>
          </div>
        </div>
        <div v-else>
          <div v-for="row in report.correctAnswer.optionRows" :key="row.id">
            {{ row.text }}:
            <v-icon v-if="row.correctAnswers.includes(row.id)">mdi-check-circle-outline</v-icon>
            <v-icon v-else>mdi-close-circle-outline</v-icon>
          </div>
          <div class="mt-4">
            <strong>Deine Antworten:</strong>
            <div v-for="given in report.givenAnswer" :key="given.id">
              {{ given.text }}
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>
    <v-card>
      <v-card-title>Gesamtpunktzahl</v-card-title>
      <v-card-text>
        {{ score }}
      </v-card-text>
    </v-card>
  </v-container>
</template>
