<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Answer } from '../services/form.service.ts'

const question = ref('')
const answers = ref<Answer[]>([{ text: '', isCorrect: false, position: 1 }])

onMounted(() => {
  console.log(answers.value[0].text)
})

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
      width="80%"
      rounded
    >
      <v-responsive class="mx-auto" width="85%">
        <v-textarea
          single-line
          class="mt-9"
          v-model="question"
          maxlength="130"
          counter
          label="Question"
          width="800"
          required
        ></v-textarea>
        <div v-for="(answer, index) in answers" :key="index" class="d-flex my-4">
          <v-text-field
            v-model="answer.text"
            :label="'Answer ' + (index + 1)"
            hide-details
            required
          ></v-text-field>
          <v-checkbox
            v-model="answer.isCorrect"
            class="ml-10"
            color="green"
            label="isCorrect"
            hide-details
          >
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
