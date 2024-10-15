<template>
  <v-sheet class="pa-10">
    <h1>{{ catalog.name }}</h1>
  </v-sheet>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type Catalog from '@/model/Catalog'
import { useRoute } from 'vue-router'
import catalogService from '@/services/catalog.service'

const route = useRoute()

const catalog = ref<Catalog>({} as Catalog)

const catalogId = ref<string>(route.params.catalogId as string)

onMounted(() => {
  console.log('CatalogId:', catalogId.value)
  getCatalog()
})

const getCatalog = () => {
  catalogService.getCatalog(catalogId.value).then((response) => {
    catalog.value = response.data as Catalog
    console.log(catalog.value)
  })
}
</script>

<style lang="scss"></style>
