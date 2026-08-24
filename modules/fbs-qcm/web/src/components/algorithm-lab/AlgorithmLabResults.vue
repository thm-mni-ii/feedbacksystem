<template>
  <div class="text-center">
    <h1 class="mb-3">Lernsession abgeschlossen</h1>
    <p class="text-medium-emphasis mb-6">
      {{ historyCount }} Fragen beantwortet · {{ summaryText }}
    </p>

    <v-card class="mx-auto mb-4 overview-card" max-width="1100" variant="outlined">
      <div class="overview-grid">
        <div class="overview-metric">
          <div class="overview-label">Ø Kompetenzscore</div>
          <div class="overview-value">{{ Math.round(averageScore * 100) }}%</div>
          <div class="overview-caption">Mittelwert ueber alle beobachteten Kompetenzen</div>
        </div>
        <div class="overview-metric">
          <div class="overview-label">Bearbeitete Kompetenzen</div>
          <div class="overview-value">{{ assessedCompetencyCount }}/{{ progress.length }}</div>
          <div class="overview-caption">Kompetenzen mit mindestens einer Beobachtung</div>
        </div>
        <div class="overview-metric">
          <div class="overview-label">Stärkste Kompetenz</div>
          <div class="overview-name">{{ strongestLabel }}</div>
          <div class="overview-caption">{{ strongestScoreLabel }}</div>
        </div>
        <div class="overview-metric">
          <div class="overview-label">Meiste Evidenz</div>
          <div class="overview-name">{{ strongestEvidenceLabel }}</div>
          <div class="overview-caption">{{ strongestEvidenceCount }}</div>
        </div>
      </div>
    </v-card>

    <v-card class="pa-6 mx-auto result-card radar-card" max-width="1100" variant="outlined">
      <div class="d-flex justify-space-between align-center flex-wrap ga-2 mb-2">
        <h2 class="text-h6">Kompetenz-Radar</h2>
      </div>
      <p class="text-body-2 text-medium-emphasis mb-5">
        Das Radar zeigt bewusst die Form des Kompetenzprofils. Kompetenznamen erscheinen unten nach
        Familien gruppiert und direkt im Diagramm beim Hover.
      </p>

      <v-row class="mb-2">
        <v-col cols="12">
          <AlgorithmLabRadarChart :competencies="competencies" :progress="progress" />
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <div class="text-subtitle-2 font-weight-bold mb-3">Kompetenzfamilien</div>
          <div class="family-grid">
            <v-card
              v-for="family in radarFamilies"
              :key="family.groupLabel"
              class="family-card"
              variant="outlined"
            >
              <div
                class="family-card__accent"
                :style="{ backgroundColor: family.groupColor }"
              ></div>
              <div class="family-card__content">
                <div class="d-flex align-start justify-space-between ga-3 mb-3 flex-wrap">
                  <div>
                    <div class="text-subtitle-2 font-weight-bold">{{ family.groupLabel }}</div>
                    <div class="text-caption text-medium-emphasis">
                      {{ family.items.length }} Kompetenz{{ family.items.length === 1 ? '' : 'en' }}
                    </div>
                  </div>
                  <v-chip size="small" variant="outlined" class="family-score-chip">
                    {{ scoreLabel(family.rootScore, family.rootTimesAssessed) }}
                  </v-chip>
                </div>

                <v-progress-linear
                  :model-value="family.rootScore * 100"
                  color="grey-darken-1"
                  height="8"
                  rounded
                  class="mb-3"
                />

                <div class="family-list">
                  <div
                    v-for="item in family.items"
                    :key="item.competencyId"
                    class="family-list__item"
                  >
                    <div class="d-flex align-center ga-3 min-w-0">
                      <span
                        class="family-list__badge"
                        :style="{ backgroundColor: family.groupColor }"
                      >
                        {{ item.axisIndex }}
                      </span>
                      <span class="family-list__label">{{ item.label }}</span>
                    </div>
                    <span class="family-list__value">{{
                      scoreLabel(item.score, item.timesAssessed)
                    }}</span>
                  </div>
                </div>
              </div>
            </v-card>
          </div>
        </v-col>
      </v-row>
    </v-card>

    <v-card class="pa-6 mx-auto mt-6 feedback-card" max-width="1100" variant="outlined">
      <div class="d-flex align-center justify-space-between flex-wrap ga-2 mb-4">
        <div>
          <h2 class="text-h6 mb-1">Lernhinweise</h2>
          <p class="text-body-2 text-medium-emphasis mb-0">
            Zusammenfassung der wichtigsten Beobachtungen aus dieser Session.
          </p>
        </div>
      </div>

      <div class="feedback-grid">
        <div v-for="section in feedbackSections" :key="section.title" class="feedback-panel">
          <div class="feedback-panel__icon" :class="`feedback-panel__icon--${section.tone}`">
            <v-icon size="18">{{ section.icon }}</v-icon>
          </div>
          <div class="feedback-panel__content">
            <div class="feedback-panel__title">{{ section.title }}</div>
            <div class="feedback-panel__text">{{ section.text }}</div>
          </div>
        </div>
      </div>
    </v-card>

    <v-btn class="mt-6" color="primary" @click="$emit('restart')">Neue Analyse</v-btn>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AlgorithmLabRadarChart from '@/components/algorithm-lab/AlgorithmLabRadarChart.vue'
import { buildProfileGroups, buildRadarItems } from '@/composables/competencyHierarchy'
import type { Competency, ProgressItem } from '@/model/types'

interface Props {
  competencies: Competency[]
  progress: ProgressItem[]
  historyCount: number
}

const props = defineProps<Props>()
defineEmits<{
  (e: 'restart'): void
}>()

const averageScore = computed(() => {
  if (props.progress.length === 0) return 0
  return props.progress.reduce((total, item) => total + item.score, 0) / props.progress.length
})
const assessedCompetencyCount = computed(
  () => props.progress.filter((item) => item.timesAssessed > 0).length
)

const strongest = computed(
  () =>
    [...props.progress].sort((a, b) => b.score - a.score || b.timesAssessed - a.timesAssessed)[0]
)

const strongestEvidence = computed(
  () =>
    [...props.progress].sort(
      (a, b) => b.timesAssessed - a.timesAssessed || b.certainty - a.certainty
    )[0]
)

const weakest = computed(
  () =>
    [...props.progress].sort((a, b) => a.score - b.score || b.timesAssessed - a.timesAssessed)[0]
)

const summaryText = computed(() => {
  if (props.progress.length === 0) return 'Keine Kompetenzen vorhanden'
  return `Ø Kompetenzscore ${Math.round(averageScore.value * 100)}%`
})

const strongestLabel = computed(() => strongest.value?.label ?? '—')
const strongestEvidenceLabel = computed(() => strongestEvidence.value?.label ?? '—')
const strongestScoreLabel = computed(() =>
  strongest.value ? scoreLabel(strongest.value.score, strongest.value.timesAssessed) : '—'
)
const strongestEvidenceCount = computed(() =>
  strongestEvidence.value ? `${strongestEvidence.value.timesAssessed} Beobachtungen` : '—'
)
const groups = computed(() => buildProfileGroups(props.competencies, props.progress))
const radarItems = computed(() => buildRadarItems(props.competencies, props.progress))
const radarFamilies = computed(() =>
  groups.value.map((group) => ({
    groupLabel: group.root.label,
    groupColor:
      radarItems.value.find((item) => item.groupLabel === group.root.label)?.groupColor ??
      '#2563EB',
    rootScore: group.root.score,
    rootTimesAssessed: group.root.timesAssessed,
    items: radarItems.value.filter((item) => item.groupLabel === group.root.label)
  }))
)

const feedbackSections = computed(() => {
  const lowEvidence = props.progress.filter((item) => item.timesAssessed < 2)
  const uncertain = props.progress
    .filter((item) => item.uncertainty > 0.45)
    .sort((a, b) => b.uncertainty - a.uncertainty)
    .slice(0, 2)

  return [
    {
      title: 'Stärke',
      tone: 'success',
      icon: 'mdi-trending-up',
      text: strongest.value
        ? `${strongest.value.label} ist aktuell am stärksten ausgeprägt (${Math.round(strongest.value.score * 100)}%).`
        : 'Noch keine ausgeprägte Stärke erkennbar.'
    },
    {
      title: 'Naechster Fokus',
      tone: 'warning',
      icon: 'mdi-target',
      text: weakest.value
        ? `${weakest.value.label} ist momentan der beste Ansatzpunkt für weiteres Ueben (${Math.round(weakest.value.score * 100)}%).`
        : 'Aktuell ist kein klarer Fokusbereich vorhanden.'
    },
    {
      title: 'Evidenzlage',
      tone: 'info',
      icon: 'mdi-chart-timeline-variant',
      text:
        lowEvidence.length > 0
          ? `Wenig Beobachtungen gibt es noch bei ${lowEvidence.map((item) => item.label).join(', ')}.`
          : 'Für alle Kompetenzen liegt bereits brauchbare Evidenz vor.'
    },
    {
      title: 'Unsicherheit',
      tone: 'neutral',
      icon: 'mdi-radar',
      text:
        uncertain.length > 0
          ? `Noch instabil eingeschätzt sind vor allem ${uncertain.map((item) => item.label).join(', ')}.`
          : 'Die aktuellen Schätzungen wirken insgesamt stabil.'
    }
  ]
})

function scoreLabel(score: number, timesAssessed: number): string {
  if (timesAssessed === 0) return 'Nicht bewertet'
  return `${Math.round(score * 100)}%`
}
</script>

<style scoped>
.overview-card {
  border-color: rgba(var(--v-theme-on-surface), 0.08);
  background: linear-gradient(
    180deg,
    rgba(var(--v-theme-surface), 1) 0%,
    rgba(var(--v-theme-primary), 0.025) 100%
  );
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.overview-metric {
  padding: 22px 24px;
  text-align: left;
}

.overview-metric:not(:last-child) {
  border-right: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.overview-label {
  margin-bottom: 10px;
  color: rgba(var(--v-theme-on-surface), 0.55);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.overview-value {
  color: rgb(var(--v-theme-on-surface));
  font-size: 32px;
  font-weight: 800;
  line-height: 1.1;
}

.overview-name {
  color: rgb(var(--v-theme-on-surface));
  font-size: 18px;
  font-weight: 700;
  line-height: 1.3;
}

.overview-caption {
  margin-top: 8px;
  color: rgba(var(--v-theme-on-surface), 0.62);
  font-size: 13px;
  line-height: 1.4;
}

.result-card {
  text-align: left;
}

.radar-card {
  border-color: rgba(var(--v-theme-on-surface), 0.08);
  background: linear-gradient(
    180deg,
    rgba(var(--v-theme-surface), 1) 0%,
    rgba(var(--v-theme-primary), 0.02) 100%
  );
}

.family-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
}

.family-card {
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  border-color: rgba(var(--v-theme-on-surface), 0.08);
  background: linear-gradient(
    180deg,
    rgba(var(--v-theme-surface), 1) 0%,
    rgba(var(--v-theme-primary), 0.02) 100%
  );
}

.family-card__accent {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 5px;
}

.family-card__content {
  padding: 16px 18px 18px 20px;
}

.family-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.family-list__item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
  padding: 8px 10px;
  border-radius: 10px;
  background: rgba(var(--v-theme-on-surface), 0.03);
}

.family-list__label {
  min-width: 0;
  font-size: 14px;
  line-height: 1.3;
}

.family-list__badge {
  display: inline-flex;
  width: 24px;
  height: 24px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  color: white;
  font-size: 11px;
  font-weight: 800;
}

.family-list__value {
  font-size: 13px;
  font-weight: 700;
  color: rgba(var(--v-theme-on-surface), 0.72);
}

.family-score-chip {
  color: rgba(var(--v-theme-on-surface), 0.72);
  border-color: rgba(var(--v-theme-on-surface), 0.16);
  background: rgba(var(--v-theme-on-surface), 0.02);
}

.feedback-card {
  border-color: rgba(var(--v-theme-on-surface), 0.08);
  background: linear-gradient(
    180deg,
    rgba(var(--v-theme-surface), 1) 0%,
    rgba(var(--v-theme-primary), 0.02) 100%
  );
  text-align: left;
}

.feedback-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.feedback-panel {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 14px;
  align-items: start;
  padding: 16px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.07);
  border-radius: 16px;
  background: rgba(var(--v-theme-surface), 0.85);
}

.feedback-panel__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 12px;
}

.feedback-panel__icon--success {
  color: #2f855a;
  background: rgba(47, 133, 90, 0.12);
}

.feedback-panel__icon--warning {
  color: #b7791f;
  background: rgba(183, 121, 31, 0.12);
}

.feedback-panel__icon--info {
  color: #2b6cb0;
  background: rgba(43, 108, 176, 0.12);
}

.feedback-panel__icon--neutral {
  color: #5a67d8;
  background: rgba(90, 103, 216, 0.12);
}

.feedback-panel__title {
  margin-bottom: 4px;
  color: rgb(var(--v-theme-on-surface));
  font-size: 15px;
  font-weight: 700;
}

.feedback-panel__text {
  color: rgba(var(--v-theme-on-surface), 0.68);
  font-size: 14px;
  line-height: 1.5;
}

@media (max-width: 960px) {
  .overview-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .overview-metric:nth-child(2) {
    border-right: none;
  }

  .overview-metric:nth-child(-n + 2) {
    border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  }

  .feedback-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .overview-grid {
    grid-template-columns: 1fr;
  }

  .overview-metric:not(:last-child) {
    border-right: none;
    border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  }
}
</style>
