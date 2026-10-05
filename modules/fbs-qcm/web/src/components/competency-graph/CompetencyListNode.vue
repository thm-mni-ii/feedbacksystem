<template>
  <v-list-group :value="competency.id">
    <template #activator="{ props: activatorProps, isOpen }">
      <v-list-item
        v-bind="activatorProps"
        density="compact"
        :active="selectedNodeId === competency.id"
        @click="onSelect(competency.id)"
      >
        <template #prepend>
          <v-icon size="18">{{ nodeIcon(competency.parentId ? 'competency-sub' : 'competency-root') }}</v-icon>
        </template>
        <v-list-item-title class="text-truncate">{{ competency.name }}</v-list-item-title>
        <template #append>
          <v-chip v-if="ownQuestions.length" size="x-small" variant="tonal" class="mr-1">
            {{ ownQuestions.length }} Aufgabe(n)
          </v-chip>
          <!-- Eigenes Auf-/Zuklapp-Icon, da der Default-Activator durch obiges
               Markup ersetzt wurde und dadurch keinen Pfeil mehr mitbringt.
               Icon-Swap statt CSS-Rotation, analog zu Vuetifys eigenem
               expand-icon/collapse-icon Verhalten in v-list-group. -->
          <v-icon v-if="hasChildren" size="20">{{ isOpen ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
        </template>
      </v-list-item>
    </template>

    <!-- Unterkompetenzen (rekursiv) -->
    <CompetencyListNode
      v-for="child in childCompetencies(competency.id)"
      :key="child.id"
      :competency="child"
      :child-competencies="childCompetencies"
      :questions-with-competency="questionsWithCompetency"
      :node-icon="nodeIcon"
      :selected-node-id="selectedNodeId"
      :on-select="onSelect"
    />

    <!-- Aufgaben dieser Kompetenz -->
    <v-list-item
      v-for="question in ownQuestions"
      :key="question.id"
      density="compact"
      :active="selectedNodeId === question.id"
      @click="onSelect(question.id)"
    >
      <template #prepend>
        <v-icon size="16">mdi-help-circle</v-icon>
      </template>
      <v-list-item-title class="text-truncate">{{ question.title || question.text }}</v-list-item-title>
    </v-list-item>
  </v-list-group>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Competency, Question } from '@/model/types'

/**
 * Reine Navigations-/Struktur-Ansicht: zeigt Name, Hierarchie und
 * Aufgaben-Anzahl. Aktionen (Bearbeiten, Löschen, Unterkompetenz/Aufgabe
 * hinzufügen) werden bewusst NICHT hier angeboten, sondern ausschließlich im
 * Detail-Panel des aktuell ausgewählten Elements - so gibt es für jede
 * Aktion genau einen Ort statt mehrerer paralleler Wege.
 */
interface Props {
  competency: Competency
  childCompetencies: (parentId: string) => Competency[]
  questionsWithCompetency: (competencyId: string) => Question[]
  nodeIcon: (type?: string) => string
  selectedNodeId: string | null
  onSelect: (id: string) => void
}

const props = defineProps<Props>()

const ownQuestions = computed(() => props.questionsWithCompetency(props.competency.id))
const hasChildren = computed(
  () => props.childCompetencies(props.competency.id).length > 0 || ownQuestions.value.length > 0,
)
</script>
