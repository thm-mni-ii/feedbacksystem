<template>
  <v-data-table :items="items" class="mt-16"></v-data-table>
</template>

<script setup lang="ts">
import catService from '../services/cat.service'

catService.postCat().then((res) => console.log(res.data))

const items = [
  {
    name: 'African Elephant',
    species: 'Loxodonta africana',
    diet: 'Herbivore',
    habitat: 'Savanna, Forests'
  },
  {
    name: 'African Wild Dog',
    species: 'Lycaon pictus',
    diet: 'Carnivore',
    habitat: 'Savanna'
  },
  {
    name: 'Black Rhinoceros',
    species: 'Diceros bicornis',
    diet: 'Herbivore',
    habitat: 'Savanna, Forests'
  },
  {
    name: 'Cheetah',
    species: 'Acinonyx jubatus',
    diet: 'Carnivore',
    habitat: 'Savanna'
  },
  {
    name: 'Giraffe',
    species: 'Giraffa camelopardalis',
    diet: 'Herbivore',
    habitat: 'Savanna'
  },
  {
    name: 'Hippopotamus',
    species: 'Hippopotamus amphibius',
    diet: 'Herbivore',
    habitat: 'Rivers, Lakes'
  },
  {
    name: 'Leopard',
    species: 'Panthera pardus',
    diet: 'Carnivore',
    habitat: 'Savanna, Forests'
  },
  {
    name: 'Lion',
    species: 'Panthera leo',
    diet: 'Carnivore',
    habitat: 'Savanna'
  },
  {
    name: 'Plains Zebra',
    species: 'Equus quagga',
    diet: 'Herbivore',
    habitat: 'Savanna'
  },
  {
    name: 'White Rhinoceros',
    species: 'Ceratotherium simum',
    diet: 'Herbivore',
    habitat: 'Savanna'
  }
]
</script>

<style scoped lang="scss"></style>
