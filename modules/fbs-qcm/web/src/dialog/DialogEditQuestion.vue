<script setup lang="ts">
import { ref } from 'vue'
import type Question from '@/model/Question'
import EditQuestion from '@/components/EditQuestion.vue'

const editQuestionDialog = ref(false)

const question = ref<Question | undefined>()
const isNew = ref<boolean>(true)
const persist = ref<boolean>(true)

// Promise resolve
const resolvePromise = ref<Function | undefined>(undefined)

/**
 * @param editQuestion Zu bearbeitende Frage, oder undefined für "neu erstellen".
 * @param options.persist Ob beim Speichern der echte Backend-Call ausgeführt wird
 * (default true). Auf false setzen, wenn die Frage nur lokal (z.B. im SkillGraph)
 * verwaltet wird und im Backend nicht existiert.
 */
const openDialog = (editQuestion?: Question, options?: { persist?: boolean }) => {
  if (editQuestion) {
    question.value = editQuestion
    isNew.value = false
  } else {
    question.value = undefined
    isNew.value = true
  }

  persist.value = options?.persist ?? true
  editQuestionDialog.value = true

  return new Promise((resolve) => {
    resolvePromise.value = resolve
  })
}

const _confirm = (updatedQuestion: Question) => {
  editQuestionDialog.value = false
  resolvePromise.value && resolvePromise.value(updatedQuestion)
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
      :persist="persist"
      @cancel="_cancel"
      @update="_confirm"
    ></EditQuestion>
  </v-dialog>
</template>
