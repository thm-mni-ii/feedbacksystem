<template>
  <div>
    <v-alert type="info" variant="tonal" density="comfortable" class="mb-4">
      Bei einer Zuordnungsaufgabe legst du zuerst die
      <strong>Kategorien</strong>
      fest, in die einsortiert werden kann. Danach fügst du die
      <strong>Elemente</strong>
      hinzu und wählst für jedes Element die dazu passende Kategorie aus – das ist die Lösung der
      Aufgabe.
    </v-alert>

    <div class="d-flex align-center mb-1">
      <v-avatar size="24" color="primary" class="mr-2">
        <span class="text-caption font-weight-bold">1</span>
      </v-avatar>
      <h3 class="text-subtitle-1">Kategorien</h3>
    </div>
    <p class="text-caption text-medium-emphasis mb-3">
      Die Kategorien sind die möglichen Ziele, denen ein Element zugeordnet werden kann, z. B.
      „richtig“ / „falsch“ oder Begriffe und ihre Definitionen.
    </p>

    <v-card
      v-for="(category, index) in configuration.categories"
      :key="category.id"
      variant="outlined"
      class="d-flex align-center ga-2 pa-2 mb-2"
    >
      <v-avatar size="28" color="primary" variant="tonal">
        <span class="text-caption">{{ index + 1 }}</span>
      </v-avatar>
      <v-text-field
        v-model="category.label"
        :label="`Kategorie ${index + 1}`"
        density="compact"
        hide-details
      />
      <v-btn
        icon="mdi-delete-outline"
        variant="text"
        density="comfortable"
        :disabled="configuration.categories.length <= 1"
        @click="removeCategory(index)"
      >
        <v-icon icon="mdi-delete-outline" />
        <v-tooltip activator="parent" location="top">
          {{
            configuration.categories.length <= 1
              ? 'Es muss mindestens eine Kategorie geben'
              : 'Kategorie entfernen'
          }}
        </v-tooltip>
      </v-btn>
    </v-card>
    <v-btn variant="tonal" prepend-icon="mdi-plus" @click="addCategory">Kategorie hinzufügen</v-btn>

    <v-divider class="my-6" />

    <div class="d-flex align-center mb-1">
      <v-avatar size="24" color="primary" class="mr-2">
        <span class="text-caption font-weight-bold">2</span>
      </v-avatar>
      <h3 class="text-subtitle-1">Zuzuordnende Elemente</h3>
    </div>
    <p class="text-caption text-medium-emphasis mb-3">
      Jedes Element muss der richtigen Kategorie zugewiesen werden, um die Aufgabe korrekt zu lösen.
    </p>

    <v-alert
      v-if="hasNoLabeledCategories"
      type="warning"
      variant="tonal"
      density="compact"
      class="mb-3"
    >
      Bitte zuerst mindestens eine Kategorie mit Bezeichnung anlegen, bevor du Elemente zuordnest.
    </v-alert>

    <v-card
      v-for="(item, index) in configuration.items"
      :key="item.id"
      variant="outlined"
      class="d-flex align-center ga-2 pa-2 mb-2"
    >
      <v-avatar size="28" color="secondary" variant="tonal">
        <span class="text-caption">{{ index + 1 }}</span>
      </v-avatar>
      <v-text-field
        v-model="item.text"
        :label="`Element ${index + 1}`"
        density="compact"
        hide-details
      />
      <v-select
        v-model="item.correctCategoryId"
        :items="configuration.categories"
        item-title="label"
        item-value="id"
        item-color="primary"
        label="Gehört zu Kategorie"
        placeholder="Kategorie wählen"
        density="compact"
        hide-details
        :disabled="hasNoLabeledCategories"
      />
      <v-btn
        icon="mdi-delete-outline"
        variant="text"
        density="comfortable"
        @click="removeItem(index)"
      >
        <v-icon icon="mdi-delete-outline" />
        <v-tooltip activator="parent" location="top">Element entfernen</v-tooltip>
      </v-btn>
    </v-card>
    <v-btn
      variant="tonal"
      prepend-icon="mdi-plus"
      :disabled="hasNoLabeledCategories"
      @click="addItem"
    >
      Element hinzufügen
    </v-btn>

    <template v-if="configuration.items.length > 0">
      <v-divider class="my-6" />
      <h3 class="text-subtitle-1 mb-2">Vorschau der Zuordnung</h3>
      <v-row dense>
        <v-col v-for="group in preview" :key="group.categoryId" cols="12" sm="6" md="4">
          <v-card variant="tonal" class="pa-2 h-100">
            <div class="text-caption font-weight-bold mb-1">
              {{ group.label || 'Unbenannte Kategorie' }}
            </div>
            <div v-if="group.items.length === 0" class="text-caption text-medium-emphasis">
              Keine Elemente zugeordnet
            </div>
            <v-chip
              v-for="item in group.items"
              :key="item.id"
              size="small"
              class="mr-1 mb-1"
              variant="elevated"
            >
              {{ item.text || 'Unbenanntes Element' }}
            </v-chip>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import type Question from '@/model/Question'
import type { Matching } from '@/model/questionTypes/Matching'

const props = defineProps<{
  question: Question
}>()

const emit = defineEmits<{
  (event: 'update', question: Question): void
}>()

const configuration = computed(() => props.question.questionConfiguration as Matching)

// Solange keine Kategorie eine Bezeichnung hat, ergibt eine Zuordnung von
// Elementen keinen Sinn (die Auswahl wäre leer) – daher wird der
// Elemente-Bereich in diesem Fall deaktiviert und der Nutzer entsprechend
// hingewiesen.
const hasNoLabeledCategories = computed(
  () => !configuration.value.categories.some((category) => category.label?.trim())
)

// Gruppiert die Elemente nach Kategorie, um dem Nutzer eine Vorschau der
// finalen Zuordnung zu geben (hilft, Tippfehler bei der Auswahl zu erkennen).
const preview = computed(() =>
  configuration.value.categories.map((category) => ({
    categoryId: category.id,
    label: category.label,
    items: configuration.value.items.filter((item) => item.correctCategoryId === category.id)
  }))
)

function update(): void {
  emit('update', props.question)
}

function addCategory(): void {
  const id = crypto.randomUUID()
  configuration.value.categories.push({ id, label: '' })
  if (configuration.value.items.length === 0) {
    configuration.value.items.push({ id: crypto.randomUUID(), text: '', correctCategoryId: id })
  }
  update()
}

function removeCategory(index: number): void {
  if (configuration.value.categories.length <= 1) return

  const [removed] = configuration.value.categories.splice(index, 1)
  const fallbackCategoryId = configuration.value.categories[0].id
  configuration.value.items.forEach((item) => {
    if (item.correctCategoryId === removed.id) {
      item.correctCategoryId = fallbackCategoryId
    }
  })
  update()
}

function addItem(): void {
  configuration.value.items.push({
    id: crypto.randomUUID(),
    text: '',
    correctCategoryId: configuration.value.categories[0]?.id ?? ''
  })
  update()
}

function removeItem(index: number): void {
  configuration.value.items.splice(index, 1)
  update()
}

watch(configuration, update, { deep: true })
</script>
