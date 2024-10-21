<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'
// import VueIntersect from 'vue-intersect'
import type Question from '../model/Question.ts'
import type Choice from '../model/questionTypes/Choice.ts'
import QuestionType from '../enums/QuestionType'

const questionTypes = Object.values(QuestionType)
// const columnDialog = ref(false)

const question = ref<Question>({
  _id: '',
  owner: -1,
  questiontext: '',
  questiontags: [] as string[],
  questiontype: QuestionType.Choice,
  questionconfiguration: {} as Choice
  //   multipleRow: false,
  //   multipleColumn: false,
  //   answerColumns: [{ id: 1, name: '', correctAnswers: [] }],
  //   optionRows: [{ id: 1, text: '' }]
  // } as Choice
})

const addOptionRow = () => {
  question.value.questionconfiguration.optionRows.push({
    id: question.value.questionconfiguration.optionRows.length + 1,
    text: ''
  })
}

const addOptionCol = () => {
  question.value.questionconfiguration.answerColumns.push({
    id: question.value.questionconfiguration.answerColumns.length,
    name: '',
    correctAnswers: []
  })
}

const deleteOption = (index: number) => {
  question.value.questionconfiguration.optionRows.splice(index, 1)
}

const deleteAnswerColumn = (index: number) => {
  if (question.value.questionconfiguration.answerColumns.length > 0) {
    question.value.questionconfiguration.answerColumns.splice(index, 1)
  }
}

const toggleCorrectAnswer = (columnIndex: number, optionIndex: number, isSelected: boolean) => {
  const correctAnswers =
    question.value.questionconfiguration.answerColumns[columnIndex].correctAnswers
  const index = correctAnswers.indexOf(optionIndex)

  if (isSelected && index === -1) {
    correctAnswers.push(optionIndex)
  } else if (!isSelected && index !== -1) {
    correctAnswers.splice(index, 1)
  }
}

const isCorrectAnswer = (columnIndex: number, optionIndex: number) => {
  return question.value.questionconfiguration.answerColumns[columnIndex].correctAnswers.includes(
    optionIndex
  )
}

const removeTag = (item: string) => {
  question.value.questiontags.splice(question.value.questiontags.indexOf(item), 1)
}

const handleSubmit = async () => {
  if (question.value.questionconfiguration.answerColumns[0].correctAnswers.length > 1) {
    question.value.questionconfiguration.multipleRow = true
  }
  const token = localStorage.getItem('token')
  console.log('Token:', token)

  const config = {
    headers: { Authorization: `Bearer ${token}` }
  }
  console.log('CONFIG:', config)
  console.log('QUESTION:', question.value)
  axios
    // Token mitsenden
    .post('/api_v1/question', question.value, config)
    .then((res) => console.log(res))
    .catch((err) => console.log(err))
}
</script>

<template>
  <v-form @submit.prevent="handleSubmit" class="mt-16">
    <v-sheet
      class="d-flex align-center justify-center flex-wrap flex-column text-center mx-auto my-14 px-4"
      elevation="4"
      height="auto"
      width="85%"
      rounded
    >
      <v-responsive class="mx-auto" width="85%">
        <h2 class="text-h4 my-8 font-weight-black text-primary">Add new Question</h2>
        <v-select
          label="Fragetyp"
          v-model="question.questiontype"
          :items="questionTypes"
          variant="solo-filled"
          class="m-4 pr-2"
        ></v-select>
        <v-textarea
          single-line
          class="my-4 mr-2"
          v-model="question.questiontext"
          maxlength="130"
          auto-grow
          counter
          label="Question"
          required
        ></v-textarea>
        <v-combobox
          v-model="question.questiontags"
          label="Tags"
          prepend-icon="mdi-tag"
          variant="solo"
          class="mr-2"
          chips
          clearable
          multiple
        >
          <template v-slot:selection="{ item }">
            <v-chip v-bind="question.questiontags" closable @click:close="removeTag(item)">
              <strong>{{ item }}</strong
              >&nbsp;
              <span>(interest)</span>
            </v-chip>
          </template>
        </v-combobox>
        <div v-if="question.questiontype === 'Choice'">
          <div class="justify-space-between d-flex flex-row">
            <v-switch
              class="ml-4"
              v-model="question.questionconfiguration.multipleColumn"
              :label="`Multi-Select Matrix`"
              color="primary"
              hide-details
            ></v-switch>
            <div v-if="question.questionconfiguration.multipleColumn === true">
              <v-btn icon="mdi-plus" class="my-4 mr-2" size="small" @click="addOptionCol"></v-btn>
            </div>
          </div>
          <div
            v-for="(option, optionIndex) in question.questionconfiguration.optionRows"
            :key="optionIndex"
            class="d-flex my-4 align-center"
          >
            <v-text-field
              auto-grow
              v-model="option.text"
              :label="'Answer ' + (optionIndex + 1)"
              hide-details
              required
            ></v-text-field>
            <v-btn
              icon="mdi-delete-outline"
              class="ml-10"
              variant="text"
              color="red"
              @click="deleteOption(optionIndex)"
            >
              <v-tooltip activator="parent" location="end">Delete Row</v-tooltip>
              <v-icon icon="mdi-delete-outline" size="small"> </v-icon>
            </v-btn>
            <v-checkbox
              v-for="(column, columnIndex) in question.questionconfiguration.answerColumns"
              :key="columnIndex"
              :model-value="isCorrectAnswer(columnIndex, optionIndex)"
              class="ml-10 mr-2"
              color="green"
              hide-details
              @update:model-value="
                (newValue) => toggleCorrectAnswer(columnIndex, optionIndex, newValue)
              "
            >
              <v-tooltip activator="parent" location="end">Correct Answer</v-tooltip>
            </v-checkbox>
          </div>
          <div class="d-flex justify-space-between">
            <v-btn
              icon="mdi-plus"
              class="my-4 ml-2"
              size="small"
              @click="addOptionRow"
              v-tooltip:end="'Add Answer'"
            ></v-btn>
            <div class="d-flex flex-row">
              <div
                class="d-flex flex-column"
                v-for="(column, columnIndex) in question.questionconfiguration.answerColumns"
                :key="columnIndex"
              >
                <v-text-field
                  v-model="column.name"
                  :label="'Column ' + (columnIndex + 1) + ' Name'"
                  hide-details
                  class="ml-10"
                  required
                ></v-text-field>

                <v-btn
                  icon="mdi-delete-outline"
                  class="ml-9 mr-1"
                  variant="text"
                  color="red"
                  @click="deleteAnswerColumn(columnIndex)"
                >
                  <v-tooltip activator="parent" location="end">Delete Column</v-tooltip>
                  <v-icon icon="mdi-delete-outline" size="small"></v-icon>
                </v-btn>
              </div>
            </div>
          </div>
        </div>
      </v-responsive>
      <v-btn variant="outlined" class="mx-auto my-8" type="submit" prepend-icon="mdi-check-circle">
        <template #prepend>
          <v-icon color="success"></v-icon>
        </template>
        Submit</v-btn
      >
    </v-sheet>
  </v-form>
</template>
