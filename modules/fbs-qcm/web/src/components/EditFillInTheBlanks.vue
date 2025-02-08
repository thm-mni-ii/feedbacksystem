<!-- src/components/EditFillInTheBlanks.vue -->
<script setup lang="ts">
import { ref, watch, defineProps, defineEmits } from 'vue'
import type Question from '../model/Question'
import type FillInTheBlanks from '../model/questionTypes/FillInTheBlanks.ts'

const props = defineProps<{ question: Question }>()

const emit = defineEmits<{ (e: 'update', updatedQuestion: FillInTheBlanks): void }>()

const localQuestion = ref<Question>({ ...props.question })

watch(
  localQuestion,
  (newVal) => {
    emit('update', newVal)
  },
  { deep: true }
)
</script>

<template>
  <div>
    <h3>Fill in the Blanks Editor</h3>
    <label>
      <input ty v-model="localQuestion.questionconfiguration.showBlanks" pe="checkbox" />
      Blanks anzeigen
    </label>
    <ul>
      <li v-for="(part, index) in localQuestion.questionconfiguration.textParts" :key="index">
        <input v-model="part.text" placeholder="Text eingeben" />
        <input v-model="part.isBlank" type="checkbox" /> Lücke?
      </li>
    </ul>
  </div>
</template>
