<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import type Question from '@/model/Question'
import DialogConfirmVue from '../dialog/DialogConfirm.vue'
import DialogEditQuestion from '@/dialog/DialogEditQuestion.vue'

const dialogConfirm = ref<typeof DialogConfirmVue>()
const selectedQuestionId = ref<string | null>(null)
const dialogEditQuestion = ref<typeof DialogEditQuestion>()

const token = localStorage.getItem('jsessionid')
const config = {
  headers: { Authorization: `Bearer ${token}` }
}

const allQuestions = ref<Question[]>([])

const getAllQuestions = async () => {
  axios
    .get('/api_v1/allquestions', config)
    .then((res) => {
      console.log(res.data)
      allQuestions.value = res.data
    })
    .catch((err) => console.log(err))
}

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

const openDialog = (id: string) => {
  selectedQuestionId.value = id
  // dialogEditQuestion.value = true
}

const closeDialog = () => {
  // dialogEditQuestion.value = false
  console.log(dialogEditQuestion.value)
}
const snackbar = ref<boolean>(false)
const snackbarText = ref<string>('')
const openSnackbar = (text: string) => {
  snackbar.value = true
  snackbarText.value = text
}

onMounted(() => {
  getAllQuestions()
})
</script>
<template>
  <v-snackbar v-model="snackbar" :timeout="4000">
    {{ snackbarText }}

    <template v-slot:actions>
      <v-btn color="primary" variant="text" @click="snackbar = false"> Close </v-btn>
    </template>
  </v-snackbar>

  <DialogEditQuestion ref="dialogEditQuestion" />
  <h2 class="mx-auto mt-16 text-primary text-center">All Questions</h2>
  <v-list class="mx-auto" max-width="400">
    <v-list-item v-for="question in allQuestions" :key="question._id" :v-bind="question">
      <v-card @click="editQuestion(question)" class="mx-auto text-center px-8 py-4">
        {{ question._id }}
      </v-card>
    </v-list-item>
  </v-list>
  <v-btn
    icon="mdi-plus"
    class="mx-auto row-btn"
    variant="tonal"
    color="primary"
    @click="addQuestion()"
  >
    <v-tooltip activator="parent" location="end">Create New Question</v-tooltip>
    <v-icon icon="mdi-plus" size="small"></v-icon>
  </v-btn>
</template>
