<template>
  <v-card class="pa-4 profile-card">
    <div class="d-flex align-center justify-space-between mb-3">
      <h3 class="mb-0">Aktuelles Kompetenzprofil</h3>
      <v-chip size="small" color="primary" variant="tonal">Hierarchie</v-chip>
    </div>

    <v-expansion-panels v-model="expandedPanelValue" variant="accordion" class="profile-panels">
      <v-expansion-panel
        v-for="group in groups"
        :key="group.root.competencyId"
        :value="group.root.competencyId"
        elevation="0"
        rounded="lg"
        class="mb-2"
        :class="{ 'profile-panel--active': group.isActive }"
      >
        <v-expansion-panel-title>
          <div class="w-100 d-flex align-center justify-space-between ga-2">
            <span class="font-weight-medium" :class="{ 'text-primary': group.isActive }">
              {{ group.root.label }}
            </span>
            <v-chip
              size="x-small"
              :color="scoreColor(group.root.score, group.root.timesAssessed)"
              variant="flat"
            >
              {{ scoreLabel(group.root.score, group.root.timesAssessed) }}
            </v-chip>
          </div>
        </v-expansion-panel-title>

        <v-expansion-panel-text>
          <div class="mb-4">
            <v-progress-linear
              :model-value="group.root.score * 100"
              :color="scoreColor(group.root.score, group.root.timesAssessed)"
              height="8"
              rounded
            />
          </div>

          <div
            v-for="item in group.items"
            :key="item.competencyId"
            class="mb-3 profile-item"
            :class="{
              'profile-item--active': item.isCurrent,
              'profile-item--branch': item.isInCurrentPath && !item.isCurrent
            }"
            :style="{ paddingLeft: `${item.depth * 14}px` }"
          >
            <div class="d-flex align-center justify-space-between mb-1 ga-2">
              <span class="text-body-2" :class="{ 'font-weight-medium text-primary': item.isCurrent }">
                {{ item.label }}
              </span>
              <span class="text-caption text-medium-emphasis">
                {{ scoreLabel(item.score, item.timesAssessed) }}
              </span>
            </div>
            <v-progress-linear
              :model-value="item.score * 100"
              :color="scoreColor(item.score, item.timesAssessed)"
              height="6"
              rounded
            />
          </div>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ProfileGroup } from '@/composables/useAlgorithmLabView'

interface Props {
  groups: ProfileGroup[]
  expandedPanel: string | null
  scoreColor: (score: number, timesAssessed: number) => string
  scoreLabel: (score: number, timesAssessed: number) => string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:expandedPanel', value: string | null): void
}>()

const expandedPanelValue = computed({
  get: () => props.expandedPanel,
  set: (value) => emit('update:expandedPanel', value)
})
</script>

<style scoped>
.profile-card {
  background: linear-gradient(
    180deg,
    rgba(var(--v-theme-surface), 1) 0%,
    rgba(var(--v-theme-app-surface-muted), 1) 100%
  );
}

.profile-panels :deep(.v-expansion-panel) {
  border: 1px solid rgba(var(--v-theme-app-text-primary), 0.08);
}

.profile-panels :deep(.profile-panel--active) {
  border-color: rgba(var(--v-theme-primary), 0.35);
  box-shadow: 0 10px 24px rgba(var(--v-theme-primary), 0.12);
  background: linear-gradient(
    180deg,
    rgba(var(--v-theme-primary), 0.05) 0%,
    rgba(var(--v-theme-surface), 0.9) 100%
  );
}

.profile-item {
  border-radius: 12px;
  padding-top: 6px;
  padding-right: 8px;
  padding-bottom: 6px;
  transition:
    background-color 0.2s ease,
    box-shadow 0.2s ease;
}

.profile-item--branch {
  background: rgba(var(--v-theme-primary), 0.05);
}

.profile-item--active {
  background: rgba(var(--v-theme-primary), 0.1);
  box-shadow: 0 0 rgba(var(--v-theme-primary), 0.9);
}
</style>
