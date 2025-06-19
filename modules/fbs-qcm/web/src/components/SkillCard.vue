<script lang="ts" setup>
import { computed, ref } from 'vue'
import DialogConfirm from '@/dialog/DialogConfirm.vue'
import DialogAddSkill from '@/dialog/DialogAddSkill.vue'
import { useRouter } from 'vue-router'
const router = useRouter()

const manageSkill = (skillId: number) => {
  router.push(`/manageSkill/${skillId}`)
}

const deleteDialogRef = ref()
const skillDialogRef = ref()

const deleteSkill = async (id: number) => {
  const confirmed = await deleteDialogRef.value.openDialog(
    `Delete Skill ${props.name}?`,
    `Are you sure you want to delete this skill ${props.name}?`,
    'Delete'
  )

  if (confirmed) {
    console.log('Deleting skill with ID:', id)
  } else {
    console.log('Delete cancelled')
  }
}
const editSkill = async () => {
  const result = await skillDialogRef.value.openDialog(123, {
    name: props.name,
    description: props.description,
    difficulty: props.difficulty,
    progress: props.progress,
    id: 123
  })

  if (result) {
    console.log('Skill wurde bearbeitet')
  } else {
    console.log('Bearbeiten abgebrochen')
  }
}

const props = defineProps<{
  difficulty: number
  id: number
  name: string
  progress: number
  description: string
}>()

const difficultyColor = computed(() => {
  return {
    1: 'beginner', // green
    2: '#ffd625', // amber
    3: '#f9a825', // orange
    4: '#d84315' // red
  }[props.difficulty]
})

const difficultyLabel = computed(() => {
  return {
    1: 'Lvl 1 🌱',
    2: 'Lvl 2 ⚙️',
    3: 'Lvl 3 🔥',
    4: 'Lvl 4 🧠'
  }[props.difficulty]
})
</script>
<template>
  <DialogConfirm ref="deleteDialogRef" />
  <DialogAddSkill ref="skillDialogRef" />

  <v-card variant="tonal" class="pa-4">
    <div class="d-flex justify-space-between align-center mb-2">
      <div class="text-h6">{{ name }}</div>
      <v-chip :color="difficultyColor" text-color="white" variant="flat" size="small" label>
        {{ difficultyLabel }}
      </v-chip>
    </div>

    <div class="wrap-subtitle text-body-2 text-medium-emphasis mb-2">
      {{ description }}
    </div>

    <v-card-title class="text-overline">
      Progress
      <div class="text-green-darken-3 text-h3 font-weight-bold">{{ progress }} %</div>
    </v-card-title>
    <v-progress-linear
      color="green-darken-3"
      height="15"
      class="mb-2"
      :model-value="progress"
      rounded="lg"
    >
    </v-progress-linear>

    <v-card-actions>
      <v-btn class="bg-primary-light">Learn for Skill</v-btn>
      <v-btn prepend-icon="mdi-cog" color="dark-grey" variant="tonal" @click="manageSkill(props.id)"
        >Manage skill</v-btn
      >
      <v-tooltip text="Edit Skill" location="bottom">
        <template #activator="{ props }">
          <v-btn v-bind="props" icon="mdi-pencil" size="x-small" color="black" @click="editSkill()">
          </v-btn>
        </template>
      </v-tooltip>
      <v-tooltip text="Delete Skill" location="bottom">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            icon="mdi-delete"
            color="error"
            size="x-small"
            class="mr-2"
            @click="deleteSkill(123)"
          >
          </v-btn>
        </template>
      </v-tooltip>
    </v-card-actions>
  </v-card>
</template>
<style scoped>
.wrap-subtitle {
  white-space: normal;
  overflow: visible;
  text-overflow: unset;
}
.difficulty-side-bar {
  width: 10px;
  border-top-left-radius: 12px;
  border-bottom-left-radius: 12px;
}
</style>
