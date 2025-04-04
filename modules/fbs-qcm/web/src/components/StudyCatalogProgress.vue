<script setup lang="ts">
const name = defineModel<string>('name')
const progress = defineModel<number>('progress')
</script>
<template>
  <div class="d-flex justify-center mt-10">
    <v-sheet border rounded :width="300" class="pa-4 bg-grey">
      <p class="text-h5 text-center">{{ name }}</p>
      <div class="d-flex align-center">
        <v-progress-linear :model-value="progress" rounded class="mt-2" color="primary" height="20">
          <strong>{{ Math.ceil(progress ?? 0) }}%</strong>
        </v-progress-linear>
      </div>
    </v-sheet>
  </div>
</template>
