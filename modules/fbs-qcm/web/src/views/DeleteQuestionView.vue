<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'
const token = localStorage.getItem('token')
const questionId = ref('')
const questionData = ref(null)

const config = {
  headers: { Authorization: `Bearer ${token}` }
}

const deleteQuestion = async () => {
  axios
    .get('/api_v1/question', { ...config, params: { ID: questionId.value } })
    .then((res) => {
      console.log('One Question:', res), (questionData.value = res.data)
    })
    .catch((err) => console.log(err))

  axios
    .delete('/api_v1/question', { ...config, params: { ID: questionId.value } })
    .then((res) => {
      console.log('Question Deleted:', res), (questionData.value = res.data)
    })
    .catch((err) => console.log(err))
}
</script>
<template>
  <div class="mx-16">
    <div class="d-flex my-4 align-center">
      <v-form class="w-25">
        <v-text-field v-model="questionId" label="Question ID"></v-text-field>
        <v-btn @click="deleteQuestion">delete question</v-btn>
      </v-form>
    </div>
    <CatalogSession v-if="questionData" :question="questionData" />
  </div>
</template>
