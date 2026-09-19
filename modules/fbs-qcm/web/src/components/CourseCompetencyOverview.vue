<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  buildProfileGroups,
  type ProfileGroup,
  type ProfileItem
} from '@/composables/competencyHierarchy'
import type { Competency, ProgressItem } from '@/model/types'

const props = defineProps<{
  competencies: Competency[]
  progress: ProgressItem[]
  hasSession: boolean
  encounteredQuestions: number
}>()

const expandedGroups = ref<string[]>([])
const activeFilter = ref<'all' | 'needs-practice' | 'unassessed' | 'secure'>('all')

const filterItems = [
  { title: 'Alle', value: 'all' },
  { title: 'Lernbedarf', value: 'needs-practice' },
  { title: 'Nicht bewertet', value: 'unassessed' },
  { title: 'Sicher', value: 'secure' }
]

const groups = computed(() => buildProfileGroups(props.competencies, props.progress))

const assessedProgress = computed(() => props.progress.filter((item) => item.timesAssessed > 0))

const averageScore = computed(() => {
  if (assessedProgress.value.length === 0) return 0
  return Math.round(
    (assessedProgress.value.reduce((total, item) => total + item.score, 0) /
      assessedProgress.value.length) *
      100
  )
})

const strongest = computed(() => {
  return [...assessedProgress.value].sort(
    (a, b) => b.score - a.score || b.timesAssessed - a.timesAssessed
  )[0]
})

const focus = computed(() => {
  return [...assessedProgress.value].sort(
    (a, b) => a.score - b.score || b.uncertainty - a.uncertainty
  )[0]
})

const groupSummaries = computed(() =>
  groups.value
    .map((group) => {
      const items = groupItems(group)
      const visibleItems = group.items.filter((item) => matchesFilter(item))
      return {
        ...group,
        score: groupScore(group),
        assessedCount: items.filter((item) => item.timesAssessed > 0).length,
        visibleItems,
        hasVisibleItems: activeFilter.value === 'all' || items.some((item) => matchesFilter(item))
      }
    })
    .filter((group) => group.hasVisibleItems)
)

function groupItems(group: ProfileGroup): ProfileItem[] {
  return [group.root, ...group.items]
}

function groupScore(group: ProfileGroup): number {
  const items = groupItems(group).filter((item) => item.timesAssessed > 0)
  if (items.length === 0) return 0
  return Math.round((items.reduce((total, item) => total + item.score, 0) / items.length) * 100)
}

function matchesFilter(item: ProfileItem): boolean {
  if (activeFilter.value === 'unassessed') return item.timesAssessed === 0
  if (activeFilter.value === 'secure') return item.timesAssessed > 0 && item.score >= 0.75
  if (activeFilter.value === 'needs-practice') {
    return item.timesAssessed > 0 && item.score < 0.75
  }
  return true
}

function scoreLabel(item: Pick<ProfileItem, 'score' | 'timesAssessed'>): string {
  return item.timesAssessed > 0 ? `${Math.round(item.score * 100)} %` : 'Nicht bewertet'
}

function statusLabel(item: ProfileItem): string {
  if (item.timesAssessed === 0) return 'Noch offen'
  if (item.score >= 0.75) return 'Sicher'
  if (item.score >= 0.5) return 'In Arbeit'
  return 'Übungsbedarf'
}

function statusColor(item: ProfileItem): string {
  if (item.timesAssessed === 0) return 'grey'
  if (item.score >= 0.75) return 'success'
  if (item.score >= 0.5) return 'warning'
  return 'error'
}
</script>

<template>
  <section aria-labelledby="learning-status-title">
    <div class="d-flex align-center justify-space-between flex-wrap ga-2 mb-4">
      <div>
        <h2 id="learning-status-title" class="text-h5 font-weight-bold">Dein Lernstand</h2>
        <p class="text-body-2 text-medium-emphasis mb-0">
          Eine Übersicht über den zuletzt ermittelten Kenntnisstand.
        </p>
      </div>
      <v-chip v-if="hasSession" variant="tonal" color="primary">
        {{ assessedProgress.length }} von {{ competencies.length }} bewertet
      </v-chip>
    </div>

    <v-card v-if="!hasSession" variant="tonal" color="primary" class="mb-8">
      <v-card-item prepend-icon="mdi-chart-box-outline">
        <v-card-text class="text-body-2">
          Noch kein Lernstand vorhanden. Starte eine Lernsitzung, um deinen Fortschritt zu sehen.
        </v-card-text>
      </v-card-item>
    </v-card>

    <template v-else>
      <v-card variant="outlined" class="course-surface learning-summary mb-8">
        <v-card-text class="pa-5">
          <div class="summary-layout">
            <div class="summary-primary">
              <div class="text-overline text-medium-emphasis">Geschätzter Kenntnisstand</div>
              <div class="summary-primary__value">{{ averageScore }} %</div>
              <div class="text-caption text-medium-emphasis">
                Durchschnitt aus bewerteten Kompetenzen
              </div>
            </div>
            <div class="summary-stats">
              <div class="summary-stat">
                <div class="text-overline text-medium-emphasis">Stärkste Kompetenz</div>
                <div class="text-subtitle-1 font-weight-bold text-truncate">
                  {{ strongest?.label ?? 'Noch keine Daten' }}
                </div>
                <div class="text-caption text-medium-emphasis">
                  {{ strongest ? scoreLabel(strongest) : '—' }}
                </div>
              </div>
              <div class="summary-stat">
                <div class="text-overline text-medium-emphasis">Nächster Lernfokus</div>
                <div class="text-subtitle-1 font-weight-bold text-truncate">
                  {{ focus?.label ?? 'Noch keine Daten' }}
                </div>
                <div class="text-caption text-medium-emphasis">
                  {{ focus ? scoreLabel(focus) : '—' }}
                </div>
              </div>
              <div class="summary-stat">
                <div class="text-overline text-medium-emphasis">Begegnete Fragen</div>
                <div class="text-h5 font-weight-bold text-primary">{{ encounteredQuestions }}</div>
                <div class="text-caption text-medium-emphasis">über alle Lernsitzungen</div>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <div class="d-flex align-end justify-space-between flex-wrap ga-4 mb-4">
        <div>
          <h2 id="learning-status-title" class="text-h5 font-weight-bold">Kompetenzübersicht</h2>
          <p class="text-body-2 text-medium-emphasis mb-0">
            Öffne einen Bereich, um die einzelnen Kompetenzen zu sehen.
          </p>
        </div>
        <v-btn-toggle v-model="activeFilter" mandatory color="primary" variant="outlined" divided>
          <v-btn
            v-for="filter in filterItems"
            :key="filter.value"
            :value="filter.value"
            size="small"
          >
            {{ filter.title }}
          </v-btn>
        </v-btn-toggle>
      </div>

      <v-expansion-panels v-model="expandedGroups" multiple variant="accordion">
        <v-expansion-panel
          v-for="group in groupSummaries"
          :key="group.root.competencyId"
          :value="group.root.competencyId"
          class="course-surface mb-3"
        >
          <v-expansion-panel-title>
            <div class="group-header w-100">
              <div class="d-flex align-center justify-space-between ga-4">
                <div class="min-w-0">
                  <div class="text-subtitle-1 font-weight-bold text-truncate">
                    {{ group.root.label }}
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    {{ group.items.length }} Unterkompetenz{{
                      group.items.length === 1 ? '' : 'en'
                    }}
                    · {{ group.assessedCount }} bewertet
                  </div>
                </div>
                <div class="group-score text-no-wrap mr-4">
                  {{ group.assessedCount ? `${group.score} %` : 'Noch nicht bewertet' }}
                </div>
              </div>
              <v-progress-linear
                :model-value="group.score"
                :color="group.assessedCount ? 'primary' : 'grey'"
                height="6"
                rounded
                class="mt-3 mr-4"
              />
            </div>
          </v-expansion-panel-title>

          <v-expansion-panel-text>
            <div
              v-for="item in group.visibleItems"
              :key="item.competencyId"
              class="competency-row"
              :style="{ paddingLeft: `${Math.max(0, item.depth - 1) * 18}px` }"
            >
              <div class="d-flex align-center justify-space-between ga-3 mb-1">
                <span class="text-body-2 text-truncate">{{ item.label }}</span>
                <span class="text-body-2 font-weight-medium text-no-wrap">
                  {{ scoreLabel(item) }}
                </span>
              </div>
              <div class="d-flex align-center ga-3">
                <v-progress-linear
                  :model-value="item.score * 100"
                  :color="statusColor(item)"
                  height="5"
                  rounded
                  class="flex-grow-1"
                />
                <span class="text-caption text-medium-emphasis competency-status">
                  {{ statusLabel(item) }}
                </span>
              </div>
            </div>
            <p v-if="group.visibleItems.length === 0" class="text-body-2 text-medium-emphasis mb-0">
              Keine Kompetenzen entsprechen diesem Filter.
            </p>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
      <v-alert v-if="groupSummaries.length === 0" type="info" variant="tonal" class="mt-4">
        Keine Kompetenzen entsprechen diesem Filter.
      </v-alert>
    </template>
  </section>
</template>

<style scoped>
.learning-summary {
  border-color: rgb(var(--v-theme-app-border));
}

.course-surface {
  background: rgb(var(--v-theme-surface));
  border-color: rgb(var(--v-theme-app-border));
}

.summary-layout {
  display: grid;
  grid-template-columns: minmax(220px, 0.85fr) minmax(0, 2.15fr);
  gap: 0;
}

.summary-primary {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  padding: 4px 28px 4px 4px;
  border-right: 1px solid rgb(var(--v-theme-app-border));
}

.summary-primary__value {
  color: rgb(var(--v-theme-primary));
  font-size: 2.25rem;
  font-weight: 700;
  line-height: 1.15;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  min-width: 0;
}

.summary-stat {
  min-width: 0;
  padding: 4px 20px;
}

.summary-stat + .summary-stat {
  border-left: 1px solid rgb(var(--v-theme-app-border));
}

.group-header {
  min-width: 0;
}

.group-score {
  font-weight: 700;
  color: rgb(var(--v-theme-primary));
}

.competency-row {
  padding-top: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgb(var(--v-theme-app-border));
}

.competency-row:last-child {
  border-bottom: 0;
}

.competency-status {
  width: 88px;
  text-align: right;
}

@media (max-width: 700px) {
  .summary-layout {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .summary-primary {
    padding: 0 0 16px;
    border-right: 0;
    border-bottom: 1px solid rgb(var(--v-theme-app-border));
  }

  .summary-stat {
    padding: 0 12px;
  }

  .summary-stat:first-child {
    padding-left: 0;
  }
}

@media (max-width: 450px) {
  .summary-stats {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .summary-stat,
  .summary-stat:first-child {
    padding: 0;
  }

  .summary-stat + .summary-stat {
    padding-top: 16px;
    border-top: 1px solid rgb(var(--v-theme-app-border));
    border-left: 0;
  }
}
</style>
