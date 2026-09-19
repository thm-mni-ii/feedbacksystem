<template>
  <div class="text-center">
    <h1 class="mb-4">Kompetenzanalyse</h1>
    <p class="text-medium-emphasis mb-6">
      Beantworte die Fragen möglichst ehrlich. Das System erstellt daraus ein Kompetenzprofil.
    </p>
    <v-btn color="primary" size="large" :loading="loading" @click="$emit('start')">
      Test starten
    </v-btn>

    <v-card v-if="sessions.length > 0" class="mt-8 text-left" variant="tonal">
      <v-card-title>Gespeicherte Lernsitzungen</v-card-title>
      <v-list>
        <v-list-item
          v-for="session in sessions"
          :key="session.id"
          :title="new Date(session.startedAt).toLocaleString('de-DE')"
          :subtitle="sessionSubtitle(session)"
        >
          <template #append>
            <v-btn
              color="primary"
              variant="text"
              :disabled="loading"
              @click="$emit('resume', session.id)"
            >
              {{ session.completedAt ? 'Ergebnis öffnen' : 'Fortsetzen' }}
            </v-btn>
          </template>
        </v-list-item>
      </v-list>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import type { StudySession } from '@/model/types'

defineProps<{
  sessions: StudySession[]
  loading: boolean
}>()

defineEmits<{
  (e: 'start'): void
  (e: 'resume', sessionId: string): void
}>()

function sessionSubtitle(session: StudySession): string {
  const answers = session.history.length
  return session.completedAt
    ? `Abgeschlossen · ${answers} beantwortete Fragen`
    : `${answers} beantwortete Fragen · zuletzt aktiv ${new Date(session.updatedAt).toLocaleString('de-DE')}`
}
</script>
