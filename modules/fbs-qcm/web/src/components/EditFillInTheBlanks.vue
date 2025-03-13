<script setup lang="ts">
import { ref, watch, defineEmits } from 'vue'
import type Question from '../model/Question'
import type FillInTheBlanks from '../model/questionTypes/FillInTheBlanks.ts'
import { onMounted } from 'vue'

const props = defineProps<{ question: Question; isNew: boolean }>()

const emit = defineEmits<{ (e: 'update', updatedQuestion: FillInTheBlanks): void }>()

const localQuestion = ref<Question>({ ...props.question })

const addTextPart = () => {
  localQuestion.value.questionconfiguration.textParts.push({
    order: localQuestion.value.questionconfiguration.textParts.length + 1,
    text: '',
    isBlank: false
  })
}
const removeLastTextPart = () => {
  if (localQuestion.value.questionconfiguration.textParts.length > 0) {
    localQuestion.value.questionconfiguration.textParts.pop()
  }
}

watch(
  localQuestion,
  (newVal, oldVal) => {
    const updatedConfig = newVal as FillInTheBlanks
    updatedConfig.questionconfiguration.textParts.forEach((part: { text: string }) => {
      part.text = part.text.trim()
    })
    console.log('New Value: ', updatedConfig)
    console.log('Old Value: ', oldVal)
    console.log('Local Question: ', localQuestion)
    emit('update', updatedConfig)
  },
  { deep: true }
)

onMounted(() => {
  if (props.isNew) {
    console.log('QUESTION: ', props.question)
    localQuestion.value.questionconfiguration = {
      showBlanks: true,
      textParts: [{ order: 1, text: '', isBlank: false }]
    }
    console.log('LOCAL QUESTION', localQuestion.value)
  } else if (
    props.question.questiontype === 'FillInTheBlanks' &&
    !localQuestion.value.questionconfiguration
  ) {
    localQuestion.value.questionconfiguration = {
      showBlanks: true,
      textParts: [{ order: 1, text: '', isBlank: false }]
    }
  } else {
    localQuestion.value = { ...props.question }
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

    <div
      v-for="(part, index) in localQuestion.questionconfiguration.textParts"
      :key="index"
      class="d-flex"
    >
      <v-text-field
        v-model="part.text"
        :label="'Textpart ' + part.order"
        class="pr-10"
      ></v-text-field>
      <v-switch
        v-model="part.isBlank"
        class="ml-4"
        :label="`Is Blank`"
        color="primary"
        hide-details
      ></v-switch>
    </div>
  </div>
  <v-btn
    v-tooltip:end="'Add Text Part'"
    icon="mdi-plus"
    class="ml-2 mb-2"
    size="small"
    @click="addTextPart"
  ></v-btn>
  <v-btn
    icon="mdi-delete-outline"
    class="ml-9 mr-1 column-btn"
    variant="text"
    color="red"
    @click="removeLastTextPart"
  >
    <v-tooltip activator="parent" location="end">Delete last text part</v-tooltip>
    <v-icon icon="mdi-delete-outline" size="small"></v-icon>
  </v-btn>

  <h2 class="text-primary text-center">Preview</h2>
  <div class="text-body-1 d-flex flex-wrap">
    <span
      v-for="(part, index) in localQuestion.questionconfiguration.textParts"
      :key="index"
      :class="{ 'bg-yellow-lighten-2 px-1 rounded': part.isBlank }"
      class="inline-block"
    >
      {{ part.text }}
      <span v-if="!part.isBlank"> &nbsp; </span>
    </span>
  </div>
</template>
