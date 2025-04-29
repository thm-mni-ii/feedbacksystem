<template>
  <div class="course-container">
    <h1 class="text-h4 font-weight-bold text-center mb-4">Meine Kurse</h1>

    <!-- Loading State -->
    <v-card v-if="loading" elevation="2" class="pa-4 mx-auto" max-width="600">
      <div class="d-flex align-center justify-center">
        <v-progress-circular indeterminate color="primary" class="mr-2"></v-progress-circular>
        <span>Lade Kurse...</span>
      </div>
    </v-card>

    <!-- Error State -->
    <v-alert v-else-if="error" type="error" class="mx-auto" max-width="600">
      <strong>Fehler beim Laden:</strong> {{ error }}
    </v-alert>

    <!-- Course List -->
    <v-card v-else elevation="3" class="mx-auto" max-width="600">
      <v-card-title class="text-subtitle-1 bg-primary text-white">
        <v-icon left>mdi-school</v-icon>
        Meine Kurse
      </v-card-title>

      <v-list>
        <v-list-item
          v-for="courseId in courses"
          :key="courseId"
          class="course-item"
          @click="navigateToCatalogManagement(courseId)"
        >
          <v-list-item-avatar>
            <v-icon color="primary">mdi-book-open-variant</v-icon>
          </v-list-item-avatar>

          <v-list-item-content>
            <v-list-item-title class="text-subtitle-1 font-weight-medium">
              Kurs {{ courseId }}
            </v-list-item-title>
          </v-list-item-content>

          <v-list-item-action>
            <v-btn icon>
              <v-icon color="grey">mdi-chevron-right</v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>

        <!-- Empty State -->
        <v-list-item v-if="courses.length === 0">
          <v-list-item-content class="text-center py-4">
            <v-icon x-large color="grey lighten-1" class="mb-2">mdi-school-outline</v-icon>
            <div class="text-subtitle-1 grey--text">Keine Kurse gefunden</div>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-card>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import catalogService from '@/services/catalog.service'

// Reactive state variables
const courses = ref([])
const loading = ref(true)
const error = ref(null)

// Router instance
const router = useRouter()

// Fetch courses from the API
const fetchCourses = async () => {
  try {
    const response = await catalogService.getAccessibleCourses()
    console.log(response)
    courses.value = response.data
  } catch (err) {
    error.value = err.message || 'Fehler beim Laden der Kurse'
  } finally {
    loading.value = false
  }
}

// Navigate to catalog management
const navigateToCatalogManagement = (courseId) => {
  router.push(`/catalogManagement/${courseId}`)
}

// Fetch courses when the component is mounted
onMounted(fetchCourses)
</script>

<style scoped>
.course-container {
  padding: 20px;
}

.course-item {
  transition: background-color 0.2s;
}

.course-item:hover {
  background-color: rgba(0, 0, 0, 0.05);
  cursor: pointer;
}
</style>
