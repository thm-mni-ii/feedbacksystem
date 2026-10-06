<template>
  <v-dialog
    :model-value="authStore.isSessionExpired"
    persistent
    max-width="480"
    contained-scrim
  >
    <v-card class="rounded-lg pa-2">
      <v-card-item>
        <template #prepend>
          <v-avatar color="warning-lighten-4" size="48" class="mr-2">
            <v-icon color="warning" size="28">mdi-clock-alert-outline</v-icon>
          </v-avatar>
        </template>
        <v-card-title class="text-h6 font-weight-bold">
          Sitzung abgelaufen
        </v-card-title>
        <v-card-subtitle>
          Ihre Authentifizierungssitzung ist abgelaufen.
        </v-card-subtitle>
      </v-card-item>

      <v-card-text class="pt-2 text-body-1">
        Bitte melden Sie sich erneut an. Ihre aktuelle Ansicht und alle geöffneten Anwendungen
        bleiben erhalten, sodass keine ungespeicherten Daten verloren gehen.
      </v-card-text>

      <v-card-actions class="d-flex flex-column gap-2 px-4 pb-4">
        <v-btn
          color="primary"
          variant="flat"
          block
          size="large"
          prepend-icon="mdi-login"
          :loading="loggingIn"
          @click="handlePopupRelogin"
        >
          Jetzt neu anmelden
        </v-btn>

        <v-btn
          color="medium-emphasis"
          variant="text"
          block
          size="small"
          class="mt-1"
          @click="handleRedirectLogin"
        >
          Vollständige Weiterleitung zur Anmeldeseite
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const loggingIn = ref(false)

async function handlePopupRelogin() {
  loggingIn.value = true
  try {
    const success = await authStore.reloginInPlace()
    if (!success) {
      console.warn('Popup login did not succeed, fallback available.')
    }
  } finally {
    loggingIn.value = false
  }
}

async function handleRedirectLogin() {
  const currentPath = router.currentRoute.value.fullPath
  await authStore.login(currentPath)
}
</script>
