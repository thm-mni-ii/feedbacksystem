<template>
  <div>
    <h1>Katalogübersicht</h1>
    <div v-if="loading">Lade Kataloge...</div>
    <div v-else-if="error">Fehler beim Laden: {{ error }}</div>
    <div v-else>
      <v-list class="mx-auto" max-width="400">
        <v-list-item v-for="catalog in catalogs" :key="catalog.id">
          <v-list-item-content>
            <v-list-item-title>
              <a href="#" @click.prevent="openCatalog(catalog.id)">{{ catalog.name }}</a>
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </div>
  </div>
</template>

<script>
import { onMounted, ref } from 'vue';
import catalogService from '@/services/catalog.service';

export default {
  setup() {
    const catalogs = ref([]);
    const loading = ref(true);
    const error = ref(null);

    const fetchCatalogs = async () => {
      try {
        const response = await catalogService.getCatalogs(187);
        catalogs.value = response.data;
      } catch (err) {
        error.value = err.message;
      } finally {
        loading.value = false;
      }
    };

    const openCatalog = (catalogId) => {
      console.log("Katalog geöffnet: ", catalogId);
      window.location.href =`http://localhost:8085/editCatalog/${catalogId}/open`;
    };

    onMounted(fetchCatalogs);

    return { catalogs, loading, error, openCatalog };
  }
};
</script>
