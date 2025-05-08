<template>
  <div class="catalog-container">
    <h1 class="text-h4 font-weight-bold text-center mb-4">Katalogübersicht</h1>

    <!-- Loading State -->
    <v-card v-if="loading" elevation="2" class="pa-4 mx-auto" max-width="600">
      <div class="d-flex align-center justify-center">
        <v-progress-circular indeterminate color="primary" class="mr-2"></v-progress-circular>
        <span>Lade Kataloge...</span>
      </div>
    </v-card>

    <!-- Error State -->
    <v-alert v-else-if="error" type="error" class="mx-auto" max-width="600">
      <strong>Fehler beim Laden:</strong> {{ error }}
    </v-alert>

    <!-- Catalog List -->
    <v-card v-else elevation="3" class="mx-auto" max-width="600">
      <v-card-title class="text-subtitle-1 bg-primary text-white">
        <v-icon left>mdi-book-multiple</v-icon>
        Verfügbare Kataloge
      </v-card-title>

      <v-list two-line>
        <v-list-item
          v-for="catalog in catalogs"
          :key="catalog.id"
          class="catalog-item"
          @click="openCatalog(catalog.id)"
        >
          <v-list-item-avatar>
            <v-icon color="primary">mdi-book-open-variant</v-icon>
          </v-list-item-avatar>

          <v-list-item-content>
            <v-list-item-title class="text-subtitle-1 font-weight-medium">
              {{ catalog.name }}
            </v-list-item-title>
            <v-list-item-subtitle v-if="catalog.description">
              {{ catalog.description }}
            </v-list-item-subtitle>
          </v-list-item-content>

          <v-list-item-action>
            <v-btn icon>
              <v-icon color="grey">mdi-chevron-right</v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>

        <!-- Empty State -->
        <v-list-item v-if="catalogs.length === 0">
          <v-list-item-content class="text-center py-4">
            <v-icon x-large color="grey lighten-1" class="mb-2">mdi-book-off</v-icon>
            <div class="text-subtitle-1 grey--text">Keine Kataloge gefunden</div>
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
const catalogs = ref([])
const loading = ref(true)
const error = ref(null)

// Router instance
const router = useRouter()

// Fetch catalogs from the API
const fetchCatalogs = async () => {
  try {
    const response = await catalogService.getCatalogs(187)
    catalogs.value = response.data
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

// Navigate to catalog editing
const openCatalog = (catalogId) => {
  console.log('Katalog geöffnet: ', catalogId)
  router.push(`/editCatalog/${catalogId}/open`)
}

// Fetch catalogs when the component is mounted
onMounted(fetchCatalogs)
</script>

<style scoped>
.catalog-container {
  padding: 20px;
}

.catalog-item {
  transition: background-color 0.2s;
}

.catalog-item:hover {
  background-color: rgba(0, 0, 0, 0.05);
  cursor: pointer;
}
</style>
