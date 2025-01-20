<template>
  <div>
    <h1>Dynamic Buttons</h1>
    <div v-if="loading">Loading buttons...</div>
    <div v-else-if="error">Error loading buttons: {{ error }}</div>
    <div v-else>
      <v-list class="mx-auto" max-width="400">
        <v-list-item v-for="course in courses" :key="course.id" :v-bind="course">
          <v-card class="mx-auto text-center px-8 py-4" @click="editCatalog(course.id)">
            {{ course.name }}
          </v-card>
        </v-list-item>
      </v-list>
    </div>
  </div>
</template>

<script>
import { onMounted } from 'vue';
import catalogService from '@/services/catalog.service';
import { ref } from 'vue';


export default {
  setup() {
    const courses = ref([]);
    const loading = ref(true);
    const error = ref(null);

    const fetchButtons = async () => {
      try {
        console.log("DU DUMMER ASFF");
        const response = await catalogService.getCatalogsFromCourse(187);
        console.log(response.data);
        courses.value = response.data;
      } catch (err) {
        error.value = err.message || "Failed to fetch buttons";
      } finally {
        loading.value = false;
      }
    };

    onMounted(async () => {
      await fetchButtons();
    });
    
    const editCatalog = (course) => {
        try {
            window.location.href =`http://localhost:8085/EditCatalogInformation/${course}`;
        } catch (err) {
            console.log(err);
        }
    };
    return {
      courses,
      loading,
      error,
      fetchButtons,
      editCatalog,
    };
  },
};
</script>

<style>
button {
  margin: 5px;
  padding: 10px 15px;
  font-size: 16px;
}
</style>

