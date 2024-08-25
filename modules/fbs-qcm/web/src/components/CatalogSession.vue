<script setup lang="ts">
import { ref, defineProps } from 'vue'
defineProps({
  question: { type: Object, required: true },
  currentQuestionIndex: { type: Number, default: 0 }
})
const emit = defineEmits(['submitAnswer'])
const selectedAnswers = ref<string[]>([])

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
  <div class="d-flex flex-column">
    <div
      v-for="option in question.questionconfiguration.optionRows"
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

  <v-btn
    variant="outlined"
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
