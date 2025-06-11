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

  <v-dialog v-model="editSkillDialog" class="responsive-dialog">
    <v-card>
      <v-card-title>
        <span>Add New Skill</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12">
              <v-text-field v-model="skill.name" label="Name"></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field v-model="skill.description" label="Description"></v-text-field>
              <v-switch v-model="skill.isPublic" label="is Public" color="primary"></v-switch>
            </v-col>
            <v-col cols="12">
              <div class="text-caption">Difficulty</div>

              <v-slider
                v-model="skill.difficulty"
                :max="3"
                :ticks="tickLabels"
                show-ticks="always"
                step="1"
                tick-size="4"
                track-color="primary"
              ></v-slider>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="_cancel">Cancel</v-btn>
        <v-btn v-if="isNew" @click="createSkill">Add</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type Skill from '@/model/Skill'
import type Course from '@/model/Course'
import skillService from '@/services/skill.service'
import catalogService from '@/services/catalog.service'

const editSkillDialog = ref(false)

const skill = ref<Skill>({} as Skill)
const isNew = ref<boolean>(true)

const tickLabels = { 0: 'Lvl 1 🌱', 1: 'Lvl 2 ⚙️', 2: 'Lvl 3 🔥', 3: 'Lvl 4🧠' }

const snackbar = ref({
  show: false,
  text: '',
  color: 'red',
  timeout: 5000
})

const createSkill = () => {
  console.log(skill.value)
  skillService
    .createNewSkill(skill.value)
    .then(() => {
      _confirm()
    })
    .catch((error) => {
      console.log(error)
      openSnackbar('Error creating Skill: ' + error.response.data)
    })
}

const updateCatalog = () => {
  catalogService
    .putCatalog(catalog.value)
    .then(() => {
      _confirm()
    })
    .catch((error) => {
      console.log(error)
      openSnackbar('Error updating catalog: ' + error.response.data)
    })
}

const openSnackbar = (text: string) => {
  snackbar.value.text = text
  snackbar.value.show = true
}

// Promise resolve
const resolvePromise = ref<Function | undefined>(undefined)

const openDialog = (courseId: number, editSkill?: Skill) => {
  if (editSkill !== undefined) {
    skill.value = { ...editSkill }
    isNew.value = false
  } else {
    isNew.value = true
    skill.value.course = courseId
  }
  editSkillDialog.value = true

  return new Promise((resolve) => {
    resolvePromise.value = resolve
  })
}

const _confirm = () => {
  editSkillDialog.value = false
  resolvePromise.value && resolvePromise.value(true)
}

const _cancel = () => {
  editSkillDialog.value = false
  resolvePromise.value && resolvePromise.value(false)
}

// define expose
defineExpose({
  openDialog
})
</script>
<style scoped>
.responsive-dialog {
  width: 75%;
}

@media (min-width: 1000px) {
  .responsive-dialog {
    width: 50%;
  }
}
::v-deep(.v-slider .v-slider__tick-label) {
  font-size: 5px;
}
</style>
