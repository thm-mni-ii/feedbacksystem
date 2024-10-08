<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'
// import VueIntersect from 'vue-intersect'
import type Question from '../model/Question'
import type Choice from '../model/questionTypes/Choice'
import QuestionType from '../enums/QuestionType'
import { onMounted } from 'vue'

const props = defineProps<{
  inputQuestion?: Question
  isNew: boolean
}>()

const emit = defineEmits<{
  (e: 'update'): void
  (e: 'cancel'): void
}>()

const questionTypes = Object.values(QuestionType)

const question = ref<Question>({} as Question)

onMounted(() => {
  console.log(props.isNew)
  console.log(props.inputQuestion)
  if (props.isNew) {
    question.value = {
      owner: -1,
      questiontext: '',
      questiontags: [] as string[],
      questiontype: QuestionType.Choice,
      questionconfiguration: {
        multipleRow: false,
        multipleColumn: false,
        answercolumns: [{ id: 1, name: '', correctAnswers: [] }],
        Optionrows: [{ id: 1, text: '' }]
      }
    }
  } else if (props.inputQuestion) {
    question.value = props.inputQuestion
  }
})

const addOptionRow = () => {
  console.log('add option row triggered')
  if (!question.value.questionconfiguration.Optionrows) {
    question.value.questionconfiguration.Optionrows = []
  }

  question.value.questionconfiguration.Optionrows.push({
    id: question.value.questionconfiguration.Optionrows.length + 1,
    text: ''
  })
}

const addOptionCol = () => {
  const answercolumns = question.value.questionconfiguration.answercolumns

  if (!Array.isArray(answercolumns)) {
    console.error('answerColumns is not initialized or is not an array')
    return
  }

  answercolumns.push({
    id: answercolumns.length,
    name: '',
    correctAnswers: []
  })

  console.log('Updated answerColumns:', answercolumns)
}

const deleteOption = (index: number) => {
  question.value.questionconfiguration.Optionrows.splice(index, 1)
}

const deleteAnswerColumn = (index: number) => {
  if (question.value.questionconfiguration.answercolumns.length > 0) {
    question.value.questionconfiguration.answercolumns.splice(index, 1)
  }
}

const toggleCorrectAnswer = (columnIndex: number, optionIndex: number, isSelected: boolean) => {
  const answercolumns = question.value.questionconfiguration.answercolumns
  if (!answercolumns || !answercolumns[columnIndex]) {
    return
  }
  const correctAnswers = answercolumns[columnIndex].correctAnswers || []
  const index = correctAnswers.indexOf(optionIndex)
  if (isSelected && index === -1) {
    correctAnswers.push(optionIndex)
  } else if (!isSelected && index !== -1) {
    correctAnswers.splice(index, 1)
  }
  question.value.questionconfiguration.answercolumns[columnIndex].correctAnswers = [
    ...correctAnswers
  ]
}

const isCorrectAnswer = (columnIndex: number, optionIndex: number) => {
  const answercolumns = question.value.questionconfiguration.answercolumns
  if (!answercolumns || !answercolumns[columnIndex] || !answercolumns[columnIndex].correctAnswers) {
    return false
  }
  return answercolumns[columnIndex].correctAnswers.includes(optionIndex)
}

const removeTag = (item: string) => {
  question.value.questiontags.splice(question.value.questiontags.indexOf(item), 1)
}

const handleSubmit = async () => {
  if (question.value.questionconfiguration.answercolumns[0].correctAnswers.length > 1) {
    question.value.questionconfiguration.multipleRow = true
  }
  const token = localStorage.getItem('token')
  console.log('Token:', token)

  const config = {
    headers: { Authorization: `Bearer ${token}` }
  }
  console.log('CONFIG:', config)
  console.log('QUESTION:', question.value)
  if (props.isNew) {
    axios.post('/api_v1/question', question.value, config).then((res) => {
      console.log(res)
      emit('update')
    })
  } else {
    axios
      .put('/api_v1/question', question.value, config)
      .then((res) => {
        console.log(res)
        emit('update')
      })
      .catch((err) => {
        console.log(err)
      })
  }
}
</script>

<template>
  <v-card>
    <v-card-title class="text-h4 font-weight-bold text-center text-primary">{{
      isNew ? 'Add new Question' : 'Update Question'
    }}</v-card-title>
    <v-card-text>
      <v-form>
        <v-select
          label="Fragetyp"
          v-model="question.questiontype"
          :items="questionTypes"
          variant="solo-filled"
        ></v-select>
        <v-textarea
          v-model="question.questiontext"
          maxlength="130"
          auto-grow
          counter
          rows="3"
          label="Question"
          required
        ></v-textarea>

        <v-combobox
          v-model="question.questiontags"
          label="Tags"
          prepend-icon="mdi-tag"
          variant="solo"
          chips
          clearable
          multiple
        >
          <template #selection="{ item }">
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

          <div class="overflow-x-auto">
            <div
              v-for="(option, optionIndex) in question.questionconfiguration.Optionrows"
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
                      class="ml-4 row-btn"
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
                  v-for="(column, columnIndex) in question.questionconfiguration.answercolumns"
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
                  icon="mdi-plus"
                  class="ml-2 mb-2"
                  size="small"
                  @click="addOptionRow"
                  v-tooltip:end="'Add Answer'"
                ></v-btn>
              </v-responsive>

              <div class="d-flex flex-row flex-nowrap">
                <div
                  v-for="(column, columnIndex) in question.questionconfiguration.answercolumns"
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
        <div v-if="question.questiontype === 'FillInTheBlanks'">HAHOOERR</div>
      </v-form>
    </v-card-text>

    <v-card-actions>
      <v-btn color="red" variant="tonal" class="mx-4 mb-4" @click="$emit('cancel')">Cancel</v-btn>
      <v-btn color="primary" variant="tonal" class="mx-4 mb-4" @click="handleSubmit">{{
        isNew ? 'Save' : 'Update'
      }}</v-btn>
    </v-card-actions>
  </v-card>
</template>

<style scoped>
.row-text {
  width: 350px;
}
</style>
