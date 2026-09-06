<script setup lang="ts">
import { ref } from 'vue'
import type Question from '../model/Question'
import type ChoiceQuestionConfiguration from '@/model/ChoiceQuestionConfiguration'
import type { Choice } from '@/model/questionTypes/Choice'
import questionService from '@/services/question.service'
import QuestionType from '../enums/QuestionType'
import { onMounted, onBeforeUnmount } from 'vue'
import QuestionCompetencies from './QuestionCompetencies.vue'
import EditFillInTheBlanks from './EditFillInTheBlanks.vue'
import EditChoiceQuestion from './EditChoiceQuestion.vue'

const props = withDefaults(
  defineProps<{
    inputQuestion?: Question
    isNew: boolean
    /**
     * Steuert, ob beim Speichern der echte Backend-Call (questionService)
     * ausgeführt wird. Der SkillGraph arbeitet mit lokalen Mock-Fragen, die
     * im Backend nicht existieren – dort wird `persist=false` übergeben und
     * die bearbeitete Frage stattdessen per `update`-Event nach oben gereicht.
     */
    persist?: boolean
  }>(),
  { persist: true }
)

const emit = defineEmits<{
  (e: 'update', question: Question): void
  (e: 'cancel'): void
}>()

const questionTypes = Object.values(QuestionType)

// Der Backend v2-/Seed-Datenbestand nutzt Legacy-Fragetyp-Strings
// ('single-choice', 'matrix', 'matching', 'fill-in-the-blank'), die nie
// exakt mit dem Frontend-Enum QuestionType ('Choice', 'FillInTheBlanks')
// übereinstimmen. Beide Varianten teilen sich aber dieselbe
// questionConfiguration-Struktur (optionRows/answerColumns bzw.
// textParts), daher hier auf Basis beider Werte matchen statt nur des Enums.
const choiceLikeTypes = new Set(['Choice', 'single-choice', 'matrix', 'matching'])
const fillInTheBlanksLikeTypes = new Set(['FillInTheBlanks', 'fill-in-the-blank'])

const isChoiceLikeQuestionType = (type?: string) => !!type && choiceLikeTypes.has(type)
const isFillInTheBlanksLikeQuestionType = (type?: string) =>
  !!type && fillInTheBlanksLikeTypes.has(type)

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    emit('cancel')
  }
}

const question = ref<Question>({
  text: '',
  competencyIds: [] as string[],
  questionType: QuestionType.Choice,
  difficulty: 0.5,
  questionConfiguration: {
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [{ id: 1, name: '' }],
    optionRows: [{ id: 1, text: '', correctAnswers: [] }]
  } as ChoiceQuestionConfiguration
} as Question)

const difficultyTicks = { 0: 'Easy', 0.5: 'Medium', 1: 'Hard' }

// Type Guard
function isChoiceQuestionConfiguration(config: any): config is Choice {
  return (
    config &&
    typeof config === 'object' &&
    'optionRows' in config &&
    Array.isArray(config.optionRows)
  )
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)

  if (!props.isNew && props.inputQuestion) {
    question.value = props.inputQuestion
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})

const checkMultipleRows = () => {
  if (isChoiceQuestionConfiguration(question.value.questionConfiguration)) {
    const optionRows = question.value.questionConfiguration.optionRows
    const rowsWithAnswers = optionRows.filter((row) => row.correctAnswers.length > 0)
    if (rowsWithAnswers.length > 1) {
      question.value.questionConfiguration.multipleRow = true
    }
  }
}

const handleUpdate = (updatedQuestion: Question) => {
  question.value = {
    ...question.value,
    questionConfiguration: updatedQuestion.questionConfiguration
  }
}

const updateCompetencyIds = (newCompetencyIds: string[]) => {
  question.value.competencyIds = newCompetencyIds
}

const handleSubmit = async () => {
  checkMultipleRows()

  if (!props.persist) {
    emit('update', question.value)
    return
  }

  if (props.isNew) {
    questionService
      .createQuestion(question.value)
      .then((res) => {
        console.log(res)
        emit('update', question.value)
      })
      .catch((err) => console.log(err))
  } else {
    questionService
      .updateQuestion(question.value)
      .then((res) => {
        console.log(res)
        emit('update', question.value)
      })
      .catch((err) => console.log(err))
  }
}
</script>

<template>
  <v-card class="w-75 mx-auto">
    <v-card-title class="text-h4 font-weight-bold text-center text-primary">{{
      isNew ? 'Add new Question' : 'Update Question'
    }}</v-card-title>
    <v-card-text>
      <v-form>
        <v-select
          v-model="question.questionType"
          :disabled="!isNew"
          label="Fragetyp"
          :items="questionTypes"
          variant="solo-filled"
        ></v-select>
        <v-textarea
          v-model="question.text"
          maxlength="130"
          auto-grow
          counter
          rows="3"
          label="Question"
          required
        ></v-textarea>
        <QuestionCompetencies
          :competency-ids="question.competencyIds"
          @update-competency-ids="updateCompetencyIds"
        />

        <v-slider
          v-model="question.difficulty"
          class="custom-slider"
          label="Difficulty"
          :ticks="difficultyTicks"
          show-ticks="always"
          tick-size="4"
          color="primary"
          min="0"
          max="1"
          step="0.1"
          thumb-label="always"
        ></v-slider>

        <EditChoiceQuestion
          v-if="isChoiceLikeQuestionType(question.questionType)"
          :question="question"
          :is-new="isNew"
          @update="handleUpdate"
        />
        <EditFillInTheBlanks
          v-if="isFillInTheBlanksLikeQuestionType(question.questionType)"
          :question="question"
          :is-new="isNew"
          @update="handleUpdate"
        />
      </v-form>
    </v-card-text>

    <v-card-actions>
      <v-btn variant="tonal" class="mx-4 mb-4" @click="$emit('cancel')">Cancel</v-btn>
      <v-btn color="primary" variant="tonal" class="mx-4 mb-4" @click="handleSubmit">{{
        isNew ? 'Save' : 'Update'
      }}</v-btn>
    </v-card-actions>
  </v-card>
</template>

<style scoped>
.row-text {
  width: 350px;
}
.custom-slider .v-slider-tick-label {
  color: #2563eb;
  font-weight: bold;
}
</style>
