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
}>()

const fillInTheBlanksAnswer = defineModel<{ [key: number]: string }>({ default: {} })

const possibleAnswers = computed(() =>
  props.questionconfiguration.textParts.filter((part) => part.isBlank).map((part) => part.text)
)

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
          variant="outlined"
          class="blank-input"
        />
        <v-text-field
          v-else-if="part.component === 'input'"
          v-model="fillInTheBlanksAnswer[part.order]"
          density="compact"
          variant="underlined"
          class="blank-input"
          max-width="100"
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
  width: 20px;
}
</style>
