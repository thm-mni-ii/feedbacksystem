<script setup lang="ts">
import { ref, watch, defineProps, defineEmits } from 'vue'
import type Question from '../model/Question'
import type FillInTheBlanks from '../model/questionTypes/FillInTheBlanks.ts'
import { onMounted } from 'vue'

const props = defineProps<{ question: Question }>()

const emit = defineEmits<{ (e: 'update', updatedQuestion: FillInTheBlanks): void }>()

const localQuestion = ref<Question>({ ...props.question })

const checkLocalQuestion = () => {
  console.log(localQuestion.value)
}
watch(
  localQuestion,
  (newVal) => {
    emit('update', newVal)
  },
  { deep: true }
)

onMounted(() => {
  localQuestion.value.questionconfiguration = {
    showBlanks: true,
    textParts: [{ order: 1, text: '', isBlank: true }]
  }
})
</script>

<template>
  <div>
    <div class="d-flex">
      <v-switch
        v-model="localQuestion.questionconfiguration.showBlanks"
        class="ml-4"
        :label="`Show Missing Words`"
        color="primary"
        hide-details
      >
      </v-switch>
      <span class="d-flex align-self-center pl-2">
        <v-icon
          icon="mdi-information-outline"
          size="small"
          class="pl-2 pr-4"
          color="dark-grey"
        ></v-icon>
        <v-tooltip activator="parent" location="end"
          >Students can see the missing words and need to put them in the right place, if
          activated</v-tooltip
        >
      </span>
    </div>

    <div v-for="(part, index) in localQuestion.questionconfiguration.textParts" :key="index">
      <v-text-field label="Label" v-model="part.text"></v-text-field>
    </div>
  </div>
  <v-btn @click="checkLocalQuestion">check</v-btn>
</template>
