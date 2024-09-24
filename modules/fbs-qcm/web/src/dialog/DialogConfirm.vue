<script setup lang="ts">
import { ref } from 'vue'

const deleteDialog = ref<boolean>(false)
const deleteTitle = ref<string>('')
const deleteMessage = ref<string | undefined>(undefined)
const deleteConfirmBtnText = ref<string | undefined>('Delete')

// Promis
const resolvePromise: any = ref(undefined)
const rejectPromise: any = ref(undefined)

const openDialog = (
  title: string,
  message: string | undefined,
  confirmBtnText: string | undefined
) => {
  deleteTitle.value = title
  deleteMessage.value = message
  deleteDialog.value = true

  if (confirmBtnText != undefined) {
    deleteConfirmBtnText.value = confirmBtnText
  }

  return new Promise((resolve, reject) => {
    resolvePromise.value = resolve
    rejectPromise.value = reject
  })
}

const _confirm = () => {
  deleteDialog.value = false
  resolvePromise.value(true)
}

const _cancel = () => {
  deleteDialog.value = false
  resolvePromise.value(false)
}

// define expose
defineExpose({
  openDialog
})
</script>

<style scoped></style>
<template>
  <v-dialog v-model="deleteDialog" width="500px">
    <v-card :title="deleteTitle" :text="deleteMessage">
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="text" @click="_cancel" color="red"> Cancel </v-btn>
        <v-btn variant="text" @click="_confirm" color="primary">
          {{ deleteConfirmBtnText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
