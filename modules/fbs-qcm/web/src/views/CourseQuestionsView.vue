<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import type Question from '@/model/Question'
import type { Competency } from '@/model/types'
import questionService from '@/services/question.service'
import competencyService from '@/services/competency.service'
import DialogEditQuestion from '@/dialog/DialogEditQuestion.vue'
import DialogConfirm from '@/dialog/DialogConfirm.vue'

/**
 * Kursbezogene Sicht auf den globalen Fragenpool (Dozenten-Werkzeug): zeigt
 * nur Fragen, die einer Kompetenz dieses Kurses zugeordnet sind. Fragen und
 * Kompetenzen selbst bleiben global verwaltet (siehe `/pool`) - hier wird
 * lediglich gefiltert, damit Dozent:innen im Kurskontext bleiben können.
 */
const route = useRoute()
const courseId = computed(() => String(route.params.courseId))

const dialogEditQuestion = ref<typeof DialogEditQuestion>()
const dialogConfirm = ref<typeof DialogConfirm>()
const allQuestions = ref<Question[]>([])
const courseCompetencies = ref<Competency[]>([])
const isLoading = ref(true)
const loadError = ref<string | null>(null)

const snackbar = ref(false)
const snackbarText = ref('')

const openSnackbar = (text: string) => {
  snackbar.value = true
  snackbarText.value = text
}

const headers = [
  { title: 'Type', key: 'questionType' },
  { title: 'Text', key: 'text' },
  { title: 'Competencies', key: 'competencyIds' },
  { title: 'Edit', key: 'actions', sortable: false }
]

const courseCompetencyIds = computed(() => new Set(courseCompetencies.value.map((c) => c.id)))

const courseQuestions = computed(() =>
  allQuestions.value.filter((question) =>
    question.competencyIds.some((id) => courseCompetencyIds.value.has(id))
  )
)

const competencyName = (competencyId: string) =>
  courseCompetencies.value.find((c) => c.id === competencyId)?.name ?? competencyId

async function loadData() {
  isLoading.value = true
  loadError.value = null
  try {
    const [competenciesRes, questionsRes] = await Promise.all([
      competencyService.getCompetenciesByCourse(courseId.value),
      questionService.getAllQuestions()
    ])
    courseCompetencies.value = competenciesRes.data
    allQuestions.value = questionsRes.data
  } catch (error) {
    console.error('Fragen/Kompetenzen dieses Kurses konnten nicht geladen werden.', error)
    loadError.value = 'Die Fragen dieses Kurses konnten nicht geladen werden.'
  } finally {
    isLoading.value = false
  }
}

const editQuestion = (question: Question) => {
  if (dialogEditQuestion.value) {
    dialogEditQuestion.value.openDialog(question).then((result: boolean) => {
      if (result) {
        openSnackbar(`Update Question ${question.id} successful`)
        loadData()
      } else {
        openSnackbar('Create / Edit Question Cancelled')
      }
    })
  }
}

const addQuestion = () => {
  if (dialogEditQuestion.value) {
    dialogEditQuestion.value.openDialog().then((result: boolean) => {
      if (result) {
        openSnackbar('Create / Edit Question Successful')
        loadData()
      } else {
        openSnackbar('Create / Edit Question Cancelled')
      }
    })
  }
}

const deleteQuestion = async (question: Question) => {
  if (!question.id || !dialogConfirm.value) {
    return
  }
  const confirmed = await dialogConfirm.value.openDialog(
    'Frage löschen',
    `Frage "${question.text}" wirklich löschen?`,
    'Delete'
  )
  if (!confirmed) {
    return
  }
  await questionService.deleteQuestion(question.id)
  openSnackbar('Question deleted')
  loadData()
}

onMounted(loadData)
</script>

<template>
  <v-container class="py-6" style="max-width: 1100px">
    <v-snackbar v-model="snackbar" :timeout="4000">
      {{ snackbarText }}
      <template #actions>
        <v-btn color="primary" variant="text" @click="snackbar = false">Close</v-btn>
      </template>
    </v-snackbar>

    <DialogEditQuestion ref="dialogEditQuestion" />
    <DialogConfirm ref="dialogConfirm" />

    <v-alert v-if="loadError" type="error" variant="tonal" class="mb-4">
      {{ loadError }}
    </v-alert>

    <v-alert
      v-else-if="!isLoading && courseCompetencies.length === 0"
      type="info"
      variant="tonal"
      class="mb-4"
    >
      Diesem Kurs sind noch keine Kompetenzen zugeordnet. Ordne im Fragenpool zunächst
      Kompetenzen diesem Kurs zu, um hier passende Fragen zu sehen.
    </v-alert>

    <v-card>
      <v-data-table
        :headers="headers"
        :items="courseQuestions"
        :loading="isLoading"
        :items-per-page="10"
        class="elevation-1"
      >
        <template #top>
          <v-toolbar flat>
            <v-toolbar-title>Fragen dieses Kurses</v-toolbar-title>
            <v-spacer />
            <v-btn prepend-icon="mdi-plus" color="primary" variant="tonal" @click="addQuestion">
              Frage erstellen
            </v-btn>
          </v-toolbar>
        </template>
        <!-- eslint-disable-next-line vue/valid-v-slot -->
        <template #item.actions="{ item }">
          <div class="d-flex justify-end">
            <v-icon
              color="primary"
              icon="mdi-pencil"
              class="me-2"
              size="small"
              @click="editQuestion(item)"
            />
            <v-icon
              color="red"
              icon="mdi-delete-outline"
              size="small"
              @click="deleteQuestion(item)"
            />
          </div>
        </template>

        <template #no-data>
          <span class="text-medium-emphasis">
            Für die Kompetenzen dieses Kurses sind noch keine Fragen vorhanden.
          </span>
        </template>
        <!-- eslint-disable-next-line vue/valid-v-slot -->
        <template #item.competencyIds="{ value }">
          <div class="d-flex flex-wrap ga-1">
            <v-chip
              v-for="(competencyId, index) in value"
              :key="index"
              size="small"
              color="primary"
              variant="tonal"
              label
            >
              {{ competencyName(competencyId) }}
            </v-chip>
          </div>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>
