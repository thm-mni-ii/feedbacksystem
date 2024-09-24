<script setup lang="ts">
import { ref } from 'vue'
import type Catalog from '@/model/Catalog'

const editCatalogDialog = ref(false)

const catalog = ref<Catalog>({} as Catalog)
const isNew = ref<boolean>(true)

// Promise resolve
const resolvePromise = ref<Function | undefined>(undefined)

const openDialog = (courseId: Number, editCatalog?: Catalog) => {
  if (editCatalog !== undefined) {
    catalog.value = editCatalog
    isNew.value = false
  } else {
    isNew.value = true
  }
  editCatalogDialog.value = true

  return new Promise((resolve) => {
    resolvePromise.value = resolve
  })
}

const _confirm = () => {
  editCatalogDialog.value = false
  resolvePromise.value && resolvePromise.value(true)
}

const _cancel = () => {
  editCatalogDialog.value = false
  resolvePromise.value && resolvePromise.value(false)
}

// define expose
defineExpose({
  openDialog
})
</script>

<template>
  <v-dialog v-model="editCatalogDialog">
    <v-card>
      <v-card-title>
        <span v-if="isNew">Create Catalog</span>
        <span v-else>Edit Catalog</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12">
              <v-text-field v-model="catalog.name" label="Name"></v-text-field>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="_cancel">Cancel</v-btn>
        <v-btn @click="_confirm">Create</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
