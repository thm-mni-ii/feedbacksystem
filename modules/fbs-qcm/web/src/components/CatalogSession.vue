<script setup>
import { ref, defineProps } from 'vue'
defineProps({
  question: Object,
  currentQuestionIndex: Number
})

const selectedAnswers = ref([])
</script>
<template>
  <div width="50%" class="w-75 bg-blue-grey-darken-2 justify-center rounded-lg d-flex">
    <p class="pa-4">
      {{ question.text }}
    </p>
  </div>
  <div class="d-flex flex-column">
    <div v-for="answer in question.answers" :key="answer" class="d-flex justify-end">
      <v-card color="primary" variant="outlined" class="w-50 pa-1 mt-5" hide-details hover>
        <v-checkbox
          v-model="selectedAnswers"
          :label="`${answer}`"
          :value="answer"
          class="ml-12 py-auto pr-12"
          hide-details
        ></v-checkbox>
      </v-card>
    </div>
    {{ selectedAnswers }}
  </div>

  <v-btn
    variant="outlined"
    class="mx-auto my-8"
    type="submit"
    append-icon="mdi-arrow-right-bold-outline"
    @click="$emit('submitAnswer', selectedAnswers)"
  >
    <template #append>
      <v-icon color="success"></v-icon>
    </template>
    next</v-btn
  >
</template>
