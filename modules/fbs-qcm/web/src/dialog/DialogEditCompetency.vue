<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Competency, CompetencyPrerequisite } from '@/model/types'
import competencyService from '@/services/competency.service'
import DialogConfirm from '@/dialog/DialogConfirm.vue'

const editCompetencyDialog = ref(false)
const dialogConfirm = ref<typeof DialogConfirm>()

const isNew = ref<boolean>(true)
const competencyId = ref<string | undefined>(undefined)

const competency = ref<Omit<Competency, 'id'>>({
  name: '',
  description: '',
  parentId: null,
  prerequisites: []
})

// Alle existierenden Competencies, z.B. für Parent-Auswahl und Prerequisites.
const allCompetencies = ref<Competency[]>([])

const snackbar = ref({
  show: false,
  text: '',
  color: 'red',
  timeout: 5000
})

const openSnackbar = (text: string, color = 'red') => {
  snackbar.value.text = text
  snackbar.value.color = color
  snackbar.value.show = true
}

/**
 * Alle Nachkommen einer Competency (rekursiv), damit sie weder als eigener
 * Parent noch als eigenes Prerequisite auswählbar sind (verhindert Zyklen).
 */
const descendantIds = (rootId: string): Set<string> => {
  const result = new Set<string>()
  const visit = (parentId: string) => {
    for (const candidate of allCompetencies.value) {
      if (candidate.parentId === parentId && !result.has(candidate.id)) {
        result.add(candidate.id)
        visit(candidate.id)
      }
    }
  }
  visit(rootId)
  return result
}

const excludedIds = computed(() => {
  if (isNew.value || !competencyId.value) {
    return new Set<string>()
  }
  return new Set([competencyId.value, ...descendantIds(competencyId.value)])
})

/**
 * Nach Baum sortierte, flache Liste (Depth-First) mit Tiefenangabe für die
 * Einrückung in den Auswahl-Dropdowns (Parent / Prerequisites).
 */
const orderedCompetencies = computed(() => {
  const byParent = new Map<string | null, Competency[]>()
  for (const item of allCompetencies.value) {
    const parentId = item.parentId ?? null
    if (!byParent.has(parentId)) {
      byParent.set(parentId, [])
    }
    byParent.get(parentId)!.push(item)
  }
  for (const siblings of byParent.values()) {
    siblings.sort((a, b) => a.name.localeCompare(b.name))
  }

  const result: { competency: Competency; depth: number }[] = []
  const visit = (parentId: string | null, depth: number) => {
    for (const item of byParent.get(parentId) ?? []) {
      if (!excludedIds.value.has(item.id)) {
        result.push({ competency: item, depth })
      }
      visit(item.id, depth + 1)
    }
  }
  visit(null, 0)
  return result
})

const prerequisites = computed<CompetencyPrerequisite[]>({
  get: () => competency.value.prerequisites ?? [],
  set: (value) => {
    competency.value.prerequisites = value
  }
})

const prerequisiteCompetencyIds = computed<string[]>({
  get: () => prerequisites.value.map((p) => p.competencyId),
  set: (newIds) => {
    const existingById = new Map(prerequisites.value.map((p) => [p.competencyId, p]))
    prerequisites.value = newIds.map(
      (id) => existingById.get(id) ?? { competencyId: id, minimumMastery: 0.7 }
    )
  }
})

const competencyName = (id: string) =>
  allCompetencies.value.find((c) => c.id === id)?.name ?? id

const updateMinimumMastery = (competencyIdToUpdate: string, value: number) => {
  prerequisites.value = prerequisites.value.map((p) =>
    p.competencyId === competencyIdToUpdate ? { ...p, minimumMastery: value } : p
  )
}

const loadCompetencies = async () => {
  try {
    const res = await competencyService.getAllCompetencies()
    allCompetencies.value = res.data
  } catch (error) {
    console.error('Fehler beim Laden der Competencies:', error)
  }
}

const nameValidationError = computed(() =>
  competency.value.name.trim().length === 0 ? 'Name ist erforderlich' : ''
)

// Promise resolve
const resolvePromise = ref<Function | undefined>(undefined)

const openDialog = (editCompetency?: Competency) => {
  loadCompetencies()

  if (editCompetency) {
    const { id, ...rest } = editCompetency
    competencyId.value = id
    competency.value = { ...rest, prerequisites: [...(rest.prerequisites ?? [])] }
    isNew.value = false
  } else {
    competencyId.value = undefined
    competency.value = {
      name: '',
      description: '',
      parentId: null,
      prerequisites: []
    }
    isNew.value = true
  }

  editCompetencyDialog.value = true

  return new Promise((resolve) => {
    resolvePromise.value = resolve
  })
}

const _confirm = () => {
  editCompetencyDialog.value = false
  resolvePromise.value && resolvePromise.value(true)
}

const _cancel = () => {
  editCompetencyDialog.value = false
  resolvePromise.value && resolvePromise.value(false)
}

const createCompetency = () => {
  competencyService
    .createCompetency(competency.value)
    .then(() => {
      _confirm()
    })
    .catch((error) => {
      console.error(error)
      openSnackbar('Error creating Competency: ' + error.response?.data)
    })
}

const updateCompetency = () => {
  if (!competencyId.value) {
    return
  }
  competencyService
    .updateCompetency(competencyId.value, competency.value)
    .then(() => {
      _confirm()
    })
    .catch((error) => {
      console.error(error)
      openSnackbar('Error updating Competency: ' + error.response?.data)
    })
}

const handleSubmit = () => {
  if (nameValidationError.value) {
    return
  }
  if (isNew.value) {
    createCompetency()
  } else {
    updateCompetency()
  }
}

const deleteCompetency = async () => {
  if (!competencyId.value || !dialogConfirm.value) {
    return
  }
  const confirmed = await dialogConfirm.value.openDialog(
    'Kompetenz löschen',
    `Kompetenz "${competency.value.name}" wirklich löschen?`,
    'Delete'
  )
  if (!confirmed) {
    return
  }
  competencyService
    .deleteCompetency(competencyId.value)
    .then(() => {
      _confirm()
    })
    .catch((error) => {
      console.error(error)
      openSnackbar('Error deleting Competency: ' + error.response?.data)
    })
}

onMounted(() => {
  loadCompetencies()
})

// define expose
defineExpose({
  openDialog
})
</script>

<template>
  <v-snackbar
    v-model="snackbar.show"
    :timeout="snackbar.timeout"
    :color="snackbar.color"
    multi-line
  >
    {{ snackbar.text }}

    <template #actions>
      <v-btn color="gray" variant="text" @click="snackbar.show = false"> Close </v-btn>
    </template>
  </v-snackbar>

  <DialogConfirm ref="dialogConfirm" />

  <v-dialog v-model="editCompetencyDialog" class="w-100 w-md-75">
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="text-h4 ma-2 border-b-md border-primary">
          {{ isNew ? 'Add new Competency' : 'Update Competency' }}
        </span>
        <v-btn icon variant="text" @click="_cancel">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text class="mt-2">
        <v-form>
          <v-text-field
            v-model="competency.name"
            label="Name"
            :error-messages="nameValidationError ? [nameValidationError] : []"
            required
          ></v-text-field>

          <v-textarea
            v-model="competency.description"
            label="Description"
            auto-grow
            rows="2"
          ></v-textarea>

          <v-select
            v-model="competency.parentId"
            :items="orderedCompetencies"
            item-title="competency.name"
            item-value="competency.id"
            label="Parent Competency"
            prepend-icon="mdi-family-tree"
            variant="solo"
            clearable
          >
            <template #item="{ props: itemProps, item }">
              <v-list-item
                v-bind="itemProps"
                :title="undefined"
                :style="{ paddingLeft: `${16 + (item.raw?.depth ?? 0) * 20}px` }"
              >
                <span v-if="(item.raw?.depth ?? 0) > 0" class="text-medium-emphasis">└ </span
                >{{ item.raw?.competency?.name ?? competencyName(item.value) }}
              </v-list-item>
            </template>
          </v-select>

          <v-select
            v-model="prerequisiteCompetencyIds"
            :items="orderedCompetencies"
            item-title="competency.name"
            item-value="competency.id"
            label="Prerequisites"
            prepend-icon="mdi-arrow-decision-outline"
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
                :style="{ paddingLeft: `${16 + (item.raw?.depth ?? 0) * 20}px` }"
              >
                <span v-if="(item.raw?.depth ?? 0) > 0" class="text-medium-emphasis">└ </span
                >{{ item.raw?.competency?.name ?? competencyName(item.value) }}
              </v-list-item>
            </template>
          </v-select>

          <div v-if="prerequisites.length > 0" class="mb-2">
            <div class="text-caption mb-1">Minimum Mastery je Prerequisite</div>
            <div
              v-for="prerequisite in prerequisites"
              :key="prerequisite.competencyId"
              class="d-flex align-center mb-2"
            >
              <span class="text-body-2 flex-shrink-0" style="width: 160px">
                {{ competencyName(prerequisite.competencyId) }}
              </span>
              <v-slider
                :model-value="prerequisite.minimumMastery"
                :min="0"
                :max="1"
                step="0.05"
                thumb-label
                color="primary"
                hide-details
                class="ml-2"
                @update:model-value="updateMinimumMastery(prerequisite.competencyId, $event)"
              ></v-slider>
            </div>
          </div>
        </v-form>
      </v-card-text>

      <v-card-actions class="justify-end">
        <v-btn v-if="!isNew" color="red" variant="text" class="mr-auto" @click="deleteCompetency">
          Delete
        </v-btn>
        <v-btn variant="text" @click="_cancel">Cancel</v-btn>
        <v-btn color="primary" @click="handleSubmit">{{ isNew ? 'Add' : 'Save' }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
