<template>
  <div v-if="selectedNode?.type === 'course'" class="course-panel" :style="panelStyles">
    <p class="text-body-2 course-description mb-4">
      {{ selectedNode.data.description }}
    </p>

    <!-- Empty State: neuer Kurs ohne Kompetenzen -->
    <v-card
      v-if="rootCompetencies.length === 0"
      class="pa-6 profile-card text-center empty-state-card"
      elevation="0"
      rounded="lg"
    >
      <v-icon size="40" color="var(--sg-accent)" class="mb-3">mdi-brain</v-icon>
      <p class="text-body-1 font-weight-bold mb-1">Noch keine Kompetenzen angelegt</p>
      <p class="text-body-2 text-medium-emphasis mb-4">
        Lege deine erste Kompetenz an, um Aufgaben daran zuordnen zu können und den
        Kompetenzbaum für diesen Kurs aufzubauen.
      </p>
      <v-btn
        v-if="!readonly"
        color="primary"
        prepend-icon="mdi-plus"
        @click="editCompetency()"
      >
        Erste Kompetenz anlegen
      </v-btn>
    </v-card>

    <!--
      Die vollständige Kompetenzstruktur (Namen, Hierarchie) wird bewusst
      NICHT nochmal hier aufgelistet: sie ist bereits links im Graphen bzw.
      in der Listenansicht sichtbar. Dieses Panel liefert nur Kennzahlen und
      handlungsrelevante Hinweise, die dort nicht auf einen Blick erkennbar
      sind.
    -->
    <v-card v-else class="pa-4 profile-card" elevation="0" rounded="lg">
      <p class="mb-3 font-weight-bold">Kursüberblick</p>

      <v-row>
        <v-col cols="6" md="4">
          <div class="overview-tile">
            <div class="text-caption text-medium-emphasis mb-1">Kompetenzen</div>
            <div class="text-h6">{{ totalCompetencies }}</div>
          </div>
        </v-col>
        <v-col cols="6" md="4">
          <div class="overview-tile">
            <div class="text-caption text-medium-emphasis mb-1">Aufgaben</div>
            <div class="text-h6">{{ questions.length }}</div>
          </div>
        </v-col>
        <v-col cols="12" md="4">
          <div class="overview-tile">
            <div class="text-caption text-medium-emphasis mb-1">Ohne Aufgaben</div>
            <div class="text-h6">{{ competenciesWithoutQuestions.length }}</div>
          </div>
        </v-col>
      </v-row>

      <v-alert
        v-if="competenciesWithoutQuestions.length"
        type="warning"
        variant="tonal"
        density="comfortable"
        class="mt-3"
      >
        {{ competenciesWithoutQuestions.length }} Kompetenz(en) haben noch keine Aufgaben
        zugeordnet. Nutze den Graphen bzw. die Listenansicht links, um gezielt Aufgaben zu
        ergänzen.
      </v-alert>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Competency, Question } from '@/model/types'
import { competencyGraphPalette } from '@/plugins/vuetify'

interface Props {
  selectedNode: any
  questions: Question[]
  rootCompetencies: Competency[]
  childCompetencies: (parentId: string) => Competency[]
  questionsWithCompetency: (compId: string) => Question[]
  readonly?: boolean
  editCompetency: (competencyId?: string, presetParentId?: string) => void
}

const props = defineProps<Props>()

const collectAllCompetencies = (parentId: string): Competency[] => {
  const children = props.childCompetencies(parentId)
  return children.flatMap((child) => [child, ...collectAllCompetencies(child.id)])
}

const allCompetencies = computed(() =>
  props.rootCompetencies.flatMap((root) => [root, ...collectAllCompetencies(root.id)])
)

const totalCompetencies = computed(() => allCompetencies.value.length)

const competenciesWithoutQuestions = computed(() =>
  allCompetencies.value.filter((competency) => props.questionsWithCompetency(competency.id).length === 0)
)

const panelStyles = {
  '--sg-surface': competencyGraphPalette.surface,
  '--sg-surface-muted': competencyGraphPalette.surfaceMuted,
  '--sg-border': competencyGraphPalette.panelBorder,
  '--sg-shadow': competencyGraphPalette.panelShadow,
  '--sg-text-primary': competencyGraphPalette.textPrimary,
  '--sg-text-secondary': competencyGraphPalette.textSecondary,
  '--sg-accent': competencyGraphPalette.accent
}
</script>

<style scoped>
.profile-card {
  background: linear-gradient(180deg, var(--sg-surface) 0%, var(--sg-surface-muted) 100%);
  border: 1px solid var(--sg-border);
  box-shadow: 0 8px 22px var(--sg-shadow);
}

.empty-state-card {
  border-style: dashed;
}

.course-description {
  color: var(--sg-text-secondary);
  line-height: 1.4;
}

.overview-tile {
  border-radius: 12px;
  padding: 10px 12px;
  background: var(--sg-surface-muted);
  border: 1px solid var(--sg-border);
}
</style>
