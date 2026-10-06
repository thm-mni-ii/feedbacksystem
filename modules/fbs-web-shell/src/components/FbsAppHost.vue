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
      :src="currentIframeSrc"
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
import { useAppsStore } from '@/stores/apps'
import { useThemeStore } from '@/stores/theme'
import { useLocaleStore } from '@/stores/locale'
import {
  getAudienceToken,
  getCachedAudienceToken,
  getRemainingValiditySeconds
} from '@/services/audienceToken'

const props = defineProps<{
  src: string
  providerId: string
  appTitle?: string
}>()

const router = useRouter()
const authStore = useAuthStore()
const appsStore = useAppsStore()
const themeStore = useThemeStore()
const localeStore = useLocaleStore()

const iframeRef = ref<HTMLIFrameElement | null>(null)
const currentIframeSrc = ref<string>(props.src)
const loading = ref(true)
const error = ref<string | null>(null)
let loadTimeout: ReturnType<typeof setTimeout> | null = null
let proactiveRenewInterval: ReturnType<typeof setInterval> | null = null
let lastEmittedPath: string | null = null

function reloadIframe() {
  error.value = null
  loading.value = true
  currentIframeSrc.value = props.src
  if (iframeRef.value) {
    iframeRef.value.src = props.src
  }
}

function onIframeLoad() {
  if (loadTimeout) clearTimeout(loadTimeout)
  setTimeout(() => {
    loading.value = false
  }, 400)
}

function onIframeError() {
  if (loadTimeout) clearTimeout(loadTimeout)
  loading.value = false
  error.value = `Die Anwendung "${props.appTitle || props.providerId}" konnte nicht geladen werden (${props.src}).`
}

async function sendAudienceToken(forceRefresh = false) {
  const targetWindow = iframeRef.value?.contentWindow
  if (!targetWindow) return

  try {
    const audienceToken = await getAudienceToken(props.providerId, forceRefresh)
    const cached = getCachedAudienceToken(props.providerId)
    const expiresIn = cached ? Math.max(30, Math.floor((cached.expiresAt - Date.now()) / 1000)) : 3600

    targetWindow.postMessage(
      {
        source: 'FBS_HOST',
        type: 'FBS_AUTH_TOKEN_RESPONSE',
        accessToken: audienceToken || authStore.token || '',
        tokenType: 'Bearer',
        expiresIn
      },
      '*'
    )
  } catch (err) {
    console.warn(`Failed to dispatch audience token to provider '${props.providerId}':`, err)
    if (authStore.token) {
      targetWindow.postMessage(
        {
          source: 'FBS_HOST',
          type: 'FBS_AUTH_TOKEN_RESPONSE',
          accessToken: authStore.token,
          tokenType: 'Bearer',
          expiresIn: 3600
        },
        '*'
      )
    }
  }
}

async function handlePostMessage(event: MessageEvent) {
  const data = event.data
  if (!data || typeof data !== 'object') return

  const targetWindow = iframeRef.value?.contentWindow
  if (!targetWindow || event.source !== targetWindow) return

  switch (data.type) {
    case 'FBS_INIT_HANDSHAKE': {
      loading.value = false
      targetWindow.postMessage(
        {
          source: 'FBS_HOST',
          type: 'FBS_HANDSHAKE_ACK',
          theme: themeStore.isDark ? 'dark' : 'light',
          locale: localeStore.currentLocale,
          hostOrigin: window.location.origin,
          providerId: props.providerId
        },
        '*'
      )
      // Dispatch audience token
      await sendAudienceToken(false)
      break
    }

    case 'FBS_REQUEST_AUTH_TOKEN': {
      // Refresh audience token on demand
      await sendAudienceToken(true)
      break
    }

    case 'FBS_NAVIGATE': {
      const navPath = data.path || data.payload?.path
      const isExternal = data.external || data.payload?.external
      if (navPath) {
        if (isExternal) {
          window.open(navPath, '_blank')
        } else {
          router.push(navPath)
        }
      }
      break
    }

    case 'FBS_SET_TITLE':
    case 'FBS_TITLE_CHANGED': {
      const title = data.title || data.payload?.title
      if (typeof title === 'string') {
        appsStore.setCustomTitle(title)
      }
      break
    }

    case 'FBS_ROUTE_CHANGED': {
      const rawPath = data.path || data.payload?.path
      if (typeof rawPath === 'string') {
        if (!rawPath.startsWith('//') && !rawPath.includes('://') && !rawPath.startsWith('javascript:')) {
          const cleanPath = rawPath.startsWith('/') ? rawPath : `/${rawPath}`
          const targetShellPath = `/apps/${props.providerId}${cleanPath}`
          if (router.currentRoute.value.fullPath !== targetShellPath) {
            lastEmittedPath = cleanPath
            router.replace(targetShellPath)
          }
        }
      }
      break
    }
  }
}

watch(
  () => props.providerId,
  () => {
    lastEmittedPath = null
    currentIframeSrc.value = props.src
    loading.value = true
    error.value = null
    if (loadTimeout) clearTimeout(loadTimeout)
    loadTimeout = setTimeout(() => {
      loading.value = false
    }, 15000)
    // Send updated audience token for the new provider
    sendAudienceToken(false)
  }
)

watch(
  () => props.src,
  (newSrc) => {
    if (lastEmittedPath) {
      const cleanSub = lastEmittedPath.startsWith('/') ? lastEmittedPath : `/${lastEmittedPath}`
      if (newSrc && (newSrc.endsWith(cleanSub) || newSrc.includes(cleanSub))) {
        lastEmittedPath = null
        return
      }
    }
    lastEmittedPath = null
    if (currentIframeSrc.value !== newSrc) {
      currentIframeSrc.value = newSrc
      loading.value = true
      error.value = null
      if (loadTimeout) clearTimeout(loadTimeout)
      loadTimeout = setTimeout(() => {
        loading.value = false
      }, 15000)
    }
  }
)

watch(
  () => themeStore.isDark,
  (isDark) => {
    const targetWindow = iframeRef.value?.contentWindow
    if (targetWindow) {
      targetWindow.postMessage(
        {
          source: 'FBS_HOST',
          type: 'FBS_THEME_CHANGED',
          theme: isDark ? 'dark' : 'light'
        },
        '*'
      )
    }
  }
)

watch(
  () => localeStore.currentLocale,
  (locale) => {
    const targetWindow = iframeRef.value?.contentWindow
    if (targetWindow) {
      targetWindow.postMessage(
        {
          source: 'FBS_HOST',
          type: 'FBS_LOCALE_CHANGED',
          locale
        },
        '*'
      )
    }
  }
)

watch(
  () => authStore.token,
  async (token) => {
    if (token) {
      // User re-authenticated or renewed token -> refresh audience token and push to iframe
      await sendAudienceToken(true)
    }
  }
)

onMounted(() => {
  window.addEventListener('message', handlePostMessage)
  loadTimeout = setTimeout(() => {
    loading.value = false
  }, 15000)

  // Proactive token renewal interval: check every 30 seconds
  proactiveRenewInterval = setInterval(async () => {
    if (!authStore.isAuthenticated) return
    const remaining = getRemainingValiditySeconds(props.providerId)
    // If token expires in less than 60s (or no cached token), proactively renew and post
    if (remaining > 0 && remaining < 60) {
      await sendAudienceToken(true)
    }
  }, 30000)
})

onUnmounted(() => {
  if (loadTimeout) clearTimeout(loadTimeout)
  if (proactiveRenewInterval) clearInterval(proactiveRenewInterval)
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
