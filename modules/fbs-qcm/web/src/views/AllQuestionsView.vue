<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type Question from '@/model/Question'
import questionService from '@/services/question.service'
import DialogEditQuestion from '@/dialog/DialogEditQuestion.vue'

const dialogEditQuestion = ref<typeof DialogEditQuestion>()
const allQuestions = ref<Question[]>([])

const snackbar = ref(false)
const snackbarText = ref('')

const openSnackbar = (text: string) => {
  snackbar.value = true
  snackbarText.value = text
}

const headers = [
  { title: 'Type', key: 'questiontype' },
  { title: 'Text', key: 'questiontext' },
  { title: 'Tags', key: 'questiontags' },
  { title: 'Edit', key: 'actions', sortable: false }
]

const loadQuestions = async () => {
  const res = await questionService.getAllQuestions()
  allQuestions.value = res.data
}

const editQuestion = (question: Question) => {
  if (dialogEditQuestion.value) {
    dialogEditQuestion.value.openDialog(question).then((result: boolean) => {
      if (result) {
        openSnackbar(`Update Question ${question._id} successful`)
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

onMounted(loadQuestions)
</script>

<template>
  <v-snackbar v-model="snackbar" :timeout="4000">
    {{ snackbarText }}
    <template #actions>
      <v-btn color="primary" variant="text" @click="snackbar = false">Close</v-btn>
    </template>
  </v-snackbar>

  <DialogEditQuestion ref="dialogEditQuestion" />

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
            @click="editQuestion(item)"
            size="small"
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
      <template #item.questiontags="{ value }">
        <div class="d-flex flex-wrap ga-1">
          <v-chip
            v-for="(tag, index) in value"
            :key="index"
            size="small"
            color="primary"
            variant="tonal"
            label
          >
            {{ tag }}
          </v-chip>
        </div>
      </template>
    </v-data-table>
  </v-card>
</template>
