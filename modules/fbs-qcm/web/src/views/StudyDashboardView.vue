<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import StudyCatalogProgress from '@/components/StudyCatalogProgress.vue'
import courseService from '@/services/course.service'
import type Catalog from '@/model/Catalog'
import type Skill from '@model/Skill'
import catalogService from '@/services/catalog.service'
import skillService from '@/services/skill.service'
import SkillCard from '@/components/SkillCard.vue'
import StudyHeader from '@/components/StudyHeader.vue'
import { useRoute } from 'vue-router'
import { watch, computed } from 'vue'
import DialogConfirmVue from '../dialog/DialogConfirm.vue'
import DialogAddSkill from '@/dialog/DialogAddSkill.vue'

const dialogAddSkill = ref<typeof DialogAddSkill>()

const catalogs = ref<Catalog[]>([])
const studyProgress = ref<{ skillId: number; progress: number }[]>([])
const route = useRoute()
const courseId = route.params.courseId
const courseInformation = ref<{}>({})
const skills = ref<Skill[]>([])

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
const averageProgress = computed(() => {
  if (!studyProgress.value.length) return 0
  const sum = studyProgress.value.reduce((a, b) => a + b, 0)
  return Math.round(sum / studyProgress.value.length)
})

const getSkillProgress = (skillId: number): number => {
  const progressItem = studyProgress.value.find((x) => x.skillId === skillId)
  return progressItem?.progress ?? 0
}

async function loadSkills() {
  const { data } = await skillService.getSkills()
  skills.value = data
}

async function loadStudyProgress() {
  const { data } = await skillService.getAllStudyProgress()
  studyProgress.value = data
}

async function loadCatalogsFromCourse(courseId: number) {
  const { data } = await catalogService.getCatalogs(courseId)
  catalogs.value = data
}

async function loadCourseInformation(courseId: number) {
  const { data } = await courseService.getCoreCourse(courseId)
  courseInformation.value = data
}

onMounted(async () => {
  await loadSkills()
  await loadStudyProgress()
  await loadCatalogsFromCourse(Number(courseId))
  await loadCourseInformation(Number(courseId))
})
</script>

<template>
  <DialogAddSkill ref="dialogAddSkill" />
  <DialogConfirmVue ref="dialogConfirm" />
  <StudyHeader
    :name="courseInformation.name ?? ''"
    :description="courseInformation.description ?? ''"
    :progress="averageProgress ?? 0"
    :totalSkills="skills.length ?? 0"
  />
  <v-row justify="center" class="mt-4">
    <v-col v-for="(skill, index) in skills" :key="index" cols="8" md="4" class="ma-2">
      <SkillCard
        :name="skill.name ?? ''"
        :description="skill.description ?? ''"
        :difficulty="skill.difficulty ?? 0"
        :progress="getSkillProgress(skill.id) ?? 0"
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
