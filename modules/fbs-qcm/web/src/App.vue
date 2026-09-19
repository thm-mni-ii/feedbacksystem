<template>
  <v-app>
    <v-app-bar app color="black">
      <v-tabs class="d-flex justify-between">
        <v-tab :to="{ name: 'home' }">Home</v-tab>
        <!--
          Fragenpool und Algorithm Lab sind Dozenten-Werkzeuge und daher nur
          für ADMIN sichtbar. Kompetenzen/Fragen/Einstellungen eines
          konkreten Kurses sind bewusst kein globaler Menüpunkt mehr, sondern
          Teil der Unternavigation im jeweiligen Kurs-Workspace.
        -->
        <v-tab v-if="isAdmin" :to="{ name: 'questionPool' }">Fragenpool</v-tab>
        <v-tab v-if="isAdmin" :to="{ name: 'AlgorithmLab' }">Algorithm Lab</v-tab>
      </v-tabs>
    </v-app-bar>
    <v-main>
      <RouterView />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()
const isAdmin = computed(() => authStore.decodedToken?.globalRole === 'ADMIN')
</script>

<style scoped lang="scss"></style>
