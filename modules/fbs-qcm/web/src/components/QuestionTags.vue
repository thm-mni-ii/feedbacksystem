<script setup lang="ts">
import { ref, watch, defineProps, defineEmits, onMounted } from 'vue'
import questionService from '@/services/question.service'

const props = defineProps<{
  questiontags?: string[]
}>()

const emit = defineEmits<{
  (e: 'update-tags', newTags: string[]): void
}>()

const localTags = ref<string[]>([...(props.questiontags ?? [])])
const items = ref<string[]>([])

watch(
  () => props.questiontags,
  (newTags) => {
    if (Array.isArray(newTags) && JSON.stringify(localTags.value) !== JSON.stringify(newTags)) {
      console.log('Props geändert:', newTags)
      localTags.value = [...newTags]
    }
  },
  { immediate: true }
)

watch(
  localTags,
  (newTags) => {
    if (JSON.stringify(props.questiontags) !== JSON.stringify(newTags)) {
      console.log('Neue Tags werden emittiert:', newTags)
      emit('update-tags', [...newTags])
    }
  },
  { deep: true }
)

onMounted(async () => {
  questionService.getAllTags().then((res) => {
    res.data.map((tag) => {
      items.value.push(tag.tag)
    })
  })
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
  >
    <template #chip="{ chipProps, item }">
      <v-chip v-bind="chipProps">
        <strong>{{ item.raw }}</strong>
      </v-chip>
    </template>
  </v-combobox>
</template>
