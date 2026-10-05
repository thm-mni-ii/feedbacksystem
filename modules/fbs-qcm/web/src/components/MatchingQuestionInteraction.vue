<template>
  <div class="matching">
    <p class="text-body-2 text-medium-emphasis mb-4">
      Ziehe jedes Element in die passende Kategorie. Du kannst ein Element auch antippen und dann
      die Kategorie anklicken.
    </p>

    <v-sheet
      rounded="lg"
      class="matching__pool pa-4 mb-4"
      :class="{ 'matching__target--active': isTargetActive(null) }"
      v-bind="targetAttributes(null)"
    >
      <div class="d-flex align-center flex-wrap ga-2 mb-3">
        <span class="text-subtitle-2 font-weight-bold">Elemente</span>
        <v-spacer />
        <span class="text-caption text-medium-emphasis">
          {{ assignedCount }} von {{ totalCount }} zugeordnet
        </span>
      </div>
      <v-progress-linear
        :model-value="totalCount ? (assignedCount / totalCount) * 100 : 0"
        color="primary"
        rounded
        height="4"
        class="mb-3"
      />

      <draggable
        v-model="unassignedItems"
        class="matching__zone matching__zone--pool"
        item-key="id"
        :group="dragGroup"
        :animation="150"
        draggable=".matching__chip"
        ghost-class="matching__ghost"
        @start="onDragStart"
        @end="isDragging = false"
      >
        <template #item="{ element }">
          <v-chip
            class="matching__chip ma-1"
            color="primary"
            :variant="selectedItemId === element.id ? 'flat' : 'tonal'"
            :aria-pressed="selectedItemId === element.id"
            @click.stop="toggleSelection(element.id)"
          >
            <v-icon start icon="mdi-drag-vertical" />
            {{ element.text }}
          </v-chip>
        </template>
        <template #footer>
          <div
            v-if="unassignedItems.length === 0"
            class="d-flex align-center ga-2 text-body-2 text-medium-emphasis pa-2"
          >
            <v-icon icon="mdi-check-all" color="success" size="small" />
            Alle Elemente sind zugeordnet.
          </div>
        </template>
      </draggable>
    </v-sheet>

    <v-row dense>
      <v-col
        v-for="category in categories"
        :key="category.id"
        cols="12"
        :sm="categories.length % 2 === 0 ? 6 : 12"
        :md="categories.length === 3 ? 4 : 6"
      >
        <v-card
          variant="flat"
          border
          rounded="lg"
          class="matching__category h-100 d-flex flex-column"
          :class="{ 'matching__target--active': isTargetActive(category.id) }"
          v-bind="targetAttributes(category.id)"
        >
          <div class="d-flex align-start ga-2 px-4 pt-4 pb-2">
            <span class="text-subtitle-2 font-weight-bold flex-grow-1">{{ category.label }}</span>
            <v-chip
              v-if="(assignments[category.id] ?? []).length > 0"
              size="x-small"
              color="primary"
              variant="tonal"
            >
              {{ (assignments[category.id] ?? []).length }}
            </v-chip>
          </div>

          <draggable
            v-model="assignments[category.id]"
            class="matching__zone matching__zone--category flex-grow-1 ma-3 mt-1 pa-1 rounded-lg"
            :class="{ 'matching__zone--dragging': isDragging }"
            item-key="id"
            :group="dragGroup"
            :animation="150"
            draggable=".matching__chip"
            ghost-class="matching__ghost"
            @start="onDragStart"
            @end="isDragging = false"
          >
            <template #item="{ element }">
              <v-chip
                class="matching__chip ma-1"
                color="primary"
                :variant="selectedItemId === element.id ? 'flat' : 'elevated'"
                :aria-pressed="selectedItemId === element.id"
                @click.stop="toggleSelection(element.id)"
              >
                <v-icon start icon="mdi-drag-vertical" />
                {{ element.text }}
              </v-chip>
            </template>
            <template #footer>
              <div
                v-if="(assignments[category.id] ?? []).length === 0"
                class="matching__placeholder d-flex align-center justify-center ga-1 text-caption text-medium-emphasis"
              >
                <v-icon icon="mdi-tray-arrow-down" size="small" />
                {{ selectedItemId ? 'Hier ablegen' : 'Hierher ziehen' }}
              </div>
            </template>
          </draggable>
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
const isDragging = ref(false)
/** Element, das per Klick/Tippen ausgewählt wurde (Alternative zu Drag & Drop). */
const selectedItemId = ref<string | null>(null)

const categories = computed(() => props.configuration.categories ?? [])
const totalCount = computed(() => (props.configuration.items ?? []).length)
const assignedCount = computed(() => totalCount.value - unassignedItems.value.length)

function resetAnswer(): void {
  // Defensiv gegen unvollständige Matching-Konfigurationen (fehlende
  // items/categories), damit die Session nicht mit einem TypeError abbricht.
  unassignedItems.value = [...(props.configuration.items ?? [])]
  assignments.value = Object.fromEntries(
    (props.configuration.categories ?? []).map((category) => [category.id, []])
  )
  selectedItemId.value = null
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

function onDragStart(): void {
  isDragging.value = true
  selectedItemId.value = null
}

function toggleSelection(itemId: string): void {
  selectedItemId.value = selectedItemId.value === itemId ? null : itemId
}

/** `null` steht für den Bereich „Elemente“ (nicht zugeordnet). */
function locationOf(itemId: string): string | null | undefined {
  if (unassignedItems.value.some((item) => item.id === itemId)) return null
  return Object.keys(assignments.value).find((categoryId) =>
    assignments.value[categoryId].some((item) => item.id === itemId)
  )
}

function isTargetActive(categoryId: string | null): boolean {
  return selectedItemId.value !== null && locationOf(selectedItemId.value) !== categoryId
}

function targetAttributes(categoryId: string | null) {
  if (!isTargetActive(categoryId)) return {}
  return {
    role: 'button',
    tabindex: 0,
    'aria-label':
      categoryId === null
        ? 'Element zurück zu den Elementen legen'
        : `Element in Kategorie ${categories.value.find((c) => c.id === categoryId)?.label} legen`,
    onClick: () => moveSelectedTo(categoryId),
    onKeydown: (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        moveSelectedTo(categoryId)
      }
    }
  }
}

function moveSelectedTo(categoryId: string | null): void {
  const itemId = selectedItemId.value
  if (!itemId) return

  const from = locationOf(itemId)
  if (from === undefined || from === categoryId) return

  const source = from === null ? unassignedItems.value : assignments.value[from]
  const index = source.findIndex((item) => item.id === itemId)
  const [item] = source.splice(index, 1)

  if (categoryId === null) unassignedItems.value.push(item)
  else assignments.value[categoryId].push(item)

  selectedItemId.value = null
}
</script>

<style scoped>
.matching__pool {
  background: rgb(var(--v-theme-app-surface-muted));
  transition: box-shadow 0.15s ease;
}

.matching__zone {
  min-height: 52px;
}

.matching__zone--category {
  min-height: 72px;
  border: 2px dashed rgba(var(--v-border-color), var(--v-border-opacity));
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease;
}

.matching__zone--dragging {
  border-color: rgba(var(--v-theme-primary), 0.5);
  background: rgba(var(--v-theme-primary), 0.04);
}

.matching__placeholder {
  min-height: 60px;
  pointer-events: none;
}

.matching__target--active {
  cursor: pointer;
  box-shadow: 0 0 0 2px rgb(var(--v-theme-primary));
}

.matching__target--active .matching__zone--category {
  border-color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.06);
}

/* Lange Elementtexte umbrechen statt abschneiden. */
.matching__chip {
  height: auto !important;
  min-height: 32px;
  padding-block: 6px;
  white-space: normal;
  cursor: grab;
}

.matching__ghost {
  opacity: 0.4;
}
</style>
