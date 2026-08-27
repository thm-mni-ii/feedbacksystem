<template>
  <v-app>
    <v-app-bar app color="black">
      <v-tabs class="d-flex justify-between">
        <v-tab @click="router.push('/')">Home</v-tab>
        <v-tab
          v-if="authStore.decodedToken?.globalRole == 'ADMIN'"
          @click="router.push('/allQuestions')"
          >All Questions</v-tab
        >
        <v-tab @click="router.push('/questionCatalogs')">Question Catalogs</v-tab>
        <v-tab @click="router.push('/skillGraph')">Skill Graph</v-tab>
        <v-tab @click="router.push('/lab')">Algorithm Lab</v-tab>
      </v-tabs>
    </v-app-bar>
    <v-main>
      <RouterView />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()

const router = useRouter()
</script>

<style scoped lang="scss"></style>
