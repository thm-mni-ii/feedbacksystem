<template>
  <v-card class="pa-6">
    <div class="mb-4">
      <v-chip color="primary" variant="tonal">
        {{ currentQuestion.targetCompetency.name }}
      </v-chip>
    </div>

    <h2 class="mb-6">
      {{ currentQuestion.question.title || currentQuestion.question.text }}
    </h2>

    <template v-if="answerConfig">
      <div
        v-if="isChoiceLike && !choiceConfig.multipleColumn"
        class="d-flex flex-column"
      >
        <div
          v-for="option in choiceConfig.optionRows"
          :key="option.id"
          class="d-flex justify-start mb-2"
        >
          <v-checkbox
            :model-value="selectedOptionIds.includes(option.id)"
            :label="option.text"
            color="primary"
            hide-details
            @update:model-value="toggleOption(option.id)"
          />
        </div>
      </div>

      <div v-else-if="isChoiceLike && choiceConfig.multipleColumn" class="mt-2">
        <v-table>
          <thead>
            <tr>
              <th></th>
              <th v-for="column in choiceConfig.answerColumns" :key="column.id" class="text-left">
                {{ column.name }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="option in choiceConfig.optionRows" :key="option.id">
              <td>{{ option.text }}</td>
              <td v-for="column in choiceConfig.answerColumns" :key="column.id">
                <v-checkbox
                  :model-value="isMatrixSelected(option.id, column.id)"
                  color="primary"
                  hide-details
                  @update:model-value="toggleMatrix(option.id, column.id)"
                />
              </td>
            </tr>
          </tbody>
        </v-table>
      </div>

      <FillInTheBlanksQuestion
        v-else-if="currentQuestion.question.questionType === QuestionType.FillInTheBlanks"
        v-model="fillInTheBlanksAnswer"
        :questionconfiguration="fillInTheBlanksConfig"
        :blank-strings="[]"
      />

      <v-alert v-else type="warning" variant="tonal" class="mb-4">
        Unbekannter Fragetyp: {{ currentQuestion.question.questionType }}
      </v-alert>
    </template>
    <v-alert v-else type="info" variant="tonal" class="mb-4">
      Für diese Frage liegen keine Antwortmöglichkeiten vor.
    </v-alert>

    <v-btn color="primary" class="mt-6" @click="submit">Antwort speichern</v-btn>
  </v-card>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { NextQuestion } from '@/model/types'
import type { Choice } from '@/model/questionTypes/Choice'
import type FillInTheBlanks from '@/model/questionTypes/FillInTheBlanks'
import QuestionType from '@/enums/QuestionType'
import FillInTheBlanksQuestion from '@/components/FillInTheBlanksQuestion.vue'

interface Props {
  currentQuestion: NextQuestion
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'submitAnswer', value: number): void
}>()

const answerConfig = computed(() => props.currentQuestion.question.questionConfiguration)
const choiceConfig = computed(() => answerConfig.value as Choice)
const fillInTheBlanksConfig = computed(() => answerConfig.value as FillInTheBlanks)
const isChoiceLike = computed(
  () => props.currentQuestion.question.questionType === QuestionType.Choice
)

const selectedOptionIds = ref<number[]>([])
const selectedMatrixPairs = ref<Array<{ rowId: number; colId: number }>>([])
const fillInTheBlanksAnswer = ref<{ [key: number]: string }>({})

watch(
  () => props.currentQuestion.question.id,
  () => {
    selectedOptionIds.value = []
    selectedMatrixPairs.value = []
    fillInTheBlanksAnswer.value = {}
  }
)

function toggleOption(optionId: number) {
  selectedOptionIds.value = selectedOptionIds.value.includes(optionId)
    ? selectedOptionIds.value.filter((id) => id !== optionId)
    : [...selectedOptionIds.value, optionId]
}

function isMatrixSelected(rowId: number, colId: number): boolean {
  return selectedMatrixPairs.value.some((pair) => pair.rowId === rowId && pair.colId === colId)
}

function toggleMatrix(rowId: number, colId: number) {
  selectedMatrixPairs.value = isMatrixSelected(rowId, colId)
    ? selectedMatrixPairs.value.filter((pair) => !(pair.rowId === rowId && pair.colId === colId))
    : [...selectedMatrixPairs.value, { rowId, colId }]
}

// Einfache Korrektheitsbewertung nur für die Demo-Anzeige: Anteil der korrekt
// beantworteten Teile (Options-Zeilen bzw. Lücken) ergibt den Score 0..1, der
// wie bei der Slider-Eingabe an den Algorithmus weitergereicht wird.
function computeScore(): number {
  if (!answerConfig.value) return 0

  if (isChoiceLike.value) {
    const rows = choiceConfig.value.optionRows
    if (!rows || rows.length === 0) return 0

    const correctRows = rows.filter((row) => {
      if (!choiceConfig.value.multipleColumn) {
        const isCorrect = row.correctAnswers.length > 0
        return isCorrect === selectedOptionIds.value.includes(row.id)
      }
      const expected = new Set(row.correctAnswers)
      const actual = new Set(
        selectedMatrixPairs.value.filter((pair) => pair.rowId === row.id).map((pair) => pair.colId)
      )
      return expected.size === actual.size && [...expected].every((id) => actual.has(id))
    })
    return correctRows.length / rows.length
  }

  if (props.currentQuestion.question.questionType === QuestionType.FillInTheBlanks) {
    const blanks = fillInTheBlanksConfig.value.textParts.filter((part) => part.isBlank)
    if (blanks.length === 0) return 0

    const correctBlanks = blanks.filter((blank) => {
      const given = (fillInTheBlanksAnswer.value[blank.order] ?? '').trim().toLowerCase()
      const accepted = [blank.text].map((value) => value.trim().toLowerCase())
      return accepted.includes(given)
    })
    return correctBlanks.length / blanks.length
  }

  return 0
}

function submit() {
  emit('submitAnswer', computeScore())
}
</script>
