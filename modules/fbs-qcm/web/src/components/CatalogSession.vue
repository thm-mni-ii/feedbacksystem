<script setup lang="ts">
import { ref, defineProps } from 'vue'
defineProps({
  question: { type: Object, required: true },
  currentQuestionIndex: { type: Number, default: 0 }
})

const emit = defineEmits(['submit-answer'])
const selectedAnswers = ref([])

const showAnswers = () => {
  console.log(selectedAnswers.value)
}

const submitAnswer = () => {
  console.log(selectedAnswers.value)
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
          :value="option.id"
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
          <td v-for="column in question.questionconfiguration.answerColumns" :key="column.id">
            <label>
              <v-checkbox
                v-model="selectedAnswers"
                color="primary"
                class="mx-auto"
                hide-details
                :value="{ row: option.id, col: column.id }"
                @change="showAnswers()"
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
