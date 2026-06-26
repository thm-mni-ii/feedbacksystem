<template>
  <div class="text-center">
    <h1 class="mb-4">Kompetenzprofil erstellt</h1>
    <p class="text-medium-emphasis mb-8">{{ historyCount }} Fragen beantwortet</p>

    <v-card class="pa-6 mx-auto" max-width="700">
      <div v-for="item in progress" :key="item.competencyId" class="mb-5">
        <div class="d-flex justify-space-between mb-1">
          <span>{{ item.label }}</span>
          <strong>{{ Math.round(item.score * 100) }}%</strong>
        </div>
        <v-progress-linear :model-value="item.score * 100" rounded height="10" />
      </div>
    </v-card>

    <v-btn class="mt-6" color="primary" @click="$emit('restart')">Neue Analyse</v-btn>
  </div>
</template>

<script setup lang="ts">
import type { ProgressItem } from '@/model/types'

interface Props {
  progress: ProgressItem[]
  historyCount: number
}

defineProps<Props>()
defineEmits<{
  (e: 'restart'): void
}>()
</script>
