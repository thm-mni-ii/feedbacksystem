<script setup lang="ts">
import { ref } from 'vue'

const deleteDialog = ref(false)
const deleteTitle = ref('')
const deleteMessage = ref<string | undefined>(undefined)
const deleteConfirmBtnText = ref('Delete')

// Promise resolve
const resolvePromise = ref<Function | undefined>(undefined)

const openDialog = (title: string, message: string = '', confirmBtnText: string = 'Cancel') => {
  deleteTitle.value = title
  deleteMessage.value = message
  deleteConfirmBtnText.value = confirmBtnText
  deleteDialog.value = true

  return new Promise((resolve) => {
    resolvePromise.value = resolve
  })
}

const _confirm = () => {
  deleteDialog.value = false
  resolvePromise.value && resolvePromise.value(true)
}

const _cancel = () => {
  deleteDialog.value = false
  resolvePromise.value && resolvePromise.value(false)
}

// define expose
defineExpose({
  openDialog
})
</script>

<template>
  <v-dialog v-model="deleteDialog" width="500px">
    <v-card>
      <v-card-title>{{ deleteTitle }}</v-card-title>
      <v-card-text>{{ deleteMessage }}</v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="text" @click="_cancel"> Close!!!!! </v-btn>
        <v-btn variant="text" @click="_confirm">CONFRM {{ deleteConfirmBtnText }} </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
