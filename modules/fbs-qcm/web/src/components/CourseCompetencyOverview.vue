<script setup lang="ts">
import { computed, ref, watch } from 'vue'
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
type CompetencyFilter = 'all' | 'needs-practice' | 'high-estimate'
const activeFilter = ref<CompetencyFilter>('all')

const groups = computed(() => buildProfileGroups(props.competencies, props.progress))

const assessedProgress = computed(() => props.progress.filter((item) => item.timesAssessed > 0))

const filterItems = computed(
  (): Array<{ title: string; value: CompetencyFilter; count: number }> => [
    {
      title: 'Alle',
      value: 'all',
      count: props.competencies.length
    },
    {
      title: 'Übungsbedarf',
      value: 'needs-practice',
      count: props.progress.filter((item) => item.timesAssessed === 0 || item.score < 0.75).length
    },
    {
      title: 'Fortgeschritten',
      value: 'high-estimate',
      count: props.progress.filter((item) => item.timesAssessed > 0 && item.score >= 0.75).length
    }
  ]
)

const averageScore = computed(() => {
  if (assessedProgress.value.length === 0) return 0
  return Math.round(
    (assessedProgress.value.reduce((total, item) => total + item.score, 0) /
      assessedProgress.value.length) *
      100
  )
})

const groupSummaries = computed(() =>
  groups.value
    .map((group) => {
      const items = groupItems(group)
      const matchingItems = items.filter((item) => matchesFilter(item))
      const assessedMatchingItems = matchingItems.filter((item) => item.timesAssessed > 0)
      const visibleItems = group.items.filter((item) => matchesFilter(item))
      const filterLabel =
        activeFilter.value === 'needs-practice'
          ? 'mit Übungsbedarf'
          : activeFilter.value === 'high-estimate'
            ? 'fortgeschritten'
            : 'Kompetenzen'
      return {
        ...group,
        score: groupScore(assessedMatchingItems),
        assessedCount: assessedMatchingItems.length,
        matchingCount: matchingItems.length,
        filterLabel,
        visibleItems,
        hasVisibleItems: activeFilter.value === 'all' || matchingItems.length > 0
      }
    })
    .filter((group) => group.hasVisibleItems)
)

watch(activeFilter, (filter) => {
  expandedGroups.value =
    filter === 'all' ? [] : groupSummaries.value.map((group) => group.root.competencyId)
})

function groupItems(group: ProfileGroup): ProfileItem[] {
  return [group.root, ...group.items]
}

function groupScore(items: ProfileItem[]): number {
  if (items.length === 0) return 0
  return Math.round((items.reduce((total, item) => total + item.score, 0) / items.length) * 100)
}

function matchesFilter(item: ProfileItem): boolean {
  if (activeFilter.value === 'high-estimate') return item.timesAssessed > 0 && item.score >= 0.75
  if (activeFilter.value === 'needs-practice') {
    return item.timesAssessed === 0 || item.score < 0.75
  }
  return true
}

function scoreLabel(item: Pick<ProfileItem, 'score' | 'timesAssessed'>): string {
  return item.timesAssessed > 0 ? `${Math.round(item.score * 100)} %` : 'Noch nicht geübt'
}

function statusLabel(item: ProfileItem): string {
  if (item.timesAssessed === 0) return 'Noch nicht geübt'
  if (item.score >= 0.75) return 'Fortgeschritten'
  if (item.score >= 0.5) return 'Übungsbedarf'
  return 'Hoher Übungsbedarf'
}

function statusColor(item: ProfileItem): string {
  if (item.timesAssessed === 0) return 'grey'
  if (item.score >= 0.75) return 'success'
  if (item.score >= 0.5) return 'warning'
  return 'error'
}

const filterDescription = computed(() => {
  if (activeFilter.value === 'needs-practice') {
    return 'Enthält noch nicht geübte Kompetenzen und Kompetenzen mit einem geschätzten Lernstand unter 75 %.'
  }
  if (activeFilter.value === 'high-estimate') {
    return 'Kompetenzen mit einem geschätzten Lernstand ab 75 %. Der Wert basiert auf bisherigen Antworten und ist kein gesicherter Nachweis der Beherrschung.'
  }
  return 'Alle Kompetenzen dieses Kurses – mit ihrem bisherigen Lernstand.'
})
</script>

<template>
  <section aria-labelledby="learning-status-title">
    <div class="d-flex align-center justify-space-between flex-wrap ga-2 mb-4">
      <div>
        <h2 id="learning-status-title" class="text-h5 font-weight-bold">Dein Lernstand</h2>
        <p class="text-body-2 text-medium-emphasis mb-0">
          Eine Übersicht der algorithmischen Einschätzung auf Basis deiner bisherigen Antworten.
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
        <v-card-text class="pa-0">
          <v-row no-gutters>
            <v-col cols="12" sm="4" class="text-center text-sm-start pa-5">
              <div class="text-overline text-medium-emphasis">Durchschnittlicher Lernstand</div>
              <div class="text-h4 font-weight-bold text-primary">{{ averageScore }} %</div>
              <div class="text-caption text-medium-emphasis">
                Geschätzter Mittelwert der geübten Kompetenzen
              </div>
            </v-col>
            <v-divider vertical class="d-none d-sm-flex" />
            <v-divider class="d-sm-none" />
            <v-col cols="12" sm="4" class="text-center text-sm-start pa-5">
              <div class="text-overline text-medium-emphasis">Bearbeitete Kompetenzen</div>
              <div class="text-h4 font-weight-bold text-primary">
                {{ assessedProgress.length }} / {{ competencies.length }}
              </div>
              <div class="text-caption text-medium-emphasis">bereits mindestens einmal geübt</div>
            </v-col>
            <v-divider vertical class="d-none d-sm-flex" />
            <v-divider class="d-sm-none" />
            <v-col cols="12" sm="4" class="text-center text-sm-start pa-5">
              <div class="text-overline text-medium-emphasis">Begegnete Aufgaben</div>
              <div class="text-h4 font-weight-bold text-primary">{{ encounteredQuestions }}</div>
              <div class="text-caption text-medium-emphasis">über alle Lernsitzungen</div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <div class="mb-4">
        <div>
          <h2 id="learning-status-title" class="text-h5 font-weight-bold">Kompetenzübersicht</h2>
          <p class="text-body-2 text-medium-emphasis mb-0">
            Öffne einen Bereich, um die einzelnen Kompetenzen zu sehen.
          </p>
        </div>
      </div>

      <div class="mb-2">
        <v-btn-toggle
          v-model="activeFilter"
          mandatory
          color="primary"
          variant="outlined"
          divided
          class="competency-filter-toggle"
          role="group"
          aria-label="Kompetenzen filtern"
        >
          <v-btn v-for="filter in filterItems" :key="filter.value" :value="filter.value" size="small">
            {{ filter.title }} ({{ filter.count }})
          </v-btn>
        </v-btn-toggle>
      </div>
      <p class="text-body-2 text-medium-emphasis mb-4">
        {{ filterDescription }}
      </p>

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
                    {{ group.matchingCount }}
                    {{ group.filterLabel }}
                    <template v-if="group.assessedCount">
                      · {{ group.assessedCount }} geübt
                    </template>
                  </div>
                </div>
                <div class="group-score text-no-wrap mr-4">
                  {{
                    group.assessedCount
                      ? `${group.score} %`
                      : group.matchingCount
                        ? 'Noch nicht geübt'
                        : '—'
                  }}
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
            <p
              v-if="
                group.visibleItems.length === 0 &&
                !(activeFilter !== 'all' && matchesFilter(group.root))
              "
              class="text-body-2 text-medium-emphasis mb-0"
            >
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

.competency-filter-toggle {
  max-width: 100%;
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

@media (max-width: 600px) {
  .competency-filter-toggle {
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }

  .competency-filter-toggle :deep(.v-btn) {
    flex: 0 0 auto;
    width: 100%;
    min-height: 44px;
  }
}
</style>
