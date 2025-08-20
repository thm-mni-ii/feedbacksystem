<script setup lang="ts">
import { ref, computed } from 'vue'
import type Question from '@/model/Question'
import SelectQuestion from '@/components/SelectQuestion.vue'

const AddQuestionDialog = ref(false)

const questionOptionsVar = ref<Question[]>([])
const showInputVar = ref(false)
const transitionVar = ref('')
const resolvePromise = ref<Function | undefined>(undefined)
const currentQuestionVar = ref('')
const selectedQuestion = ref<string>('')
const nodeData = ref(0)
const showInput = ref<boolean>(true)

const scoreValidationError = computed(() =>
  nodeData.value < 0 || nodeData.value > 100 ? 'Wert muss zwischen 0 und 100 liegen' : ''
)

const openDialog = (
  questionOptions: Question[],
  showInput: boolean,
  transition: string,
  currentQuestion: string
) => {
  AddQuestionDialog.value = true
  questionOptionsVar.value = questionOptions
  showInputVar.value = showInput
  transitionVar.value = transition
  currentQuestionVar.value = currentQuestion
  return new Promise((resolve) => {
    resolvePromise.value = resolve
  })
}

const _confirm = () => {
  AddQuestionDialog.value = false
  if (resolvePromise.value) {
    resolvePromise.value({
      nodeData: nodeData.value,
      selectedQuestion: selectedQuestion.value,
      transition: transitionVar.value
    })
  }
}

const _cancel = () => {
  AddQuestionDialog.value = false
  resolvePromise.value && resolvePromise.value(null)
}
const handleQuestionChange = (question: Ref<string>) => {
  selectedQuestion.value = question.value
  console.log(selectedQuestion.value)
  console.log(question.value)
}

// define expose
defineExpose({
  openDialog
})
</script>

<template>
  <v-dialog v-model="AddQuestionDialog" class="w-100 w-md-75">
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="text-h4 ma-2 border-b-md border-primary">Select a Question</span>
        <v-btn icon variant="text" @click="_cancel">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <SelectQuestion
        :question-options="questionOptionsVar"
        :show-input="showInputVar"
        :transition="transitionVar"
        :current-question="currentQuestionVar"
        @question-changed="handleQuestionChange"
      ></SelectQuestion>
      <v-divider></v-divider>
      <v-card-text v-if="showInputVar" class="mt-6">
        <div class="border-b-md border-primary mb-1 pb-1">
          <div class="text-h6">Forwarding Threshold</div>
          <small class="text-caption">
            This percentage is used to redirect to the selected question.
          </small>
        </div>

        <v-slider
          v-model="nodeData"
          step="5"
          :error-messages="scoreValidationError ? [scoreValidationError] : []"
        >
          <template #append>
            <v-text-field
              v-model="nodeData"
              density="compact"
              style="width: 130px"
              type="number"
              hide-details
              single-line
              append-icon="mdi-percent"
            ></v-text-field>
          </template>
        </v-slider>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn variant="text" @click="_cancel">Cancel</v-btn>
        <v-btn color="primary" :disabled="!selectedQuestion" @click="_confirm"> Confirm </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
