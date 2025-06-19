<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import questionService from '@/services/question.service'
import skillService from '@/services/skill.service'

import DialogEditQuestion from '@/dialog/DialogEditQuestion.vue'
import DialogAddQuestion from '@/dialog/DialogAddQuestion.vue'
import DialogConfirm from '@/dialog/DialogConfirm.vue'

import type Question from '@/model/Question'

const route = useRoute()
const router = useRouter()
const skillId = route.params.skillId
const skill = ref<Skill>({})
const allQuestions = ref<Question[]>([])
const totalQuestions = ref<number>(0)

const snackbar = ref(false)
const snackbarText = ref('')

const dialogEditQuestion = ref<typeof DialogEditQuestion>()
const dialogAddQuestion = ref<typeof DialogAddQuestion>()
const dialogRemoveQuestion = ref<typeof DialogConfirm>()

const difficultyColor = computed(
  () =>
    ({
      1: 'beginner',
      2: '#ffd625',
      3: '#f9a825',
      4: '#d84315'
    })[skill.value.difficulty]
)

const difficultyLabel = computed(
  () =>
    ({
      1: 'Lvl 1 🌱',
      2: 'Lvl 2 ⚙️',
      3: 'Lvl 3 🔥',
      4: 'Lvl 4 🧠'
    })[skill.value.difficulty]
)

const headers = [
  { title: 'Type', key: 'questiontype' },
  { title: 'Text', key: 'questiontext' },
  { title: 'Tags', key: 'questiontags' },
  { title: 'Edit', key: 'edit', sortable: false },
  { title: 'Remove', key: 'remove', sortable: false }
]

onMounted(() => {
  loadQuestions()
  fetchSkill()
})

const backToDashboard = () => router.push('/study/2')

const openSnackbar = (text: string) => {
  snackbarText.value = text
  snackbar.value = true
}

const fetchSkill = async () => {
  const res = await skillService.getSkill(skillId)
  skill.value = res.data
}

const loadQuestions = async () => {
  const res = await questionService.getAllQuestions()
  allQuestions.value = res.data
  totalQuestions.value = res.data.length
}

const editQuestion = async (question: Question) => {
  if (!dialogEditQuestion.value) return
  const result = await dialogEditQuestion.value.openDialog(question)
  if (result) {
    openSnackbar(`Updated question ${question._id}`)
    loadQuestions()
  } else {
    openSnackbar('Edit cancelled')
  }
}

const removeQuestion = async (question: Question) => {
  if (!dialogRemoveQuestion.value) return
  const confirmed = await dialogRemoveQuestion.value.openDialog(
    'Remove Question from Skill?',
    'Are you sure you want to remove this Question?',
    'Remove'
  )
  if (confirmed) {
    await skillService.removeQuestion(question._id)
    loadQuestions()
    openSnackbar(`Removed question ${question._id}`)
  }
}

const addQuestion = async () => {
  if (!dialogEditQuestion.value) return
  const result = await dialogEditQuestion.value.openDialog()
  if (result) {
    openSnackbar('Question created')
    loadQuestions()
  }
}

const addQuestionToSkill = async () => {
  if (!dialogAddQuestion.value) return
  const result = await dialogAddQuestion.value.openDialog()
  if (result) {
    openSnackbar('Question added to skill')
    loadQuestions()
  }
}
</script>

<template>
  <DialogEditQuestion ref="dialogEditQuestion" />
  <DialogAddQuestion ref="dialogAddQuestion" />
  <DialogConfirm ref="dialogRemoveQuestion" />

  <v-card
    class="pa-6 mx-auto my-6 transition-ease-in-out"
    max-width="900"
    elevation="2"
    rounded="xl"
    variant="tonal"
  >
    <div class="d-flex justify-space-between align-center mb-4">
      <div class="d-flex align-center gap-4">
        <v-tooltip text="Back to Course" location="bottom">
          <template #activator="{ props }">
            <v-btn v-bind="props" icon variant="text" @click="backToDashboard()">
              <v-icon icon="mdi-arrow-left" />
            </v-btn>
          </template>
        </v-tooltip>

        <div class="ml-4">
          <h2 class="text-h5 font-weight-bold mb-1">{{ skill.name }}</h2>
          <p class="text-medium-emphasis">{{ skill.description }}</p>
        </div>
      </div>

      <v-tooltip text="Edit Skill" location="bottom">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            icon
            size="small"
            color="primary"
            variant="flat"
            @click="createNewSkill()"
          >
            <v-icon icon="mdi-pencil" />
          </v-btn>
        </template>
      </v-tooltip>
    </div>
    <v-divider class="my-2" />
    <v-row dense>
      <v-col cols="6" sm="3">
        <div class="text-caption text-medium-emphasis mb-1">Total Questions</div>
        <div class="text-h6 font-weight-medium">
          <v-skeleton-loader v-if="!totalQuestions" type="text" />
          <span v-else>{{ totalQuestions }}</span>
        </div>
      </v-col>

      <v-col cols="6" sm="3">
        <div class="text-caption text-medium-emphasis mb-1">Difficulty</div>
        <v-chip class="text-h6 font-weight-medium" :color="difficultyColor">{{
          difficultyLabel
        }}</v-chip>
      </v-col>

      <v-col cols="6" sm="3">
        <div class="text-caption text-medium-emphasis mb-1">Last Updated</div>
        <div class="text-h6 font-weight-medium">2 days ago</div>
      </v-col>
    </v-row>
  </v-card>

  <v-card class="mx-auto my-8" max-width="1000">
    <v-data-table :headers="headers" :items="allQuestions" :items-per-page="10" class="elevation-1">
      <template #top>
        <v-toolbar flat>
          <v-toolbar-title
            >All Questions for Skill <strong>{{ skill.name }} </strong></v-toolbar-title
          >
          <v-spacer />
          <v-btn
            prepend-icon="mdi-plus"
            color="primary"
            variant="tonal"
            @click="addQuestionToSkill"
          >
            Add Question
          </v-btn>
        </v-toolbar>
      </template>
      <!-- eslint-disable-next-line vue/valid-v-slot -->
      <template #item.edit="{ item }">
        <div class="d-flex justify-end">
          <v-btn icon="mdi-pencil" class="me-2" size="x-small" @click="editQuestion(item)"></v-btn>
        </div>
      </template>
      <!-- eslint-disable-next-line vue/valid-v-slot -->
      <template #item.remove="{ item }">
        <div class="d-flex justify-end">
          <v-btn
            icon="mdi-delete"
            color="red"
            variant="tonal"
            size="x-small"
            class="mr-2"
            @click="removeQuestion(item)"
          ></v-btn>
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
