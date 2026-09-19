<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import type Question from '@/model/Question'
import type { Choice } from '@/model/questionTypes/Choice'
import QuestionType from '@/enums/QuestionType'

const props = defineProps<{
  question: Question
  isNew?: boolean
}>()

const emit = defineEmits<{
  (e: 'update', question: Question): void
}>()

function isChoiceConfiguration(config: any): config is Choice {
  return (
    config &&
    typeof config === 'object' &&
    Array.isArray(config.optionRows) &&
    Array.isArray(config.answerColumns)
  )
}

function createDefaultMatrixConfig(): Choice {
  return {
    multipleRow: false,
    multipleColumn: true,
    answerColumns: [
      { id: 1, name: 'Spalte 1' },
      { id: 2, name: 'Spalte 2' }
    ],
    optionRows: [
      { id: 1, text: '', correctAnswers: [] },
      { id: 2, text: '', correctAnswers: [] }
    ]
  }
}

function normalizeMatrixQuestion(q: Question): Question {
  const copy = JSON.parse(JSON.stringify(q)) as Question
  if (!isChoiceConfiguration(copy.questionConfiguration)) {
    copy.questionConfiguration = createDefaultMatrixConfig()
  } else {
    copy.questionConfiguration.multipleColumn = true
    if (!copy.questionConfiguration.answerColumns || copy.questionConfiguration.answerColumns.length === 0) {
      copy.questionConfiguration.answerColumns = [
        { id: 1, name: 'Spalte 1' },
        { id: 2, name: 'Spalte 2' }
      ]
    }
    if (!copy.questionConfiguration.optionRows || copy.questionConfiguration.optionRows.length === 0) {
      copy.questionConfiguration.optionRows = [{ id: 1, text: '', correctAnswers: [] }]
    }
  }
  return copy
}

const localQuestion = ref<Question>(normalizeMatrixQuestion(props.question))

watch(
  () => props.question,
  (newQuestion) => {
    const normalized = normalizeMatrixQuestion(newQuestion)
    if (JSON.stringify(localQuestion.value) !== JSON.stringify(normalized)) {
      localQuestion.value = normalized
    }
  },
  { deep: true }
)

watch(
  localQuestion,
  (updatedQuestion) => {
    if (isChoiceConfiguration(updatedQuestion.questionConfiguration)) {
      const rowsWithAnswers = updatedQuestion.questionConfiguration.optionRows.filter(
        (row) => row.correctAnswers && row.correctAnswers.length > 0
      )
      updatedQuestion.questionConfiguration.multipleRow = rowsWithAnswers.length > 1
    }
    emit('update', updatedQuestion)
  },
  { deep: true }
)

const addColumn = () => {
  if (isChoiceConfiguration(localQuestion.value.questionConfiguration)) {
    const cols = localQuestion.value.questionConfiguration.answerColumns
    const nextId = cols.length > 0 ? Math.max(...cols.map((c) => c.id)) + 1 : 1
    cols.push({
      id: nextId,
      name: `Spalte ${cols.length + 1}`
    })
  }
}

const deleteColumn = (index: number) => {
  if (isChoiceConfiguration(localQuestion.value.questionConfiguration)) {
    const cols = localQuestion.value.questionConfiguration.answerColumns
    const deleted = cols[index]
    if (deleted) {
      cols.splice(index, 1)
      localQuestion.value.questionConfiguration.optionRows.forEach((row) => {
        row.correctAnswers = row.correctAnswers.filter((id) => id !== deleted.id)
      })
    }
  }
}

const addRow = () => {
  if (isChoiceConfiguration(localQuestion.value.questionConfiguration)) {
    const rows = localQuestion.value.questionConfiguration.optionRows
    const nextId = rows.length > 0 ? Math.max(...rows.map((r) => r.id)) + 1 : 1
    rows.push({
      id: nextId,
      text: '',
      correctAnswers: []
    })
  }
}

const deleteRow = (index: number) => {
  if (isChoiceConfiguration(localQuestion.value.questionConfiguration)) {
    localQuestion.value.questionConfiguration.optionRows.splice(index, 1)
  }
}

const isCorrectAnswer = (rowIndex: number, columnId: number): boolean => {
  if (isChoiceConfiguration(localQuestion.value.questionConfiguration)) {
    const row = localQuestion.value.questionConfiguration.optionRows[rowIndex]
    return row?.correctAnswers?.includes(columnId) ?? false
  }
  return false
}

const toggleCorrectAnswer = (rowIndex: number, columnId: number, isSelected: boolean) => {
  if (isChoiceConfiguration(localQuestion.value.questionConfiguration)) {
    const row = localQuestion.value.questionConfiguration.optionRows[rowIndex]
    if (!row) return
    const index = row.correctAnswers.indexOf(columnId)
    if (isSelected && index === -1) {
      row.correctAnswers.push(columnId)
    } else if (!isSelected && index !== -1) {
      row.correctAnswers.splice(index, 1)
    }
  }
}

onMounted(() => {
  if (
    props.isNew &&
    (!props.question.questionConfiguration || !isChoiceConfiguration(props.question.questionConfiguration))
  ) {
    localQuestion.value = {
      text: props.question.text ?? '',
      competencyIds: props.question.competencyIds ?? [],
      questionType: QuestionType.Choice,
      difficulty: props.question.difficulty ?? 0.5,
      questionConfiguration: createDefaultMatrixConfig()
    } as Question
  }
})
</script>

<template>
  <div class="mt-4">
    <v-alert type="info" variant="tonal" density="comfortable" class="mb-4">
      Definiere die <strong>Spalten</strong> (z. B. Bewertungskriterien) und die <strong>Zeilen</strong> (z. B. Aussagen) der Matrix. Markiere die jeweils zutreffenden Checkboxen.
    </v-alert>

    <!-- 1. Spalten definieren -->
    <div class="d-flex align-center mb-1">
      <v-avatar size="24" color="primary" class="mr-2">
        <span class="text-caption font-weight-bold">1</span>
      </v-avatar>
      <h3 class="text-subtitle-1 font-weight-medium">Spalten definieren</h3>
    </div>
    <p class="text-caption text-medium-emphasis mb-3">
      Die Spaltenüberschriften der Matrix (z. B. „Richtig“ / „Falsch“ oder „Vorteil“ / „Nachteil“).
    </p>

    <div
      v-for="(column, colIndex) in localQuestion.questionConfiguration.answerColumns"
      :key="column.id"
      class="d-flex align-center ga-2 mb-2"
    >
      <v-avatar size="28" color="primary" variant="tonal">
        <span class="text-caption">{{ colIndex + 1 }}</span>
      </v-avatar>
      <v-text-field
        v-model="column.name"
        :label="`Spalte ${colIndex + 1}`"
        density="compact"
        hide-details
        required
      />
      <v-btn
        icon="mdi-delete-outline"
        variant="text"
        density="comfortable"
        color="error"
        :disabled="localQuestion.questionConfiguration.answerColumns.length <= 1"
        @click="deleteColumn(colIndex)"
      >
        <v-icon icon="mdi-delete-outline" />
        <v-tooltip activator="parent" location="top">
          {{
            localQuestion.questionConfiguration.answerColumns.length <= 1
              ? 'Es muss mindestens eine Spalte geben'
              : 'Spalte entfernen'
          }}
        </v-tooltip>
      </v-btn>
    </div>

    <v-btn
      variant="tonal"
      prepend-icon="mdi-plus"
      class="mt-1 mb-6"
      @click="addColumn"
    >
      Spalte hinzufügen
    </v-btn>

    <v-divider class="my-4" />

    <!-- 2. Zeilen und Zuordnungen -->
    <div class="d-flex align-center mb-1">
      <v-avatar size="24" color="primary" class="mr-2">
        <span class="text-caption font-weight-bold">2</span>
      </v-avatar>
      <h3 class="text-subtitle-1 font-weight-medium">Zeilen & Richtige Antworten</h3>
    </div>
    <p class="text-caption text-medium-emphasis mb-3">
      Trage für jede Zeile eine Aussage oder Option ein und markiere die zutreffenden Spalten.
    </p>

    <v-table density="comfortable" class="mb-4">
      <thead>
        <tr>
          <th class="text-left" style="min-width: 250px">Aussage / Zeile</th>
          <th
            v-for="column in localQuestion.questionConfiguration.answerColumns"
            :key="column.id"
            class="text-center"
            style="min-width: 100px"
          >
            {{ column.name || `Spalte` }}
          </th>
          <th class="text-center" style="width: 50px"></th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, rowIndex) in localQuestion.questionConfiguration.optionRows"
          :key="row.id"
        >
          <td class="py-2">
            <v-text-field
              v-model="row.text"
              :label="`Zeile ${rowIndex + 1}`"
              density="compact"
              hide-details
              required
            />
          </td>
          <td
            v-for="column in localQuestion.questionConfiguration.answerColumns"
            :key="column.id"
            class="text-center py-2"
          >
            <div class="d-flex justify-center">
              <v-checkbox
                :model-value="isCorrectAnswer(rowIndex, column.id)"
                color="primary"
                density="compact"
                hide-details
                @update:model-value="(val) => toggleCorrectAnswer(rowIndex, column.id, !!val)"
              >
                <v-tooltip activator="parent" location="top">
                  {{ `Spalte "${column.name || ''}" für Zeile ${rowIndex + 1} als zutreffend markieren` }}
                </v-tooltip>
              </v-checkbox>
            </div>
          </td>
          <td class="text-center py-2">
            <v-btn
              icon="mdi-delete-outline"
              variant="text"
              density="comfortable"
              color="error"
              :disabled="localQuestion.questionConfiguration.optionRows.length <= 1"
              @click="deleteRow(rowIndex)"
            >
              <v-icon icon="mdi-delete-outline" />
              <v-tooltip activator="parent" location="top">
                {{
                  localQuestion.questionConfiguration.optionRows.length <= 1
                    ? 'Es muss mindestens eine Zeile geben'
                    : 'Zeile entfernen'
                }}
              </v-tooltip>
            </v-btn>
          </td>
        </tr>
      </tbody>
    </v-table>

    <v-btn
      variant="tonal"
      prepend-icon="mdi-plus"
      @click="addRow"
    >
      Zeile hinzufügen
    </v-btn>
  </div>
</template>
