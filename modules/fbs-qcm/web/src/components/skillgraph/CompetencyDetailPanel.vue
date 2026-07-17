<template>
  <div
    v-if="
      selectedNode?.type?.startsWith('competency-root') ||
      selectedNode?.type?.startsWith('competency-sub')
    "
    class="competency-panel"
  >
    <v-card class="mb-4 profile-card" elevation="0" rounded="lg" :style="panelStyles">
      <div class="d-flex align-center justify-space-between pa-4 competency-header">
        <div class="d-flex align-center ga-3 min-w-0">
          <span
            class="competency-dot"
            :style="{ backgroundColor: getCompetencyColor(selectedNode.data) }"
          ></span>
          <div class="min-w-0">
            <p class="text-overline mb-1 section-label">Kompetenzdetails</p>
            <h3 class="text-h6 font-weight-bold mb-0 competency-title text-truncate">
              {{ selectedNode.data.name }}
            </h3>
          </div>
        </div>

        <v-chip size="small" variant="flat" class="summary-chip">
          {{ questionsWithCompetency(selectedNode.data.id).length }} Fragen
        </v-chip>
      </div>
    </v-card>

    <v-card class="mb-4 profile-card" elevation="0" rounded="lg" :style="panelStyles">
      <v-card-text class="pa-4">
        <div class="d-flex align-center justify-space-between mb-3">
          <p class="mb-0 font-weight-bold">Kompetenzstruktur</p>
          <v-chip size="small" variant="flat" class="summary-chip">
            {{ selectedHierarchy.length }} Unterkompetenzen
          </v-chip>
        </div>

        <div class="d-flex align-center ga-2 mb-3">
          <span
            class="root-dot"
            :style="{ backgroundColor: getCompetencyColor(selectedNode.data) }"
          ></span>
          <span class="text-body-2 text-medium-emphasis text-truncate">
            <template v-if="selectedNode.type?.startsWith('competency-root')">
              Kompetenzbereich: {{ selectedNode.data.category || 'Ohne Kompetenzbereich' }}
            </template>
            <template v-else>
              Übergeordnete Kompetenz:
              {{ getCompetency(selectedNode.data.parentId)?.name || 'Nicht verfügbar' }}
            </template>
          </span>
        </div>

        <p v-if="selectedNode.data.description" class="text-caption text-medium-emphasis mb-3">
          {{ selectedNode.data.description }}
        </p>

        <div v-if="selectedHierarchy.length">
          <div
            v-for="item in selectedHierarchy"
            :key="item.competency.id"
            class="mb-2 profile-item"
            :class="`profile-item--depth-${Math.min(item.depth, 4)}`"
            :style="{ paddingLeft: `${item.depth * 14}px` }"
          >
            <div
              class="profile-item-line"
              :style="{ backgroundColor: getCompetencyColor(item.competency) }"
            ></div>
            <div class="d-flex align-center justify-space-between ga-2">
              <div class="d-flex align-center ga-2 min-w-0">
                <v-icon size="14" color="grey-darken-1">mdi-source-branch</v-icon>
                <span class="text-body-2 text-truncate">{{ item.competency.name }}</span>
              </div>
              <v-chip
                size="x-small"
                :color="getCompetencyColor(item.competency)"
                variant="tonal"
                class="level-chip"
              >
                L{{ item.depth }}
              </v-chip>
            </div>
          </div>
        </div>

        <p v-else class="text-body-2 text-medium-emphasis mb-0">
          Keine Unterkompetenzen vorhanden.
        </p>
      </v-card-text>
    </v-card>

    <v-card variant="outlined" class="mt-3">
      <v-card-text class="d-flex justify-space-between align-center">
        <div>
          <div class="text-caption text-medium-emphasis">Fragen</div>
          <div class="text-h6">{{ questionsWithCompetency(selectedNode.data.id).length }}</div>
        </div>
        <v-icon color="var(--sg-accent)">mdi-help-circle-outline</v-icon>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Competency, Question } from '@/model/types'
import { skillGraphPalette } from '@/plugins/vuetify'

interface Props {
  selectedNode: any
  getCompetency: (id: string) => Competency | undefined
  getCompetencyColor: (comp?: Competency) => string
  childCompetencies: (parentId: string) => Competency[]
  questionsWithCompetency: (compId: string) => Question[]
}

const props = defineProps<Props>()

interface HierarchyItem {
  competency: Competency
  depth: number
}

const panelStyles = {
  '--sg-surface': skillGraphPalette.surface,
  '--sg-surface-muted': skillGraphPalette.surfaceMuted,
  '--sg-border': skillGraphPalette.panelBorder,
  '--sg-shadow': skillGraphPalette.panelShadow,
  '--sg-text-primary': skillGraphPalette.textPrimary,
  '--sg-text-secondary': skillGraphPalette.textSecondary,
  '--sg-accent': skillGraphPalette.accent,
  '--sg-depth-1': skillGraphPalette.hierarchyDepth1,
  '--sg-depth-2': skillGraphPalette.hierarchyDepth2,
  '--sg-depth-3': skillGraphPalette.hierarchyDepth3,
  '--sg-depth-4': skillGraphPalette.hierarchyDepth4
}

const selectedHierarchy = computed<HierarchyItem[]>(() => {
  const selectedId = props.selectedNode?.data?.id

  if (!selectedId) {
    return []
  }

  const buildHierarchy = (parentId: string, depth = 1): HierarchyItem[] => {
    const children = props.childCompetencies(parentId)
    return children.flatMap((child) => [
      { competency: child, depth },
      ...buildHierarchy(child.id, depth + 1)
    ])
  }

  return buildHierarchy(selectedId)
})
</script>

<style scoped>
.profile-card {
  background: linear-gradient(180deg, var(--sg-surface) 0%, var(--sg-surface-muted) 100%);
  border: 1px solid var(--sg-border);
  box-shadow: 0 8px 22px var(--sg-shadow);
}

.competency-header {
  gap: 12px;
}

.competency-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  flex: 0 0 auto;
  box-shadow: 0 0 0 3px var(--sg-surface);
}

.competency-title {
  color: v-bind('skillGraphPalette.textPrimary');
  line-height: 1.25;
}

.section-label {
  color: v-bind('skillGraphPalette.textSecondary');
  letter-spacing: 0.08em;
}

.summary-chip {
  color: var(--sg-surface);
  background: var(--sg-accent);
}

.root-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  flex: 0 0 auto;
  box-shadow: 0 0 0 3px var(--sg-surface);
}

.profile-item {
  position: relative;
  border-radius: 12px;
  padding-top: 6px;
  padding-right: 8px;
  padding-bottom: 6px;
  background: var(--sg-surface-muted);
  border: 1px solid var(--sg-border);
}

.profile-item-line {
  position: absolute;
  top: 6px;
  bottom: 6px;
  left: 6px;
  width: 3px;
  border-radius: 999px;
}

.profile-item--depth-1 {
  background: var(--sg-depth-1);
}

.profile-item--depth-2 {
  background: var(--sg-depth-2);
}

.profile-item--depth-3 {
  background: var(--sg-depth-3);
}

.profile-item--depth-4 {
  background: var(--sg-depth-4);
}

.level-chip {
  font-weight: 600;
}

.sub-competency-item {
  border-left: 4px solid transparent;
  background: v-bind('skillGraphPalette.surfaceMuted');
}
</style>
