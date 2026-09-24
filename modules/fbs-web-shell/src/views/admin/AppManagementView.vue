<template>
  <v-container fluid class="pa-6">
    <v-row class="mb-4 align-center">
      <v-col cols="12" sm="8">
        <h1 class="text-h4 font-weight-bold d-flex align-center">
          <v-icon icon="mdi-view-grid-plus" class="mr-3" color="primary"></v-icon>
          Anwendungsverwaltung
        </h1>
        <p class="text-subtitle-1 text-medium-emphasis mt-1">
          Registrieren und verwalten Sie Fachanwendungen (ApplicationProviders) für die Web Shell.
        </p>
      </v-col>
      <v-col cols="12" sm="4" class="text-sm-right">
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          size="large"
          class="text-none font-weight-bold"
          @click="openCreateDialog"
        >
          Neue Anwendung registrieren
        </v-btn>
      </v-col>
    </v-row>

    <!-- App List Card / Table -->
    <v-card elevation="2" class="rounded-lg">
      <v-card-title class="pa-4 d-flex align-center">
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          label="Anwendungen durchsuchen..."
          single-line
          hide-details
          density="compact"
          variant="outlined"
          class="max-w-xs mr-4"
          style="max-width: 320px;"
        ></v-text-field>
        <v-spacer></v-spacer>
        <v-btn
          icon="mdi-refresh"
          variant="text"
          :loading="loading"
          @click="loadApps"
        ></v-btn>
      </v-card-title>

      <v-divider></v-divider>

      <v-table hover class="fbs-apps-table">
        <thead>
          <tr>
            <th class="text-left">Icon / ID</th>
            <th class="text-left">Titel & Beschreibung</th>
            <th class="text-left">Einstiegs-URL</th>
            <th class="text-center">Modus</th>
            <th class="text-center">Erforderliche Rolle</th>
            <th class="text-center">Pos.</th>
            <th class="text-center">Navbar</th>
            <th class="text-center">Status</th>
            <th class="text-right">Aktionen</th>
          </tr>
        </thead>
        <tbody>
          <template v-if="loading">
            <tr>
              <td colspan="9" class="text-center py-8">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
                <div class="mt-2 text-caption">Lade Anwendungen...</div>
              </td>
            </tr>
          </template>
          <template v-else-if="filteredApps.length === 0">
            <tr>
              <td colspan="9" class="text-center py-8 text-medium-emphasis">
                Keine registrierten Fachanwendungen gefunden.
              </td>
            </tr>
          </template>
          <template v-else>
            <tr v-for="app in filteredApps" :key="app.id">
              <td>
                <div class="d-flex align-center">
                  <v-avatar color="primary-lighten-1" size="36" class="mr-2 text-white">
                    <v-icon :icon="formatIcon(app.icon)" size="20"></v-icon>
                  </v-avatar>
                  <code>{{ app.id }}</code>
                </div>
              </td>
              <td>
                <div class="font-weight-bold d-flex align-center">
                  {{ app.title }}
                  <v-chip
                    v-if="app.isDefault"
                    size="x-small"
                    color="secondary"
                    class="ml-2 font-weight-bold"
                  >
                    Standard
                  </v-chip>
                </div>
                <div class="text-caption text-medium-emphasis text-truncate" style="max-width: 260px;">
                  {{ app.description || 'Keine Beschreibung' }}
                </div>
              </td>
              <td>
                <a
                  :href="resolveAppUrl(app.url)"
                  target="_blank"
                  rel="noopener"
                  class="text-decoration-none text-primary d-flex align-center text-caption font-family-monospace"
                >
                  <span class="text-truncate" style="max-width: 220px;">{{ app.url }}</span>
                  <v-icon icon="mdi-open-in-new" size="12" class="ml-1"></v-icon>
                </a>
              </td>
              <td class="text-center">
                <v-chip
                  size="small"
                  :color="app.embedMode === 'IFRAME' ? 'primary' : 'warning'"
                  variant="flat"
                >
                  {{ app.embedMode }}
                </v-chip>
              </td>
              <td class="text-center">
                <v-chip
                  size="small"
                  :color="getRoleColor(app.requiredGlobalRole)"
                  variant="outlined"
                >
                  {{ app.requiredGlobalRole }}
                </v-chip>
              </td>
              <td class="text-center font-weight-medium">
                {{ app.navbarPosition }}
              </td>
              <td class="text-center">
                <v-icon
                  :icon="app.showInNavbar ? 'mdi-check-circle' : 'mdi-close-circle'"
                  :color="app.showInNavbar ? 'success' : 'grey'"
                  size="20"
                ></v-icon>
              </td>
              <td class="text-center">
                <v-chip
                  size="small"
                  :color="app.isActive ? 'success' : 'grey'"
                  variant="tonal"
                >
                  {{ app.isActive ? 'Aktiv' : 'Inaktiv' }}
                </v-chip>
              </td>
              <td class="text-right">
                <v-btn
                  icon="mdi-pencil"
                  size="small"
                  variant="text"
                  color="primary"
                  title="Bearbeiten"
                  @click="openEditDialog(app)"
                ></v-btn>
                <v-btn
                  icon="mdi-delete"
                  size="small"
                  variant="text"
                  color="error"
                  title="Löschen"
                  @click="openDeleteDialog(app)"
                ></v-btn>
              </td>
            </tr>
          </template>
        </tbody>
      </v-table>
    </v-card>

    <!-- Create / Edit Modal Dialog -->
    <v-dialog v-model="dialog" max-width="650" persistent>
      <v-card class="rounded-lg">
        <v-card-title class="pa-4 bg-primary text-white d-flex align-center">
          <v-icon :icon="isEditing ? 'mdi-pencil' : 'mdi-plus-box'" class="mr-2"></v-icon>
          <span>{{ isEditing ? 'Fachanwendung bearbeiten' : 'Neue Fachanwendung registrieren' }}</span>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" size="small" @click="dialog = false"></v-btn>
        </v-card-title>

        <v-card-text class="pa-6">
          <v-form ref="formRef" v-model="formValid">
            <v-row>
              <!-- ID -->
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="form.id"
                  label="Eindeutige ID *"
                  placeholder="z.B. sql-playground"
                  :disabled="isEditing"
                  :rules="[rules.required, rules.slug]"
                  variant="outlined"
                  density="comfortable"
                  hint="Erlaubt: Buchstaben, Zahlen, Bindestriche"
                  persistent-hint
                ></v-text-field>
              </v-col>

              <!-- Title -->
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="form.title"
                  label="Titel in der Navbar *"
                  placeholder="z.B. SQL Playground"
                  :rules="[rules.required]"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>

              <!-- Description -->
              <v-col cols="12">
                <v-textarea
                  v-model="form.description"
                  label="Beschreibung"
                  rows="2"
                  variant="outlined"
                  density="comfortable"
                ></v-textarea>
              </v-col>

              <!-- Icon -->
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="form.icon"
                  label="Icon Name *"
                  placeholder="z.B. terminal, school, database"
                  :rules="[rules.required]"
                  variant="outlined"
                  density="comfortable"
                >
                  <template #append-inner>
                    <v-avatar color="primary" size="28" class="text-white">
                      <v-icon :icon="formatIcon(form.icon)" size="18"></v-icon>
                    </v-avatar>
                  </template>
                </v-text-field>
              </v-col>

              <!-- URL -->
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="form.url"
                  label="Einstiegs-URL *"
                  placeholder="https://... oder http://localhost:..."
                  :rules="[rules.required, rules.url]"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>

              <!-- Embed Mode -->
              <v-col cols="12" sm="6">
                <v-select
                  v-model="form.embedMode"
                  :items="['IFRAME', 'EXTERNAL']"
                  label="Einbettungsmodus *"
                  variant="outlined"
                  density="comfortable"
                ></v-select>
              </v-col>

              <!-- Required Global Role -->
              <v-col cols="12" sm="6">
                <v-select
                  v-model="form.requiredGlobalRole"
                  :items="['ALL', 'USER', 'MODERATOR', 'ADMIN']"
                  label="Erforderliche Mindestrolle *"
                  variant="outlined"
                  density="comfortable"
                ></v-select>
              </v-col>

              <!-- Navbar Position -->
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model.number="form.navbarPosition"
                  type="number"
                  label="Navbar Position (Sortierung) *"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>

              <!-- Client ID -->
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="form.clientId"
                  label="OIDC Client ID (optional)"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>

              <!-- Switches -->
              <v-col cols="12" sm="4">
                <v-switch
                  v-model="form.showInNavbar"
                  color="primary"
                  label="In Navbar anzeigen"
                  hide-details
                ></v-switch>
              </v-col>

              <v-col cols="12" sm="4">
                <v-switch
                  v-model="form.isDefault"
                  color="secondary"
                  label="Standard-App"
                  hide-details
                ></v-switch>
              </v-col>

              <v-col cols="12" sm="4">
                <v-switch
                  v-model="form.isActive"
                  color="success"
                  label="Aktiv"
                  hide-details
                ></v-switch>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="dialog = false">Abbrechen</v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            :loading="saving"
            :disabled="!formValid"
            @click="saveApp"
          >
            {{ isEditing ? 'Änderungen speichern' : 'Registrieren' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="480">
      <v-card class="rounded-lg">
        <v-card-title class="pa-4 bg-error text-white d-flex align-center">
          <v-icon icon="mdi-alert" class="mr-2"></v-icon>
          <span>Fachanwendung löschen</span>
        </v-card-title>
        <v-card-text class="pa-6 text-body-1">
          Möchten Sie die Fachanwendung <strong>{{ appToDelete?.title }}</strong> (<code>{{ appToDelete?.id }}</code>) wirklich unwiderruflich löschen?
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="deleteDialog = false">Abbrechen</v-btn>
          <v-btn
            color="error"
            variant="elevated"
            :loading="deleting"
            @click="confirmDelete"
          >
            Löschen bestätigen
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="4000">
      {{ snackbar.text }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { appProviderApi } from '@/services/api'
import { useAppsStore } from '@/stores/apps'
import type {
  ApplicationProvider,
  CreateApplicationProviderInput,
  EmbedMode,
  AppRequiredRole
} from '@/types/app'

const appsStore = useAppsStore()

const apps = ref<ApplicationProvider[]>([])
const loading = ref(false)
const search = ref('')

const dialog = ref(false)
const isEditing = ref(false)
const saving = ref(false)
const formValid = ref(false)
const formRef = ref<any>(null)

const deleteDialog = ref(false)
const appToDelete = ref<ApplicationProvider | null>(null)
const deleting = ref(false)

const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
})

const defaultForm: CreateApplicationProviderInput = {
  id: '',
  title: '',
  description: '',
  icon: 'application',
  url: '',
  embedMode: 'IFRAME' as EmbedMode,
  requiredGlobalRole: 'ALL' as AppRequiredRole,
  navbarPosition: 100,
  showInNavbar: true,
  isDefault: false,
  isActive: true,
  clientId: ''
}

const form = ref<CreateApplicationProviderInput>({ ...defaultForm })

const rules = {
  required: (v: any) => !!v || 'Dieses Feld ist erforderlich',
  slug: (v: string) =>
    /^[a-zA-Z0-9_-]+$/.test(v) || 'Nur alphanumerische Zeichen, Bindestriche und Unterstriche',
  url: (v: string) => {
    if (!v) return 'Dieses Feld ist erforderlich'
    if (v.startsWith('/')) return true
    try {
      new URL(v)
      return true
    } catch {
      return 'Gültige absolute (z.B. https://example.com) oder relative URL (z.B. /course-management/) erforderlich'
    }
  }
}

function resolveAppUrl(url: string): string {
  if (!url) return ''
  const trimmed = url.trim()
  if (trimmed.startsWith('/') || !/^https?:\/\//i.test(trimmed)) {
    const normalized = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
    return `${window.location.origin}${normalized}`
  }
  return trimmed
}

const filteredApps = computed(() => {
  if (!search.value) return apps.value
  const q = search.value.toLowerCase()
  return apps.value.filter(
    (a) =>
      a.id.toLowerCase().includes(q) ||
      a.title.toLowerCase().includes(q) ||
      (a.description && a.description.toLowerCase().includes(q))
  )
})

onMounted(() => {
  loadApps()
})

async function loadApps() {
  loading.value = true
  try {
    apps.value = await appProviderApi.getAllProvidersAdmin()
  } catch (e: any) {
    showSnackbar(e.message || 'Fehler beim Laden der Anwendungen', 'error')
  } finally {
    loading.value = false
  }
}

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

function getRoleColor(role: string): string {
  switch (role) {
    case 'ADMIN':
      return 'error'
    case 'MODERATOR':
      return 'warning'
    case 'USER':
      return 'primary'
    default:
      return 'grey'
  }
}

function openCreateDialog() {
  isEditing.value = false
  form.value = { ...defaultForm }
  dialog.value = true
}

function openEditDialog(app: ApplicationProvider) {
  isEditing.value = true
  form.value = {
    id: app.id,
    title: app.title,
    description: app.description || '',
    icon: app.icon,
    url: app.url,
    embedMode: app.embedMode,
    requiredGlobalRole: app.requiredGlobalRole,
    navbarPosition: app.navbarPosition,
    showInNavbar: app.showInNavbar,
    isDefault: app.isDefault,
    isActive: app.isActive,
    clientId: app.clientId || ''
  }
  dialog.value = true
}

async function saveApp() {
  if (!formRef.value) return
  const { valid } = await formRef.value.validate()
  if (!valid) return

  saving.value = true
  try {
    if (isEditing.value) {
      await appProviderApi.updateProvider(form.value.id, {
        title: form.value.title,
        description: form.value.description,
        icon: form.value.icon,
        url: form.value.url,
        embedMode: form.value.embedMode,
        requiredGlobalRole: form.value.requiredGlobalRole,
        navbarPosition: form.value.navbarPosition,
        showInNavbar: form.value.showInNavbar,
        isDefault: form.value.isDefault,
        isActive: form.value.isActive,
        clientId: form.value.clientId
      })
      showSnackbar('Fachanwendung erfolgreich aktualisiert', 'success')
    } else {
      await appProviderApi.createProvider(form.value)
      showSnackbar('Fachanwendung erfolgreich registriert', 'success')
    }
    dialog.value = false
    await loadApps()
    await appsStore.fetchVisibleApps()
  } catch (e: any) {
    showSnackbar(e.response?.data?.message || e.message || 'Fehler beim Speichern', 'error')
  } finally {
    saving.value = false
  }
}

function openDeleteDialog(app: ApplicationProvider) {
  appToDelete.value = app
  deleteDialog.value = true
}

async function confirmDelete() {
  if (!appToDelete.value) return
  deleting.value = true
  try {
    await appProviderApi.deleteProvider(appToDelete.value.id)
    showSnackbar('Fachanwendung erfolgreich gelöscht', 'success')
    deleteDialog.value = false
    await loadApps()
    await appsStore.fetchVisibleApps()
  } catch (e: any) {
    showSnackbar(e.response?.data?.message || e.message || 'Fehler beim Löschen', 'error')
  } finally {
    deleting.value = false
  }
}

function showSnackbar(text: string, color = 'success') {
  snackbar.value = { show: true, text, color }
}
</script>
