<script setup lang="ts">
import { ref } from 'vue'
import type Question from '@/model/Question'
import EditQuestion from '@/components/EditQuestion.vue'

const editQuestionDialog = ref(false)

const question = ref<Question | undefined>()
const isNew = ref<boolean>(true)

// Promise resolve
const resolvePromise = ref<Function | undefined>(undefined)

const openDialog = (editQuestion?: Question) => {
  if (editQuestion) {
    question.value = editQuestion
    isNew.value = false
  } else {
    isNew.value = true
  }
  editQuestionDialog.value = true

  return new Promise((resolve) => {
    resolvePromise.value = resolve
  })
}

const _confirm = () => {
  editQuestionDialog.value = false
  resolvePromise.value && resolvePromise.value(true)
}

const _cancel = () => {
  editQuestionDialog.value = false
  resolvePromise.value && resolvePromise.value(false)
}

// define expose
defineExpose({
  openDialog
})
</script>

<template>
  <v-dialog v-model="editQuestionDialog">
    <EditQuestion
      :input-question="question"
      :is-new="isNew"
      @cancel="_cancel"
      @update="_confirm"
    ></EditQuestion>
  </v-dialog>
</template>
