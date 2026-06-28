<template>
  <section class="header" :style="headerStyle">
    <v-container fluid class="px-4 py-2">
      <div class="header-bar d-flex align-center justify-space-between ga-3">
        <div class="d-flex align-center ga-3 min-w-0">
          <v-avatar size="34" :style="avatarStyle" class="header-avatar">
            <v-icon size="18">mdi-brain</v-icon>
          </v-avatar>
          <div class="min-w-0">
            <h1 class="text-h6 font-weight-bold mb-0 text-truncate">Kompetenz Graph</h1>
            <p class="text-caption header-subtitle mb-0 text-truncate">
              Kurs-Kompetenzmodell verwalten
            </p>
          </div>
        </div>
        <v-chip size="small" variant="flat" class="header-chip">Skill Map</v-chip>
      </div>
    </v-container>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { skillGraphPalette } from '@/plugins/vuetify'

const headerStyle = computed(() => ({
  background: `linear-gradient(135deg, ${skillGraphPalette.headerStart}, ${skillGraphPalette.headerEnd})`,
  color: skillGraphPalette.headerText
}))

const avatarStyle = computed(() => ({
  backgroundColor: skillGraphPalette.headerAvatar
}))
</script>

<style scoped>
.header {
  border-bottom: 1px solid rgba(var(--v-theme-app-text-primary), 0.1);
}

.header-bar {
  min-height: 56px;
}

.header-avatar {
  box-shadow: 0 8px 18px rgba(var(--v-theme-primary), 0.2);
}

.header-subtitle {
  opacity: 0.78;
}

.header-chip {
  background: rgba(var(--v-theme-surface), 0.88);
}
</style>
