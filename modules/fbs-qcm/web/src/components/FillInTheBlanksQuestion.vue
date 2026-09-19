<script setup lang="ts">
import { computed, defineProps, defineModel, watch } from 'vue'

interface TextPart {
  order: number
  text: string
  isBlank: boolean
  distractors?: string[]
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

// Fisher-Yates, damit die korrekte Antwort nicht immer an derselben Position steht.
function shuffle<T>(items: T[]): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

const allBlankParts = computed(() =>
  props.questionconfiguration.textParts.filter((part) => part.isBlank)
)

// Optionen je Lücke: bevorzugt die pro Lücke festgelegten Distraktoren, gemischt mit der
// richtigen Antwort. Fällt mangels Distraktoren auf den bisherigen globalen Wortpool
// (alle Blank-Texte der Frage) zurück, damit ältere Fragen ohne Distraktoren weiter funktionieren.
const possibleAnswersByOrder = computed(() => {
  const map = new Map<number, string[]>()
  for (const part of allBlankParts.value) {
    const options =
      props.blankStrings.length > 0
        ? props.blankStrings
        : part.distractors && part.distractors.length > 0
          ? shuffle([part.text, ...part.distractors])
          : allBlankParts.value.map((blank) => blank.text)
    map.set(part.order, options)
  }
  return map
})

const formattedText = computed(() => {
  return props.questionconfiguration.textParts.map((part) => {
    if (part.isBlank) {
      return {
        order: part.order,
        component: props.questionconfiguration.showBlanks ? 'select' : 'input',
        value: fillInTheBlanksAnswer.value?.[part.order] || '',
        options: possibleAnswersByOrder.value.get(part.order) ?? []
      }
    } else {
      return {
        order: part.order,
        component: 'text',
        value: part.text,
        options: [] as string[]
      }
    }
  })
})

watch(
  fillInTheBlanksAnswer,
  (newVal) => {
    for (const key in newVal) {
      const trimmed = newVal[key]?.trim?.()
      if (trimmed !== newVal[key]) {
        fillInTheBlanksAnswer.value[key] = trimmed
      }
    }
  },
  { deep: true }
)
</script>

<template>
  <div class="mt-4">
    <div class="text-container">
      <template v-for="part in formattedText" :key="part.order">
        <span v-if="part.component === 'text'">{{ part.value }}</span>
        <v-select
          v-else-if="part.component === 'select'"
          v-model="fillInTheBlanksAnswer[part.order]"
          :items="part.options"
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
