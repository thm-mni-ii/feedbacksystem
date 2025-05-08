<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'
const token = localStorage.getItem('token')
const questionId = ref<string>('')
const questionData = ref<any>(null)
const message = ref<string>('')

const config = {
  headers: { Authorization: `Bearer ${token}` }
}

const deleteQuestion = async () => {
  try {
    const getResponse = await axios.get('/api_v1/question', {
      ...config,
      params: { ID: questionId.value }
    })
    questionData.value = getResponse.data
    console.log('One Question:', getResponse.data)

    await axios.delete('/api_v1/question', {
      ...config,
      params: { ID: questionId.value }
    })
    console.log('Question Deleted:', questionData.value.questiontext)
    message.value = 'Question deleted successfully!'
  } catch (err) {
    console.error('Error:', err)
    message.value = 'Failed to delete question.'
  }
}
</script>
<template>
  <div class="mx-16 mt-16">
    <div class="d-flex my-4 align-center">
      <v-form class="w-50" @submit.prevent="deleteQuestion">
        <v-text-field v-model="questionId" label="Question ID"></v-text-field>
        <v-btn type="submit">delete question</v-btn>
      </v-form>
    </div>
    <div v-if="message" class="my-2">{{ message }}</div>
  </div>
</template>
