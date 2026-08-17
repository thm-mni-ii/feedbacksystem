<template>
  <div class="qmatrix-dialog-launcher">
    <v-btn
      color="primary"
      variant="tonal"
      prepend-icon="mdi-table"
      class="qmatrix-open-btn"
      @click="isOpen = true"
    >
      {{ buttonLabel }}
    </v-btn>

    <v-dialog v-model="isOpen" class="qmatrix-dialog w-100 w-md-90 w-xl-80">
      <v-card class="qmatrix-dialog-card" elevation="10">
        <v-card-title class="qmatrix-dialog-header d-flex justify-space-between align-center">
          <div class="d-flex flex-column qmatrix-dialog-title-block">
            <span class="text-h4 ma-2 border-b-md border-primary">{{ title }}</span>
          </div>

          <v-btn icon variant="text" @click="isOpen = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-divider />

        <v-card-text class="qmatrix-dialog-body pa-4 pa-md-6">
          <QMatrixPanel
            :competencies="competencies"
            :questions="questions"
            :title="title"
            table-max-height="calc(100vh - 380px)"
          />
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Competency, Question } from '@/model/types'
import QMatrixPanel from '@/components/QMatrixPanel.vue'

interface Props {
  competencies: Competency[]
  questions: Question[]
  title?: string
  buttonLabel?: string
}

withDefaults(defineProps<Props>(), {
  title: 'Q-Matrix',
  buttonLabel: 'Open Q-Matrix'
})

const isOpen = ref(false)
</script>

<style scoped>
.qmatrix-dialog-launcher {
  width: 100%;
}

.qmatrix-open-btn {
  align-self: flex-end;
}

.qmatrix-dialog {
  align-items: center;
}

.qmatrix-dialog-card {
  width: min(1600px, calc(100vw - 48px));
  height: min(94vh, calc(100vh - 48px));
  margin: 24px auto;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 32px;
  max-width: none;
}

.qmatrix-dialog-header {
  padding: 18px 20px 8px;
}

.qmatrix-dialog-title-block {
  min-width: 0;
}

.qmatrix-dialog-subtitle {
  padding-left: 10px;
}

.qmatrix-dialog-body {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  align-items: stretch;
}

.qmatrix-dialog-body :deep(.qmatrix-panel) {
  flex: 1;
  min-height: 0;
}

@media (max-width: 960px) {
  .qmatrix-dialog-card {
    width: calc(100vw - 24px);
    height: calc(100vh - 24px);
    margin: 12px auto;
    border-radius: 22px;
  }

  .qmatrix-dialog-header {
    padding: 12px 12px 4px;
  }
}
</style>
