<template>
  <v-app>
    <v-app-bar app color="primary">
      <v-tabs class="d-flex justify-between">
        <v-tab @click="router.push('/')">Home</v-tab>
        <v-tab @click="router.push('/categories')">Categories</v-tab>
        <v-tab @click="router.push('/addCat')">new Category</v-tab>
        <v-tab @click="router.push('/Question')">Get Question</v-tab>
        <v-tab @click="router.push('/deleteQuestion')">Delete Question</v-tab>
        <v-tab @click="router.push('/allQuestions')">All Questions</v-tab>
      </v-tabs>
    </v-app-bar>
    <v-main>
      <RouterView />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router'

const router = useRouter()
</script>

<style scoped lang="scss"></style>
