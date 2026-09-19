<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import type Question from '../model/Question'
import type ChoiceQuestionConfiguration from '@/model/ChoiceQuestionConfiguration'
import type { Choice } from '@/model/questionTypes/Choice'
import type { Matching } from '@/model/questionTypes/Matching'
import type FillInTheBlanks from '@/model/questionTypes/FillInTheBlanks'
import questionService from '@/services/question.service'
import QuestionType from '../enums/QuestionType'
import QuestionCompetencies from './QuestionCompetencies.vue'
import EditFillInTheBlanks from './EditFillInTheBlanks.vue'
import EditChoiceQuestion from './EditChoiceQuestion.vue'
import EditMatrixQuestion from './EditMatrixQuestion.vue'
import EditMatchingQuestion from './EditMatchingQuestion.vue'

type QuestionEditorType = 'Choice' | 'Matrix' | 'FillInTheBlanks' | 'Matching'

const props = withDefaults(
  defineProps<{
    inputQuestion?: Question
    isNew: boolean
    /**
     * Steuert, ob beim Speichern der echte Backend-Call (questionService)
     * ausgeführt wird. Der Kompetenzgraph arbeitet mit lokalen Mock-Fragen, die
     * im Backend nicht existieren – dort wird `persist=false` übergeben und
     * die bearbeitete Frage stattdessen per `update`-Event nach oben gereicht.
     */
    persist?: boolean
  }>(),
  { inputQuestion: undefined, persist: true }
)

const emit = defineEmits<{
  (e: 'update', question: Question): void
  (e: 'cancel'): void
}>()

const questionTypeOptions = [
  { title: 'Multiple Choice', value: 'Choice' },
  { title: 'Multi-Select Matrix', value: 'Matrix' },
  { title: 'Lückentext (Fill in the Blanks)', value: 'FillInTheBlanks' },
  { title: 'Zuordnung (Matching)', value: 'Matching' }
]

const choiceLikeTypes = new Set(['Choice', 'single-choice', 'matrix'])
const fillInTheBlanksLikeTypes = new Set(['FillInTheBlanks', 'fill-in-the-blank'])
const matchingLikeTypes = new Set(['Matching', 'matching'])

const isChoiceLikeQuestionType = (type?: string) => !!type && choiceLikeTypes.has(type)
const isFillInTheBlanksLikeQuestionType = (type?: string) =>
  !!type && fillInTheBlanksLikeTypes.has(type)
const isMatchingQuestionType = (type?: string) => !!type && matchingLikeTypes.has(type)

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    emit('cancel')
  }
}

const matchingConfiguration = () => {
  const categoryId = crypto.randomUUID()
  return {
    categories: [{ id: categoryId, label: '' }],
    items: [{ id: crypto.randomUUID(), text: '', correctCategoryId: categoryId }]
  }
}

const selectedQuestionType = ref<QuestionEditorType>('Choice')

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

function determineEditorType(q?: Question): QuestionEditorType {
  if (!q) return 'Choice'
  if (isMatchingQuestionType(q.questionType)) return 'Matching'
  if (isFillInTheBlanksLikeQuestionType(q.questionType)) return 'FillInTheBlanks'
  if (isChoiceLikeQuestionType(q.questionType)) {
    const config = q.questionConfiguration
    if (
      config?.multipleColumn === true ||
      (Array.isArray(config?.answerColumns) && config.answerColumns.length > 1) ||
      String(q.questionType) === 'matrix'
    ) {
      return 'Matrix'
    }
    return 'Choice'
  }
  return 'Choice'
}

function initQuestion(q?: Question) {
  if (q) {
    question.value = JSON.parse(JSON.stringify(q))
    selectedQuestionType.value = determineEditorType(q)
  } else {
    selectedQuestionType.value = 'Choice'
    question.value = {
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
    } as Question
  }
}

watch(
  () => props.inputQuestion,
  (newVal) => {
    initQuestion(newVal)
  },
  { deep: true }
)

watch(selectedQuestionType, (newType) => {
  if (newType === 'Choice') {
    question.value.questionType = QuestionType.Choice
    const currentConfig = question.value.questionConfiguration
    if (isChoiceQuestionConfiguration(currentConfig)) {
      currentConfig.multipleColumn = false
      if (!currentConfig.answerColumns || currentConfig.answerColumns.length === 0) {
        currentConfig.answerColumns = [{ id: 1, name: '' }]
      }
    } else {
      question.value.questionConfiguration = {
        multipleRow: false,
        multipleColumn: false,
        answerColumns: [{ id: 1, name: '' }],
        optionRows: [{ id: 1, text: '', correctAnswers: [] }]
      } as ChoiceQuestionConfiguration
    }
  } else if (newType === 'Matrix') {
    question.value.questionType = QuestionType.Choice
    const currentConfig = question.value.questionConfiguration
    if (isChoiceQuestionConfiguration(currentConfig)) {
      currentConfig.multipleColumn = true
      if (!currentConfig.answerColumns || currentConfig.answerColumns.length < 2) {
        currentConfig.answerColumns = [
          { id: 1, name: currentConfig.answerColumns?.[0]?.name || 'Spalte 1' },
          { id: 2, name: 'Spalte 2' }
        ]
      }
    } else {
      question.value.questionConfiguration = {
        multipleRow: false,
        multipleColumn: true,
        answerColumns: [
          { id: 1, name: 'Spalte 1' },
          { id: 2, name: 'Spalte 2' }
        ],
        optionRows: [{ id: 1, text: '', correctAnswers: [] }]
      } as ChoiceQuestionConfiguration
    }
  } else if (newType === 'FillInTheBlanks') {
    question.value.questionType = QuestionType.FillInTheBlanks
    const currentConfig = question.value.questionConfiguration
    if (!isFillInTheBlanksConfiguration(currentConfig)) {
      question.value.questionConfiguration = {
        showBlanks: true,
        textParts: [{ order: 1, text: '', isBlank: false }]
      }
    }
  } else if (newType === 'Matching') {
    question.value.questionType = QuestionType.Matching
    const currentConfig = question.value.questionConfiguration
    if (!isMatchingConfiguration(currentConfig)) {
      question.value.questionConfiguration = matchingConfiguration()
    }
  }
})

const difficultyTicks = { 0: 'Easy', 0.5: 'Medium', 1: 'Hard' }

const snackbar = ref({
  show: false,
  text: '',
  color: 'error',
  timeout: 6000
})

const openSnackbar = (text: string, color = 'error') => {
  snackbar.value.text = text
  snackbar.value.color = color
  snackbar.value.show = true
}

// Type Guard
function isChoiceQuestionConfiguration(config: any): config is Choice {
  return (
    config &&
    typeof config === 'object' &&
    'optionRows' in config &&
    Array.isArray(config.optionRows)
  )
}

function isFillInTheBlanksConfiguration(config: any): config is FillInTheBlanks {
  return config && typeof config === 'object' && Array.isArray(config.textParts)
}

function isMatchingConfiguration(config: any): config is Matching {
  return (
    config &&
    typeof config === 'object' &&
    Array.isArray(config.categories) &&
    Array.isArray(config.items)
  )
}

/**
 * Prüft die Pflichtfelder der aktuellen Frage vor dem Speichern.
 * Gibt eine Liste verständlicher Fehlermeldungen zurück (leer = gültig).
 * Bewusst als reine Funktion statt Vuetify-Formularregeln, weil die
 * Pflichtfelder je nach Fragetyp (Choice/Matrix/FillInTheBlanks/Matching) variieren
 * und mehrere verschachtelte Editor-Components betreffen.
 */
function validateQuestion(): string[] {
  const errors: string[] = []

  if (!question.value.text?.trim()) {
    errors.push('Bitte einen Fragetext eingeben.')
  }

  if (!question.value.competencyIds || question.value.competencyIds.length === 0) {
    errors.push('Bitte mindestens eine Kompetenz auswählen.')
  }

  const config = question.value.questionConfiguration

  if (selectedQuestionType.value === 'Choice') {
    if (!isChoiceQuestionConfiguration(config) || config.optionRows.length === 0) {
      errors.push('Bitte mindestens eine Antwortoption hinzufügen.')
    } else {
      if (config.optionRows.some((row) => !row.text?.trim())) {
        errors.push('Bitte für alle Antwortoptionen einen Text eingeben.')
      }
      if (!config.optionRows.some((row) => row.correctAnswers && row.correctAnswers.length > 0)) {
        errors.push('Bitte mindestens eine richtige Antwort markieren.')
      }
    }
  }

  if (selectedQuestionType.value === 'Matrix') {
    if (!isChoiceQuestionConfiguration(config) || config.optionRows.length === 0) {
      errors.push('Bitte mindestens eine Zeile hinzufügen.')
    } else {
      if (config.optionRows.some((row) => !row.text?.trim())) {
        errors.push('Bitte für alle Zeilen einen Text eingeben.')
      }
      if (!config.answerColumns || config.answerColumns.length === 0) {
        errors.push('Bitte mindestens eine Spalte hinzufügen.')
      } else if (config.answerColumns.some((column) => !column.name?.trim())) {
        errors.push('Bitte für alle Spalten einen Namen eingeben.')
      }
      if (!config.optionRows.some((row) => row.correctAnswers && row.correctAnswers.length > 0)) {
        errors.push('Bitte mindestens eine richtige Antwort in der Matrix markieren.')
      }
    }
  }

  if (selectedQuestionType.value === 'FillInTheBlanks') {
    if (!isFillInTheBlanksConfiguration(config) || config.textParts.length === 0) {
      errors.push('Bitte mindestens einen Textabschnitt hinzufügen.')
    } else {
      if (!config.textParts.some((part) => part.isBlank)) {
        errors.push('Bitte mindestens eine Lücke markieren.')
      }
      if (config.textParts.some((part) => part.isBlank && !part.text?.trim())) {
        errors.push('Bitte für alle Lücken die richtige Antwort eingeben.')
      }
    }
  }

  if (selectedQuestionType.value === 'Matching') {
    if (!isMatchingConfiguration(config) || config.categories.length === 0) {
      errors.push('Bitte mindestens eine Kategorie hinzufügen.')
    } else if (config.categories.some((category) => !category.label?.trim())) {
      errors.push('Bitte für alle Kategorien eine Bezeichnung eingeben.')
    }

    if (!isMatchingConfiguration(config) || config.items.length === 0) {
      errors.push('Bitte mindestens ein zuzuordnendes Element hinzufügen.')
    } else if (config.items.some((item) => !item.text?.trim())) {
      errors.push('Bitte für alle Elemente einen Text eingeben.')
    }
  }

  return errors
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  initQuestion(props.inputQuestion)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})

const checkMultipleRows = () => {
  if (isChoiceQuestionConfiguration(question.value.questionConfiguration)) {
    const optionRows = question.value.questionConfiguration.optionRows
    const rowsWithAnswers = optionRows.filter(
      (row) => row.correctAnswers && row.correctAnswers.length > 0
    )
    question.value.questionConfiguration.multipleRow = rowsWithAnswers.length > 1
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

  const validationErrors = validateQuestion()
  if (validationErrors.length > 0) {
    openSnackbar(validationErrors.join(' '))
    return
  }

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
      .catch((err) => {
        console.log(err)
        openSnackbar(
          'Frage konnte nicht gespeichert werden: ' + (err.response?.data ?? err.message)
        )
      })
  } else {
    questionService
      .updateQuestion(question.value)
      .then((res) => {
        console.log(res)
        emit('update', question.value)
      })
      .catch((err) => {
        console.log(err)
        openSnackbar(
          'Frage konnte nicht aktualisiert werden: ' + (err.response?.data ?? err.message)
        )
      })
  }
}
</script>

<template>
  <v-card class="w-75 mx-auto">
    <v-card-title class="d-flex justify-space-between align-center">
      <span class="text-h5 font-weight-medium text-primary">
        {{ isNew ? 'Add new Question' : 'Update Question' }}
      </span>
      <v-btn icon variant="text" @click="$emit('cancel')">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-card-title>

    <v-divider></v-divider>

    <v-card-text class="mx-4">
      <v-form>
        <v-select
          v-model="selectedQuestionType"
          :disabled="!isNew"
          item-title="title"
          item-color="primary"
          item-value="value"
          label="Fragetyp"
          :items="questionTypeOptions"
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
          thumb-label
        ></v-slider>

        <EditChoiceQuestion
          v-if="selectedQuestionType === 'Choice'"
          :question="question"
          :is-new="isNew"
          @update="handleUpdate"
        />
        <EditMatrixQuestion
          v-if="selectedQuestionType === 'Matrix'"
          :question="question"
          :is-new="isNew"
          @update="handleUpdate"
        />
        <EditFillInTheBlanks
          v-if="selectedQuestionType === 'FillInTheBlanks'"
          :question="question"
          :is-new="isNew"
          @update="handleUpdate"
        />
        <EditMatchingQuestion
          v-if="selectedQuestionType === 'Matching'"
          :question="question"
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

    <v-snackbar
      v-model="snackbar.show"
      :timeout="snackbar.timeout"
      :color="snackbar.color"
      multi-line
    >
      {{ snackbar.text }}

      <template #actions>
        <v-btn color="white" variant="text" @click="snackbar.show = false">Close</v-btn>
      </template>
    </v-snackbar>
  </v-card>
</template>

<style scoped>
.custom-slider .v-slider-tick-label {
  color: rgb(var(--v-theme-primary));
  font-weight: bold;
}
</style>
