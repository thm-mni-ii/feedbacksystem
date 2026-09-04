<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import competencyService from '@/services/competency.service'
import type { Competency } from '@/model/types'

const props = defineProps<{
  competencyIds?: string[]
}>()

const emit = defineEmits<{
  (e: 'update-competency-ids', newCompetencyIds: string[]): void
}>()

const localCompetencyIds = ref<string[]>([...(props.competencyIds ?? [])])
const competencies = ref<Competency[]>([])

watch(
  () => props.competencyIds,
  (newIds) => {
    if (
      Array.isArray(newIds) &&
      JSON.stringify(localCompetencyIds.value) !== JSON.stringify(newIds)
    ) {
      localCompetencyIds.value = [...newIds]
    }
  },
  { immediate: true }
)

watch(
  localCompetencyIds,
  (newIds) => {
    if (JSON.stringify(props.competencyIds) !== JSON.stringify(newIds)) {
      emit('update-competency-ids', [...newIds])
    }
  },
  { deep: true }
)

/**
 * Competencies als flache, nach Baum sortierte Liste mit Tiefenangabe
 * für die Einrückung (Depth-First: jede Root-Competency direkt gefolgt
 * von all ihren (rekursiven) Kindern).
 */
const orderedCompetencies = computed(() => {
  const byParent = new Map<string | null, Competency[]>()
  for (const competency of competencies.value) {
    const parentId = competency.parentId ?? null
    if (!byParent.has(parentId)) {
      byParent.set(parentId, [])
    }
    byParent.get(parentId)!.push(competency)
  }
  for (const siblings of byParent.values()) {
    siblings.sort((a, b) => a.name.localeCompare(b.name))
  }

  const result: { competency: Competency; depth: number }[] = []
  const visit = (parentId: string | null, depth: number) => {
    for (const competency of byParent.get(parentId) ?? []) {
      result.push({ competency, depth })
      visit(competency.id, depth + 1)
    }
  }
  visit(null, 0)
  return result
})

onMounted(async () => {
  try {
    const res = await competencyService.getAllCompetencies()
    competencies.value = res.data
  } catch (error) {
    console.error('Fehler beim Laden der Competencies:', error)
  }
})
</script>

<template>
  <v-select
    v-model="localCompetencyIds"
    :items="orderedCompetencies"
    item-title="competency.name"
    item-value="competency.id"
    label="Competencies dieser Frage"
    prepend-icon="mdi-shape-outline"
    variant="solo"
    chips
    clearable
    closable-chips
    multiple
  >
    <template #item="{ props: itemProps, item }">
      <v-list-item
        v-bind="itemProps"
        :title="undefined"
        :style="{ paddingLeft: `${16 + item.raw.depth * 20}px` }"
      >
        <span v-if="item.raw.depth > 0" class="text-medium-emphasis">└ </span>{{
          item.raw.competency.name
        }}
      </v-list-item>
    </template>
    <template #chip="{ props: chipProps, item }">
      <v-chip v-bind="chipProps">
        <strong>{{ item.raw.competency.name }}</strong>
      </v-chip>
    </template>
  </v-select>
</template>
