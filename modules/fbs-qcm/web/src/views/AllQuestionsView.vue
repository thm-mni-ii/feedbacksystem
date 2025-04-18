<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type Question from '@/model/Question'
import questionService from '@/services/question.service'
import DialogEditQuestion from '@/dialog/DialogEditQuestion.vue'

const dialogEditQuestion = ref<typeof DialogEditQuestion>()

const allQuestions = ref<Question[]>([])

const editQuestion = (question: Question) => {
  if (dialogEditQuestion.value) {
    console.log(question)
    dialogEditQuestion.value.openDialog(question).then((result: boolean) => {
      if (result) {
        // router.push(`/catalogSession/${catalog.id}`)
        console.log(`Update Question ${question._id} successful`)
        openSnackbar(`Update Question ${question._id} successful`)
      } else {
        console.log(`Update Question ${question._id} Cancelled`)
        openSnackbar('Create / Edit Quesion Cancelled')
      }
    })
  }
}
const addQuestion = () => {
  if (dialogEditQuestion.value) {
    dialogEditQuestion.value.openDialog().then((result: boolean) => {
      if (result) {
        // router.push(`/catalogSession/${catalog.id}`)
        console.log(`Create new Question Successful`)
        openSnackbar('Create / Edit Question Successful')
      } else {
        console.log(`Create new Question Cancelled`)
        openSnackbar('Create / Edit Quesion Cancelled')
      }
    })
  }
}

const snackbar = ref<boolean>(false)
const snackbarText = ref<string>('')
const openSnackbar = (text: string) => {
  snackbar.value = true
  snackbarText.value = text
}

onMounted(() => {
  questionService.getAllQuestions().then((res) => {
    console.log(res.data)
    allQuestions.value = res.data
  })
})
</script>
<template>
  <v-snackbar v-model="snackbar" :timeout="4000">
    {{ snackbarText }}

    <template #actions>
      <v-btn color="primary" variant="text" @click="snackbar = false"> Close </v-btn>
    </template>
  </v-snackbar>

  <DialogEditQuestion ref="dialogEditQuestion" />
  <v-card class="mx-auto my-8" max-width="800">
    <v-card-title class="text-primary"> All Questions </v-card-title>

    <v-divider></v-divider>

    <v-virtual-scroll :items="allQuestions" height="700" item-height="48">
      <template #default="{ item }">
        <v-list-item
          :title="`${item.questiontype} Question`"
          :subtitle="`${item.questiontext}`"
          @click="editQuestion(item)"
        >
          <template v-slot:append>
            <v-btn icon="mdi-pencil" size="x-small" variant="tonal"></v-btn>
          </template>
        </v-list-item>
      </template>
    </v-virtual-scroll>
  </v-card>
  <div class="d-flex justify-center">
    <v-btn
      icon="mdi-plus"
      class="mx-auto row-btn mx-8 mb-16 align-center"
      variant="tonal"
      color="primary"
      @click="addQuestion()"
    >
      <v-tooltip activator="parent" location="end">Create New Question</v-tooltip>
      <v-icon icon="mdi-plus" size="small" class="mx-auto"></v-icon>
    </v-btn>
  </div>
</template>
