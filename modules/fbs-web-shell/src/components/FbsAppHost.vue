<template>
  <div class="fbs-app-host-container">
    <!-- Loading Overlay -->
    <v-overlay
      :model-value="loading"
      contained
      class="align-center justify-center"
      scrim="surface"
      opacity="0.8"
    >
      <div class="text-center">
        <v-progress-circular
          indeterminate
          color="primary"
          size="64"
          width="5"
        ></v-progress-circular>
        <div class="mt-4 text-subtitle-1 font-weight-medium">
          Lade {{ appTitle || 'Anwendung' }}...
        </div>
      </div>
    </v-overlay>

    <!-- Error Banner -->
    <v-alert
      v-if="error"
      type="error"
      variant="tonal"
      class="ma-4"
      closable
      @click:close="error = null"
    >
      <v-alert-title>Verbindungsfehler</v-alert-title>
      {{ error }}
      <template #append>
        <v-btn
          color="error"
          variant="outlined"
          size="small"
          class="ml-2"
          @click="reloadIframe"
        >
          Erneut versuchen
        </v-btn>
      </template>
    </v-alert>

    <!-- Embedded Iframe -->
    <iframe
      ref="iframeRef"
      :src="src"
      :title="appTitle || 'Embedded Application'"
      class="fbs-embedded-iframe"
      allow="clipboard-read; clipboard-write; camera; microphone"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads"
      @load="onIframeLoad"
      @error="onIframeError"
    ></iframe>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'

const props = defineProps<{
  src: string
  providerId: string
  appTitle?: string
}>()

const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()

const iframeRef = ref<HTMLIFrameElement | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
let loadTimeout: ReturnType<typeof setTimeout> | null = null

function reloadIframe() {
  error.value = null
  loading.value = true
  if (iframeRef.value) {
    iframeRef.value.src = props.src
  }
}

function onIframeLoad() {
  if (loadTimeout) clearTimeout(loadTimeout)
  // Give a brief moment for handshake or fallback hide
  setTimeout(() => {
    loading.value = false
  }, 400)
}

function onIframeError() {
  if (loadTimeout) clearTimeout(loadTimeout)
  loading.value = false
  error.value = `Die Anwendung "${props.appTitle || props.providerId}" konnte nicht geladen werden (${props.src}).`
}

function handlePostMessage(event: MessageEvent) {
  const data = event.data
  if (!data || typeof data !== 'object') return

  const targetWindow = iframeRef.value?.contentWindow
  if (!targetWindow || event.source !== targetWindow) return

  switch (data.type) {
    case 'FBS_INIT_HANDSHAKE': {
      loading.value = false
      targetWindow.postMessage(
        {
          type: 'FBS_HANDSHAKE_ACK',
          theme: themeStore.isDark ? 'dark' : 'light',
          locale: 'de',
          hostOrigin: window.location.origin,
          providerId: props.providerId
        },
        '*'
      )
      // Send token right away if available
      if (authStore.token) {
        targetWindow.postMessage(
          {
            type: 'FBS_AUTH_TOKEN_RESPONSE',
            accessToken: authStore.token,
            expiresIn: 3600
          },
          '*'
        )
      }
      break
    }

    case 'FBS_REQUEST_AUTH_TOKEN': {
      targetWindow.postMessage(
        {
          type: 'FBS_AUTH_TOKEN_RESPONSE',
          accessToken: authStore.token || '',
          expiresIn: 3600
        },
        '*'
      )
      break
    }

    case 'FBS_NAVIGATE': {
      if (data.path) {
        if (data.external) {
          window.open(data.path, '_blank')
        } else {
          router.push(data.path)
        }
      }
      break
    }
  }
}

watch(
  () => props.src,
  () => {
    loading.value = true
    error.value = null
    if (loadTimeout) clearTimeout(loadTimeout)
    loadTimeout = setTimeout(() => {
      loading.value = false
    }, 15000)
  }
)

watch(
  () => themeStore.isDark,
  (isDark) => {
    const targetWindow = iframeRef.value?.contentWindow
    if (targetWindow) {
      targetWindow.postMessage(
        {
          type: 'FBS_THEME_CHANGED',
          theme: isDark ? 'dark' : 'light'
        },
        '*'
      )
    }
  }
)

watch(
  () => authStore.token,
  (token) => {
    const targetWindow = iframeRef.value?.contentWindow
    if (targetWindow && token) {
      targetWindow.postMessage(
        {
          type: 'FBS_AUTH_TOKEN_RESPONSE',
          accessToken: token,
          expiresIn: 3600
        },
        '*'
      )
    }
  }
)

onMounted(() => {
  window.addEventListener('message', handlePostMessage)
  loadTimeout = setTimeout(() => {
    loading.value = false
  }, 15000)
})

onUnmounted(() => {
  if (loadTimeout) clearTimeout(loadTimeout)
  window.removeEventListener('message', handlePostMessage)
})
</script>

<style scoped>
.fbs-app-host-container {
  position: relative;
  width: 100%;
  height: calc(100vh - 64px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: rgb(var(--v-theme-background));
}

.fbs-embedded-iframe {
  width: 100%;
  height: 100%;
  border: none;
  flex: 1 1 auto;
}
</style>
