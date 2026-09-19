<template>
  <div>
    <p class="text-body-2 text-medium-emphasis mb-4">
      Ziehe jedes Element in die passende Kategorie.
    </p>

    <v-card variant="outlined" class="mb-4">
      <v-card-title class="text-subtitle-1 text-wrap">Noch nicht zugeordnet</v-card-title>
      <v-card-text>
        <draggable
          v-model="unassignedItems"
          class="matching-drop-zone"
          item-key="id"
          :group="dragGroup"
          :animation="150"
        >
          <template #item="{ element }">
            <v-chip class="ma-1" color="primary" variant="tonal">
              <v-icon start>mdi-drag</v-icon>
              {{ element.text }}
            </v-chip>
          </template>
        </draggable>
      </v-card-text>
    </v-card>

    <v-row>
      <v-col v-for="category in configuration.categories ?? []" :key="category.id" cols="12" md="6">
        <v-card variant="outlined" height="100%">
          <v-card-title class="text-subtitle-1 text-wrap">{{ category.label }}</v-card-title>
          <v-card-text>
            <draggable
              v-model="assignments[category.id]"
              class="matching-drop-zone"
              item-key="id"
              :group="dragGroup"
              :animation="150"
            >
              <template #item="{ element }">
                <v-chip class="ma-1" color="primary">
                  <v-icon start>mdi-drag</v-icon>
                  {{ element.text }}
                </v-chip>
              </template>
            </draggable>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import draggable from 'vuedraggable'
import type { Matching, MatchingItem } from '@/model/questionTypes/Matching'

const props = defineProps<{
  configuration: Matching
}>()

const emit = defineEmits<{
  (event: 'update:answer', value: Record<string, string>): void
}>()

const unassignedItems = ref<MatchingItem[]>([])
const assignments = ref<Record<string, MatchingItem[]>>({})
const dragGroup = { name: 'matching-items', pull: true, put: true }

function resetAnswer(): void {
  // Defensiv gegen unvollständige Matching-Konfigurationen (fehlende
  // items/categories), damit die Session nicht mit einem TypeError abbricht.
  unassignedItems.value = [...(props.configuration.items ?? [])]
  assignments.value = Object.fromEntries(
    (props.configuration.categories ?? []).map((category) => [category.id, []])
  )
}

watch(
  () => props.configuration,
  resetAnswer,
  { immediate: true, deep: true }
)

const answer = computed(() => {
  const entries = Object.entries(assignments.value).flatMap(([categoryId, items]) =>
    items.map((item) => [item.id, categoryId] as const)
  )
  return Object.fromEntries(entries)
})

watch(answer, (value) => emit('update:answer', value), { immediate: true })
</script>

<style scoped>
.matching-drop-zone {
  min-height: 52px;
}
</style>
