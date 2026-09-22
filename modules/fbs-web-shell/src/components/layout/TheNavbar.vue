<template>
  <!-- Left-side Collapsible Navigation Drawer -->
  <v-navigation-drawer
    v-model="drawer"
    elevation="2"
    class="fbs-sidebar"
  >
    <!-- Brand / Logo Header -->
    <div class="logo pa-3 d-flex align-center justify-center cursor-pointer border-b" @click="navigateToDefault">
      <h1 class="fbs-brand text-h6 font-weight-light text-primary d-flex align-center ma-0">
        Feedbacksystem
        <v-icon icon="mdi-message-alert" color="primary" size="22" class="ml-1"></v-icon>
      </h1>
    </div>

    <!-- Dynamic Application Navigation Items -->
    <v-list density="comfortable" nav class="py-2">
      <template v-for="app in appsStore.navbarApps" :key="app.id">
        <!-- External link -->
        <v-list-item
          v-if="app.embedMode === 'EXTERNAL'"
          :href="app.url"
          target="_blank"
          rel="noopener noreferrer"
          :prepend-icon="formatIcon(app.icon)"
          append-icon="mdi-open-in-new"
          :title="app.title"
          class="my-1 rounded"
        ></v-list-item>

        <!-- Embedded Iframe App -->
        <v-list-item
          v-else
          :active="isAppActive(app.id)"
          :prepend-icon="formatIcon(app.icon)"
          :title="app.title"
          color="primary"
          class="my-1 rounded"
          @click="navigateToApp(app.id)"
        ></v-list-item>
      </template>

      <!-- Admin Tools Section (Admins only) -->
      <template v-if="authStore.isAdmin">
        <v-divider class="my-2"></v-divider>
        <v-list-subheader class="font-weight-bold text-uppercase text-caption">
          Administration
        </v-list-subheader>
        <v-list-item
          to="/admin/apps"
          prepend-icon="mdi-view-grid-plus"
          title="Anwendungsverwaltung"
          subtitle="Fachanwendungen verwalten"
          color="primary"
          class="my-1 rounded"
        ></v-list-item>
        <v-list-item
          to="/admin/users"
          prepend-icon="mdi-account-group"
          title="Benutzerverwaltung"
          subtitle="Benutzer & Rollen"
          color="primary"
          class="my-1 rounded"
        ></v-list-item>
      </template>
    </v-list>

    <!-- Drawer Footer: Legal Links -->
    <template #append>
      <v-divider></v-divider>
      <div class="pa-2 d-flex justify-space-around text-caption legal-links">
        <v-btn variant="plain" size="small" density="compact" @click="showImprint = true">
          Impressum
        </v-btn>
        <v-btn variant="plain" size="small" density="compact" @click="showPrivacy = true">
          Datenschutz
        </v-btn>
      </div>
    </template>
  </v-navigation-drawer>

  <!-- Top App Bar -->
  <v-app-bar color="primary" density="default" elevation="2">
    <v-app-bar-nav-icon
      aria-label="Menü ein- oder ausklappen"
      @click.stop="drawer = !drawer"
    ></v-app-bar-nav-icon>

    <v-app-bar-title class="font-weight-medium">
      {{ currentTitle }}
    </v-app-bar-title>

    <v-spacer></v-spacer>

    <!-- Language Selection -->
    <v-menu location="bottom end">
      <template #activator="{ props }">
        <v-btn
          v-bind="props"
          variant="text"
          class="mx-1 text-none"
          title="Sprache ändern / Change Language"
        >
          <v-icon icon="mdi-translate" class="mr-1"></v-icon>
          <span class="text-uppercase font-weight-bold text-caption">{{ localeStore.currentLocale.toUpperCase() }}</span>
        </v-btn>
      </template>
      <v-list min-width="150" elevation="4">
        <v-list-item
          :active="localeStore.currentLocale === 'de'"
          title="Deutsch (DE)"
          @click="localeStore.setLocale('de')"
        ></v-list-item>
        <v-list-item
          :active="localeStore.currentLocale === 'en'"
          title="English (EN)"
          @click="localeStore.setLocale('en')"
        ></v-list-item>
      </v-list>
    </v-menu>

    <!-- Theme Toggle -->
    <v-btn
      icon
      variant="text"
      class="mx-1"
      :title="themeStore.isDark ? 'Helles Design aktivieren' : 'Dunkles Design aktivieren'"
      @click="toggleTheme"
    >
      <v-icon :icon="themeStore.isDark ? 'mdi-weather-sunny' : 'mdi-weather-night'"></v-icon>
    </v-btn>

    <!-- User Profile / Auth Menu -->
    <template v-if="authStore.isAuthenticated">
      <v-menu location="bottom end">
        <template #activator="{ props }">
          <v-btn v-bind="props" variant="text" class="text-none pl-2 pr-3 ml-1">
            <v-avatar color="secondary" size="32" class="mr-2 text-caption font-weight-bold">
              {{ userInitials }}
            </v-avatar>
            <div class="d-none d-sm-flex flex-column text-left">
              <span class="text-body-2 font-weight-medium">{{ authStore.displayName }}</span>
              <span class="text-caption opacity-80">{{ authStore.globalRole }}</span>
            </div>
            <v-icon icon="mdi-chevron-down" size="18" class="ml-1"></v-icon>
          </v-btn>
        </template>
        <v-list min-width="220" elevation="4">
          <v-list-item
            to="/profile"
            prepend-icon="mdi-account"
            title="Mein Profil"
            :subtitle="authStore.email || authStore.preferredUsername"
          ></v-list-item>
          <v-divider class="my-1"></v-divider>
          <v-list-item
            prepend-icon="mdi-logout"
            title="Abmelden"
            class="text-error"
            @click="logout"
          ></v-list-item>
        </v-list>
      </v-menu>
    </template>

    <template v-else>
      <v-btn
        variant="elevated"
        color="secondary"
        class="text-none font-weight-medium ml-2"
        prepend-icon="mdi-login"
        @click="login"
      >
        Anmelden
      </v-btn>
    </template>
  </v-app-bar>

  <!-- Legal Dialogs -->
  <v-dialog v-model="showImprint" max-width="600">
    <v-card>
      <v-card-title>Impressum</v-card-title>
      <v-card-text>
        <p><strong>Technische Hochschule Mittelhessen (THM)</strong></p>
        <p>Fachbereich MNI - Mathematik, Naturwissenschaften und Informatik</p>
        <p>Wiesenstraße 14, 35390 Gießen</p>
        <p class="mt-2">Feedback System</p>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="showImprint = false">Schließen</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="showPrivacy" max-width="600">
    <v-card>
      <v-card-title>Datenschutz</v-card-title>
      <v-card-text>
        <p><strong>Datenschutzerklärung</strong></p>
        <p>Die Nutzung des Feedback Systems erfolgt im Rahmen des Lehrbetriebs der THM.</p>
        <p class="mt-2">Personenbezogene Daten werden vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften behandelt.</p>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="showPrivacy = false">Schließen</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTheme } from 'vuetify'
import { useAuthStore } from '@/stores/auth'
import { useAppsStore } from '@/stores/apps'
import { useThemeStore } from '@/stores/theme'
import { useLocaleStore } from '@/stores/locale'

const router = useRouter()
const route = useRoute()
const theme = useTheme()
const authStore = useAuthStore()
const appsStore = useAppsStore()
const themeStore = useThemeStore()
const localeStore = useLocaleStore()

const drawer = ref<boolean | null>(true)
const showImprint = ref(false)
const showPrivacy = ref(false)

onMounted(async () => {
  themeStore.initTheme(theme)
  if (!authStore.isInitialized) {
    await authStore.initAuth()
  }
  await appsStore.fetchVisibleApps()
})

watch(
  () => authStore.token,
  async (newToken) => {
    if (newToken) {
      await appsStore.fetchVisibleApps()
    }
  }
)

const currentTitle = computed(() => {
  if (route.path.startsWith('/admin/apps')) return 'Anwendungsverwaltung'
  if (route.path.startsWith('/admin/users')) return 'Benutzerverwaltung'
  if (route.path.startsWith('/profile')) return 'Mein Profil'
  if (appsStore.customTitle) return appsStore.customTitle
  const activeApp = appsStore.apps.find((a) => a.id === route.params.providerId)
  if (activeApp) return activeApp.title
  return 'Feedbacksystem'
})

watch(
  currentTitle,
  (title) => {
    if (title && title !== 'Feedbacksystem') {
      document.title = `${title} - Feedbacksystem`
    } else {
      document.title = 'Feedbacksystem'
    }
  },
  { immediate: true }
)

watch(
  () => [route.params.providerId, route.name],
  (newVal, oldVal) => {
    if (!oldVal || newVal[0] !== oldVal[0] || newVal[1] !== oldVal[1]) {
      appsStore.setCustomTitle(null)
    }
  }
)

const userInitials = computed(() => {
  const name = authStore.displayName || authStore.preferredUsername || 'U'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
})

const ICON_MAP: Record<string, string> = {
  terminal: 'console',
  school: 'school',
  build: 'wrench',
  settings: 'cog',
  dashboard: 'view-dashboard',
  user: 'account',
  users: 'account-group',
  code: 'code-tags',
  database: 'database',
  assignment: 'clipboard-text',
  assessment: 'chart-bar'
}

function formatIcon(icon: string): string {
  if (!icon) return 'mdi-application'
  if (icon.startsWith('mdi-')) return icon
  const mapped = ICON_MAP[icon] || icon
  return `mdi-${mapped}`
}

function isAppActive(appId: string): boolean {
  return route.params.providerId === appId
}

function navigateToApp(appId: string) {
  router.push(`/apps/${appId}`)
}

function navigateToDefault() {
  if (appsStore.defaultApp) {
    router.push(`/apps/${appsStore.defaultApp.id}`)
  } else {
    router.push('/')
  }
}

function toggleTheme() {
  themeStore.toggleTheme(theme)
}

function login() {
  authStore.login()
}

function logout() {
  authStore.logout()
}
</script>

<style scoped>
.fbs-sidebar {
  border-right: 1px solid rgba(0, 0, 0, 0.12);
}

.fbs-brand {
  font-family: Roboto, "Helvetica Neue Light", "Helvetica Neue", Helvetica, Arial, sans-serif;
  letter-spacing: 0.5px;
  user-select: none;
}

.legal-links {
  opacity: 0.8;
}

.cursor-pointer {
  cursor: pointer;
}

.line-height-1 {
  line-height: 1.2;
}
</style>
