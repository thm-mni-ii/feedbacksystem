<template>
  <div>
    <h1>CatalogSessionView</h1>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

onMounted(() => {
  console.log(route.params.catalogId)
})
</script>

<style scoped lang="scss"></style>
