<template>
  <v-dialog v-model="isOpen" class="w-75">
    <v-card class="ma-4">
      <div>
        <v-card-title class="d-flex justify-space-between align-center">
          <span class="text-h5 font-weight-medium text-primary"> Bestehende Aufgabe verknüpfen </span>
          <v-btn icon variant="text" @click="_cancel">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-subtitle class="text-wrap mb-4">
          Wähle eine oder mehrere Aufgaben aus dem Aufgabenpool, die zusätzlich der Kompetenz "{{
            competencyName
          }}" zugeordnet werden sollen.
        </v-card-subtitle>
      </div>

      <v-divider />
      <v-card-text class="pa-0">
        <v-data-table
          v-model="questionIdsToLink"
          :headers="headers"
          :items="linkableQuestions"
          :search="search"
          item-value="id"
          show-select
          density="comfortable"
          items-per-page="10"
        >
          <template #top>
            <v-text-field
              v-model="search"
              prepend-inner-icon="mdi-magnify"
              label="Aufgabe suchen"
              placeholder="Titel oder Text der Aufgabe…"
              variant="outlined"
              density="comfortable"
              single-line
              hide-details
              clearable
              class="pa-4 pb-2"
            />
          </template>
          <!-- eslint-disable-next-line vue/valid-v-slot -->
          <template #item.questionType="{ value }">
            <v-chip
              size="small"
              variant="tonal"
              :prepend-icon="questionTypeMeta[value as QuestionType]?.icon"
            >
              {{ questionTypeMeta[value as QuestionType]?.label ?? 'Unbekannt' }}
            </v-chip>
          </template>
          <template #no-data>
            <span class="text-medium-emphasis">
              Alle Aufgaben sind dieser Kompetenz bereits zugeordnet.
            </span>
          </template>
        </v-data-table>
      </v-card-text>
      <v-divider />
      <v-card-actions class="pa-4">
        <span class="text-caption text-medium-emphasis">
          {{ questionIdsToLink.length }} ausgewählt
        </span>
        <v-spacer />
        <v-btn variant="text" @click="_cancel">Abbrechen</v-btn>
        <v-btn
          color="primary"
          variant="flat"
          :disabled="questionIdsToLink.length === 0"
          @click="_confirm"
        >
          Verknüpfen
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Competency, Question } from '@/model/types'
import type QuestionType from '@/enums/QuestionType'
import { questionTypeMeta } from '@/composables/questionTypeMeta'

const isOpen = ref(false)
const search = ref('')
const questionIdsToLink = ref<string[]>([])
const competencyName = ref('')
const allQuestions = ref<Question[]>([])
const excludedCompetencyId = ref<string>()

const resolvePromise: any = ref(undefined)

const headers = [
  { title: 'Aufgabentyp', key: 'questionType', width: 180 },
  { title: 'Aufgabe', key: 'text' }
]

/**
 * Aufgaben aus dem gesamten Pool, die der übergebenen Kompetenz noch NICHT
 * zugeordnet sind - vermeidet, dass Dozent:innen eine Aufgabe duplizieren,
 * die inhaltlich bereits existiert.
 */
const linkableQuestions = computed(() => {
  const competencyId = excludedCompetencyId.value
  if (!competencyId) return []
  return allQuestions.value.filter((question) => !question.competencyIds.includes(competencyId))
})

/**
 * @param competency Kompetenz, der bestehende Aufgaben zugeordnet werden sollen.
 * @param questions Gesamter Aufgabenpool, aus dem ausgewählt werden kann.
 * @returns Promise, das mit den ausgewählten Aufgaben-IDs (string[]) auflöst,
 * oder mit `false`, wenn der Dialog abgebrochen wurde.
 */
const openDialog = (competency: Competency, questions: Question[]) => {
  competencyName.value = competency.name
  excludedCompetencyId.value = competency.id
  allQuestions.value = questions
  search.value = ''
  questionIdsToLink.value = []
  isOpen.value = true

  return new Promise((resolve) => {
    resolvePromise.value = resolve
  })
}

const _confirm = () => {
  isOpen.value = false
  resolvePromise.value && resolvePromise.value(questionIdsToLink.value)
}

const _cancel = () => {
  isOpen.value = false
  resolvePromise.value && resolvePromise.value(false)
}

defineExpose({
  openDialog
})
</script>
