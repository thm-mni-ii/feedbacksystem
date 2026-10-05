<template>
  <v-card class="pa-6">
    <div class="mb-4">
      <v-chip color="primary" variant="tonal">
        {{ currentQuestion.targetCompetency.name }}
      </v-chip>
    </div>

    <h2 v-if="!isFillInTheBlanks" class="mb-6">
      {{ currentQuestion.question.title || currentQuestion.question.text }}
    </h2>

    <div class="mb-6">
      <div class="d-flex justify-space-between text-caption text-medium-emphasis mb-1">
        <span>Session-Fortschritt</span>
        <span>{{ progressLabel }}</span>
      </div>
      <v-progress-linear
        :model-value="progress"
        color="primary"
        rounded
        height="8"
        aria-label="Session-Fortschritt"
      />
    </div>

    <template v-if="isChoice">
      <div v-if="!choiceConfiguration.multipleColumn" class="d-flex flex-column ga-2">
        <v-radio-group
          v-if="choiceAnswerMode === 'single'"
          :model-value="selectedOptionIds[0] ?? null"
          hide-details
          @update:model-value="selectSingleOption"
        >
          <v-radio
            v-for="option in displayedOptionRows"
            :key="option.id"
            :value="option.id"
            :label="option.text"
            color="primary"
          />
        </v-radio-group>
        <v-checkbox
          v-for="option in displayedOptionRows"
          v-else
          :key="option.id"
          :model-value="selectedOptionIds.includes(option.id)"
          :label="option.text"
          color="primary"
          hide-details
          @update:model-value="toggleOption(option.id)"
        />
      </div>

      <v-table v-else>
        <thead>
          <tr>
            <th />
            <th
              v-for="column in choiceConfiguration.answerColumns"
              :key="column.id"
              class="text-left"
            >
              {{ column.name }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="option in displayedOptionRows" :key="option.id">
            <td>{{ option.text }}</td>
            <td v-for="column in choiceConfiguration.answerColumns" :key="column.id">
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
    </template>

    <template v-else-if="isFillInTheBlanks">
      <p class="text-body-2 text-medium-emphasis mb-2">Fülle die Lücke(n) im Text aus.</p>
      <FillInTheBlanksQuestion
        v-model="fillInTheBlanksAnswer"
        :questionconfiguration="fillInTheBlanksConfiguration"
        :blank-strings="[]"
      />
    </template>

    <MatchingQuestionInteraction
      v-else-if="isMatching && isMatchingConfigurationValid"
      :configuration="matchingConfiguration"
      @update:answer="matchingAnswer = $event"
    />

    <v-alert v-else-if="isMatching" type="warning" variant="tonal">
      Diese Zuordnungsaufgabe hat eine unvollständige Konfiguration (keine Elemente/Kategorien)
      und kann nicht angezeigt werden.
    </v-alert>

    <v-alert v-else type="warning" variant="tonal">
      Unbekannter Aufgabentyp: {{ currentQuestion.question.questionType }}
    </v-alert>

    <v-btn color="primary" class="mt-6" :disabled="!hasAnswer" @click="submit">
      Antwort speichern
    </v-btn>
  </v-card>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import QuestionType from '@/enums/QuestionType'
import FillInTheBlanksQuestion from '@/components/FillInTheBlanksQuestion.vue'
import type { NextQuestion } from '@/model/types'
import type { Choice } from '@/model/questionTypes/Choice'
import type FillInTheBlanks from '@/model/questionTypes/FillInTheBlanks'
import type { Matching } from '@/model/questionTypes/Matching'
import { scoreChoice, scoreFillInTheBlanks, scoreMatching } from '@/composables/answerScoring'
import MatchingQuestionInteraction from '@/components/MatchingQuestionInteraction.vue'

interface Props {
  currentQuestion: NextQuestion
  progress: number
  progressLabel: string
}

interface AnswerSubmission {
  score: number
  isCorrect: boolean
  responsePayload: unknown
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (event: 'submitAnswer', value: AnswerSubmission): void
}>()

const selectedOptionIds = ref<number[]>([])
const selectedMatrixPairs = ref<Array<{ rowId: number; colId: number }>>([])
const fillInTheBlanksAnswer = ref<Record<number, string>>({})
const matchingAnswer = ref<Record<string, string>>({})
const displayedOptionRows = ref<Choice['optionRows']>([])

const isChoice = computed(
  () => props.currentQuestion.question.questionType === QuestionType.Choice
)
const isFillInTheBlanks = computed(
  () => props.currentQuestion.question.questionType === QuestionType.FillInTheBlanks
)
const isMatching = computed(
  () => props.currentQuestion.question.questionType === QuestionType.Matching
)
const choiceConfiguration = computed(
  () => props.currentQuestion.question.questionConfiguration as Choice
)
const fillInTheBlanksConfiguration = computed(
  () => props.currentQuestion.question.questionConfiguration as FillInTheBlanks
)
const matchingConfiguration = computed(
  () => props.currentQuestion.question.questionConfiguration as Matching
)
const choiceAnswerMode = computed(
  () => choiceConfiguration.value.answerMode ?? (choiceConfiguration.value.multipleRow ? 'multiple' : 'single')
)
// Schutz gegen unvollständig gespeicherte/migrierte Matching-Aufgaben (z.B.
// fehlende `items`/`categories`), siehe scoreMatching() weiter unten.
const isMatchingConfigurationValid = computed(
  () =>
    Array.isArray(matchingConfiguration.value?.items) &&
    Array.isArray(matchingConfiguration.value?.categories)
)
const hasAnswer = computed(() => {
  if (isChoice.value) {
    return choiceConfiguration.value.multipleColumn
      ? selectedMatrixPairs.value.length > 0
      : selectedOptionIds.value.length > 0
  }

  if (isFillInTheBlanks.value) {
    return Object.values(fillInTheBlanksAnswer.value).some((answer) => answer.trim().length > 0)
  }

  if (isMatching.value) {
    const items = matchingConfiguration.value.items ?? []
    return items.length > 0 && Object.keys(matchingAnswer.value).length === items.length
  }

  return false
})

watch(
  () => props.currentQuestion.question.id,
  () => {
    selectedOptionIds.value = []
    selectedMatrixPairs.value = []
    fillInTheBlanksAnswer.value = {}
    matchingAnswer.value = {}
    const optionRows = choiceConfiguration.value?.optionRows
    displayedOptionRows.value = Array.isArray(optionRows) ? shuffleOptionRows(optionRows) : []
  },
  { immediate: true }
)

function shuffleOptionRows(optionRows: Choice['optionRows']): Choice['optionRows'] {
  const shuffledRows = [...optionRows]
  for (let index = shuffledRows.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    const currentRow = shuffledRows[index]
    shuffledRows[index] = shuffledRows[swapIndex]
    shuffledRows[swapIndex] = currentRow
  }
  return shuffledRows
}

function toggleOption(optionId: number) {
  selectedOptionIds.value = selectedOptionIds.value.includes(optionId)
    ? selectedOptionIds.value.filter((id) => id !== optionId)
    : [...selectedOptionIds.value, optionId]
}

function selectSingleOption(optionId: number | null) {
  selectedOptionIds.value = optionId === null ? [] : [optionId]
}

function isMatrixSelected(rowId: number, colId: number) {
  return selectedMatrixPairs.value.some((pair) => pair.rowId === rowId && pair.colId === colId)
}

function toggleMatrix(rowId: number, colId: number) {
  selectedMatrixPairs.value = isMatrixSelected(rowId, colId)
    ? selectedMatrixPairs.value.filter(
        (pair) => !(pair.rowId === rowId && pair.colId === colId)
      )
    : [...selectedMatrixPairs.value, { rowId, colId }]
}

function submit() {
  if (!hasAnswer.value) throw new Error('Es wurde noch keine Antwort eingegeben.')
  const score = isChoice.value
    ? scoreChoice(choiceConfiguration.value, selectedOptionIds.value, selectedMatrixPairs.value)
    : isFillInTheBlanks.value
      ? scoreFillInTheBlanks(fillInTheBlanksConfiguration.value, fillInTheBlanksAnswer.value)
      : isMatching.value
        ? scoreMatching(matchingConfiguration.value, matchingAnswer.value)
        : null
  if (score === null) throw new Error('Der Aufgabentyp kann nicht bewertet werden.')
  const responsePayload = isChoice.value
    ? choiceConfiguration.value.multipleColumn
      ? selectedMatrixPairs.value
      : selectedOptionIds.value
    : isFillInTheBlanks.value
      ? fillInTheBlanksAnswer.value
      : matchingAnswer.value

  emit('submitAnswer', {
    score,
    isCorrect: score === 1,
    responsePayload
  })
}
</script>
