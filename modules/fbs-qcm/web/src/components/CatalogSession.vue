<script setup lang="ts">
import { ref, defineProps } from 'vue'
import type { SelectedAnswers } from '@/views/CatalogSessionView.vue'

defineProps({
  question: { type: Object, required: true },
  currentQuestionIndex: { type: Number, default: 0 }
})

const emit = defineEmits(['submit-answer'])
const selectedAnswers = ref<SelectedAnswers[]>([])

const toggleAnswer = (rowId: number, colId: number | string) => {
  const index = selectedAnswers.value.findIndex(
    (answer) => answer.rowId === rowId && answer.colId === colId
  )
  if (index === -1) {
    selectedAnswers.value.push({ rowId, colId })
    showAnswers()
  } else {
    selectedAnswers.value.splice(index, 1)
    showAnswers()
  }
}

const isChecked = (rowId: number, colId: number | string) => {
  return selectedAnswers.value.some((answer) => answer.rowId == rowId && answer.colId === colId)
}

const showAnswers = () => {
  console.log(selectedAnswers.value)
}

const submitAnswer = () => {
  emit('submit-answer', selectedAnswers.value)
}
</script>

<template>
  <div width="50%" class="w-75 bg-blue-grey-darken-2 justify-center rounded-lg d-flex">
    <p class="pa-4">
      {{ question.questiontext }}
    </p>
  </div>
  <div v-if="!question.questionconfiguration.multipleColumn" class="d-flex flex-column">
    <div
      v-for="option in question.questionconfiguration.optionRows"
      :key="option.id"
      class="d-flex justify-end"
    >
      <div class="w-50 mt-4 justify-start rounded-lg d-flex border-md border-primary">
        <v-checkbox
          v-model="selectedAnswers"
          :label="`${option.text}`"
          :value="option.text"
          color="primary"
          class="mx-auto py-auto"
          hide-details
          @change="showAnswers()"
        >
          <template #label>
            <div>{{ option.text }}</div>
          </template>
        </v-checkbox>
      </div>
    </div>
  </div>

  <div v-if="question.questionconfiguration.multipleColumn" class="d-flex flex-column">
    <v-table>
      <thead>
        <tr>
          <th>Options</th>
          <th
            v-for="column in question.questionconfiguration.answerColumns"
            :key="column.id"
            class="text-left"
          >
            {{ column.name }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="option in question.questionconfiguration.optionRows" :key="option.id">
          <td class="text-left">{{ option.text }}</td>
          <td
            v-for="column in question.questionconfiguration.answerColumns"
            :key="column.id"
            :messages="false"
          >
            <label>
              <v-checkbox
                :input-value="isChecked(option.id, column.id)"
                color="primary"
                class="mx-auto"
                :hide-details="true"
                @click="toggleAnswer(option.id, column.id)"
              ></v-checkbox>
            </label>
          </td>
        </tr>
      </tbody>
    </v-table>
  </div>

  <v-btn
    variant="tonal"
    class="mx-auto my-8"
    type="submit"
    append-icon="mdi-arrow-right-bold-outline"
    @click="submitAnswer"
  >
    next
  </v-btn>
</template>
