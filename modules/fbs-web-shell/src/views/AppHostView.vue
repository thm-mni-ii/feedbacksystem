<template>
  <div class="fbs-app-host-view">
    <template v-if="appsStore.loading">
      <div class="d-flex flex-column align-center justify-center fill-height pt-16">
        <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
        <span class="mt-4 text-subtitle-1">Anwendungskatalog wird geladen...</span>
      </div>
    </template>

    <template v-else-if="currentApp">
      <FbsAppHost
        :provider-id="currentApp.id"
        :src="appSrc"
        :app-title="currentApp.title"
      />
    </template>

    <template v-else>
      <v-container class="pt-12">
        <v-card max-width="600" class="mx-auto text-center pa-6" elevation="2">
          <v-icon icon="mdi-alert-circle-outline" color="warning" size="64" class="mb-4"></v-icon>
          <v-card-title class="text-h5 font-weight-bold">Anwendung nicht gefunden</v-card-title>
          <v-card-text class="text-body-1 mt-2">
            Die angeforderte Fachanwendung <code>{{ providerId }}</code> ist entweder nicht registriert, inaktiv oder Sie verfügen nicht über die erforderlichen Berechtigungen.
          </v-card-text>
          <v-card-actions class="justify-center mt-4">
            <v-btn
              color="primary"
              variant="elevated"
              prepend-icon="mdi-home"
              @click="goToDefault"
            >
              Zur Hauptanwendung
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-container>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAppsStore } from '@/stores/apps'
import FbsAppHost from '@/components/FbsAppHost.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const appsStore = useAppsStore()

const providerId = computed(() => route.params.providerId as string)

const subPath = computed(() => {
  const p = route.params.subPath
  if (Array.isArray(p)) return p.join('/')
  return (p as string) || ''
})

const currentApp = computed(() => {
  return appsStore.apps.find((app) => app.id === providerId.value)
})

const appSrc = computed(() => {
  if (!currentApp.value) return ''
  const baseUrl = currentApp.value.url.replace(/\/+$/, '')
  const sub = subPath.value ? (subPath.value.startsWith('/') ? subPath.value : `/${subPath.value}`) : ''
  return baseUrl + sub
})

watch(
  providerId,
  (newId) => {
    appsStore.setActiveApp(newId)
  },
  { immediate: true }
)

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    await authStore.login(route.fullPath)
    return
  }
  if (appsStore.apps.length === 0) {
    await appsStore.fetchVisibleApps()
  }
})

function goToDefault() {
  if (appsStore.defaultApp) {
    router.push(`/apps/${appsStore.defaultApp.id}`)
  } else {
    router.push('/')
  }
}
</script>

<style scoped>
.fbs-app-host-view {
  width: 100%;
  height: calc(100vh - 64px);
  overflow: hidden;
}
</style>
