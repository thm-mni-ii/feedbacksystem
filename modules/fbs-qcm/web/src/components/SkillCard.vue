<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps<{
  difficulty: number
  name: string
  progress: number
  description: string
}>()

const difficultyColor = computed(() => {
  return {
    1: '#b8f25b', // green
    2: '#ffd625', // amber
    3: '#f9a825', // orange
    4: '#d84315' // red
  }[props.difficulty]
})

const difficultyLabel = computed(() => {
  return {
    1: 'Easy 🌱',
    2: 'Intermediate ⚙️',
    3: 'Advanced 🔥',
    4: 'Expert 🧠'
  }[props.difficulty]
})
</script>
<template>
  <v-card variant="tonal" class="pa-4">
    <div class="d-flex justify-space-between align-center mb-2">
      <div class="text-h6">{{ name }}</div>
      <v-chip :color="difficultyColor" text-color="white" variant="flat" size="small" label>
        {{ difficultyLabel }}
      </v-chip>
    </div>

    <div class="wrap-subtitle text-body-2 text-medium-emphasis mb-2">
      {{ description }}
    </div>

    <v-card-title class="text-overline">
      Progress
      <div class="text-green-darken-3 text-h3 font-weight-bold">{{ progress }} %</div>
    </v-card-title>
    <v-progress-linear color="green-darken-3" height="15" :model-value="progress" rounded="lg">
    </v-progress-linear>

    <v-card-actions>
      <v-btn class="bg-primary-light mt-2">Start</v-btn>
    </v-card-actions>
  </v-card>
</template>
<style scoped>
.wrap-subtitle {
  white-space: normal;
  overflow: visible;
  text-overflow: unset;
}
.difficulty-side-bar {
  width: 10px;
  border-top-left-radius: 12px;
  border-bottom-left-radius: 12px;
}
</style>
