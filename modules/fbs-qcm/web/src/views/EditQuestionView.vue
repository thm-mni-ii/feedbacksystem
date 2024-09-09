<script setup lang="ts">
import { ref } from 'vue'
import QuestionForm from '@/components/QuestionForm.vue'
console.log('EDIT QUESTION')
const dialog = ref<boolean>(false)
</script>

<template>
  <h1>HEYOO</h1>

  <QuestionForm
    :question="question"
    :questionTypes="questionTypes"
    :isEditMode="true"
    @submit="handleSubmit"
    @update:question="(q) => (question = q)"
  />
</template>
