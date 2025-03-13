<script setup lang="ts">
import { ref } from 'vue'
import type { Ref } from 'vue'
import type Question from '../model/Question'
import type ChoiceQuestionConfiguration from '@/model/ChoiceQuestionConfiguration'
import type { Choice } from '@/model/questionTypes/Choice'
import questionService from '@/services/question.service'
import QuestionType from '../enums/QuestionType'
import { onMounted, onBeforeUnmount } from 'vue'
import EditFillInTheBlanks from './EditFillInTheBlanks.vue'
import EditChoiceQuestion from './EditChoiceQuestion.vue'

const props = defineProps<{
  inputQuestion?: Question
  isNew: boolean
}>()

const emit = defineEmits<{
  (e: 'update'): void
  (e: 'cancel'): void
}>()

const questionTypes = Object.values(QuestionType)

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    emit('cancel')
  }
}

const question = ref<Question>({} as Question)
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
// Type Guard
function isChoiceQuestionConfiguration(config: any): config is Choice {
  return (
    config &&
    typeof config === 'object' &&
    'optionRows' in config &&
    Array.isArray(config.optionRows)
  )
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)

  if (props.isNew) {
    resetChoiceQuestion(question)
  } else if (props.inputQuestion) {
    question.value = props.inputQuestion
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})

const checkMultipleRows = () => {
  if (isChoiceQuestionConfiguration(question.value.questionconfiguration)) {
    const optionRows = question.value.questionconfiguration.optionRows
    const rowsWithAnswers = optionRows.filter((row) => row.correctAnswers.length > 0)
    if (rowsWithAnswers.length > 1) {
      question.value.questionconfiguration.multipleRow = true
    }
  }
}

const removeTag = (item: string) => {
  question.value.questiontags.splice(question.value.questiontags.indexOf(item), 1)
}

const handleUpdate = (updatedQuestion: Question) => {
  question.value = {
    ...question.value,
    questionconfiguration: updatedQuestion.questionconfiguration
  }
}

const handleSubmit = async () => {
  checkMultipleRows()
  if (props.isNew) {
    questionService
      .createQuestion(question.value)
      .then((res) => {
        console.log(res)
        emit('update')
      })
      .catch((err) => console.log(err))
  } else {
    questionService
      .updateQuestion(question.value)
      .then((res) => {
        console.log(res)
        emit('update')
      })
      .catch((err) => console.log(err))
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
          v-model="question.questiontype"
          :disabled="!isNew"
          label="Fragetyp"
          :items="questionTypes"
          variant="solo-filled"
        ></v-select>
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
        <v-textarea
          v-model="question.questiontext"
          maxlength="130"
          auto-grow
          counter
          rows="3"
          label="Question"
          required
        ></v-textarea>
        <EditChoiceQuestion
          v-if="question.questiontype === 'Choice'"
          :question="question"
          @update="handleUpdate"
        />
        <EditFillInTheBlanks
          v-if="question.questiontype === 'FillInTheBlanks'"
          :question="question"
          :isNew="isNew"
          @update="handleUpdate"
        />
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
