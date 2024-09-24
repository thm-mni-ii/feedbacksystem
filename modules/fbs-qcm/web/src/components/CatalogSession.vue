<script setup lang="ts">
import { ref, defineProps } from 'vue'
defineProps({
  question: { type: Object, required: true },
  currentQuestionIndex: { type: Number, default: 0 }
})
const emit = defineEmits(['submitAnswer'])
const selectedAnswers = ref<Array<{ rowId: number; colId: string | number }>>([])

const toggleAnswer = (rowId: number, colId: string | number) => {
  const answerIndex = selectedAnswers.value.findIndex(
    (answer) => answer.rowId === rowId && answer.colId === colId
  )

  if (answerIndex === -1) {
    selectedAnswers.value.push({ rowId, colId })
  } else {
    selectedAnswers.value.splice(answerIndex, 1)
  }

  console.log('Selected Answers:', selectedAnswers.value)
}

const showAnswers = () => {
  console.log(selectedAnswers.value)
}
</script>
<template>
  <div width="50%" class="w-75 bg-blue-grey-darken-2 justify-center rounded-lg d-flex">
    <p class="pa-4">
      {{ question.questiontext }}
    </p>
  </div>
  <div v-if="question.questionconfiguration.multipleColumn == false" class="d-flex flex-column">
    <div
      v-for="option in question.questionconfiguration.Optionrows"
      :key="option.id"
      class="d-flex justify-end"
    >
      <v-card color="primary" variant="outlined" class="w-50 pa-1 mt-5" hide-details hover>
        <v-checkbox
          v-model="selectedAnswers"
          :label="`${option.text}`"
          :value="option.text"
          class="ml-12 py-auto pr-12"
          hide-details
          @change="showAnswers()"
        ></v-checkbox>
      </v-card>
    </div>
  </div>

  <div class="d-flex flex-column">
    <div v-for="option in question.questionconfiguration.Optionrows" :key="option.id" class="mb-6">
      <v-card color="primary" variant="outlined" class="pa-4">
        <p class="mb-4">{{ option.text }}</p>

        <div class="d-flex flex-col justify-start">
          <v-checkbox
            v-for="column in question.questionconfiguration.answercolumns"
            :key="column.id"
            v-model="selectedAnswers"
            :value="{ rowId: option.id, colId: column.id }"
            :label="column.name || `Answer ${column.id}`"
            @change="toggleAnswer(option.id, column.id)"
            hide-details
            class="mr-8"
          />
        </div>
      </v-card>
    </div>
  </div>

  <v-btn
    variant="tonal"
    class="mx-auto my-8"
    type="submit"
    append-icon="mdi-arrow-right-bold-outline"
    @click="$emit('submitAnswer', selectedAnswers.value)"
  >
    <template #append>
      <v-icon color="success"></v-icon>
    </template>
    next</v-btn
  >
</template>
