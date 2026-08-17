<template>
  <v-card class="qmatrix-panel" variant="outlined" density="compact">
    <v-card-title class="d-flex flex-wrap align-center ga-2 py-2 px-4">
      <span>{{ title }}</span>
      <v-chip size="small" color="primary" variant="tonal"> {{ questions.length }} Items </v-chip>
      <v-chip size="small" color="secondary" variant="tonal">
        {{ competencies.length }} Competencies
      </v-chip>
      <v-chip size="small" color="info" variant="tonal">
        {{ multiAttributeCount }} Multi-Attribute
      </v-chip>
    </v-card-title>

    <v-card-subtitle class="py-0 px-4 pb-2">
      Scroll horizontally to inspect all competencies. Dark cells show linked attributes.
    </v-card-subtitle>

    <v-card-text class="py-2 px-4">
      <div class="matrix-status mb-2">
        <v-chip v-if="validation.errors.length > 0" size="small" color="error" variant="tonal">
          {{ validation.errors.length }} error(s)
        </v-chip>
        <v-chip v-else size="small" color="success" variant="tonal"> Q-matrix ready </v-chip>

        <span v-if="validation.warnings.length > 0" class="status-note">
          {{ validation.warnings.length }} note(s) hidden to keep the matrix readable.
        </span>
      </div>

      <v-table fixed-header :height="tableMaxHeight" density="compact" class="qmatrix-table">
        <thead>
          <tr>
            <th class="row-label-col">Item</th>
            <th
              v-for="competency in competencies"
              :key="competency.id"
              class="competency-col text-center"
              :title="competency.name"
            >
              {{ competency.name }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(question, rowIndex) in questions" :key="question.id">
            <td class="row-label-col item-title" :title="question.text">
              {{ questionLabel(question) }}
            </td>
            <td
              v-for="(competency, colIndex) in competencies"
              :key="`${question.id}-${competency.id}`"
              class="cell text-center"
              :class="{ active: matrix.values[rowIndex]?.[colIndex] > 0 }"
            >
              <span v-if="matrix.values[rowIndex]?.[colIndex] > 0" class="cell-marker"></span>
              <span v-else class="cell-empty"></span>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Competency, Question } from '@/model/types'
import { buildQMatrix, getQuestionCompetencyIds, validateQMatrix } from '@/composables/qMatrix'

interface Props {
  competencies: Competency[]
  questions: Question[]
  title?: string
  tableMaxHeight?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Q-Matrix',
  tableMaxHeight: '220px'
})

const matrix = computed(() => buildQMatrix(props.questions, props.competencies))
const validation = computed(() => validateQMatrix(props.questions, props.competencies))
const multiAttributeCount = computed(
  () => props.questions.filter((q) => getQuestionCompetencyIds(q).length > 1).length
)

function shortQuestionLabel(value: string): string {
  return value.length > 56 ? `${value.slice(0, 56)}...` : value
}

function questionLabel(question: Question): string {
  return shortQuestionLabel(question.title?.trim() || question.text.trim())
}
</script>

<style scoped>
.qmatrix-panel {
  width: 100%;
}

.qmatrix-table {
  width: max-content;
  min-width: 100%;
}

.row-label-col {
  position: sticky;
  left: 0;
  z-index: 1;
  background: rgb(var(--v-theme-surface));
  min-width: 220px;
  max-width: 260px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Ecke oben links muss über allem liegen */
thead .row-label-col {
  z-index: 3;
}

.competency-col {
  min-width: 120px;
  white-space: nowrap;
}

.item-title {
  font-weight: 600;
}

.cell.active {
  background: rgba(var(--v-theme-primary), 0.08);
}

.cell-marker {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 999px;
  background: rgb(var(--v-theme-primary));
}

.cell-empty {
  display: inline-block;
  width: 12px;
  height: 12px;
}

.matrix-status {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.status-note {
  font-size: 0.75rem;
  color: rgb(var(--v-theme-on-surface-variant));
}
</style>
