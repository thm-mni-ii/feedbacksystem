<template>
  <div
    v-if="
      selectedNode?.type?.startsWith('competency-root') ||
      selectedNode?.type?.startsWith('competency-sub')
    "
    class="competency-panel"
  >
    <v-card class="mb-4 profile-card" elevation="0" rounded="lg" :style="panelStyles">
      <v-card-text class="pa-4">
        <div class="d-flex align-center justify-space-between mb-3">
          <p class="mb-0 font-weight-bold">Kompetenzstruktur</p>
        </div>

        <div class="info-stack mb-3">
          <div class="info-block">
            <div class="info-block-label">
              <v-icon size="16" color="var(--sg-accent)">mdi-map-marker-path</v-icon>
              <span>Kompetenzpfad</span>
            </div>
            <div class="breadcrumb text-body-2">
              <template v-for="(segment, index) in competencyPath" :key="`${segment}-${index}`">
                <span class="breadcrumb-segment text-truncate">{{ segment }}</span>
                <v-icon v-if="index < competencyPath.length - 1" size="18" color="var(--sg-accent)">
                  mdi-chevron-right
                </v-icon>
              </template>
            </div>
          </div>

          <div class="info-block">
            <div class="info-block-label">
              <v-icon size="16" color="var(--sg-accent)">mdi-text-box-outline</v-icon>
              <span>Beschreibung</span>
            </div>
            <p v-if="selectedNode.data.description" class="info-block-text mb-0">
              {{ selectedNode.data.description }}
            </p>
            <p v-else class="info-block-text text-medium-emphasis mb-0">
              Keine Beschreibung vorhanden.
            </p>
          </div>
        </div>

        <div class="d-flex align-center justify-space-between mb-2">
          <p class="mb-0 text-body-2 font-weight-bold">Unterkompetenzen</p>
          <v-chip size="small" variant="flat" class="summary-chip">
            {{ selectedHierarchy.length }}
          </v-chip>
        </div>

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

    <v-expansion-panels
      v-model="questionsExpanded"
      variant="accordion"
      class="question-panels mt-3"
    >
      <v-expansion-panel elevation="0" rounded="lg" class="profile-card">
        <v-expansion-panel-title class="px-4 py-3 question-panel-title">
          <div class="d-flex align-center justify-space-between w-100 ga-3">
            <div class="d-flex align-center ga-2 min-w-0">
              <v-icon color="var(--sg-accent)" size="18">mdi-help-circle-outline</v-icon>
              <div class="text-left min-w-0">
                <div class="text-caption text-medium-emphasis">Fragen</div>
                <div class="text-body-1 font-weight-bold">Zugeordnete Fragen anzeigen</div>
              </div>
            </div>

            <v-chip size="small" variant="flat" class="summary-chip text-white question-count-chip">
              {{ assignedQuestions.length }} Fragen
            </v-chip>
          </div>
        </v-expansion-panel-title>

        <v-expansion-panel-text class="px-4 pb-4 pt-0">
          <div v-if="assignedQuestions.length" class="questions-list">
            <v-list density="compact" class="question-list bg-transparent">
              <v-list-item
                v-for="question in assignedQuestions"
                :key="question.id"
                class="question-list-item"
              >
                <template #prepend>
                  <v-icon size="16" color="var(--sg-accent)">mdi-file-question-outline</v-icon>
                </template>

                <v-list-item-title class="text-body-2 text-wrap">
                  {{ question.title || question.text }}
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </div>

          <p v-else class="text-body-2 text-medium-emphasis mb-0">
            Für diese Kompetenz sind keine Fragen zugeordnet.
          </p>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
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

const categoryLabels: Record<string, string> = {
  database: 'Datenbanken',
  programming: 'Programmierung'
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

const questionsExpanded = ref(false)

const assignedQuestions = computed(() => {
  const selectedId = props.selectedNode?.data?.id
  if (!selectedId) return []
  return props.questionsWithCompetency(selectedId)
})

const competencyPath = computed<string[]>(() => {
  const selectedCompetency = props.selectedNode?.data as Competency | undefined

  if (!selectedCompetency?.id) {
    return []
  }

  const path: string[] = [selectedCompetency.name]
  let rootCompetency: Competency = selectedCompetency
  let currentParentId = selectedCompetency.parentId

  while (currentParentId) {
    const parent = props.getCompetency(currentParentId)
    if (!parent) break

    path.unshift(parent.name)
    rootCompetency = parent
    currentParentId = parent.parentId ?? undefined
  }

  const category = selectedCompetency.category || rootCompetency?.category
  const categoryLabel = category ? categoryLabels[category] ?? category : undefined

  return categoryLabel ? [categoryLabel, ...path] : path
})

watch(
  () => props.selectedNode?.data?.id,
  () => {
    questionsExpanded.value = false
  }
)

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

.info-stack {
  display: grid;
  gap: 10px;
}

.info-block {
  border: 1px solid var(--sg-border);
  border-radius: 12px;
  padding: 10px 12px;
  background: color-mix(in srgb, var(--sg-surface-muted) 75%, white 25%);
}

.info-block-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: var(--sg-text-secondary);
  margin-bottom: 6px;
}

.info-block-text {
  font-size: 13px;
  line-height: 1.35;
  color: var(--sg-text-secondary);
}

.breadcrumb {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

.breadcrumb-segment {
  color: var(--sg-text-primary);
  font-weight: 500;
  max-width: 100%;
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

.question-panels :deep(.v-expansion-panel) {
  border: 1px solid var(--sg-border);
  background: var(--sg-surface);
}

.question-panel-title {
  min-height: 72px;
}

.question-count-chip {
  min-width: 38px;
}

.question-list {
  padding: 0;
}

.question-list-item {
  border: 1px solid var(--sg-border);
  border-radius: 10px;
  margin-bottom: 8px;
  background: var(--sg-surface-muted);
}

.sub-competency-item {
  border-left: 4px solid transparent;
  background: v-bind('skillGraphPalette.surfaceMuted');
}
</style>
