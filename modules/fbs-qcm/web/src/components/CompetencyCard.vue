<script setup lang="ts">
defineProps<{
  name: string
  description?: string
  category?: string
  progress: number
}>()
</script>

<template>
  <v-card variant="tonal" class="pa-4 d-flex flex-column h-100">
    <div class="d-flex align-start justify-space-between ga-3 mb-2">
      <div class="text-h6">{{ name }}</div>
      <v-chip v-if="category" color="primary" variant="tonal" size="small">
        {{ category }}
      </v-chip>
    </div>

    <p class="text-body-2 text-medium-emphasis mb-4 flex-grow-1">
      {{ description || 'Keine Beschreibung vorhanden.' }}
    </p>

    <div class="d-flex justify-space-between text-body-2 mb-1">
      <span class="text-overline">Fortschritt</span>
      <span class="font-weight-bold">{{ progress }}%</span>
    </div>
    <v-progress-linear :model-value="progress" color="primary" height="10" rounded />
  </v-card>
</template>
