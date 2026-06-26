<template>
  <div class="text-center pa-6">
    <v-card class="pa-6">
      <v-icon size="64" color="warning" class="mb-4">mdi-alert-circle-outline</v-icon>
      <h2 class="mb-4">Keine Fragen verfügbar</h2>
      <p class="text-medium-emphasis mb-6">
        Es sind keine weiteren Fragen für die aktuelle Sitzung vorhanden.
      </p>
      <v-btn color="primary" @click="$emit('restart')">Neue Analyse starten</v-btn>
    </v-card>
  </div>
</template>

<script setup lang="ts">
defineEmits<{
  (e: 'restart'): void
}>()
</script>
