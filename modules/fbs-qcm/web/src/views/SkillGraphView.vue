<template>
  <DialogEditQuestion ref="dialogEditQuestion" />

  <section class="skill-graph-view" :style="viewStyle">
    <v-container fluid class="pa-2 pa-md-3 skill-graph-content">
      <v-row class="fill-height skill-graph-row" align="stretch">
        <!-- Graph -->
        <v-col
          cols="12"
          :md="selectedNodeId ? 8 : 12"
          class="d-flex flex-column fill-height pr-md-2"
        >
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
          :root-competencies="rootCompetencies"
          :get-competency-color="getCompetencyColor"
          :get-competency="getCompetency"
          :child-competencies="childCompetencies"
          :questions-with-competency="questionsWithCompetency"
          :remove-competency-from-question="removeCompetencyFromQuestion"
          :select-course="selectCourse"
          :edit-question="editQuestion"
          :delete-question="deleteQuestion"
        />
      </v-row>
    </v-container>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import DialogEditQuestion from '@/dialog/DialogEditQuestion.vue'
import SkillGraphContainer from '@/components/SkillGraphContainer.vue'
import SkillGraphDetailPanel from '@/components/SkillGraphDetailPanel.vue'
import { useSkillGraphLogic } from '@/composables/useSkillGraphLogic'
import type { Question } from '@/model/types'
import { skillGraphPalette } from '@/plugins/vuetify'
import {
  competencies as mockCompetencies,
  questions as mockQuestions
} from '@/composables/skillgraph.mock'

const dialogEditQuestion = ref<typeof DialogEditQuestion>()
const viewStyle = computed(() => ({
  background: `linear-gradient(180deg, ${skillGraphPalette.viewBackground} 0%, ${skillGraphPalette.viewBackgroundAlt} 100%)`
}))

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
  rootCompetencies,
  getCompetencyColor,
  childCompetencies,
  questionsWithCompetency,
  nodeIcon,
  deleteQuestion,
  removeCompetencyFromQuestion,
  selectCourse
} = useSkillGraphLogic(mockCompetencies, mockQuestions)
</script>

<style scoped>
.skill-graph-view {
  height: calc(100dvh - var(--v-layout-top, 0px));
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.skill-graph-content {
  flex: 1;
  min-height: 0;
}

.skill-graph-row {
  margin: 0;
}
</style>
