<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import StudyCatalogProgress from '@/components/StudyCatalogProgress.vue'
import questionService from '@/services/question.service'
import type Question from '@/model/Question'
import type Catalog from '@/model/Catalog'
import catalogService from '@/services/catalog.service'
import { useRoute } from 'vue-router'
import { watch } from 'vue'

const allQuestions = ref<Question[]>([])
const catalogs = ref<Catalog[]>([])
const progress = ref<number>(42)
const route = useRoute()
const courseId = route.params.courseId
const activeCatalog = ref<string>('')

onMounted(async () => {
  const allCatalogsResponse = await catalogService.getCatalogs(Number(courseId))
  catalogs.value = allCatalogsResponse.data

  if (catalogs.value.length > 0) {
    activeCatalog.value = catalogs.value[0].id
  }
  const allQuestionsResponse = await questionService.getAllCatalogQuestions(activeCatalog.value)
  allQuestions.value = allQuestionsResponse.data
  console.log(allQuestions.value)
})

watch(activeCatalog, async () => {
  try {
    const res = await questionService.getAllCatalogQuestions(activeCatalog.value)
    allQuestions.value = res.data
    console.log(allQuestions.value)
  } catch (err) {
    console.log(err)
  }
})
</script>

<template>
  <div class="d-flex flex-col align-start justify-space-around">
    <div class="w-66">
      <p class="text-h5 text-center mt-4">Questions</p>
      <v-card class="mx-auto mt-4">
        <v-list color="primary-dark">
          <v-list-item v-for="(item, i) in allQuestions" :key="i" :value="item._id" color="primary">
            <div class="d-flex justify-space-between align-center">
              <v-list-item>{{ item.questiontext }}</v-list-item>
              <div>
                <v-chip v-for="tag in item.questiontags" :key="tag" class="ml-2">{{ tag }}</v-chip>
              </div>
            </div>
          </v-list-item>
        </v-list>
      </v-card>
    </div>

    <div class="mx-4 w-25">
      <p class="text-h5 text-center mt-4">Kompetenzen</p>
      <StudyCatalogProgress
        v-for="cat in catalogs"
        :key="cat.id"
        :name="cat.name"
        :progress="progress"
        :is-active="cat.id === activeCatalog"
        @click="activeCatalog = cat.id"
      />
    </div>
  </div>
</template>
