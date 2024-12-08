<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type Catalog from '@/model/Catalog'
import type Question from '@/model/Question'
import { useRoute } from 'vue-router'
import catalogService from '@/services/catalog.service'
import questionService from '@/services/question.service'
import draggable from 'vuedraggable'
import nestedDraggable from 'vuedraggable'

const route = useRoute()

const catalog = ref<Catalog>({} as Catalog)

const allQuestions = ref<Question[]>([])

const catalogId = ref<string>(route.params.catalogId as string)

const addQuestionToCatalog = (question: Question) => {
  if (!catalog.value.questions) {
    catalog.value.questions = []
  }

  console.log('QUESTIONID: ', question._id)
  console.log('CATALOGID: ', catalogId.value)
  catalog.value.questions?.push(question)
  catalogService.addQuestionToCatalog({ catalog: catalogId, question: question._id })
}

onMounted(() => {
  questionService.getAllQuestions().then((res) => {
    allQuestions.value = res.data
  })
  console.log('CatalogId:', catalogId.value)
  getCatalog()
})

const getCatalog = () => {
  catalogService.getCatalog(catalogId.value).then((response) => {
    catalog.value = response.data as Catalog
    console.log('CATALOOOOOG: ', catalog.value)
  })
}
</script>

<template>
  <div class="d-flex flex-col">
    <v-sheet class="py-5 w-33">
      <v-table density="compact" height="100vh" fixed-header>
        <thead>
          <tr>
            <th class="text-left">Question</th>
            <th class="text-left">Tags</th>
            <th class="text-left">Add</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="question in allQuestions" :key="question._id">
            <td>{{ question.questiontext }}</td>
            <td>
              <v-chip size="x-small" v-for="(tag, index) in question.questiontags" :key="index"
                >{{ tag }}
              </v-chip>
            </td>
            <td>
              <v-btn
                icon="mdi-plus"
                class="row-btn align-center"
                size="x-small"
                variant="tonal"
                color="primary"
                @click="addQuestionToCatalog(question)"
              >
                <v-tooltip activator="parent" location="end">Add Question to Catalog</v-tooltip>
                <v-icon icon="mdi-plus" size="small" class="mx-auto"></v-icon>
              </v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-sheet>
    <v-sheet class="w-75 pt-5 d-flex align-center justify-center">
      <div v-if="catalog.questions">
        <h1 class="text-center">{{ catalogId }}</h1>
        <div class="text-center">
          <nested-draggable
            v-model="catalog.questions"
            :list="catalog.questions"
            item-key="id"
            tag="ul"
          >
            <template #item="{ element }">
              <li>
                {{ element.questiontext }}
                <nested-draggable
                  v-if="element.children"
                  v-model="element.children"
                  :list="element.children"
                  item-key="id"
                  tag="ul"
                >
                  <template #item="{ element }">
                    <li>{{ element.questiontext }}</li>
                  </template>
                </nested-draggable>
              </li>
            </template>
          </nested-draggable>
        </div>
      </div>
    </v-sheet>
  </div>
</template>

<style lang="scss"></style>
