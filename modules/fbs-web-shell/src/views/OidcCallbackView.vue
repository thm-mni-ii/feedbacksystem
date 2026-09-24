<template>
  <div class="d-flex flex-column align-center justify-center fill-height pt-16">
    <v-progress-circular indeterminate color="primary" size="64" width="5"></v-progress-circular>
    <div class="mt-4 text-h6 font-weight-medium">Anmeldung wird abgeschlossen...</div>
    <div class="text-body-2 text-medium-emphasis">Bitte warten Sie einen Augenblick.</div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAppsStore } from '@/stores/apps'
import { handleCallback } from '@/services/oidc'

const router = useRouter()
const authStore = useAuthStore()
const appsStore = useAppsStore()

onMounted(async () => {
  try {
    const user = await handleCallback()
    authStore.setSession(user)
    await appsStore.fetchVisibleApps()

    const redirectUrl = (user?.state as { redirectUrl?: string } | undefined)?.redirectUrl
    if (redirectUrl && !redirectUrl.startsWith('/oauth2/callback') && redirectUrl !== '/') {
      router.replace(redirectUrl)
    } else if (appsStore.defaultApp) {
      router.replace(`/apps/${appsStore.defaultApp.id}`)
    } else {
      router.replace('/')
    }
  } catch (error) {
    console.error('OIDC callback failed:', error)
    router.replace('/')
  }
})
</script>
