<script setup lang="ts">
import { ref, onMounted, defineProps, defineEmits } from 'vue'
import questionService from '../services/question.service.ts'

const props = defineProps<{ questiontags: Array }>()

const emit = defineEmits<{ (e: 'update', localTags: Array): void }>()

const items = ref(['SQL', 'Datenbanken'])
const localTags = ref([...props.questiontags])

const updateTags = (newValue: string[]) => {
  emit('update', newValue)
}

const getTags = async () => {
  try {
    const res = await questionService.getAllTags()
    items.value = res.data
  } catch (err) {
    console.log(err)
  }
}

onMounted(() => {
  console.log(props.questiontags)
  getTags()
})
</script>

<template>
  <v-combobox
    v-model="localTags"
    :items="items"
    label="Add Tags to your Question"
    prepend-icon="mdi-tag"
    variant="solo"
    chips
    clearable
    closable-chips
    multiple
    @update:model-value="updateTags"
  >
    <template #chip="{ chipProps, item }">
      <v-chip v-bind="chipProps">
        <strong>{{ item.raw }}</strong>
      </v-chip>
    </template>
  </v-combobox>
</template>
