<template>
  <DialogEditQuestion ref="dialogEditQuestion" />

  <SkillGraphHeader />

  <v-container fluid class="pa-4">
    <v-row>
      <!-- Graph -->
      <v-col cols="12" :md="selectedNodeId ? 8 : 12">
        <SkillGraphContainer
          v-model:zoom-level="zoomLevel"
          :graph-nodes="graphNodes"
          :graph-edges="graphEdges"
          :layouts="layouts"
          :configs="configs"
          :event-handlers="eventHandlers"
        />
      </v-col>

      <!-- Detail Panel -->
      <SkillGraphDetailPanel
        :selected-node-id="selectedNodeId"
        :selected-node="selectedNode"
        :questions="questions"
        :node-icon="nodeIcon"
        :get-categories="getCategories"
        :competencies-by-category="competenciesByCategory"
        :get-competency-color="getCompetencyColor"
        :get-competency="getCompetency"
        :child-competencies="childCompetencies"
        :questions-with-competency="questionsWithCompetency"
        :remove-competency-from-question="removeCompetencyFromQuestion"
        :edit-question="editQuestion"
        :delete-question="deleteQuestion"
      />
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DialogEditQuestion from '@/dialog/DialogEditQuestion.vue'
import SkillGraphHeader from '@/components/SkillGraphHeader.vue'
import SkillGraphContainer from '@/components/SkillGraphContainer.vue'
import SkillGraphDetailPanel from '@/components/SkillGraphDetailPanel.vue'
import { useSkillGraphLogic } from '@/composables/useSkillGraphLogic'
import type { Question } from '@/model/types'
import {
  competencies as mockCompetencies,
  questions as mockQuestions
} from '@/composables/skillgraph.mock'

const dialogEditQuestion = ref<typeof DialogEditQuestion>()

const editQuestion = (question?: Question) => {
  if (dialogEditQuestion.value) {
    dialogEditQuestion.value.openDialog(question).then((result: boolean) => {
      if (result) {
        console.log('Create / Edit Question Successful')
      } else {
        console.log('Create / Edit Question Cancelled')
      }
    })
  }
}

const {
  zoomLevel,
  selectedNodeId,
  selectedNode,
  questions,
  graphNodes,
  graphEdges,
  layouts,
  configs,
  eventHandlers,
  getCompetency,
  getCategories,
  competenciesByCategory,
  getCompetencyColor,
  childCompetencies,
  questionsWithCompetency,
  nodeIcon,
  deleteQuestion,
  removeCompetencyFromQuestion
} = useSkillGraphLogic(mockCompetencies, mockQuestions)
</script>
