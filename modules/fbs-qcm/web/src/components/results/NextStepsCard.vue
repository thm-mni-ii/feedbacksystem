<template>
  <v-card elevation="1" rounded="lg" class="next-steps-card">
    <v-card-title class="pa-4">🚀 Nächste Schritte</v-card-title>
    <v-divider />

    <v-card-text class="pa-6">
      <v-row dense>
        <!-- Recommendation -->
        <v-col cols="12" md="8">
          <div class="recommendation">
            <h3 class="text-subtitle-1 font-weight-bold mb-3">Empfohlene Aktion</h3>
            <v-alert type="info" variant="tonal" class="mb-4">
              <template #title>
                {{ getRecommendation().title }}
              </template>
              {{ getRecommendation().description }}
            </v-alert>

            <!-- Next Skills to Unlock -->
            <div v-if="unlockedSkills.length > 0" class="mb-4">
              <h4 class="text-body-2 font-weight-bold mb-2">📌 Neu freigeschaltete Skills:</h4>
              <div class="skills-list">
                <v-chip
                  v-for="skill in unlockedSkills"
                  :key="skill.skillId"
                  color="success"
                  text-color="white"
                  size="small"
                  prepend-icon="mdi-lock-open"
                  class="mb-1 mr-1"
                >
                  {{ skill.label }}
                </v-chip>
              </div>
            </div>

            <!-- Skills needing practice -->
            <div v-if="needsPracticeSkills.length > 0">
              <h4 class="text-body-2 font-weight-bold mb-2">📚 Bedarf Übung:</h4>
              <div class="skills-list">
                <v-chip
                  v-for="skill in needsPracticeSkills"
                  :key="skill.skillId"
                  color="warning"
                  text-color="white"
                  size="small"
                  prepend-icon="mdi-alert-circle"
                  class="mb-1 mr-1"
                >
                  {{ skill.label }} ({{ Math.round(skill.pLearned * 100) }}%)
                </v-chip>
              </div>
            </div>
          </div>
        </v-col>

        <!-- Actions -->
        <v-col cols="12" md="4">
          <div class="actions">
            <h3 class="text-subtitle-1 font-weight-bold mb-3">Aktionen</h3>

            <v-btn
              block
              color="primary"
              prepend-icon="mdi-reload"
              class="mb-2"
              @click="$emit('retry')"
            >
              Nochmal Üben
            </v-btn>

            <v-btn block color="success" prepend-icon="mdi-plus" class="mb-2" variant="tonal">
              Neuen Kurs Starten
            </v-btn>

            <v-btn
              block
              color="secondary"
              prepend-icon="mdi-download"
              variant="tonal"
              @click="$emit('export')"
            >
              Exportieren
            </v-btn>

            <!-- Stats Card -->
            <v-card class="mt-4" elevation="0" style="background: #f5f7fa">
              <v-card-text class="pa-3">
                <div class="stat-mini">
                  <div class="stat-label">Gesamtzeit</div>
                  <div class="stat-value">{{ totalTime }}</div>
                </div>
                <v-divider class="my-2" />
                <div class="stat-mini">
                  <div class="stat-label">Erfolgsrate</div>
                  <div class="stat-value">{{ successRate }}%</div>
                </div>
                <v-divider class="my-2" />
                <div class="stat-mini">
                  <div class="stat-label">Fragen</div>
                  <div class="stat-value">{{ totalQuestions }}</div>
                </div>
              </v-card-text>
            </v-card>
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SkillVisualization } from '@/composables/types'

const props = defineProps<{
  skills: SkillVisualization[]
}>()

defineEmits<{
  retry: []
  export: []
}>()

// ─── Computed ─────────────────────────────────────────────────────
const masteredSkills = computed(() => props.skills.filter((s) => s.mastered))
const unlockedSkills = computed(() =>
  props.skills.filter((s) => s.unlocked && !s.mastered && s.pLearned < 0.2)
)
const needsPracticeSkills = computed(() =>
  props.skills.filter((s) => s.unlocked && !s.mastered && s.pLearned >= 0.2 && s.pLearned < 0.75)
)

const successRate = computed(() => {
  if (props.skills.length === 0) return 0
  const avgSuccess = props.skills.reduce((sum, s) => sum + s.successRate, 0) / props.skills.length
  return Math.round(avgSuccess * 100)
})

const totalQuestions = computed(() => props.skills.reduce((sum, s) => sum + s.timesAsked, 0))

const totalTime = computed(() => {
  const totalMs = props.skills.reduce((sum, s) => sum + s.avgTimePerQuestion * s.timesAsked, 0)
  const totalSeconds = Math.floor(totalMs / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}m ${seconds}s`
})

// ─── Methods ──────────────────────────────────────────────────────
function getRecommendation() {
  const masteredCount = masteredSkills.value.length
  const totalCount = props.skills.length

  if (masteredCount === totalCount) {
    return {
      title: '🎉 Herzlichen Glückwunsch!',
      description:
        'Du hast alle Skills gemeistert! Überlege dir einen neuen Kurs oder vertiefen dein Wissen mit fortgeschrittenen Themen.'
    }
  }

  if (needsPracticeSkills.value.length > 0) {
    return {
      title: `🎯 Weiter so! (${masteredCount}/${totalCount} Gemeistert)`,
      description: `Konzentriere dich auf die ${needsPracticeSkills.value.length} Skills, die noch Übung brauchen. Du machst gute Fortschritte!`
    }
  }

  return {
    title: '🚀 Guter Start!',
    description: `Du hast die ersten Steps gemeistert! Versuche jetzt die ${unlockedSkills.value.length} neu freigeschalteten Skills zu erkunden.`
  }
}
</script>

<style scoped>
.next-steps-card {
  background: linear-gradient(135deg, rgba(129, 186, 36, 0.03), rgba(54, 199, 142, 0.03));
  border: 1px solid rgba(129, 186, 36, 0.1);
}

.recommendation {
  padding: 4px;
}

.skills-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stat-mini {
  text-align: center;
  padding: 4px;
}

.stat-label {
  font-size: 11px;
  font-weight: 600;
  color: #999;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #43c57c;
}
</style>
