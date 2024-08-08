<script setup lang="ts">
import { ref } from 'vue'
import axios, { type AxiosResponse } from 'axios'
import type { Answers } from '../model/Answers'
import type Question from '../model/Question.ts'
import QuestionType from '../enums/QuestionType'

const questionTypes = Object.values(QuestionType)

const question = ref<Question>({
  id: '',
  owner: -1,
  questiontext: '',
  questiontags: [],
  questiontype: QuestionType.Choice,
  questionconfiguration: {
    options: [],
    correctAnswer: 0
  }
})
const answers = ref<Answers[]>([{ id: -1, questionId: -1, text: '', isCorrect: false }])

const addAnswer = () => {
  answers.value.push({
    id: -1,
    questionId: -1,
    text: '',
    isCorrect: false
  })
}

const handleSubmit = () => {
  console.log(answers.value)
  console.log(question.value)
  axios
    // Token mitsenden
    .post('/api_v1/questions', question)
    .then((res) => console.log(res))
    .catch((err) => console.log(err))
}

const deleteAnswer = (index: number) => {
  console.log(answers.value)
  answers.value.splice(index, 1)
}

const removeTag = (item: string) => {
  question.value.questiontags.splice(question.value.questiontags.indexOf(item), 1)
}
</script>

<template>
  <v-form @submit.prevent="handleSubmit">
    <v-sheet
      class="d-flex align-center justify-center flex-wrap flex-column text-center mx-auto my-14 px-4"
      elevation="4"
      height="auto"
      width="70%"
      rounded
    >
      <v-responsive class="mx-auto" width="85%">
        <h2 class="text-h4 my-8 font-weight-black text-primary">Add new Question</h2>
        <v-select
          label="Fragetyp"
          v-model="question.questiontype"
          :items="questionTypes"
          variant="solo-filled"
          class="m-4 pr-2"
        ></v-select>
        <v-slider
          class="pr-4"
          show-ticks="always"
          width="90%"
          label="Difficulty"
          thumb-label
          step="1"
          min="1"
          max="10"
        ></v-slider>
        <div v-if="question.questiontype === 'Choice'">
          <v-textarea
            single-line
            class="mt-4"
            v-model="question.questiontext"
            maxlength="130"
            auto-grow
            counter
            label="Question"
            width="800"
            required
          ></v-textarea>
          <v-combobox
            v-model="question.questiontags"
            label="Tags"
            prepend-icon="mdi-tag"
            variant="solo"
            chips
            clearable
            multiple
          >
            <template v-slot:selection="{ item }">
              <v-chip v-bind="question.questiontags" closable @click:close="removeTag(item)">
                <strong>{{ item }}</strong
                >&nbsp;
                <span>(interest)</span>
              </v-chip>
            </template>
          </v-combobox>

          <div v-for="(answer, index) in answers" :key="index" class="d-flex my-4 align-center">
            <v-text-field
              auto-grow
              v-model="answer.text"
              :label="'Answer ' + (index + 1)"
              hide-details
              required
            ></v-text-field>
            <v-btn
              icon="mdi-delete-outline"
              @click="deleteAnswer(index)"
              class="ml-10"
              variant="text"
              color="red"
            >
              <v-tooltip activator="parent" location="end">Delete </v-tooltip>
              <v-icon icon="mdi-delete-outline" size="small"> </v-icon>
            </v-btn>
            <v-checkbox v-model="answer.isCorrect" class="ml-10" color="green" hide-details>
              <v-tooltip activator="parent" location="end">Correct answer</v-tooltip>
            </v-checkbox>
          </div>
          <v-btn icon="mdi-plus" @click="addAnswer" class="my-4" size="small"></v-btn>
        </div>
      </v-responsive>
      <v-btn variant="outlined" class="mx-auto my-8" type="submit" prepend-icon="mdi-check-circle">
        <template v-slot:prepend>
          <v-icon color="success"></v-icon>
        </template>
        Submit</v-btn
      >
    </v-sheet>
  </v-form>
</template>
