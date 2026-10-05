<script setup lang="ts">
import { ref } from 'vue'
import type Question from '@/model/Question'
import EditQuestion from '@/components/EditQuestion.vue'

const editQuestionDialog = ref(false)

const question = ref<Question | undefined>()
const isNew = ref<boolean>(true)
const persist = ref<boolean>(true)
const presetCompetencyIds = ref<string[] | undefined>(undefined)

// Promise resolve
const resolvePromise = ref<Function | undefined>(undefined)

/**
 * @param editQuestion Zu bearbeitende Aufgabe, oder undefined für "neu erstellen".
 * @param options.persist Ob beim Speichern der echte Backend-Call ausgeführt wird
 * (default true). Auf false setzen, wenn die Aufgabe nur lokal (z.B. im Kompetenzgraph)
 * verwaltet wird und im Backend nicht existiert.
 * @param options.presetCompetencyIds Vorbelegte Kompetenz-IDs für eine neue Aufgabe,
 * z.B. wenn "Aufgabe zu dieser Kompetenz hinzufügen" aus dem Kompetenz-Panel
 * aufgerufen wird. Wird nur beim Neuanlegen berücksichtigt.
 */
const openDialog = (
  editQuestion?: Question,
  options?: { persist?: boolean; presetCompetencyIds?: string[] }
) => {
  if (editQuestion) {
    question.value = editQuestion
    isNew.value = false
  } else {
    question.value = undefined
    isNew.value = true
  }

  persist.value = options?.persist ?? true
  presetCompetencyIds.value = editQuestion ? undefined : options?.presetCompetencyIds
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
      :preset-competency-ids="presetCompetencyIds"
      @cancel="_cancel"
      @update="_confirm"
    ></EditQuestion>
  </v-dialog>
</template>
