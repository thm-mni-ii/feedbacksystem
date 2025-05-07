<script setup lang="ts">
import { ref } from 'vue'
import type Question from '@/model/Question'
import QuestionFindModal from '@/components/QuestionFindModal.vue'

const AddQuestionDialog = ref(false)

const questionOptionsVar = ref<Question[]>([]); 
const showInputVar = ref(false);
const transitionVar = ref("");
const resolvePromise = ref<Function | undefined>(undefined);
const currentQuestionVar = ref("");

const openDialog = (questionOptions: Question[], showInput: boolean, transition: string, currentQuestion: string) => {
  AddQuestionDialog.value = true
  questionOptionsVar.value = questionOptions;
  showInputVar.value = showInput;
  transitionVar.value = transition;
  currentQuestionVar.value = currentQuestion;
  return new Promise((resolve) => {
    resolvePromise.value = resolve
  })
}

const _confirm = (nodeData: number, selectedQuestion: string, transition: string) => {
  AddQuestionDialog.value = false
  resolvePromise.value && resolvePromise.value({ 
    nodeData, 
    selectedQuestion, 
    transition 
  })
}

const _cancel = () => {
  AddQuestionDialog.value = false
  resolvePromise.value && resolvePromise.value(null)
}

// define expose
defineExpose({
  openDialog
})
</script>

<template>
  <v-dialog v-model="AddQuestionDialog">
    <QuestionFindModal
      :show="AddQuestionDialog"
      :question-options="questionOptionsVar"
      :show-input="showInputVar"
      :transition="transitionVar"
      :current-question="currentQuestionVar"
      @cancel="_cancel"
      @confirm="_confirm"
    ></QuestionFindModal>
  </v-dialog>
</template>