<script setup lang="ts">
import { computed } from 'vue'
import { format } from 'date-fns'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()

const props = defineProps<{
  name: string
  description: string
  progress: number
  lastStudySession?: Date
  totalCompetencies?: number
  totalQuestions?: number
  isStartingSession?: boolean
}>()

const emit = defineEmits<{
  (e: 'startSession'): void
  (e: 'openSettings'): void
}>()

const formattedDate = computed(() =>
  props.lastStudySession ? format(new Date(props.lastStudySession), 'dd MMM yyyy, HH:mm') : '–'
)
</script>

<template>
  <v-card
    class="study-course-header pa-6 mb-6 mx-auto"
    elevation="0"
    rounded="lg"
    variant="outlined"
  >
    <div class="d-flex justify-space-between align-start mb-2">
      <div>
        <h1 class="text-h4 font-weight-bold">{{ name }}</h1>
        <p class="text-body-1 mt-2 mb-0">{{ description }}</p>
      </div>
      <v-menu v-if="authStore.decodedToken?.globalRole == 'ADMIN'">
        <template #activator="{ props: menuProps }">
          <v-btn v-bind="menuProps" icon="mdi-dots-vertical" variant="text" />
        </template>
        <v-list density="compact">
          <v-list-item
            prepend-icon="mdi-tune"
            title="Lernalgorithmus konfigurieren"
            @click="emit('openSettings')"
          />
        </v-list>
      </v-menu>
    </div>

    <v-row align="center">
      <v-col cols="12" md="8">
        <div class="course-metrics mb-5 rounded-sm">
          <div class="course-metric">
            <v-icon icon="mdi-calendar-clock-outline" color="primary" size="22" />
            <div class="course-metric__content">
              <div class="text-caption text-medium-emphasis">Letzte Sitzung</div>
              <div class="course-metric__value">{{ formattedDate }}</div>
            </div>
          </div>
          <div class="course-metric">
            <v-icon icon="mdi-shape-outline" color="primary" size="22" />
            <div class="course-metric__content">
              <div class="text-caption text-medium-emphasis">Kompetenzen</div>
              <div class="course-metric__value">{{ totalCompetencies ?? '-' }}</div>
            </div>
          </div>
          <div class="course-metric">
            <v-icon icon="mdi-help-circle-outline" color="primary" size="22" />
            <div class="course-metric__content">
              <div class="text-caption text-medium-emphasis">Fragen</div>
              <div class="course-metric__value">{{ totalQuestions ?? '-' }}</div>
            </div>
          </div>
        </div>

        <v-btn
          color="primary"
          prepend-icon="mdi-play"
          size="large"
          :loading="isStartingSession"
          @click="emit('startSession')"
        >
          Lernsitzung starten
        </v-btn>
      </v-col>

      <v-col cols="12" md="4" class="d-flex align-center justify-center">
        <div class="text-center">
          <v-progress-circular :model-value="progress" size="100" width="10" color="primary">
            <span class="text-h6">{{ progress }}%</span>
          </v-progress-circular>
          <div class="text-body-2 font-weight-medium mt-2">Geschätzter Kenntnisstand</div>
          <div class="text-caption text-medium-emphasis">
            Durchschnitt aus bewerteten Kompetenzen
          </div>
        </div>
      </v-col>
    </v-row>
  </v-card>
</template>

<style scoped>
.study-course-header {
  width: 100%;
  border-color: rgb(var(--v-theme-app-border-strong));
  background: rgb(var(--v-theme-surface));
}

.course-metrics {
  display: grid;
  grid-template-columns: minmax(190px, 1.5fr) repeat(2, minmax(130px, 1fr));
  border: 1px solid rgb(var(--v-theme-app-border));
  border-radius: 12px;
  overflow: hidden;
}

.course-metric {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  padding: 14px 16px;
}

.course-metric + .course-metric {
  border-left: 1px solid rgb(var(--v-theme-app-border));
}

.course-metric__content {
  min-width: 0;
}

.course-metric__value {
  overflow: hidden;
  color: rgb(var(--v-theme-app-text-primary));
  font-size: 0.95rem;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 700px) {
  .course-metrics {
    grid-template-columns: 1fr;
  }

  .course-metric + .course-metric {
    border-top: 1px solid rgb(var(--v-theme-app-border));
    border-left: 0;
  }
}
</style>
