<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import StudyCatalogProgress from '@/components/StudyCatalogProgress.vue'
import questionService from '@/services/question.service'
import courseService from '@/services/course.service'
import type Question from '@/model/Question'
import type Catalog from '@/model/Catalog'
import type Skill from '@model/Skill'
import catalogService from '@/services/catalog.service'
import skillService from '@/services/skill.service'
import SkillCard from '@/components/SkillCard.vue'
import { useRoute } from 'vue-router'
import { watch, computed } from 'vue'
import DialogConfirmVue from '../dialog/DialogConfirm.vue'
import DialogAddSkill from '@/dialog/DialogAddSkill.vue'

const dialogAddSkill = ref<typeof DialogAddSkill>()

const catalogs = ref<Catalog[]>([])
const studyProgress = ref<number[]>([])
const route = useRoute()
const courseId = route.params.courseId
const courseInformation = ref<{}>({})
const skills = ref<Skill[]>([])

const createNewSkill = (courseId: number) => {
  if (dialogAddSkill.value) {
    dialogAddSkill.value.openDialog(courseId).then((result: boolean) => {
      if (result) {
        console.log('Create new catalog')
        loadCatalogsFromCourse(courseId)
      } else {
        console.log('Cancel')
      }
    })
  }
}
const averageProgress = computed(() => {
  if (!studyProgress.value.length) return 0
  const sum = studyProgress.value.reduce((a, b) => a + b, 0)
  return Math.round(sum / studyProgress.value.length)
})

onMounted(async () => {
  const getSkillsResponse = await skillService.getSkills()
  skills.value = getSkillsResponse.data

  const getStudyProgress = await skillService.getStudyProgress()
  studyProgress.value = getStudyProgress.data
  const allCatalogsResponse = await catalogService.getCatalogs(Number(courseId))
  catalogs.value = allCatalogsResponse.data

  const courseResponse = await courseService.getCourse(2)
  console.log('COURSE RESPONSE', courseResponse)

  const coreResponse = await courseService.getCoreCourse(courseId)
  courseInformation.value = coreResponse.data
  console.log(courseInformation.value)
})
</script>

<template>
  <DialogAddSkill ref="dialogAddSkill" />
  <DialogConfirmVue ref="dialogConfirm" />
  <v-card class="pa-6 mb-6 text-center" style="background-color: #f8f8f8">
    <h2 class="text-h6 font-weight-bold mb-1">{{ courseInformation.name }}</h2>
    <p class="text-body-2 mb-4">{{ courseInformation.description }}</p>
    <v-progress-circular :model-value="averageProgress" size="72" width="6" color="#36c78e">
      <span class="text-caption font-weight-medium">{{ averageProgress }}%</span>
    </v-progress-circular>
  </v-card>
  <v-row justify="center" class="mt-4">
    <v-col v-for="(skill, index) in skills" :key="index" cols="8" md="4" class="ma-2">
      <SkillCard
        :name="skill.name"
        :description="skill.description"
        :difficulty="skill.difficulty"
        :progress="studyProgress[index]"
      />
    </v-col>
  </v-row>

  <div class="d-flex justify-center mt-4">
    <v-btn
      icon="mdi-plus"
      class="mx-auto row-btn mx-8 mb-16 align-center"
      variant="tonal"
      color="primary"
      @click="createNewSkill()"
    >
      <v-tooltip activator="parent" location="end">Add New Skill</v-tooltip>
      <v-icon icon="mdi-plus" size="small" class="mx-auto"></v-icon>
    </v-btn>
  </div>
</template>
