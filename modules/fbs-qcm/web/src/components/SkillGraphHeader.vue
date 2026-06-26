<template>
  <section class="mb-4" :style="headerStyle">
    <v-container class="text-center py-4">
      <v-avatar size="64" class="mb-2" :style="avatarStyle">
        <v-icon size="36">mdi-brain</v-icon>
      </v-avatar>
      <h1 class="text-h3 font-weight-bold mb-2">Kompetenz Graph</h1>
      <p class="text-subtitle-1 opacity-75">Kurs-Kompetenzmodell verwalten</p>
    </v-container>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { skillGraphPalette } from '@/plugins/vuetify'

const headerStyle = computed(() => ({
  background: `linear-gradient(135deg, ${skillGraphPalette.headerStart}, ${skillGraphPalette.headerEnd})`,
  color: skillGraphPalette.headerText
}))

const avatarStyle = computed(() => ({
  backgroundColor: skillGraphPalette.headerAvatar
}))
</script>

<style scoped></style>
