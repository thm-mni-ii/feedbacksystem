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
  return config && typeof config === 'object' && Array.isArray(config.optionRows)
}

function createDefaultChoiceConfig(): Choice {
  return {
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [{ id: 1, name: '' }],
    optionRows: [
      { id: 1, text: '', correctAnswers: [] },
      { id: 2, text: '', correctAnswers: [] }
    ]
  }
}

function normalizeChoiceQuestion(q: Question): Question {
  const copy = JSON.parse(JSON.stringify(q)) as Question
  if (!isChoiceConfiguration(copy.questionConfiguration)) {
    copy.questionConfiguration = createDefaultChoiceConfig()
  } else {
    copy.questionConfiguration.multipleColumn = false
    if (!copy.questionConfiguration.answerColumns || copy.questionConfiguration.answerColumns.length === 0) {
      copy.questionConfiguration.answerColumns = [{ id: 1, name: '' }]
    }
    if (!copy.questionConfiguration.optionRows || copy.questionConfiguration.optionRows.length === 0) {
      copy.questionConfiguration.optionRows = [{ id: 1, text: '', correctAnswers: [] }]
    }
  }
  return copy
}

const localQuestion = ref<Question>(normalizeChoiceQuestion(props.question))

watch(
  () => props.question,
  (newQuestion) => {
    const normalized = normalizeChoiceQuestion(newQuestion)
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

const addOptionRow = () => {
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

const deleteOption = (index: number) => {
  if (isChoiceConfiguration(localQuestion.value.questionConfiguration)) {
    localQuestion.value.questionConfiguration.optionRows.splice(index, 1)
  }
}

const isCorrectAnswer = (optionIndex: number) => {
  if (isChoiceConfiguration(localQuestion.value.questionConfiguration)) {
    const row = localQuestion.value.questionConfiguration.optionRows[optionIndex]
    const columnId = localQuestion.value.questionConfiguration.answerColumns[0]?.id ?? 1
    return row?.correctAnswers?.includes(columnId) ?? false
  }
  return false
}

const toggleCorrectAnswer = (optionIndex: number, isSelected: boolean) => {
  if (isChoiceConfiguration(localQuestion.value.questionConfiguration)) {
    const row = localQuestion.value.questionConfiguration.optionRows[optionIndex]
    if (!row) return
    const columnId = localQuestion.value.questionConfiguration.answerColumns[0]?.id ?? 1
    if (isSelected) {
      if (!row.correctAnswers.includes(columnId)) {
        row.correctAnswers.push(columnId)
      }
    } else {
      row.correctAnswers = row.correctAnswers.filter((id) => id !== columnId)
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
      questionConfiguration: createDefaultChoiceConfig()
    } as Question
  }
})
</script>

<template>
  <div class="mt-4">
    <v-alert type="info" variant="tonal" density="comfortable" class="mb-4">
      Antwortoptionen eingeben und richtige Antworten mit der Checkbox markieren.
    </v-alert>

    <div class="d-flex align-center justify-space-between mb-2">
      <h3 class="text-subtitle-1 font-weight-medium">Antwortoptionen</h3>
    </div>

    <div
      v-for="(option, optionIndex) in localQuestion.questionConfiguration.optionRows"
      :key="option.id"
      class="d-flex align-center ga-2 mb-3"
    >
      <v-checkbox
        :model-value="isCorrectAnswer(optionIndex)"
        color="primary"
        density="compact"
        hide-details
        class="flex-shrink-0"
        @update:model-value="(val) => toggleCorrectAnswer(optionIndex, !!val)"
      >
        <v-tooltip activator="parent" location="top">Als richtige Antwort markieren</v-tooltip>
      </v-checkbox>

      <v-text-field
        v-model="option.text"
        :label="`Antwort ${optionIndex + 1}`"
        density="compact"
        hide-details
        required
      />

      <v-btn
        icon="mdi-delete-outline"
        variant="text"
        density="comfortable"
        color="error"
        :disabled="localQuestion.questionConfiguration.optionRows.length <= 1"
        @click="deleteOption(optionIndex)"
      >
        <v-icon icon="mdi-delete-outline" />
        <v-tooltip activator="parent" location="top">
          {{
            localQuestion.questionConfiguration.optionRows.length <= 1
              ? 'Es muss mindestens eine Antwortoption geben'
              : 'Antwort entfernen'
          }}
        </v-tooltip>
      </v-btn>
    </div>

    <v-btn
      variant="tonal"
      prepend-icon="mdi-plus"
      class="mt-2"
      @click="addOptionRow"
    >
      Antwort hinzufügen
    </v-btn>
  </div>
</template>
