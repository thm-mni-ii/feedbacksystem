<script setup lang="ts">
// import { ref } from 'vue's
import { category } from '../services/category.service.ts'
const course = 'MIB20 Netzwerksicherheit'
const difficultyLabels = {
  1: 'Easy',
  2: 'Medium',
  3: 'Hard'
}
const items = [
  { type: 'subheader', title: 'Current Categories' },
  {
    title: 'TCP/IP',
    difficulty: 2
  },
  {
    title: 'Passwords',
    difficulty: 1
  },
  {
    title: 'Cryptography',
    difficulty: 2
  }
]
</script>

<template>
  <v-form class="mt-16">
    <v-sheet
      class="d-flex align-center justify-center flex-wrap flex-column text-center mx-auto my-14 px-4"
      elevation="4"
      height="auto"
      width="80%"
      rounded
    >
      <v-responsive class="mx-auto" width="85%">
        <h2 class="text-h4 my-8 font-weight-black text-primary">
          Add new Category to {{ course }}
        </h2>
        <div class="d-flex flex-row">
          <v-select label="Course" variant="solo-filled" class="m-4 pl-2"></v-select>
        </div>
        <v-slider
          class="pr-4"
          show-ticks="always"
          :ticks="difficultyLabels"
          tick-size="4"
          width="90%"
          label="Difficulty"
          thumb-label
          step="1"
          min="1"
          max="3"
        ></v-slider>

        <v-text-field auto-grow label="Category Name" hide-details required></v-text-field>
      </v-responsive>
      <v-sheet class="d-flex">
        <v-list :items="items"></v-list>
      </v-sheet>
      <v-btn variant="outlined" class="mx-auto my-8" type="submit" prepend-icon="mdi-check-circle">
        <template v-slot:prepend>
          <v-icon color="success"></v-icon>
        </template>
        Submit</v-btn
      >
    </v-sheet>
  </v-form>
</template>
