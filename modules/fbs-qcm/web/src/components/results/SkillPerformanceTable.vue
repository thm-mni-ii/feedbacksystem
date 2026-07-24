<template>
  <v-card elevation="1" class="performance-table">
    <v-card-title class="pa-4">Performance Übersicht</v-card-title>
    <v-divider />
    <v-card-text class="pa-0">
      <v-table density="compact" class="performance-table-inner">
        <thead>
          <tr>
            <th>Skill</th>
            <th>Mastery</th>
            <th>Erfolg</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="skill in sortedSkills"
            :key="skill.skillId"
            class="skill-row"
            :class="{ active: selected === skill.skillId }"
            @click="$emit('select', skill)"
          >
            <td class="skill-name">
              <div class="skill-name-inner">
                <div :class="`status-dot ${skill.status}`"></div>
                <span>{{ skill.label }}</span>
              </div>
            </td>
            <td class="skill-mastery">
              <div class="progress-bar-small">
                <div
                  class="progress-fill"
                  :style="{ width: `${skill.pLearned * 100}%` }"
                  :class="`fill-${skill.status}`"
                ></div>
              </div>
              <span class="mastery-text">{{ Math.round(skill.pLearned * 100) }}%</span>
            </td>
            <td class="skill-success">
              <span
                class="success-badge"
                :class="{
                  'success-high': skill.successRate >= 0.8,
                  'success-medium': skill.successRate < 0.8 && skill.successRate >= 0.5,
                  'success-low': skill.successRate < 0.5
                }"
              >
                {{ Math.round(skill.successRate * 100) }}%
              </span>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SkillVisualization } from '@/composables/types'

const props = defineProps<{
  skills: SkillVisualization[]
  selected?: string
}>()

defineEmits<{
  select: [skill: SkillVisualization]
}>()

const sortedSkills = computed(() =>
  // Sortiere: Gemeistert → In Progress → Gesperrt
  props.skills.slice().sort((a, b) => {
    const statusOrder = { mastered: 0, progress: 1, locked: 2 }
    return (
      statusOrder[a.status as keyof typeof statusOrder] -
      statusOrder[b.status as keyof typeof statusOrder]
    )
  })
)
</script>

<style scoped>
.performance-table {
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.performance-table-inner {
  background: white;
}

.performance-table-inner thead {
  background: linear-gradient(135deg, #f5f7fa, #e8eff5);
  border-bottom: 2px solid #e0e0e0;
}

.performance-table-inner th {
  font-weight: 700;
  color: #333;
  font-size: 12px;
  padding: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.skill-row {
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid #f0f0f0;
}

.skill-row:hover {
  background: #f9f9f9;
}

.skill-row.active {
  background: #eff6ff;
}

.skill-name {
  padding: 12px;
  font-weight: 500;
  color: #333;
}

.skill-name-inner {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-dot.mastered {
  background: #2563eb;
}

.status-dot.progress {
  background: #ffa726;
}

.status-dot.locked {
  background: #bdbdbd;
}

.skill-mastery {
  padding: 12px;
}

.progress-bar-small {
  height: 4px;
  background: #e0e0e0;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 4px;
}

.progress-fill {
  height: 100%;
  transition: width 0.3s ease;
  border-radius: 2px;
}

.fill-mastered {
  background: #2563eb;
}

.fill-progress {
  background: #ffa726;
}

.fill-locked {
  background: #bdbdbd;
}

.mastery-text {
  font-size: 11px;
  font-weight: 600;
  color: #666;
}

.skill-success {
  padding: 12px;
  text-align: center;
}

.success-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.success-high {
  background: #dbeafe;
  color: #1d4ed8;
}

.success-medium {
  background: #ffe0b2;
  color: #e65100;
}

.success-low {
  background: #ffcdd2;
  color: #b71c1c;
}
</style>
