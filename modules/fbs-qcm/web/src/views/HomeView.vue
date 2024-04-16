<template>
  <DialogConfirmVue ref="dialogConfirm" />

  <h1>Home</h1>

  <v-card class="mx-auto" prepend-icon="$vuetify" subtitle="The #1 Vue UI Library" width="400">
    <template #title>
      <span class="font-weight-black">Welcome to Vuetify</span>
    </template>

    <v-card-text class="bg-surface-light pt-4">
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Commodi, ratione debitis quis est
      labore voluptatibus! Eaque cupiditate minima, at placeat totam, magni doloremque veniam neque
      porro libero rerum unde voluptatem!
    </v-card-text>

    <v-card-actions>
      <v-btn color="primary" @click="click">Open Dialog</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type modelTest from '../model/modelTest'

import DialogConfirmVue from '../dialog/DialogConfirm.vue'

const dialogConfirm = ref<typeof DialogConfirmVue>()

const model = ref<modelTest>({} as modelTest)

const click = () => {
  if (dialogConfirm.value) {
    dialogConfirm.value.openDialog('Title', 'Message', 'Confirm').then((result: boolean) => {
      if(result) {
        console.log('Delete')
      } else {
        console.log('Cancel')
      }
    })
  }
}

model.value.id = 1
</script>

<style scoped lang="scss"></style>
