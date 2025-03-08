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
  if (props.isNew) {
    localQuestion.value.questionconfiguration = {
      showBlanks: true,
      textParts: [{ order: 1, text: '', isBlank: false }]
    }
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
        :label="'Textpart ' + part.order"
        v-model="part.text"
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

  <h3 class="text-primary">Preview</h3>
  <div class="text-body-1 d-flex flex-wrap">
    <span
      v-for="(part, index) in localQuestion.questionconfiguration.textParts"
      :key="index"
      :class="{ 'bg-yellow-lighten-2 px-1 rounded': part.isBlank }"
    >
      {{ part.text }}
    </span>
  </div>
</template>
