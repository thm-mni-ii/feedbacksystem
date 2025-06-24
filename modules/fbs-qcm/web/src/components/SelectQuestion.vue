<template>
  <v-card-text>
    <v-text-field
      v-model="searchQuery"
      label="Frage suchen"
      prepend-inner-icon="mdi-magnify"
      density="compact"
      variant="outlined"
    />

    <div class="mt-4">
      <div class="text-h6 border-b-md border-primary">Filter for Tags</div>
      <div v-if="isLoadingTags" class="text-grey text-caption mt-2">Tags loading...</div>
      <div v-else-if="tags.length === 0" class="text-caption mt-2">No Tags available</div>
      <div v-else class="d-flex flex-wrap gap-2 mt-2">
        <v-chip
          v-for="tag in tags"
          :key="tag.tag"
          :color="selectedTags.includes(tag.tag) ? 'primary' : 'grey-darken-1'"
          label
          class="cursor-pointer ma-1"
          @click="toggleTag(tag.tag)"
        >
          {{ tag.tag }} ({{ tag.count }})
        </v-chip>
      </div>
    </div>

    <div v-if="selectedTags.length > 0" class="mt-3">
      <div class="text-subtitle-2 mb-1">Active Tags:</div>
      <div class="d-flex flex-wrap gap-2">
        <v-chip
          v-for="tag in selectedTags"
          :key="tag"
          closable
          color="primary"
          class="ma-1"
          @click:close="removeTag(tag)"
        >
          {{ tag }}
        </v-chip>
      </div>
      <v-btn variant="text" size="small" class="mt-2 text-red" @click="clearTags"
        >Reset all Tags</v-btn
      >
    </div>

    <div class="mt-6">
      <div class="mt-6">
        <div class="text-h6 border-b-md border-primary">Select a Question</div>

        <div class="mt-2" style="max-height: 300px; overflow-y: auto">
          <v-virtual-scroll :items="filteredQuestions" height="300" item-height="56">
            <template #default="{ item: question }">
              <div
                class="d-flex justify-space-between align-center px-4 py-2"
                :class="{ 'bg-grey-lighten-4': selectedQuestion === question._id }"
              >
                <div class="text-truncate me-4">{{ question.questiontext }}</div>
                <v-btn
                  size="small"
                  :variant="selectedQuestion === question._id ? 'tonal' : 'outlined'"
                  color="primary"
                  @click="selectQuestion(question._id)"
                >
                  {{ selectedQuestion === question._id ? '✔ Selected' : 'Select' }}
                </v-btn>
              </div>
            </template>
          </v-virtual-scroll>

          <div
            v-if="filteredQuestions.length === 0"
            class="text-center text-grey text-caption mt-2"
          >
            No Questions found.
          </div>
        </div>
      </div>
    </div>
  </v-card-text>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import questionService from '@/services/question.service'
import catalogService from '@/services/catalog.service'

interface QuestionOption {
  _id: string
  questiontext: string
  questiontags?: string[]
  [key: string]: any
}

interface TagItem {
  tag: string
  count: number
}

// Props definition
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  showInput: {
    type: Boolean,
    default: true
  },
  questionOptions: {
    type: Array as () => QuestionOption[],
    required: true,
    default: () => []
  },
  transition: {
    type: String,
    default: 'correct'
  },
  currentQuestion: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['questionChanged'])

const selectedQuestion = ref('')
const transitionValue = ref(props.transition)
const searchQuery = ref('')
const tags = ref<TagItem[]>([])
const selectedTags = ref<string[]>([])
const isLoadingTags = ref(true)
const scoreValidationError = ref('')
const correctScore = ref<number | null>(null)
const incorrectScore = ref<number | null>(null)
const currentQuestionVar = ref(props.currentQuestion)
const isInCatalogEditPage = () => window.location.pathname.includes('/editCatalog')

const fetchTags = async () => {
  try {
    isLoadingTags.value = true
    const tagData = await questionService.getAllTags()
    tags.value = tagData.data
  } catch (error) {
    console.error('Fehler beim Laden der Tags:', error)
  } finally {
    isLoadingTags.value = false
  }
}

const fetchCurrentScores = async () => {
  try {
    const path = window.location.pathname
    const pathParts = path.split('/')
    const catalogId = pathParts[2]
    const response = await catalogService.editCatalog(catalogId, currentQuestionVar.value)
    correctScore.value = null
    incorrectScore.value = null

    for (const child of response.data.children) {
      if (child.transition === 'correct') {
        correctScore.value = child.score
      } else if (child.transition === 'incorrect') {
        incorrectScore.value = child.score
      }
    }
  } catch (error) {
    console.error('Fehler beim Laden der aktuellen Schwellenwerte:', error)
  }
}

onMounted(() => {
  fetchTags()
  if (isInCatalogEditPage()) {
    fetchCurrentScores()
  }
})
watch(
  () => props.show,
  (newValue) => {
    if (newValue) {
      fetchTags()
      if (isInCatalogEditPage()) {
        fetchCurrentScores()
      }
      scoreValidationError.value = ''
    }
  }
)
const filteredQuestions = computed(() => {
  let filtered = props.questionOptions

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter((question) => question.questiontext.toLowerCase().includes(query))
  }

  if (selectedTags.value.length > 0) {
    filtered = filtered.filter((question) => {
      if (!question.questiontags || !Array.isArray(question.questiontags)) {
        return false
      }

      return selectedTags.value.some((tag) => question.questiontags!.includes(tag))
    })
  }

  return filtered
})

const toggleTag = (tag: string) => {
  if (selectedTags.value.includes(tag)) {
    removeTag(tag)
  } else {
    selectedTags.value.push(tag)
  }
}

const removeTag = (tag: string) => {
  selectedTags.value = selectedTags.value.filter((t) => t !== tag)
}

const clearTags = () => {
  selectedTags.value = []
}

const selectQuestion = (id: string) => {
  selectedQuestion.value = id
  emit('questionChanged', selectedQuestion)
}

const validateScore = () => {
  scoreValidationError.value = ''

  if (isNaN(score) || score < 0 || score > 100) {
    scoreValidationError.value =
      'Bitte geben Sie einen gültigen Prozentwert zwischen 0 und 100 ein.'
    return false
  }
  if (transitionValue.value === 'correct') {
    if (incorrectScore.value !== null && score <= incorrectScore.value) {
      scoreValidationError.value = `Der Schwellenwert für "Richtig" (${score}%) muss höher sein als für "Falsch" (${incorrectScore.value}%).`
      return false
    }
  } else if (transitionValue.value === 'incorrect') {
    if (correctScore.value !== null && score >= correctScore.value) {
      scoreValidationError.value = `Der Schwellenwert für "Falsch" (${score}%) muss niedriger sein als für "Richtig" (${correctScore.value}%).`
      return false
    }
  }

  return true
}

const validateAndConfirm = () => {
  if (!selectedQuestion.value) {
    return
  }

  if (props.showInput && !validateScore()) {
    return
  }

  emit('questionChanged', selectedQuestion.value, transitionValue.value)
}

watch(
  () => props.show,
  (newValue) => {
    if (newValue) {
      selectedQuestion.value = ''
      transitionValue.value = props.transition
      searchQuery.value = ''
      selectedTags.value = []
      scoreValidationError.value = ''
    }
  }
)

watch(
  () => props.transition,
  (newValue) => {
    transitionValue.value = newValue
    scoreValidationError.value = ''
  }
)
</script>
