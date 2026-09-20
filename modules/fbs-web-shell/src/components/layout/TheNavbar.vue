<template>
  <v-app-bar color="primary" density="default" elevation="2" class="px-2">
    <!-- Brand / Logo -->
    <v-btn
      variant="text"
      class="text-none font-weight-bold text-h6 d-flex align-center mr-4"
      @click="navigateToDefault"
    >
      <v-icon icon="mdi-checkbox-marked-circle-outline" class="mr-2" size="28"></v-icon>
      <span>Feedback System</span>
    </v-btn>

    <v-divider vertical class="my-3 mr-2"></v-divider>

    <!-- Dynamic Application Navigation Items -->
    <div class="d-flex align-center flex-row flex-nowrap overflow-x-auto">
      <template v-for="app in appsStore.navbarApps" :key="app.id">
        <!-- External link -->
        <v-btn
          v-if="app.embedMode === 'EXTERNAL'"
          variant="text"
          class="text-none mx-1"
          :href="app.url"
          target="_blank"
          rel="noopener noreferrer"
        >
          <v-icon :icon="formatIcon(app.icon)" class="mr-1"></v-icon>
          <span>{{ app.title }}</span>
          <v-icon icon="mdi-open-in-new" size="14" class="ml-1"></v-icon>
        </v-btn>

        <!-- Embedded Iframe App -->
        <v-btn
          v-else
          variant="text"
          class="text-none mx-1"
          :class="{ 'fbs-nav-active': isAppActive(app.id) }"
          @click="navigateToApp(app.id)"
        >
          <v-icon :icon="formatIcon(app.icon)" class="mr-1"></v-icon>
          <span>{{ app.title }}</span>
        </v-btn>
      </template>
    </div>

    <v-spacer></v-spacer>

    <!-- Admin Tools Menu (Admins only) -->
    <v-menu v-if="authStore.isAdmin" location="bottom end">
      <template #activator="{ props }">
        <v-btn
          v-bind="props"
          variant="text"
          class="text-none mx-1"
          :class="{ 'fbs-nav-active': isAdminRouteActive }"
        >
          <v-icon icon="mdi-cog" class="mr-1"></v-icon>
          <span>Administration</span>
          <v-icon icon="mdi-chevron-down" size="18" class="ml-1"></v-icon>
        </v-btn>
      </template>
      <v-list density="compact" elevation="4">
        <v-list-item
          to="/admin/apps"
          prepend-icon="mdi-view-grid-plus"
          title="Anwendungsverwaltung"
          subtitle="Fachanwendungen registrieren & verwalten"
        ></v-list-item>
        <v-list-item
          to="/admin/users"
          prepend-icon="mdi-account-group"
          title="Benutzerverwaltung"
          subtitle="Benutzer, Rollen & Passwörter"
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
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTheme } from 'vuetify'
import { useAuthStore } from '@/stores/auth'
import { useAppsStore } from '@/stores/apps'
import { useThemeStore } from '@/stores/theme'

const router = useRouter()
const route = useRoute()
const theme = useTheme()
const authStore = useAuthStore()
const appsStore = useAppsStore()
const themeStore = useThemeStore()

onMounted(() => {
  themeStore.initTheme(theme)
  appsStore.fetchVisibleApps()
})

const userInitials = computed(() => {
  const name = authStore.displayName || authStore.preferredUsername || 'U'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
})

const isAdminRouteActive = computed(() => {
  return route.path.startsWith('/admin')
})

function formatIcon(icon: string): string {
  if (!icon) return 'mdi-application'
  if (icon.startsWith('mdi-')) return icon
  return `mdi-${icon}`
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
.fbs-nav-active {
  background-color: rgba(255, 255, 255, 0.2) !important;
  border-bottom: 3px solid #ffffff;
  border-radius: 4px 4px 0 0;
}
</style>
