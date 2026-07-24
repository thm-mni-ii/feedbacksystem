<template>
  <v-card elevation="1" rounded="lg">
    <v-card-title class="d-flex align-center pa-4">
      <div :class="`status-indicator ${skill.status}`"></div>
      <span class="ml-3">{{ skill.label }}</span>
      <v-spacer />
      <v-chip
        :color="skill.mastered ? 'success' : skill.unlocked ? 'warning' : 'default'"
        text-color="white"
        size="small"
      >
        {{
          skill.status === 'mastered'
            ? '✅ Gemeistert'
            : skill.status === 'progress'
              ? '🔄 In Progress'
              : '🔒 Gesperrt'
        }}
      </v-chip>
    </v-card-title>

    <v-divider />

    <v-card-text class="pa-6">
      <v-row dense class="mb-6">
        <!-- Mastery Level -->
        <v-col cols="12" md="6">
          <div class="detail-stat">
            <div class="detail-label">Mastery Level (P(L))</div>
            <div class="detail-value">{{ Math.round(skill.pLearned * 100) }}%</div>
            <v-progress-linear
              :value="skill.pLearned * 100"
              height="8"
              rounded
              :color="skill.mastered ? 'success' : skill.unlocked ? 'warning' : 'default'"
              class="mt-2"
            />
            <div class="detail-subtext">
              Schwellenwert: 75% | Status:
              {{ skill.pLearned >= 0.75 ? '✅ Erreicht' : '❌ Nicht erreicht' }}
            </div>
          </div>
        </v-col>

        <!-- Success Rate -->
        <v-col cols="12" md="6">
          <div class="detail-stat">
            <div class="detail-label">Erfolgsquote</div>
            <div class="detail-value">{{ Math.round(skill.successRate * 100) }}%</div>
            <v-progress-linear
              :value="skill.successRate * 100"
              height="8"
              rounded
              :color="
                skill.successRate >= 0.8
                  ? 'success'
                  : skill.successRate >= 0.5
                    ? 'warning'
                    : 'error'
              "
              class="mt-2"
            />
            <div class="detail-subtext">{{ skill.timesAsked }} Fragen gestellt</div>
          </div>
        </v-col>

        <!-- Durchschn. Schwierigkeit -->
        <v-col cols="12" md="6">
          <div class="detail-stat">
            <div class="detail-label">Durchschn. Schwierigkeit</div>
            <div class="detail-value">{{ skill.avgDifficulty.toFixed(2) }}</div>
            <div class="difficulty-scale">
              <div
                class="difficulty-marker"
                :style="{ left: `${skill.avgDifficulty * 100}%` }"
              ></div>
              <div class="difficulty-label">Leicht</div>
              <div class="difficulty-label">Schwer</div>
            </div>
          </div>
        </v-col>

        <!-- Durchschn. Zeit -->
        <v-col cols="12" md="6">
          <div class="detail-stat">
            <div class="detail-label">Ø Zeit pro Frage</div>
            <div class="detail-value">{{ skill.avgTimePerQuestion.toFixed(0) }}ms</div>
          </div>
        </v-col>
      </v-row>

      <!-- Prerequisites & Unlocks -->
      <v-row dense class="mb-4">
        <v-col cols="12" md="6">
          <div class="relations">
            <div class="relations-label">📋 Voraussetzungen</div>
            <div v-if="skill.prerequisites.length === 0" class="no-data">Keine</div>
            <div v-else class="relations-list">
              <v-chip
                v-for="prereqId in skill.prerequisites"
                :key="prereqId"
                size="small"
                variant="outlined"
                color="primary"
                class="mb-1 mr-1"
              >
                {{ getSkillLabel(prereqId) }}
              </v-chip>
            </div>
          </div>
        </v-col>

        <v-col cols="12" md="6">
          <div class="relations">
            <div class="relations-label">🔓 Freischaltet</div>
            <div v-if="skill.unlocks.length === 0" class="no-data">Keine</div>
            <div v-else class="relations-list">
              <v-chip
                v-for="unlockId in skill.unlocks"
                :key="unlockId"
                size="small"
                variant="outlined"
                color="success"
                class="mb-1 mr-1"
              >
                {{ getSkillLabel(unlockId) }}
              </v-chip>
            </div>
          </div>
        </v-col>
      </v-row>

      <!-- Antwort-Timeline -->
      <v-divider class="my-4" />

      <div class="answer-timeline">
        <div class="timeline-label">📝 Antwort-Verlauf</div>
        <div class="timeline">
          <div v-for="(answer, index) in answers" :key="index" class="timeline-item">
            <div :class="`timeline-marker ${answer.wasCorrect ? 'correct' : 'incorrect'}`">
              {{ answer.wasCorrect ? '✓' : '✗' }}
            </div>
            <div class="timeline-content">
              <div class="timeline-question">{{ answer.questionText }}</div>
              <div class="timeline-meta">
                {{ answer.timeSeconds }}s | Difficulty: {{ (answer.difficulty * 100).toFixed(0) }}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import type { SkillVisualization, AnswerVisualization } from '@/composables/types'

defineProps<{
  skill: SkillVisualization
  answers: AnswerVisualization[]
}>()

function getSkillLabel(skillId: string): string {
  // Placeholder - würde vom Parent übergeben
  return skillId
}
</script>

<style scoped>
.status-indicator {
  width: 16px;
  height: 16px;
  border-radius: 50%;
}

.status-indicator.mastered {
  background: #2563eb;
  box-shadow: 0 0 8px rgba(37, 99, 235, 0.4);
}

.status-indicator.progress {
  background: #ffa726;
  box-shadow: 0 0 8px rgba(255, 167, 38, 0.4);
}

.status-indicator.locked {
  background: #bdbdbd;
}

.detail-stat {
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
}

.detail-label {
  font-size: 12px;
  font-weight: 600;
  color: #999;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.detail-value {
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin-bottom: 8px;
}

.detail-subtext {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.difficulty-scale {
  position: relative;
  height: 20px;
  background: linear-gradient(90deg, #2563eb, #ffc107, #f44336);
  border-radius: 4px;
  margin-top: 8px;
}

.difficulty-marker {
  position: absolute;
  top: -4px;
  width: 16px;
  height: 28px;
  background: #333;
  border-radius: 2px;
  transform: translateX(-50%);
}

.difficulty-label {
  position: absolute;
  bottom: -20px;
  font-size: 10px;
  color: #999;
  font-weight: 600;
}

.difficulty-label:first-of-type {
  left: 0;
}

.difficulty-label:last-of-type {
  right: 0;
}

.relations {
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
}

.relations-label {
  font-size: 12px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.relations-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.no-data {
  font-size: 12px;
  color: #999;
  font-style: italic;
}

.answer-timeline {
  margin-top: 12px;
}

.timeline-label {
  font-size: 12px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.timeline-item {
  display: flex;
  gap: 12px;
  padding: 8px;
  background: #f9f9f9;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.timeline-item:hover {
  background: #f0f0f0;
}

.timeline-marker {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
}

.timeline-marker.correct {
  background: #2563eb;
}

.timeline-marker.incorrect {
  background: #f44336;
}

.timeline-content {
  flex: 1;
}

.timeline-question {
  font-size: 13px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.timeline-meta {
  font-size: 11px;
  color: #999;
}
</style>
