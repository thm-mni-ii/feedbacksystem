<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue'
import type Question from '../model/Question.ts'
import type { Choice } from '../model/questionTypes/Choice.ts'
import QuestionType from '../enums/QuestionType'

const props = defineProps<{
  question: Question
  questionTypes: (typeof QuestionType)[]
  isEditMode: boolean
}>()

const emit = defineEmits<{
  (e: 'update:question', question: Question): void
  (e: 'submit'): void
}>()

const addOptionRow = () => {
  props.question.questionconfiguration.optionRows.push({
    id: props.question.questionconfiguration.optionRows.length + 1,
    text: ''
  })
  emit('update:question', props.question)
}

const addOptionCol = () => {
  props.question.questionconfiguration.answerColumns.push({
    id: props.question.questionconfiguration.answerColumns.length,
    name: '',
    correctAnswers: []
  })
  emit('update:question', props.question)
}

const deleteOption = (index: number) => {
  props.question.questionconfiguration.optionRows.splice(index, 1)
  emit('update:question', props.question)
}

const deleteAnswerColumn = (index: number) => {
  if (props.question.questionconfiguration.answerColumns.length > 0) {
    props.question.questionconfiguration.answerColumns.splice(index, 1)
    emit('update:question', props.question)
  }
}

const toggleCorrectAnswer = (columnIndex: number, optionIndex: number, isSelected: boolean) => {
  const correctAnswers =
    props.question.questionconfiguration.answerColumns[columnIndex].correctAnswers
  const index = correctAnswers.indexOf(optionIndex)

  if (isSelected && index === -1) {
    correctAnswers.push(optionIndex)
  } else if (!isSelected && index !== -1) {
    correctAnswers.splice(index, 1)
  }
  emit('update:question', props.question)
}

const isCorrectAnswer = (columnIndex: number, optionIndex: number) => {
  return props.question.questionconfiguration.answerColumns[columnIndex].correctAnswers.includes(
    optionIndex
  )
}

const removeTag = (item: string) => {
  props.question.questiontags.splice(props.question.questiontags.indexOf(item), 1)
  emit('update:question', props.question)
}

const handleSubmit = () => {
  emit('submit')
}
</script>

<template>
  <v-form @submit.prevent="handleSubmit">
    <v-sheet
      class="d-flex align-center justify-center flex-wrap flex-column text-center mx-auto my-14 px-4"
      elevation="4"
      height="auto"
      width="85%"
      rounded
    >
      <v-responsive class="mx-auto" width="85%">
        <h2 class="text-h4 my-8 font-weight-black text-primary">
          {{ isEditMode ? 'Edit Question' : 'Add new Question' }}
        </h2>
        <v-select
          label="Fragetyp"
          v-model="props.question.questiontype"
          :items="props.questionTypes"
          variant="solo-filled"
          class="m-4 pr-2"
        ></v-select>
        <div v-if="props.question.questiontype === 'Choice'"></div>
      </v-responsive>
      <v-btn variant="outlined" class="mx-auto my-8" type="submit" prepend-icon="mdi-check-circle">
        <template #prepend>
          <v-icon color="success"></v-icon>
        </template>
        Submit
      </v-btn>
    </v-sheet>
  </v-form>
</template>
