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
  { title: 'Type', key: 'questionType' },
  { title: 'Text', key: 'text' },
  { title: 'Competencies', key: 'competencyIds' },
  { title: 'Edit', key: 'actions', sortable: false }
]

const competencyHeaders = [
  { title: 'Name', key: 'name' },
  { title: 'Parent', key: 'parentId' },
  { title: 'Edit', key: 'actions', sortable: false }
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
        openSnackbar(`Update Question ${question.id} successful`)
        loadQuestions()
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
        loadQuestions()
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
  loadQuestions()
}

const editCompetency = (competency: Competency) => {
  if (dialogEditCompetency.value) {
    dialogEditCompetency.value.openDialog(competency).then((result: boolean) => {
      if (result) {
        openSnackbar(`Update Competency ${competency.name} successful`)
        loadCompetencies()
      } else {
        openSnackbar('Create / Edit Competency Cancelled')
      }
    })
  }
}

const addCompetency = () => {
  if (dialogEditCompetency.value) {
    dialogEditCompetency.value.openDialog().then((result: boolean) => {
      if (result) {
        openSnackbar('Create Competency Successful')
        loadCompetencies()
      } else {
        openSnackbar('Create / Edit Competency Cancelled')
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
    'Delete'
  )
  if (!confirmed) {
    return
  }
  await competencyService.deleteCompetency(competency.id)
  openSnackbar('Competency deleted')
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
      <v-btn color="primary" variant="text" @click="snackbar = false">Close</v-btn>
    </template>
  </v-snackbar>

  <DialogEditQuestion ref="dialogEditQuestion" />
  <DialogEditCompetency ref="dialogEditCompetency" />
  <DialogConfirm ref="dialogConfirm" />

  <v-card class="mx-auto my-8" max-width="1000">
    <v-data-table :headers="headers" :items="allQuestions" :items-per-page="10" class="elevation-1">
      <template #top>
        <v-toolbar flat>
          <v-toolbar-title>All Questions</v-toolbar-title>
          <v-spacer />
          <v-btn prepend-icon="mdi-plus" color="primary" variant="tonal" @click="addQuestion">
            Create Question
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
          text="Reload Questions"
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
          <v-toolbar-title>All Competencies</v-toolbar-title>
          <v-spacer />
          <v-btn prepend-icon="mdi-plus" color="primary" variant="tonal" @click="addCompetency">
            Create Competency
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
          text="Reload Competencies"
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
