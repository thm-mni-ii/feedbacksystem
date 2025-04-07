<script lang="ts" setup>
defineProps<{
  name: string
  progress: number
  isActive: boolean
}>()
</script>

<template>
  <div class="d-flex justify-center mt-4 mr-4">
    <v-sheet
      border
      rounded
      :width="300"
      class="pa-4 transition-colors cursor-pointer"
      :class="{
        'bg-blue-grey-darken-2': isActive,
        'bg-grey': !isActive
      }"
    >
      <p class="text-h6 text-center">{{ name }}</p>
      <div class="d-flex align-center">
        <v-progress-linear
          :model-value="progress"
          rounded
          class="mt-2"
          color="primary-light"
          height="18"
        >
          <strong>{{ Math.ceil(progress ?? 0) }}%</strong>
        </v-progress-linear>
      </div>
    </v-sheet>
  </div>
</template>
