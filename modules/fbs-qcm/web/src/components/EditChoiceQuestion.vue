<script setup lang="ts">
import { ref, watch, defineProps, defineEmits, onMounted } from 'vue'
import type Question from '@/model/Question'
import type { Choice } from '@/model/questionTypes/Choice'
import type FillInTheBlanks from '@/model/questionTypes/FillInTheBlanks'
import QuestionType from '../enums/QuestionType'

type QuestionConfiguration = Choice | FillInTheBlanks

const props = defineProps<{ question: Question; isNew: boolean }>()

const emit = defineEmits<{ (e: 'update', localQuestion: Question): void }>()

const localQuestion = ref<Question>(JSON.parse(JSON.stringify(props.question)))

watch(
  () => props.question,
  (newQuestion) => {
    const newCopy = JSON.parse(JSON.stringify(newQuestion))

    if (JSON.stringify(localQuestion.value) !== JSON.stringify(newCopy)) {
      localQuestion.value = newCopy
    }
  },
  { deep: true }
)
watch(
  () => localQuestion.value,
  (updatedQuestion) => {
    if (JSON.stringify(props.question) !== JSON.stringify(updatedQuestion)) {
      emit('update', updatedQuestion)
    }
  },
  { deep: true }
)

// Type Guard
function isChoiceQuestionConfiguration(config: QuestionConfiguration): config is Choice {
  return (config as Choice).optionRows !== undefined
}

const addOptionRow = () => {
  if (isChoiceQuestionConfiguration(localQuestion.value.questionconfiguration)) {
    if (!localQuestion.value.questionconfiguration.optionRows) {
      localQuestion.value.questionconfiguration.optionRows = []
    }

    localQuestion.value.questionconfiguration.optionRows.push({
      id: localQuestion.value.questionconfiguration.optionRows.length + 1,
      text: '',
      correctAnswers: []
    })
  }
}

const addOptionCol = () => {
  if (isChoiceQuestionConfiguration(localQuestion.value.questionconfiguration)) {
    const answerColumns = localQuestion.value.questionconfiguration.answerColumns

    if (!Array.isArray(answerColumns)) {
      console.error('answerColumns is not initialized or is not an array')
      return
    }
    answerColumns.push({
      id: answerColumns.length + 1,
      name: ''
    })
    console.log('Updated answerColumns:', answerColumns)
  }
}

const deleteOption = (index: number) => {
  if (isChoiceQuestionConfiguration(localQuestion.value.questionconfiguration)) {
    localQuestion.value.questionconfiguration.optionRows.splice(index, 1)
  }
}

const deleteAnswerColumn = (index: number) => {
  if (isChoiceQuestionConfiguration(localQuestion.value.questionconfiguration)) {
    if (localQuestion.value.questionconfiguration.answerColumns.length > 0) {
      localQuestion.value.questionconfiguration.answerColumns.splice(index, 1)
    }
  }
}

const toggleCorrectAnswer = (columnIndex: number, optionIndex: number, isSelected: boolean) => {
  if (isChoiceQuestionConfiguration(localQuestion.value.questionconfiguration)) {
    const optionRows = localQuestion.value.questionconfiguration.optionRows
    if (!optionRows || !optionRows[optionIndex]) {
      return
    }
    const correctAnswers = optionRows[optionIndex].correctAnswers || []
    const index = correctAnswers.indexOf(columnIndex)
    if (isSelected && index === -1) {
      correctAnswers.push(columnIndex)
    } else if (!isSelected && index !== -1) {
      correctAnswers.splice(index, 1)
    }
    optionRows[optionIndex].correctAnswers = [...correctAnswers]
  }
}

const isCorrectAnswer = (columnIndex: number, optionIndex: number) => {
  if (isChoiceQuestionConfiguration(localQuestion.value.questionconfiguration)) {
    const optionRows = localQuestion.value.questionconfiguration.optionRows
    if (!optionRows || !optionRows[optionIndex] || !optionRows[optionIndex].correctAnswers) {
      return false
    }
    return optionRows[optionIndex].correctAnswers.includes(columnIndex)
  }
  return false
}
const resetChoiceQuestion = (q: Ref<Question>) => {
  q.value = {
    owner: 1,
    questiontext: '',
    questiontags: [],
    questiontype: QuestionType.Choice,
    questionconfiguration: {
      multipleRow: false,
      multipleColumn: false,
      answerColumns: [{ id: 1, name: '' }],
      optionRows: [{ id: 1, text: '', correctAnswers: [] }]
    } as ChoiceQuestionConfiguration
  }
  console.log(q.value)
}

onMounted(() => {
  if (props.isNew) {
    resetChoiceQuestion(localQuestion)
  }
})
</script>
<template>
  <div>
    <div class="justify-space-between d-flex flex-row">
      <span class="d-flex flex-col">
        <v-switch
          v-model="localQuestion.questionconfiguration.multipleColumn"
          class="ml-4"
          :label="`Multi-Select Matrix`"
          color="primary"
          hide-details
        ></v-switch>
        <span class="d-flex align-self-center pl-2">
          <v-icon
            icon="mdi-information-outline"
            size="small"
            class="pl-2 pr-4"
            color="dark-grey"
          ></v-icon>
          <v-tooltip activator="parent" location="end"
            >Choose between a Multiple Choice Question and a Question with a Multi Select
            Matrix</v-tooltip
          >
        </span>
      </span>

      <div v-if="localQuestion.questionconfiguration.multipleColumn === true">
        <v-btn
          icon="mdi-plus"
          class="my-2 mr-10"
          size="small"
          v-tooltip:start="'Add Column'"
          @click="addOptionCol"
        ></v-btn>
      </div>
    </div>

    <div class="overflow-x-auto">
      <div
        v-for="(option, optionIndex) in localQuestion.questionconfiguration.optionRows"
        :key="optionIndex"
        class="d-flex flex-row flex-nowrap align-center my-4 justify-space-between"
      >
        <v-responsive class="ml-2" width="480">
          <div class="d-flex flex-row">
            <div class="d-flex flex-row">
              <v-text-field
                v-model="option.text"
                :label="'Answer ' + (optionIndex + 1)"
                hide-details
                class="row-text"
                required
              ></v-text-field>
              <v-btn
                icon="mdi-delete-outline"
                class="mx-4 row-btn"
                variant="text"
                color="red"
                @click="deleteOption(optionIndex)"
              >
                <v-tooltip activator="parent" location="end">Delete Row</v-tooltip>
                <v-icon icon="mdi-delete-outline" size="small"></v-icon>
              </v-btn>
            </div>
          </div>
        </v-responsive>
        <div class="d-flex flex-row flex-nowrap mx-auto">
          <v-checkbox
            v-for="(column, columnIndex) in localQuestion.questionconfiguration.answerColumns"
            :key="columnIndex"
            :model-value="isCorrectAnswer(columnIndex, optionIndex)"
            class="d-flex justify-center column-items mx-auto"
            color="green"
            width="120"
            hide-details
            @update:model-value="
              (newValue) => toggleCorrectAnswer(columnIndex, optionIndex, newValue)
            "
          >
            <v-tooltip activator="parent" location="end">Correct Answer</v-tooltip>
          </v-checkbox>
        </div>
      </div>
      <div class="d-flex flex-row flex-nowrap justify-space-between align-center my-4">
        <v-responsive width="480">
          <v-btn
            v-tooltip:end="'Add Answer'"
            icon="mdi-plus"
            class="ml-2 mb-2"
            size="small"
            @click="addOptionRow"
          ></v-btn>
        </v-responsive>

        <div class="d-flex flex-row flex-nowrap">
          <div
            v-for="(column, columnIndex) in localQuestion.questionconfiguration.answerColumns"
            :key="columnIndex"
            class="d-flex flex-column align-center"
          >
            <v-responsive width="120">
              <v-text-field
                v-model="column.name"
                :label="'Column ' + (columnIndex + 1)"
                hide-details
                class="mx-2 column-text"
                required
              ></v-text-field>

              <v-btn
                icon="mdi-delete-outline"
                class="ml-9 mr-1 column-btn"
                variant="text"
                color="red"
                @click="deleteAnswerColumn(columnIndex)"
              >
                <v-tooltip activator="parent" location="end">Delete Column</v-tooltip>
                <v-icon icon="mdi-delete-outline" size="small"></v-icon>
              </v-btn>
            </v-responsive>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.row-text {
  width: 350px;
}
</style>
