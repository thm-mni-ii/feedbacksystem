<template>
  <v-card elevation="2" class="summary-card">
    <v-card-text class="pa-6">
      <v-row dense align="center">
        <!-- Overall Progress -->
        <v-col cols="12" sm="6" md="3" class="text-center">
          <div class="stat-box">
            <div class="stat-value">{{ Math.round(results.overallProgress * 100) }}%</div>
            <div class="stat-label">Gesamtfortschritt</div>
            <v-progress-linear
              :value="results.overallProgress * 100"
              height="6"
              color="#43C57C"
              class="mt-2"
            />
          </div>
        </v-col>

        <!-- Mastered Skills -->
        <v-col cols="12" sm="6" md="3" class="text-center">
          <div class="stat-box">
            <div class="stat-value" style="color: #43c57c">{{ masteredCount }}</div>
            <div class="stat-label">Gemeistert</div>
            <div class="stat-subtext">von {{ results.skills.length }}</div>
          </div>
        </v-col>

        <!-- Success Rate -->
        <v-col cols="12" sm="6" md="3" class="text-center">
          <div class="stat-box">
            <div class="stat-value" style="color: #ffa726">{{ successRate }}%</div>
            <div class="stat-label">Erfolgsquote</div>
            <div class="stat-subtext">
              {{ results.correctAnswers }}/{{ results.questionsAnswered }}
            </div>
          </div>
        </v-col>

        <!-- Time Spent -->
        <v-col cols="12" sm="6" md="3" class="text-center">
          <div class="stat-box">
            <div class="stat-value" style="color: #29b6f6">{{ timeDisplay }}</div>
            <div class="stat-label">Zeitaufwand</div>
            <div class="stat-subtext">{{ new Date(results.completedAt).toLocaleString('de') }}</div>
          </div>
        </v-col>
      </v-row>
    </v-card-text>

    <!-- Skill-Verteilung Breakdown -->
    <v-divider />

    <v-card-text class="pa-6">
      <v-row>
        <!-- Skill Status Distribution -->
        <v-col cols="12" md="6">
          <h3 class="text-subtitle-2 font-weight-bold mb-4">Skill-Status</h3>
          <div class="skill-status-chart">
            <div class="status-item">
              <div class="status-circle mastered"></div>
              <div class="status-info">
                <div class="status-label">Gemeistert</div>
                <div class="status-count">{{ masteredCount }} Skills</div>
              </div>
              <div class="status-percentage">{{ masteredPercent }}%</div>
            </div>
            <div class="status-item">
              <div class="status-circle progress"></div>
              <div class="status-info">
                <div class="status-label">In Progress</div>
                <div class="status-count">{{ progressCount }} Skills</div>
              </div>
              <div class="status-percentage">{{ progressPercent }}%</div>
            </div>
            <div class="status-item">
              <div class="status-circle locked"></div>
              <div class="status-info">
                <div class="status-label">Gesperrt</div>
                <div class="status-count">{{ lockedCount }} Skills</div>
              </div>
              <div class="status-percentage">{{ lockedPercent }}%</div>
            </div>
          </div>
        </v-col>

        <!-- Performance Metrics -->
        <v-col cols="12" md="6">
          <h3 class="text-subtitle-2 font-weight-bold mb-4">Statistiken</h3>
          <v-list density="compact" class="bg-transparent">
            <v-list-item>
              <template #prepend>
                <v-icon color="green">mdi-check-circle</v-icon>
              </template>
              <v-list-item-title>Richtige Antworten</v-list-item-title>
              <template #append>
                <div class="font-weight-bold">{{ results.correctAnswers }}</div>
              </template>
            </v-list-item>

            <v-list-item>
              <template #prepend>
                <v-icon color="red">mdi-close-circle</v-icon>
              </template>
              <v-list-item-title>Falsche Antworten</v-list-item-title>
              <template #append>
                <div class="font-weight-bold">{{ results.incorrectAnswers }}</div>
              </template>
            </v-list-item>

            <v-list-item>
              <template #prepend>
                <v-icon color="blue">mdi-help-circle</v-icon>
              </template>
              <v-list-item-title>Insgesamt Fragen</v-list-item-title>
              <template #append>
                <div class="font-weight-bold">{{ results.questionsAnswered }}</div>
              </template>
            </v-list-item>

            <v-list-item>
              <template #prepend>
                <v-icon color="orange">mdi-clock-outline</v-icon>
              </template>
              <v-list-item-title>Durchschnitt/Frage</v-list-item-title>
              <template #append>
                <div class="font-weight-bold">{{ avgTimePerQuestion }}s</div>
              </template>
            </v-list-item>
          </v-list>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SessionResults } from '@/composables/types'

const props = defineProps<{
  results: SessionResults
}>()

// ─── Computed ─────────────────────────────────────────────────────
const masteredCount = computed(() => props.results.skills.filter((s) => s.mastered).length)
const progressCount = computed(
  () => props.results.skills.filter((s) => s.status === 'progress').length
)
const lockedCount = computed(() => props.results.skills.filter((s) => s.status === 'locked').length)

const totalSkills = computed(() => props.results.skills.length)

const masteredPercent = computed(() =>
  totalSkills.value > 0 ? Math.round((masteredCount.value / totalSkills.value) * 100) : 0
)
const progressPercent = computed(() =>
  totalSkills.value > 0 ? Math.round((progressCount.value / totalSkills.value) * 100) : 0
)
const lockedPercent = computed(() =>
  totalSkills.value > 0 ? Math.round((lockedCount.value / totalSkills.value) * 100) : 0
)

const successRate = computed(() =>
  props.results.questionsAnswered > 0
    ? Math.round((props.results.correctAnswers / props.results.questionsAnswered) * 100)
    : 0
)

const timeDisplay = computed(() => {
  const seconds = props.results.totalTimeSeconds
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes}m ${secs}s`
})

const avgTimePerQuestion = computed(() => {
  if (props.results.questionsAnswered === 0) return 0
  return (props.results.totalTimeSeconds / props.results.questionsAnswered).toFixed(1)
})
</script>

<style scoped>
.summary-card {
  background: linear-gradient(135deg, rgba(129, 186, 36, 0.05), rgba(54, 199, 142, 0.05));
  border: 1px solid rgba(129, 186, 36, 0.1);
  transition: all 0.3s ease;
}

.summary-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.stat-box {
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.stat-box:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #43c57c;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.stat-subtext {
  font-size: 12px;
  color: #999;
}

.skill-status-chart {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.status-item:hover {
  background: #e8eff5;
}

.status-circle {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-circle.mastered {
  background: #43c57c;
}

.status-circle.progress {
  background: #ffa726;
}

.status-circle.locked {
  background: #ccc;
}

.status-info {
  flex: 1;
}

.status-label {
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

.status-count {
  font-size: 12px;
  color: #999;
}

.status-percentage {
  font-size: 14px;
  font-weight: 700;
  color: #333;
  min-width: 40px;
  text-align: right;
}
</style>
