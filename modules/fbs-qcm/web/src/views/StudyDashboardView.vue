<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import courseService from '@/services/course.service'
import type Catalog from '@/model/Catalog'
import type Skill from '@model/Skill'
import catalogService from '@/services/catalog.service'
import skillService from '@/services/skill.service'
import SkillCard from '@/components/SkillCard.vue'
import StudyHeader from '@/components/StudyHeader.vue'
import DialogConfirmVue from '../dialog/DialogConfirm.vue'
import DialogAddSkill from '../dialog/DialogAddSkill.vue'

const catalogs = ref<Catalog[]>([])
const studyProgress = ref<{ skillId: number; progress: number }[]>([])
const route = useRoute()
const courseId = Number(route.params.courseId)
const courseInformation = ref<{}>({})
const skills = ref<Skill[]>([])
const totalQuestions = ref<number>(0) // Neue Variable für alle Fragen des Kurses

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
  const { data } = await skillService.getSkills(courseId)
  skills.value = data
}

async function loadStudyProgress() {
  const { data } = await skillService.getAllStudyProgress(courseId)
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

async function loadTotalQuestions() {
  try {
    const { data } = await skillService.getTotalQuestions(courseId)
    totalQuestions.value = data.totalQuestions
  } catch (error) {
    console.error('Error loading total questions:', error)
  }
}

onMounted(async () => {
  await loadSkills()
  await loadStudyProgress()
  await loadCatalogsFromCourse(courseId)
  await loadCourseInformation(courseId)
  await loadTotalQuestions()
  console.log('Skills loaded:', skills.value)
})

async function reloadSkills() {
  await loadSkills()
  await loadTotalQuestions() // Neu laden, wenn sich Skills ändern
}
</script>

<template>
  <DialogAddSkill ref="dialogAddSkill" />
  <DialogConfirmVue ref="dialogConfirm" />
  <StudyHeader
    :name="courseInformation.name ?? ''"
    :description="courseInformation.description ?? ''"
    :progress="averageProgress ?? 0"
    :total-skills="skills.length ?? 0"
    :total-questions="totalQuestions"
    :reload-skills="reloadSkills"
  />
  <v-row justify="center" class="mt-4">
    <v-col v-for="(skill, index) in skills" :key="index" cols="8" md="4" class="ma-2">
      <SkillCard
        :_id="skill._id ?? ''"
        :name="skill.name ?? ''"
        :description="skill.description ?? ''"
        :difficulty="skill.difficulty ?? 0"
        :progress="getSkillProgress(skill.id) ?? 0"
        @skill-deleted="reloadSkills"
        @skill-updated="reloadSkills"
      />
    </v-col>
  </v-row>
</template>
