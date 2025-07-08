<script setup lang="ts">
import { computed, ref } from 'vue'
import { format } from 'date-fns'
import { useAuthStore } from '@/stores/authStore'
import DialogAddSkill from '@/dialog/DialogAddSkill.vue'

const authStore = useAuthStore()
const dialogAddSkill = ref<typeof DialogAddSkill>()

const props = defineProps<{
  name: string
  description: string
  progress: number
  lastStudySession?: Date
  totalSkills?: number
  totalQuestions?: number
}>()

const formattedDate = computed(() =>
  props.lastStudySession ? format(new Date(props.lastStudySession), 'dd MMM yyyy, HH:mm') : '–'
)
const createNewSkill = (courseId: number) => {
  if (dialogAddSkill.value) {
    dialogAddSkill.value.openDialog(courseId).then((result: boolean) => {
      if (result) {
        console.log('Create new skill')
        loadCatalogsFromCourse(courseId)
      } else {
        console.log('Cancel')
      }
    })
  }
}
</script>

<template>
  <DialogAddSkill ref="dialogAddSkill" />

  <v-card class="pa-6 ma-4 mx-auto mb-6 w-75" elevation="3" rounded="lg" variant="tonal">
    <div class="d-flex justify-space-between">
      <div>
        <h1 class="text-h4 font-weight-bold">{{ name }}</h1>
        <p class="text-body-1 mt-2">{{ description }}</p>
      </div>
      <div v-if="authStore.decodedToken?.globalRole == 'ADMIN'">
        <v-tooltip text="Edit course" location="bottom">
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              icon="mdi-cog"
              size="x-small"
              color="black"
              @click="console.log('works')"
            >
            </v-btn>
          </template>
        </v-tooltip>
        <v-tooltip text="Create new Skill" location="bottom">
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              class="mx-2"
              icon="mdi-plus"
              size="x-small"
              color="black"
              @click="createNewSkill()"
            >
            </v-btn>
          </template>
        </v-tooltip>
      </div>
    </div>

    <v-row>
      <v-col cols="12" md="8">
        <v-row class="mt-4" dense>
          <v-col cols="6" sm="4">
            <strong class="border-b">Last Session:</strong><br />
            <span>{{ formattedDate }}</span>
          </v-col>
          <v-col cols="6" sm="4">
            <strong class="border-b">Total Skills:</strong><br />
            <span>{{ totalSkills ?? '-' }}</span>
          </v-col>
          <v-col cols="6" sm="4">
            <strong class="border-b">Total Questions:</strong><br />
            <span>{{ totalQuestions ?? '-' }}</span>
          </v-col>
          <v-btn class="bg-primary-light mt-2">Learn for Course </v-btn>
          <v-spacer></v-spacer>
          <v-btn class="bg-primary-light mt-2">Test your skills</v-btn>
        </v-row>
      </v-col>

      <v-col cols="12" md="4" class="d-flex align-center justify-center">
        <v-progress-circular :model-value="progress" size="100" width="10" color="green-darken-3">
          <span class="text-h6">{{ progress }}%</span>
        </v-progress-circular>
      </v-col>
    </v-row>
  </v-card>
</template>
