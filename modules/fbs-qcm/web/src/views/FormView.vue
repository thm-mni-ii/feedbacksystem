<script setup lang="ts">
import { ref } from 'vue'
import { Answer } from '../services/form.service.ts'
import { Question } from '../services/question.service.ts'

const question = ref('')
const answers = ref<Answer[]>([{ text: '', isCorrect: false, position: 1 }])
const course = ref(['MIB 13 Datenbanken', 'Anderer Kurs', 'Netzwerksicherheit'])
const competence = ref(['SERM', 'SQL', 'Relationen'])

const addAnswer = () => {
  answers.value.push({
    text: '',
    isCorrect: false,
    position: answers.value.length + 1
  })
}

const handleSubmit = () => {
  console.log(answers.value)
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
        <div class="d-flex flex-row">
          <v-select
            label="Course"
            :items="course"
            variant="solo-filled"
            class="m-4 pr-2"
          ></v-select>

          <v-select
            label="Competence"
            :items="competence"
            variant="solo-filled"
            class="m-4 pl-2"
          ></v-select>
        </div>
        <v-slider
          class="pr-4"
          show-ticks="always"
          width="400"
          label="Difficulty"
          thumb-label
          step="1"
          min="1"
          max="10"
        ></v-slider>

        <v-textarea
          single-line
          class="mt-4"
          v-model="question"
          maxlength="130"
          auto-grow
          counter
          label="Question"
          width="800"
          required
        ></v-textarea>
        <div v-for="(answer, index) in answers" :key="index" class="d-flex my-4">
          <v-text-field
            auto-grow
            v-model="answer.text"
            :label="'Answer ' + (index + 1)"
            hide-details
            required
          ></v-text-field>
          <v-checkbox v-model="answer.isCorrect" class="ml-10" color="green" hide-details>
            <v-tooltip activator="parent" location="end">Correct answer?</v-tooltip>
          </v-checkbox>
        </div>
      </v-responsive>
      <v-btn icon="mdi-plus" @click="addAnswer" class="my-4" size="small"></v-btn>
      <v-btn variant="outlined" class="mx-auto my-8" type="submit" prepend-icon="mdi-check-circle">
        <template v-slot:prepend>
          <v-icon color="success"></v-icon>
        </template>
        Submit</v-btn
      >
    </v-sheet>
  </v-form>
</template>
