<template>
  <div
    v-if="
      selectedNode?.type?.startsWith('competency-root') ||
      selectedNode?.type?.startsWith('competency-sub')
    "
    class="competency-panel"
  >
    <v-card class="profile-card" elevation="0" rounded="lg" :style="panelStyles">
      <v-card-text class="pa-4">
        <div class="d-flex align-start justify-space-between ga-3 mb-4 flex-wrap">
          <div>
            <p class="mb-1 text-caption text-medium-emphasis">Kompetenzdetails</p>
            <h3 class="text-h6 mb-0">{{ selectedCompetency?.name }}</h3>
          </div>
          <v-chip size="small" variant="flat" class="summary-chip">
            {{ selectedPrerequisites.length }} Voraussetzungen
          </v-chip>
        </div>

        <v-row class="mb-4">
          <v-col cols="12" md="6">
            <div class="overview-tile">
              <div class="info-block-label">
                <v-icon size="16" color="var(--sg-accent)">mdi-map-marker-path</v-icon>
                <span>Pfad</span>
              </div>
              <div class="breadcrumb text-body-2">
                <template v-for="(segment, index) in competencyPath" :key="`${segment}-${index}`">
                  <span class="breadcrumb-segment text-truncate">{{ segment }}</span>
                  <v-icon
                    v-if="index < competencyPath.length - 1"
                    size="18"
                    color="var(--sg-accent)"
                  >
                    mdi-chevron-right
                  </v-icon>
                </template>
              </div>
            </div>
          </v-col>

          <v-col cols="6" md="3">
            <div class="overview-tile">
              <div class="text-caption text-medium-emphasis mb-1">Unterkompetenzen</div>
              <div class="text-h6">{{ selectedHierarchy.length }}</div>
            </div>
          </v-col>

          <v-col cols="6" md="3">
            <div class="overview-tile">
              <div class="text-caption text-medium-emphasis mb-1">Fragen</div>
              <div class="text-h6">{{ assignedQuestions.length }}</div>
            </div>
          </v-col>
        </v-row>

        <v-tabs v-model="activeSection" color="primary" density="comfortable" class="mb-4">
          <v-tab value="overview">Überblick</v-tab>
          <v-tab value="prerequisites">Voraussetzungen</v-tab>
          <v-tab value="questions">Fragen</v-tab>
        </v-tabs>

        <v-window v-model="activeSection">
          <v-window-item value="overview">
            <div class="info-stack">
              <div class="info-block">
                <div class="info-block-label">
                  <v-icon size="16" color="var(--sg-accent)">mdi-text-box-outline</v-icon>
                  <span>Beschreibung</span>
                </div>
                <p v-if="selectedCompetency?.description" class="info-block-text mb-0">
                  {{ selectedCompetency.description }}
                </p>
                <p v-else class="info-block-text text-medium-emphasis mb-0">
                  Keine Beschreibung vorhanden.
                </p>
              </div>

              <div class="info-block">
                <div class="d-flex align-center justify-space-between mb-2">
                  <div class="info-block-label mb-0">
                    <v-icon size="16" color="var(--sg-accent)">mdi-source-branch</v-icon>
                    <span>Unterkompetenzen</span>
                  </div>
                  <v-chip size="x-small" variant="tonal" color="primary">
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
              </div>
            </div>
          </v-window-item>

          <v-window-item value="prerequisites">
            <div class="d-flex align-center justify-space-between mb-2">
              <p class="mb-0 text-body-2 font-weight-bold">Fachliche Voraussetzungen</p>
              <v-btn
                size="small"
                variant="tonal"
                color="primary"
                :prepend-icon="
                  isEditingPrerequisites ? 'mdi-content-save-outline' : 'mdi-pencil-outline'
                "
                :loading="isSavingPrerequisites"
                :disabled="isEditingPrerequisites && !canSavePrerequisites"
                @click="isEditingPrerequisites ? savePrerequisites() : startEditingPrerequisites()"
              >
                {{ isEditingPrerequisites ? 'Speichern' : 'Bearbeiten' }}
              </v-btn>
            </div>

            <v-alert
              variant="tonal"
              color="info"
              density="comfortable"
              class="mb-3 prerequisite-hint"
            >
              Hier definierst du nur fachlich begründete Abhängigkeiten. Die Taxonomie über
              <code>parentId</code> bleibt davon getrennt. Gespeichert wird lokal im späteren
              Backend-Format <code>prerequisites: [{ competencyId, minimumMastery }]</code>.
            </v-alert>

            <div v-if="isEditingPrerequisites" class="prerequisite-editor">
              <div
                v-for="(prerequisite, index) in prerequisiteDrafts"
                :key="`prerequisite-${index}`"
                class="prerequisite-editor-row"
              >
                <v-row dense>
                  <v-col cols="12" md="7">
                    <v-autocomplete
                      v-model="prerequisite.competencyId"
                      label="Vorausgesetzte Kompetenz"
                      density="comfortable"
                      variant="outlined"
                      :items="prerequisiteOptions(index)"
                      item-title="name"
                      item-value="id"
                      clearable
                    />
                  </v-col>
                  <v-col cols="9" md="4">
                    <v-text-field
                      :model-value="prerequisite.minimumMasteryPercent"
                      label="Mindestbeherrschung (%)"
                      type="number"
                      min="0"
                      max="100"
                      step="5"
                      density="comfortable"
                      variant="outlined"
                      @update:model-value="updateDraftMastery(index, $event)"
                    />
                  </v-col>
                  <v-col cols="3" md="1" class="d-flex align-center justify-end">
                    <v-btn
                      icon="mdi-delete-outline"
                      variant="text"
                      color="error"
                      @click="removePrerequisiteDraft(index)"
                    />
                  </v-col>
                </v-row>
              </div>

              <div class="d-flex flex-wrap ga-2">
                <v-btn
                  variant="text"
                  color="primary"
                  prepend-icon="mdi-plus"
                  :disabled="!canAddPrerequisite"
                  @click="addPrerequisiteDraft"
                >
                  Voraussetzung hinzufügen
                </v-btn>
                <v-btn variant="text" color="secondary" @click="cancelPrerequisiteEditing">
                  Abbrechen
                </v-btn>
              </div>

              <p v-if="!canSavePrerequisites" class="text-caption text-error mb-0 mt-2">
                Bitte wähle für jede Zeile eine Kompetenz und einen Wert zwischen 0% und 100%.
              </p>
            </div>

            <div v-else>
              <div v-if="selectedPrerequisites.length" class="d-flex flex-column ga-2">
                <div
                  v-for="prerequisite in selectedPrerequisites"
                  :key="prerequisite.competencyId"
                  class="prerequisite-item"
                >
                  <div class="d-flex align-center justify-space-between ga-3 flex-wrap">
                    <div>
                      <div class="text-body-2 font-weight-medium">{{ prerequisite.label }}</div>
                      <div class="text-caption text-medium-emphasis">
                        Muss mindestens {{ prerequisite.minimumMasteryLabel }} erreicht haben
                      </div>
                    </div>
                    <v-chip size="small" color="primary" variant="tonal">
                      {{ prerequisite.minimumMasteryLabel }}
                    </v-chip>
                  </div>
                </div>
              </div>
              <p v-else class="text-body-2 text-medium-emphasis mb-0">
                Für diese Kompetenz sind aktuell keine fachlichen Voraussetzungen definiert.
              </p>
            </div>
          </v-window-item>

          <v-window-item value="questions">
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
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Competency, CompetencyPrerequisite, Question } from '@/model/types'
import { skillGraphPalette } from '@/plugins/vuetify'

interface Props {
  selectedNode: any
  getCompetency: (id: string) => Competency | undefined
  getCompetencyColor: (comp?: Competency) => string
  childCompetencies: (parentId: string) => Competency[]
  getAvailablePrerequisites: (competencyId: string) => Competency[]
  questionsWithCompetency: (compId: string) => Question[]
  saveCompetencyPrerequisites: (
    competencyId: string,
    prerequisites: CompetencyPrerequisite[]
  ) => Promise<void>
}

const props = defineProps<Props>()

interface HierarchyItem {
  competency: Competency
  depth: number
}

interface EditablePrerequisite {
  competencyId: string | null
  minimumMasteryPercent: number
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

const activeSection = ref('overview')
const isEditingPrerequisites = ref(false)
const isSavingPrerequisites = ref(false)
const prerequisiteDrafts = ref<EditablePrerequisite[]>([])

const selectedCompetency = computed(() => props.selectedNode?.data as Competency | undefined)

const assignedQuestions = computed(() => {
  const selectedId = selectedCompetency.value?.id
  if (!selectedId) return []
  return props.questionsWithCompetency(selectedId)
})

const selectedPrerequisites = computed(() => {
  const prerequisites = selectedCompetency.value?.prerequisites ?? []

  return prerequisites.map((prerequisite) => ({
    ...prerequisite,
    label: props.getCompetency(prerequisite.competencyId)?.name ?? prerequisite.competencyId,
    minimumMasteryLabel: formatMasteryLabel(prerequisite.minimumMastery)
  }))
})

const competencyPath = computed<string[]>(() => {
  const competency = selectedCompetency.value

  if (!competency?.id) {
    return []
  }

  const path: string[] = [competency.name]
  let rootCompetency: Competency = competency
  let currentParentId = competency.parentId

  while (currentParentId) {
    const parent = props.getCompetency(currentParentId)
    if (!parent) break

    path.unshift(parent.name)
    rootCompetency = parent
    currentParentId = parent.parentId ?? undefined
  }

  const category = competency.category || rootCompetency.category
  const categoryLabel = category ? categoryLabels[category] ?? category : undefined

  return categoryLabel ? [categoryLabel, ...path] : path
})

watch(
  () => props.selectedNode?.data?.id,
  () => {
    activeSection.value = 'overview'
    cancelPrerequisiteEditing()
  }
)

const availablePrerequisiteOptions = computed(() => {
  const competencyId = selectedCompetency.value?.id
  return competencyId ? props.getAvailablePrerequisites(competencyId) : []
})

const selectedHierarchy = computed<HierarchyItem[]>(() => {
  const selectedId = selectedCompetency.value?.id

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

const canAddPrerequisite = computed(() => {
  const usedIds = new Set(
    prerequisiteDrafts.value
      .map((prerequisite) => prerequisite.competencyId)
      .filter((competencyId): competencyId is string => !!competencyId)
  )

  return availablePrerequisiteOptions.value.some((competency) => !usedIds.has(competency.id))
})

const canSavePrerequisites = computed(() =>
  prerequisiteDrafts.value.every(
    (prerequisite) =>
      !!prerequisite.competencyId &&
      prerequisite.minimumMasteryPercent >= 0 &&
      prerequisite.minimumMasteryPercent <= 100
  )
)

function formatMasteryLabel(mastery: number): string {
  return `${Math.round(mastery * 100)}%`
}

function toPrerequisiteDrafts(
  prerequisites: CompetencyPrerequisite[] = []
): EditablePrerequisite[] {
  return prerequisites.map((prerequisite) => ({
    competencyId: prerequisite.competencyId,
    minimumMasteryPercent: Math.round(prerequisite.minimumMastery * 100)
  }))
}

function startEditingPrerequisites() {
  prerequisiteDrafts.value = toPrerequisiteDrafts(selectedCompetency.value?.prerequisites ?? [])
  activeSection.value = 'prerequisites'
  isEditingPrerequisites.value = true
}

function cancelPrerequisiteEditing() {
  prerequisiteDrafts.value = toPrerequisiteDrafts(selectedCompetency.value?.prerequisites ?? [])
  isEditingPrerequisites.value = false
  isSavingPrerequisites.value = false
}

function addPrerequisiteDraft() {
  prerequisiteDrafts.value = [
    ...prerequisiteDrafts.value,
    {
      competencyId: null,
      minimumMasteryPercent: 60
    }
  ]
}

function removePrerequisiteDraft(index: number) {
  prerequisiteDrafts.value = prerequisiteDrafts.value.filter(
    (_, draftIndex) => draftIndex !== index
  )
}

function updateDraftMastery(index: number, value: unknown) {
  const numericValue = Number(value)
  const safeValue = Number.isFinite(numericValue) ? Math.min(100, Math.max(0, numericValue)) : 0

  prerequisiteDrafts.value[index].minimumMasteryPercent = safeValue
}

function prerequisiteOptions(index: number): Competency[] {
  const currentCompetencyId = prerequisiteDrafts.value[index]?.competencyId
  const selectedInOtherRows = new Set(
    prerequisiteDrafts.value
      .filter((_, draftIndex) => draftIndex !== index)
      .map((prerequisite) => prerequisite.competencyId)
      .filter((competencyId): competencyId is string => !!competencyId)
  )

  const options = availablePrerequisiteOptions.value.filter(
    (competency) => competency.id === currentCompetencyId || !selectedInOtherRows.has(competency.id)
  )

  if (currentCompetencyId) {
    const currentCompetency = props.getCompetency(currentCompetencyId)
    if (
      currentCompetency &&
      !options.some((competency) => competency.id === currentCompetency.id)
    ) {
      return [currentCompetency, ...options]
    }
  }

  return options
}

async function savePrerequisites() {
  if (!selectedCompetency.value?.id) {
    return
  }

  isSavingPrerequisites.value = true

  try {
    await props.saveCompetencyPrerequisites(
      selectedCompetency.value.id,
      prerequisiteDrafts.value.flatMap((prerequisite) =>
        prerequisite.competencyId
          ? [
              {
                competencyId: prerequisite.competencyId,
                minimumMastery: prerequisite.minimumMasteryPercent / 100
              }
            ]
          : []
      )
    )
    isEditingPrerequisites.value = false
  } finally {
    isSavingPrerequisites.value = false
    prerequisiteDrafts.value = toPrerequisiteDrafts(selectedCompetency.value?.prerequisites ?? [])
  }
}
</script>

<style scoped>
.profile-card {
  background: linear-gradient(180deg, var(--sg-surface) 0%, var(--sg-surface-muted) 100%);
  border: 1px solid var(--sg-border);
  box-shadow: 0 8px 22px var(--sg-shadow);
}

.summary-chip {
  color: var(--sg-surface);
  background: var(--sg-accent);
}

.overview-tile {
  height: 100%;
  border: 1px solid var(--sg-border);
  border-radius: 14px;
  padding: 12px;
  background: color-mix(in srgb, var(--sg-surface-muted) 72%, white 28%);
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

.prerequisite-hint :deep(code) {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}

.prerequisite-editor {
  display: grid;
  gap: 10px;
}

.prerequisite-editor-row,
.prerequisite-item {
  border: 1px solid var(--sg-border);
  border-radius: 12px;
  padding: 12px;
  background: color-mix(in srgb, var(--sg-surface-muted) 82%, white 18%);
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

.question-list {
  padding: 0;
}

.question-list-item {
  border: 1px solid var(--sg-border);
  border-radius: 10px;
  margin-bottom: 8px;
  background: var(--sg-surface-muted);
}
</style>
