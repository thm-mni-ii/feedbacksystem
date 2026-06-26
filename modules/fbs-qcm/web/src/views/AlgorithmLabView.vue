<template>
  <v-container class="pa-6">
    <!-- Startscreen -->

    <div v-if="!store.session" class="text-center">
      <h1 class="mb-4">Kompetenzanalyse</h1>

      <p class="text-medium-emphasis mb-6">
        Beantworte die Fragen möglichst ehrlich. Das System erstellt daraus ein Kompetenzprofil.
      </p>

      <v-btn color="primary" size="large" @click="store.startSession()"> Test starten </v-btn>
    </div>

    <!-- Quiz -->

    <div v-else-if="store.currentQuestion && !store.isComplete">
      <v-row>
        <!-- Frage -->

        <v-col cols="12" md="8">
          <v-card class="pa-6">
            <div class="mb-4">
              <v-chip color="primary" variant="tonal">
                {{ store.currentQuestion.targetCompetency.name }}
              </v-chip>
            </div>

            <h2 class="mb-8">
              {{ store.currentQuestion.question.title || store.currentQuestion.question.text }}
            </h2>

            <p class="mb-4 text-medium-emphasis">Wie gut konntest du diese Frage beantworten?</p>
            <div class="d-flex">
              <v-slider
                v-model="slider1"
                thumb-color="orange"
                :max="1"
                :min="0"
                :step="0.1"
                thumb-label
              ></v-slider>
              <v-btn color="primary" class="ml-4" @click="answer(slider1)">Antwort speichern</v-btn>
            </div>
          </v-card>
        </v-col>

        <!-- Kompetenzprofil -->

        <v-col cols="12" md="4">
          <v-card class="pa-4 profile-card">
            <div class="d-flex align-center justify-space-between mb-3">
              <h3 class="mb-0">Aktuelles Kompetenzprofil</h3>
              <v-chip size="small" color="primary" variant="tonal">Hierarchie</v-chip>
            </div>

            <v-expansion-panels v-model="expandedPanel" variant="accordion" class="profile-panels">
              <v-expansion-panel
                v-for="group in hierarchicalProgress"
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
                      <span
                        class="text-body-2"
                        :class="{ 'font-weight-medium text-primary': item.isCurrent }"
                      >
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
        </v-col>
      </v-row>

      <!-- Feedback -->

      <v-alert v-if="showFeedback" class="mt-4" color="success" variant="tonal">
        Antwort gespeichert
      </v-alert>
    </div>

    <!-- Keine Fragen verfügbar -->
    <div
      v-else-if="store.session && !store.currentQuestion && !store.isComplete"
      class="text-center pa-6"
    >
      <v-card class="pa-6">
        <v-icon size="64" color="warning" class="mb-4">mdi-alert-circle-outline</v-icon>
        <h2 class="mb-4">Keine Fragen verfügbar</h2>
        <p class="text-medium-emphasis mb-6">
          Es sind keine weiteren Fragen für die aktuelle Sitzung vorhanden.
        </p>
        <v-btn color="primary" @click="store.resetSession()"> Neue Analyse starten </v-btn>
      </v-card>
    </div>

    <!-- Ergebnis -->

    <div v-else class="text-center">
      <h1 class="mb-4">Kompetenzprofil erstellt</h1>

      <p class="text-medium-emphasis mb-8">{{ store.historyCount }} Fragen beantwortet</p>

      <v-card class="pa-6 mx-auto" max-width="700">
        <div v-for="item in store.progress" :key="item.competencyId" class="mb-5">
          <div class="d-flex justify-space-between mb-1">
            <span>
              {{ item.label }}
            </span>

            <strong> {{ Math.round(item.score * 100) }}% </strong>
          </div>

          <v-progress-linear :model-value="item.score * 100" rounded height="10" />
        </div>
      </v-card>

      <v-btn class="mt-6" color="primary" @click="store.resetSession()"> Neue Analyse </v-btn>
    </div>
  </v-container>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useQuizSessionStore } from '@/stores/quizSessionStore'

type ProfileItem = {
  competencyId: string
  label: string
  score: number
  timesAssessed: number
  depth: number
  isCurrent: boolean
  isInCurrentPath: boolean
}

type ProfileGroup = {
  root: ProfileItem
  items: ProfileItem[]
  isActive: boolean
}

const store = useQuizSessionStore()

const slider1 = ref(0.5)
const expandedPanel = ref<string | null>(null)

const showFeedback = ref(false)

const hierarchicalProgress = computed<ProfileGroup[]>(() => {
  const competencies = [...store.competencies]
  const progressById = new Map(store.progress.map((item) => [item.competencyId, item]))
  const competencyIds = new Set(competencies.map((c) => c.id))
  const parentById = new Map(competencies.map((c) => [c.id, c.parentId ?? null]))
  const currentCompetencyId = store.currentQuestion?.targetCompetency.id ?? null

  const currentPathIds = new Set<string>()
  let cursor = currentCompetencyId

  while (cursor) {
    currentPathIds.add(cursor)
    cursor = parentById.get(cursor) ?? null
  }

  const childrenByParent = new Map<string, string[]>()

  for (const competency of competencies) {
    if (!competency.parentId || !competencyIds.has(competency.parentId)) {
      continue
    }

    const existing = childrenByParent.get(competency.parentId) ?? []

    existing.push(competency.id)
    childrenByParent.set(competency.parentId, existing)
  }

  const nameById = new Map(competencies.map((c) => [c.id, c.name]))

  const toItem = (competencyId: string, depth: number): ProfileItem => {
    const progress = progressById.get(competencyId)

    return {
      competencyId,
      label: nameById.get(competencyId) ?? competencyId,
      score: progress?.score ?? 0,
      timesAssessed: progress?.timesAssessed ?? 0,
      depth,
      isCurrent: competencyId === currentCompetencyId,
      isInCurrentPath: currentPathIds.has(competencyId)
    }
  }

  const roots = competencies
    .filter((c) => !c.parentId || !competencyIds.has(c.parentId))
    .sort((a, b) => a.name.localeCompare(b.name))

  const collectChildren = (parentId: string, depth: number, acc: ProfileItem[]) => {
    const childIds = (childrenByParent.get(parentId) ?? []).sort((a, b) =>
      (nameById.get(a) ?? '').localeCompare(nameById.get(b) ?? '')
    )

    for (const childId of childIds) {
      acc.push(toItem(childId, depth))
      collectChildren(childId, depth + 1, acc)
    }
  }

  return roots.map((root) => {
    const items: ProfileItem[] = []

    collectChildren(root.id, 1, items)

    return {
      root: toItem(root.id, 0),
      items,
      isActive: currentPathIds.has(root.id)
    }
  })
})

watch(
  hierarchicalProgress,
  (groups) => {
    const activeGroup = groups.find((group) => group.isActive)

    expandedPanel.value = activeGroup?.root.competencyId ?? null
  },
  { immediate: true }
)

function scoreColor(score: number, timesAssessed: number): string {
  if (timesAssessed === 0) return 'grey'
  if (score < 0.35) return 'low'
  if (score < 0.7) return 'medium'

  return 'success'
}

function scoreLabel(score: number, timesAssessed: number): string {
  if (timesAssessed === 0) return 'Nicht bewertet'

  return `${Math.round(score * 100)}%`
}

function answer(score: number) {
  if (!store.currentQuestion) {
    console.warn('Keine aktuelle Frage vorhanden')
    return
  }

  store.submitAnswer(score)

  showFeedback.value = true

  setTimeout(() => {
    showFeedback.value = false
  }, 1000)
}
</script>
<style scoped>
.profile-card {
  background: linear-gradient(
    180deg,
    rgba(var(--v-theme-surface), 1) 0%,
    rgba(248, 250, 252, 1) 100%
  );
}

.profile-panels :deep(.v-expansion-panel) {
  border: 1px solid rgba(15, 23, 42, 0.08);
}

.profile-panels :deep(.profile-panel--active) {
  border-color: rgba(var(--v-theme-primary), 0.35);
  box-shadow: 0 10px 24px rgba(var(--v-theme-primary), 0.12);
  background: linear-gradient(
    180deg,
    rgba(var(--v-theme-primary), 0.05) 0%,
    rgba(255, 255, 255, 0.9) 100%
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
