<template>
  <div class="text-center">
    <h1 class="mb-4">Kompetenzanalyse</h1>
    <p class="text-medium-emphasis mb-6">
      Beantworte die Fragen möglichst ehrlich. Das System erstellt daraus ein Kompetenzprofil.
    </p>
    <v-btn color="primary" size="large" @click="$emit('start')">Test starten</v-btn>
  </div>
</template>

<script setup lang="ts">
defineEmits<{
  (e: 'start'): void
}>()
</script>
