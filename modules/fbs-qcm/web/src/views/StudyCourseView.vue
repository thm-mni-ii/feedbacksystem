<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import StudyCatalogProgress from '@/components/StudyCatalogProgress.vue'
import questionService from '@/services/question.service'
import type Question from '@/model/Question'
import type Catalog from '@/model/Catalog'
import catalogService from '@/services/catalog.service'

const allQuestions = ref<Question[]>([])
const catalogs = ref<Catalog[]>([])
const progress = ref<number>(22)

onMounted(async () => {
  const allQuestionsResponse = await questionService.getAllCatalogQuestions(
    '663a51d228d8781d96050905'
  )
  allQuestions.value = allQuestionsResponse.data
  const allCatalogsResponse = await catalogService.getCatalogs(187)
  catalogs.value = allCatalogsResponse.data

  console.log(allQuestions.value)
  console.log(catalogs.value)
})
</script>

<template>
  <div v-for="cat in catalogs" :key="cat.id">
    <StudyCatalogProgress v-model:name="cat.name" v-model:progress="progress" />
  </div>
</template>
