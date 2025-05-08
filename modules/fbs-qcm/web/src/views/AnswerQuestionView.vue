<script setup lang="ts">
import type Question from '@/model/Question'
import QuestionType from '@/enums/QuestionType'
import type Choice from '@/model/questionTypes/Choice'
import CatalogSession from '@/components/CatalogSession.vue'

const questionData: Question = {
  _id: '6638fbdb7cbf615381a90abe',
  owner: 1,
  questiontext: 'Was ist 2 + 57?',
  questiontags: ['komplex', 'frage'],
  questiontype: 'Choice' as QuestionType,
  questionconfiguration: {
    multipleRow: true,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: ''
      }
    ],
    optionRows: [
      {
        id: 0,
        text: 'erste Antwort'
      },
      {
        id: 1,
        text: 'zweite Antwort'
      },
      {
        id: 2,
        text: 'dritte antworttt'
      }
    ]
  } as Choice
}
</script>
<template>
  <h1>huhu</h1>
  <v-form>
    <v-sheet
      class="d-flex align-center justify-center flex-wrap flex-column text-center mx-auto my-14 px-4"
      elevation="4"
      height="auto"
      width="80%"
      rounded
    >
      <v-responsive class="mx-auto" width="85%">
        <h2 class="text-h4 my-8 font-weight-black text-primary">Course Catalog</h2>
        <v-divider class="mb-4"></v-divider>
        <h3>{{ question.questiontext }}</h3>
        <CatalogSession :question="questionData" />
      </v-responsive>
    </v-sheet>
  </v-form>
</template>

<style scoped lang="scss"></style>
