<template>
  <v-app>
    <v-app-bar app color="primary">
      <v-tabs class="d-flex justify-between">
        <v-tab @click="router.push('/')">Home</v-tab>
        <v-tab @click="router.push('/allQuestions')">All Questions</v-tab>
        <v-tab @click="router.push('/CourseOverview')">Edit Catalog</v-tab>
        <v-tab @click="router.push('/Study')">Study</v-tab>
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
