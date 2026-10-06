<template>
  <div class="d-flex flex-column align-center justify-center fill-height pt-16">
    <template v-if="!errorMessage">
      <v-progress-circular indeterminate color="primary" size="64" width="5"></v-progress-circular>
      <div class="mt-4 text-h6 font-weight-medium">Anmeldung wird abgeschlossen...</div>
      <div class="text-body-2 text-medium-emphasis">Bitte warten Sie einen Augenblick.</div>
    </template>

    <template v-else>
      <v-card class="pa-6 text-center rounded-lg" max-width="460" elevation="3">
        <v-avatar color="error-lighten-4" size="64" class="mb-4">
          <v-icon color="error" size="36">mdi-alert-circle-outline</v-icon>
        </v-avatar>
        <div class="text-h6 font-weight-bold text-error mb-2">Anmeldung fehlgeschlagen</div>
        <div class="text-body-2 text-medium-emphasis mb-6">
          {{ errorMessage }}
        </div>
        <div class="d-flex flex-column gap-2">
          <v-btn
            color="primary"
            variant="flat"
            block
            prepend-icon="mdi-refresh"
            @click="handleRetryLogin"
          >
            Erneut anmelden
          </v-btn>
          <v-btn
            color="secondary"
            variant="text"
            block
            class="mt-2"
            href="/login"
          >
            Direkt zur Login-Seite
          </v-btn>
        </div>
      </v-card>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAppsStore } from '@/stores/apps'
import { handleCallback, handleSilentCallback, handlePopupCallback } from '@/services/oidc'

const router = useRouter()
const authStore = useAuthStore()
const appsStore = useAppsStore()
const errorMessage = ref<string | null>(null)

async function handleRetryLogin() {
  errorMessage.value = null
  await authStore.login('/')
}

onMounted(async () => {
  // Case 1: Silent renew inside hidden iframe
  if (typeof window !== 'undefined' && window.self !== window.top) {
    try {
      await handleSilentCallback()
    } catch (e) {
      console.warn('Silent renew callback error:', e)
    }
    return
  }

  // Case 2: Popup login callback
  if (typeof window !== 'undefined' && window.opener && window.opener !== window) {
    try {
      await handlePopupCallback()
    } catch (e) {
      console.warn('Popup login callback error:', e)
    } finally {
      window.close()
    }
    return
  }

  // Case 3: Standard full redirect callback in main window
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
    errorMessage.value = (error as Error)?.message || 'Die Authentifizierung konnte nicht abgeschlossen werden. Bitte versuchen Sie es erneut.'
  }
})
</script>
