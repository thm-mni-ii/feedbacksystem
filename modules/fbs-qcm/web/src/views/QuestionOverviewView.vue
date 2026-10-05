<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type Question from '@/model/Question'
import type { Competency } from '@/model/types'
import questionService from '@/services/question.service'
import competencyService from '@/services/competency.service'
import DialogEditQuestion from '@/dialog/DialogEditQuestion.vue'
import DialogEditCompetency from '@/dialog/DialogEditCompetency.vue'
import DialogConfirm from '@/dialog/DialogConfirm.vue'

const dialogEditQuestion = ref<typeof DialogEditQuestion>()
const dialogEditCompetency = ref<typeof DialogEditCompetency>()
const dialogConfirm = ref<typeof DialogConfirm>()
const allQuestions = ref<Question[]>([])
const competencies = ref<Competency[]>([])

const snackbar = ref(false)
const snackbarText = ref('')

const openSnackbar = (text: string) => {
  snackbar.value = true
  snackbarText.value = text
}

const headers = [
  { title: 'Typ', key: 'questionType' },
  { title: 'Text', key: 'text' },
  { title: 'Kompetenzen', key: 'competencyIds' },
  { title: 'Bearbeiten', key: 'actions', sortable: false }
]

const competencyHeaders = [
  { title: 'Name', key: 'name' },
  { title: 'Übergeordnet', key: 'parentId' },
  { title: 'Bearbeiten', key: 'actions', sortable: false }
]

const competencyName = (competencyId: string) =>
  competencies.value.find((c) => c.id === competencyId)?.name ?? competencyId

const loadCompetencies = async () => {
  const res = await competencyService.getAllCompetencies()
  competencies.value = res.data
}

const loadQuestions = async () => {
  const res = await questionService.getAllQuestions()
  allQuestions.value = res.data
}

const editQuestion = (question: Question) => {
  if (dialogEditQuestion.value) {
    dialogEditQuestion.value.openDialog(question).then((result: boolean) => {
      if (result) {
        openSnackbar(`Aufgabe ${question.id} aktualisiert`)
        loadQuestions()
      } else {
        openSnackbar('Bearbeiten abgebrochen')
      }
    })
  }
}

const addQuestion = () => {
  if (dialogEditQuestion.value) {
    dialogEditQuestion.value.openDialog().then((result: boolean) => {
      if (result) {
        openSnackbar('Aufgabe erfolgreich erstellt')
        loadQuestions()
      } else {
        openSnackbar('Erstellen abgebrochen')
      }
    })
  }
}

const deleteQuestion = async (question: Question) => {
  if (!question.id || !dialogConfirm.value) {
    return
  }
  const confirmed = await dialogConfirm.value.openDialog(
    'Aufgabe löschen',
    `Aufgabe "${question.text}" wirklich löschen?`,
    'Löschen'
  )
  if (!confirmed) {
    return
  }
  await questionService.deleteQuestion(question.id)
  openSnackbar('Aufgabe gelöscht')
  loadQuestions()
}

const editCompetency = (competency: Competency) => {
  if (dialogEditCompetency.value) {
    dialogEditCompetency.value.openDialog(competency).then((result: boolean) => {
      if (result) {
        openSnackbar(`Kompetenz ${competency.name} aktualisiert`)
        loadCompetencies()
      } else {
        openSnackbar('Bearbeiten abgebrochen')
      }
    })
  }
}

const addCompetency = () => {
  if (dialogEditCompetency.value) {
    dialogEditCompetency.value.openDialog().then((result: boolean) => {
      if (result) {
        openSnackbar('Kompetenz erfolgreich erstellt')
        loadCompetencies()
      } else {
        openSnackbar('Erstellen abgebrochen')
      }
    })
  }
}

const deleteCompetency = async (competency: Competency) => {
  if (!competency.id || !dialogConfirm.value) {
    return
  }
  const confirmed = await dialogConfirm.value.openDialog(
    'Kompetenz löschen',
    `Kompetenz "${competency.name}" wirklich löschen?`,
    'Löschen'
  )
  if (!confirmed) {
    return
  }
  await competencyService.deleteCompetency(competency.id)
  openSnackbar('Kompetenz gelöscht')
  loadCompetencies()
}

onMounted(() => {
  loadCompetencies()
  loadQuestions()
})
</script>

<template>
  <v-snackbar v-model="snackbar" :timeout="4000">
    {{ snackbarText }}
    <template #actions>
      <v-btn color="primary" variant="text" @click="snackbar = false">Schließen</v-btn>
    </template>
  </v-snackbar>

  <DialogEditQuestion ref="dialogEditQuestion" />
  <DialogEditCompetency ref="dialogEditCompetency" />
  <DialogConfirm ref="dialogConfirm" />

  <v-card class="mx-auto my-8" max-width="1000">
    <v-data-table :headers="headers" :items="allQuestions" :items-per-page="10" class="elevation-1">
      <template #top>
        <v-toolbar flat>
          <v-toolbar-title>Aufgabenpool</v-toolbar-title>
          <v-spacer />
          <v-btn prepend-icon="mdi-plus" color="primary" variant="tonal" @click="addQuestion">
            Aufgabe erstellen
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
        <v-btn
          prepend-icon="mdi-refresh"
          text="Aufgaben neu laden"
          variant="text"
          @click="loadQuestions"
        />
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

  <v-card class="mx-auto my-8" max-width="1000">
    <v-data-table
      :headers="competencyHeaders"
      :items="competencies"
      :items-per-page="10"
      class="elevation-1"
    >
      <template #top>
        <v-toolbar flat>
          <v-toolbar-title>Kompetenzen (global)</v-toolbar-title>
          <v-spacer />
          <v-btn prepend-icon="mdi-plus" color="primary" variant="tonal" @click="addCompetency">
            Kompetenz erstellen
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
            @click="editCompetency(item)"
          />
          <v-icon
            color="red"
            icon="mdi-delete-outline"
            size="small"
            @click="deleteCompetency(item)"
          />
        </div>
      </template>

      <template #no-data>
        <v-btn
          prepend-icon="mdi-refresh"
          text="Kompetenzen neu laden"
          variant="text"
          @click="loadCompetencies"
        />
      </template>
      <!-- eslint-disable-next-line vue/valid-v-slot -->
      <template #item.parentId="{ value }">
        {{ value ? competencyName(value) : '—' }}
      </template>
    </v-data-table>
  </v-card>
</template>
