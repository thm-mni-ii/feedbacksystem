<template>
  <v-btn @click="router.push('/')">Home</v-btn>
  <v-btn @click="router.push('/categories')">Category</v-btn>
  <v-btn @click="router.push('/form')">Form</v-btn>
  <v-btn @click="router.push('/addCat')">new Category</v-btn>

  <RouterView />
</template>

<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router'

const router = useRouter()
</script>

<style scoped lang="scss"></style>
