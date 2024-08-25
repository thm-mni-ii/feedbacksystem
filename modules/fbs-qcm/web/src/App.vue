<template>
  <div>
    <v-btn @click="router.push('/')" class="ma-2">Home</v-btn>
    <v-btn @click="router.push('/categories')" class="ma-2">Category</v-btn>
    <v-btn @click="router.push('/newQuestion')" class="ma-2">new Question</v-btn>
    <v-btn @click="router.push('/addCat')" class="ma-2">new Category</v-btn>
    <v-btn @click="router.push('/Question')" class="ma-2">Get Question</v-btn>
    <v-btn @click="router.push('/deleteQuestion')" class="ma-2">Delete Question</v-btn>
  </div>
  <RouterView />
</template>

<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router'

const router = useRouter()
</script>

<style scoped lang="scss"></style>
