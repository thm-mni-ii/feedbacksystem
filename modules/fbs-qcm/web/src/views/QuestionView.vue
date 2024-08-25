<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'
import CatalogSession from '../components/CatalogSession.vue'

const questionData = ref(null)
const token = localStorage.getItem('token')
const questionId = ref('')

const config = {
  headers: { Authorization: `Bearer ${token}` }
}

const getQuestion = async () => {
  axios
    .get('/api_v1/question', { ...config, params: { ID: questionId.value } })
    .then((res) => {
      console.log('One Question:', res), (questionData.value = res.data)
    })
    .catch((err) => console.log(err))
}
</script>
<template>
  <div class="mx-16">
    <div class="d-flex my-4 align-center">
      <v-form @submit.prevent="getQuestion" class="w-25">
        <v-text-field v-model="questionId" label="Question ID"></v-text-field>
        <v-btn type="submit">get question</v-btn>
      </v-form>
    </div>
    <CatalogSession v-if="questionData" :question="questionData" />
  </div>
</template>
