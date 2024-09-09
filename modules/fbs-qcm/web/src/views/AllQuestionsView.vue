<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import type Question from '@/model/Question'
import DialogConfirmVue from '../dialog/DialogConfirm.vue'
import DialogEditQuestion from '@/dialog/DialogEditQuestion.vue'

const dialogConfirm = ref<typeof DialogConfirmVue>()
const selectedQuestionId = ref<string | null>(null)
const dialogEditQuestion = ref<typeof DialogEditQuestion>()

const token = localStorage.getItem('token')
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

const editQuestion = () => {
  if (dialogEditQuestion.value) {
    dialogEditQuestion.value.openDialog('HEYOOOOOO!!').then((result: boolean) => {
      if (result) {
        // router.push(`/catalogSession/${catalog.id}`)
        console.log('CONFIRMED!!')
      } else {
        console.log('Cancel')
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

onMounted(() => {
  getAllQuestions()
})
</script>
<template>
  <DialogEditQuestion ref="dialogEditQuestion" />
  <h2 class="mx-auto mt-16 text-primary text-center">All Questions</h2>
  <v-list class="mx-auto" max-width="400">
    <v-list-item v-for="question in allQuestions" :key="question._id" :v-bind="question">
      <v-card @click="editQuestion()" class="mx-auto text-center px-8 py-4">
        {{ question._id }}
      </v-card>
    </v-list-item>
  </v-list>
</template>
