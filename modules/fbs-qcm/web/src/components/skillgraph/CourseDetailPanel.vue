<template>
  <div v-if="selectedNode?.type === 'course'" class="course-panel" :style="panelStyles">
    <p class="text-body-2 course-description mb-4">
      {{ selectedNode.data.description }}
    </p>

    <v-card class="pa-4 profile-card" elevation="0" rounded="lg">
      <div class="d-flex align-center justify-space-between mb-3">
        <p class="mb-0 font-weight-bold">Kompetenzstruktur</p>
        <v-chip size="small" variant="flat" class="summary-chip">
          {{ totalCompetencies }} Kompetenzen
        </v-chip>
      </div>

      <v-expansion-panels v-model="expandedPanel" variant="accordion" class="profile-panels">
        <v-expansion-panel
          v-for="group in competencyGroups"
          :key="group.root.id"
          :value="group.root.id"
          elevation="0"
          rounded="lg"
          class="mb-2"
        >
          <v-expansion-panel-title>
            <div class="w-100 d-flex align-center justify-space-between ga-2">
              <div class="d-flex align-center ga-2 min-w-0">
                <span
                  class="root-dot"
                  :style="{ backgroundColor: getCompetencyColor(group.root) }"
                ></span>
                <span class="font-weight-medium text-truncate">{{ group.root.name }}</span>
              </div>
              <v-chip size="x-small" :color="getCompetencyColor(group.root)" variant="flat">
                {{ group.hierarchy.length }} Unterkompetenzen
              </v-chip>
            </div>
          </v-expansion-panel-title>

          <v-expansion-panel-text>
            <p v-if="group.root.description" class="text-caption text-medium-emphasis mb-3">
              {{ group.root.description }}
            </p>

            <div
              v-for="item in group.hierarchy"
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

            <p v-if="!group.hierarchy.length" class="text-caption text-medium-emphasis mb-0">
              Keine Unterkompetenzen vorhanden.
            </p>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-card>

    <v-card elevation="0" rounded="lg" class="mt-3 question-summary-card">
      <v-card-text>
        <div>
          <div class="text-caption text-medium-emphasis">Fragen</div>
          <div class="text-h6">{{ questions.length }}</div>
          <div class="text-caption text-medium-emphasis">gesamt im aktuellen Kursmodell</div>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Competency, Question } from '@/model/types'
import { skillGraphPalette } from '@/plugins/vuetify'

interface Props {
  selectedNode: any
  questions: Question[]
  rootCompetencies: Competency[]
  childCompetencies: (parentId: string) => Competency[]
  getCompetencyColor: (comp?: Competency) => string
}

const props = defineProps<Props>()

interface HierarchyItem {
  competency: Competency
  depth: number
}

const expandedPanel = ref<string | undefined>(props.rootCompetencies[0]?.id)

const buildHierarchy = (parentId: string, depth = 1): HierarchyItem[] => {
  const children = props.childCompetencies(parentId)
  return children.flatMap((child) => [
    { competency: child, depth },
    ...buildHierarchy(child.id, depth + 1)
  ])
}

const competencyGroups = computed(() =>
  props.rootCompetencies.map((root) => ({
    root,
    hierarchy: buildHierarchy(root.id)
  }))
)

const totalCompetencies = computed(
  () =>
    props.rootCompetencies.length +
    competencyGroups.value.reduce((sum, g) => sum + g.hierarchy.length, 0)
)

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
</script>

<style scoped>
.profile-card {
  background: linear-gradient(180deg, var(--sg-surface) 0%, var(--sg-surface-muted) 100%);
  border: 1px solid var(--sg-border);
  box-shadow: 0 8px 22px var(--sg-shadow);
}

.question-summary-card {
  background: linear-gradient(180deg, var(--sg-surface) 0%, var(--sg-surface-muted) 100%);
  border: 1px solid var(--sg-border);
  box-shadow: 0 8px 22px var(--sg-shadow);
}

.course-description {
  color: var(--sg-text-secondary);
  line-height: 1.4;
}

.summary-chip {
  color: var(--sg-surface);
  background: var(--sg-accent);
}

.profile-panels :deep(.v-expansion-panel) {
  border: 1px solid var(--sg-border);
  background: var(--sg-surface);
}

.profile-panels :deep(.v-expansion-panel-title) {
  min-height: 48px;
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
</style>
