<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import DialogConfirm from '@/dialog/DialogConfirm.vue'
import DialogAddSkill from '@/dialog/DialogAddSkill.vue'
import skillService from '@/services/skill.service'

const props = defineProps<{
  _id: string
  name: string
  description: string
  difficulty: number
  progress: number
}>()

const emit = defineEmits<{
  (e: 'skillDeleted', id: string): void
  (e: 'skillUpdated', id: string, updatedFields: Partial<Skill>): void
}>()

const router = useRouter()

const dialogConfirmRef = ref()
const dialogEditSkillRef = ref()

const difficultyColor = computed(
  () =>
    ({
      1: '#4caf50', // green
      2: '#ffd625', // amber
      3: '#f9a825', // orange
      4: '#d84315' // red
    })[props.difficulty]
)

const difficultyLabel = computed(
  () =>
    ({
      1: 'Lvl 1 🌱',
      2: 'Lvl 2 ⚙️',
      3: 'Lvl 3 🔥',
      4: 'Lvl 4 🧠'
    })[props.difficulty]
)

const handleManageSkill = () => {
  router.push(`/manageSkill/${props._id}`)
}

const handleEditSkill = async () => {
  const result = await dialogEditSkillRef.value.openDialog(props._id, {
    name: props.name,
    description: props.description,
    difficulty: props.difficulty,
    progress: props.progress,
    _id: props._id
  })

  if (result) {
    console.log('Skill wurde bearbeitet')
    emit('skillUpdated', props._id, result)
  }
}

const handleDeleteSkill = async () => {
  const confirmed = await dialogConfirmRef.value.openDialog(
    `Delete Skill ${props.name}?`,
    `Are you sure you want to delete the skill ${props.name}?`,
    'Delete'
  )

  if (confirmed) {
    try {
      console.log('Deleting skill:', props._id)
      await skillService.removeSkill(props._id)
      emit('skillDeleted', props._id)
    } catch (error) {
      console.error('Error deleting skill:', error)
    }
  }
}
</script>

<template>
  <DialogConfirm ref="dialogConfirmRef" />
  <DialogAddSkill ref="dialogEditSkillRef" />

  <v-card variant="tonal" class="pa-4">
    <div class="d-flex justify-space-between align-center mb-2">
      <div class="text-h6">{{ props.name }}</div>
      <v-chip :color="difficultyColor" text-color="white" variant="flat" size="small" label>
        {{ difficultyLabel }}
      </v-chip>
    </div>

    <div class="wrap-subtitle text-body-2 text-medium-emphasis mb-2">
      {{ props.description }}
    </div>

    <v-card-title class="text-overline">
      Progress
      <div class="text-green-darken-3 text-h3 font-weight-bold">{{ props.progress }} %</div>
    </v-card-title>

    <v-progress-linear
      color="green-darken-3"
      height="15"
      class="mb-2"
      :model-value="props.progress"
      rounded="lg"
    />

    <v-card-actions class="d-flex justify-space-between flex-wrap align-center pa-0">
      <div class="d-flex flex-wrap gap-2">
        <v-btn class="bg-primary-light">Learn for Skill</v-btn>

        <v-btn prepend-icon="mdi-cog" color="dark-grey" variant="tonal" @click="handleManageSkill">
          Manage skill
        </v-btn>
      </div>
      <div class="d-flex flex-wrap gap-2">
        <v-tooltip text="Edit Skill" location="bottom">
          <template #activator="{ props: tooltipProps }">
            <v-btn
              v-bind="tooltipProps"
              icon="mdi-pencil"
              size="x-small"
              color="black"
              @click="handleEditSkill"
            />
          </template>
        </v-tooltip>

        <v-tooltip text="Delete Skill" location="bottom">
          <template #activator="{ props: tooltipProps }">
            <v-btn
              v-bind="tooltipProps"
              icon="mdi-delete"
              size="x-small"
              color="error"
              @click="handleDeleteSkill"
            />
          </template>
        </v-tooltip>
      </div>
    </v-card-actions>
  </v-card>
</template>

<style scoped>
.wrap-subtitle {
  white-space: normal;
  overflow: visible;
  text-overflow: unset;
}
</style>
