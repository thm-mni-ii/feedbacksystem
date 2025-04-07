<script setup lang="ts">
import { ref } from 'vue'
import FillInTheBlanksQuestion from './FillInTheBlanksQuestion.vue'

interface ChoiceAnswer {
  id: number
  text: string
  entries: Entry[]
}

interface Entry {
  id: number
  text: string
}

const fillInTheBlanksAnswer = ref<{ [key: number]: string }>({})

const props = defineProps({
  question: { type: Object, required: true },
  currentQuestionIndex: { type: Number, default: 0 }
})

const emit = defineEmits(['submit-answer'])
const selectedAnswers = ref<ChoiceAnswer[]>([])
const selectedMatrixAnswers = ref<
  Array<{ rowId: number; rowText: string; colId: number; colText: string }>
>([])

const choiceAnswers = ref<ChoiceAnswer[]>([])

const updateSelectedAnswers = (option: { id: number; text: string }) => {
  const existingAnswer = selectedAnswers.value.find((a) => a.id === option.id)
  if (existingAnswer) {
    selectedAnswers.value = selectedAnswers.value.filter((a) => a.id !== option.id)
  } else {
    selectedAnswers.value.push({
      id: option.id,
      text: option.text,
      entries: []
    })
  }
}
const updateChoiceAnswers = () => {
  choiceAnswers.value = []
  selectedMatrixAnswers.value.forEach((answer) => {
    let existingRow = choiceAnswers.value.find((row) => row.id === answer.rowId)

    if (!existingRow) {
      existingRow = {
        id: answer.rowId,
        text: answer.rowText,
        entries: []
      }
      choiceAnswers.value.push(existingRow)
    }
    existingRow.entries.push({
      id: answer.colId,
      text: answer.colText
    })
  })
}

const submitAnswer = () => {
  switch (props.question.questiontype) {
    case 'Choice':
      if (props.question.questionconfiguration.multipleColumn) {
        console.log('CHOICE ANSWER: ', choiceAnswers.value)
        emit('submit-answer', choiceAnswers.value)
        choiceAnswers.value.length = 0
        selectedMatrixAnswers.value.length = 0
      } else {
        emit('submit-answer', selectedAnswers.value)
        selectedAnswers.value.length = 0
      }
      break
    case 'FillInTheBlanks': {
      const formattedAnswer = {
        question: props.question._id,
        answers: Object.entries(fillInTheBlanksAnswer.value).map(([order, text]) => ({
          order: Number(order),
          text
        }))
      }
      emit('submit-answer', formattedAnswer)
      fillInTheBlanksAnswer.value = {}
      break
    }
    default:
      console.warn('Unsupported question type')
  }
}
</script>

<template>
  <div width="50%" class="w-75 bg-blue-grey-darken-2 justify-center rounded-lg d-flex">
    <p class="pa-4">
      {{ question.questiontext }}
    </p>
  </div>
  <div
    v-if="!question.questionconfiguration?.multipleColumn && question.questiontype == 'Choice'"
    class="d-flex flex-column"
  >
    <div
      v-for="option in question.questionconfiguration.optionRows"
      :key="option.id"
      class="d-flex justify-end"
    >
      <div class="w-50 mt-4 justify-start rounded-lg d-flex border-md border-primary">
        <v-checkbox
          :model-value="selectedAnswers.some((a) => a.id === option.id)"
          :label="`${option.text}`"
          color="primary"
          class="mx-auto py-auto"
          hide-details
          @change="updateSelectedAnswers(option)"
        >
          <template #label>
            <div>{{ option.text }}</div>
          </template>
        </v-checkbox>
      </div>
    </div>
  </div>

  <div
    v-if="question.questionconfiguration?.multipleColumn && question.questiontype == 'Choice'"
    class="d-flex flex-column"
  >
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
                v-model="selectedMatrixAnswers"
                color="primary"
                class="mx-auto"
                hide-details
                :value="{
                  rowId: option.id,
                  rowText: option.text,
                  colId: column.id,
                  colText: column.name
                }"
                @change="updateChoiceAnswers()"
              ></v-checkbox>
            </label>
          </td>
        </tr>
      </tbody>
    </v-table>
  </div>
  <FillInTheBlanksQuestion
    v-if="question.questiontype == 'FillInTheBlanks'"
    v-model="fillInTheBlanksAnswer"
    :questionconfiguration="question.questionconfiguration"
    :blankStrings="question.blankStrings ?? []"
  />

  <v-btn
    variant="tonal"
    class="mx-auto my-8"
    type="button"
    append-icon="mdi-arrow-right-bold-outline"
    @click="submitAnswer"
  >
    next
  </v-btn>
</template>
