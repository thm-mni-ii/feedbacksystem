<script setup lang="ts">
import { computed, defineProps, defineModel } from 'vue'

interface TextPart {
  order: number
  text: string
  isBlank: boolean
}

interface QuestionConfiguration {
  showBlanks: boolean
  textParts: TextPart[]
}

const props = defineProps<{
  questionconfiguration: QuestionConfiguration
  blankStrings: string[]
}>()

const fillInTheBlanksAnswer = defineModel<{ [key: number]: string }>({ default: {} })

const possibleAnswers = computed(() => {
  return props.blankStrings.length > 0
    ? props.blankStrings
    : props.questionconfiguration.textParts.filter((part) => part.isBlank).map((part) => part.text)
})

const formattedText = computed(() => {
  return props.questionconfiguration.textParts.map((part) => {
    if (part.isBlank) {
      return {
        order: part.order,
        component: props.questionconfiguration.showBlanks ? 'select' : 'input',
        value: fillInTheBlanksAnswer.value?.[part.order] || ''
      }
    } else {
      return {
        order: part.order,
        component: 'text',
        value: part.text
      }
    }
  })
})
</script>

<template>
  <div class="mt-4">
    <div class="text-container">
      <template v-for="part in formattedText" :key="part.order">
        <span v-if="part.component === 'text'">{{ part.value }}</span>
        <v-select
          v-else-if="part.component === 'select'"
          v-model="fillInTheBlanksAnswer[part.order]"
          :items="possibleAnswers"
          density="compact"
          class="blank-input"
        />
        <v-text-field
          v-else-if="part.component === 'input'"
          v-model="fillInTheBlanksAnswer[part.order]"
          density="compact"
          class="blank-input"
          style="width: fit-content"
        />
      </template>
    </div>
  </div>
</template>

<style scoped>
.text-container {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.blank-input {
  text-align: center;
  min-width: 100px;
  max-width: fit-content;
}
</style>
