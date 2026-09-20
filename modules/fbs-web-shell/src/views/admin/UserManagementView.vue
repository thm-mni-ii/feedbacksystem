<template>
  <v-container fluid class="pa-6">
    <v-row class="mb-4 align-center">
      <v-col cols="12" sm="8">
        <h1 class="text-h4 font-weight-bold d-flex align-center">
          <v-icon icon="mdi-account-group" class="mr-3" color="primary"></v-icon>
          Benutzerverwaltung
        </h1>
        <p class="text-subtitle-1 text-medium-emphasis mt-1">
          Verwalten Sie globale Benutzerkonten, Rollenberechtigungen und Authentifizierungsquellen.
        </p>
      </v-col>
      <v-col cols="12" sm="4" class="text-sm-right">
        <v-btn
          color="primary"
          prepend-icon="mdi-account-plus"
          size="large"
          class="text-none font-weight-bold"
          @click="openCreateDialog"
        >
          Neuen internen Benutzer anlegen
        </v-btn>
      </v-col>
    </v-row>

    <!-- Filters and Table Card -->
    <v-card elevation="2" class="rounded-lg">
      <v-card-title class="pa-4">
        <v-row dense class="align-center">
          <v-col cols="12" sm="5">
            <v-text-field
              v-model="searchQuery"
              prepend-inner-icon="mdi-magnify"
              label="Suche nach Benutzername, Name oder E-Mail..."
              single-line
              hide-details
              density="compact"
              variant="outlined"
              clearable
              @update:model-value="onFilterChanged"
            ></v-text-field>
          </v-col>

          <v-col cols="12" sm="4">
            <v-select
              v-model="selectedRoleFilter"
              :items="roleFilterOptions"
              label="Rolle filtern"
              item-title="text"
              item-value="value"
              single-line
              hide-details
              density="compact"
              variant="outlined"
              @update:model-value="onFilterChanged"
            ></v-select>
          </v-col>

          <v-col cols="12" sm="3" class="text-right">
            <v-btn
              icon="mdi-refresh"
              variant="text"
              :loading="loading"
              @click="loadUsers"
            ></v-btn>
          </v-col>
        </v-row>
      </v-card-title>

      <v-divider></v-divider>

      <!-- Users Table -->
      <v-table hover class="fbs-users-table">
        <thead>
          <tr>
            <th class="text-left">Benutzername</th>
            <th class="text-left">Anzeigename</th>
            <th class="text-left">E-Mail</th>
            <th class="text-center">Quelle</th>
            <th class="text-center">Passwort</th>
            <th class="text-center">Globale Rolle</th>
            <th class="text-right">Aktionen</th>
          </tr>
        </thead>
        <tbody>
          <template v-if="loading">
            <tr>
              <td colspan="7" class="text-center py-8">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
                <div class="mt-2 text-caption">Lade Benutzer...</div>
              </td>
            </tr>
          </template>
          <template v-else-if="users.length === 0">
            <tr>
              <td colspan="7" class="text-center py-8 text-medium-emphasis">
                Keine passenden Benutzer gefunden.
              </td>
            </tr>
          </template>
          <template v-else>
            <tr v-for="user in users" :key="user.id">
              <td>
                <div class="font-weight-bold d-flex align-center">
                  <v-avatar color="primary" size="28" class="mr-2 text-caption text-white font-weight-bold">
                    {{ (user.username[0] || 'U').toUpperCase() }}
                  </v-avatar>
                  <code>{{ user.username }}</code>
                </div>
              </td>
              <td>
                <div>{{ user.displayName }}</div>
                <div v-if="user.alias" class="text-caption text-medium-emphasis">Alias: {{ user.alias }}</div>
              </td>
              <td>
                <span class="text-caption font-family-monospace">{{ user.email || '—' }}</span>
              </td>
              <td class="text-center">
                <v-chip
                  size="small"
                  :color="user.source === 'INTERNAL' ? 'primary' : 'success'"
                  variant="flat"
                  :prepend-icon="user.source === 'INTERNAL' ? 'mdi-database' : 'mdi-shield-account'"
                >
                  {{ user.source === 'INTERNAL' ? 'Intern' : 'SAML SSO' }}
                </v-chip>
              </td>
              <td class="text-center">
                <v-chip
                  size="small"
                  :color="user.hasPassword ? 'info' : 'grey'"
                  variant="outlined"
                  :prepend-icon="user.hasPassword ? 'mdi-key' : 'mdi-key-remove'"
                >
                  {{ user.hasPassword ? 'Vorhanden' : 'Kein Passwort' }}
                </v-chip>
              </td>
              <td class="text-center">
                <v-chip
                  size="small"
                  :color="getRoleColor(user.globalRole)"
                  variant="flat"
                  class="font-weight-bold"
                >
                  {{ user.globalRole }}
                </v-chip>
              </td>
              <td class="text-right">
                <!-- Edit User -->
                <v-btn
                  icon="mdi-account-edit"
                  size="small"
                  variant="text"
                  color="primary"
                  title="Benutzerdaten bearbeiten"
                  @click="openEditDialog(user)"
                ></v-btn>

                <!-- Change Role -->
                <v-btn
                  icon="mdi-shield-edit"
                  size="small"
                  variant="text"
                  color="warning"
                  title="Rolle anpassen"
                  @click="openRoleDialog(user)"
                ></v-btn>

                <!-- Reset Password (for internal users) -->
                <v-btn
                  v-if="user.hasPassword || user.source === 'INTERNAL'"
                  icon="mdi-lock-reset"
                  size="small"
                  variant="text"
                  color="secondary"
                  title="Passwort zurücksetzen"
                  @click="openPasswordDialog(user)"
                ></v-btn>

                <!-- Deactivate User -->
                <v-btn
                  icon="mdi-account-remove"
                  size="small"
                  variant="text"
                  color="error"
                  title="Benutzer deaktivieren"
                  @click="openDeactivateDialog(user)"
                ></v-btn>
              </td>
            </tr>
          </template>
        </tbody>
      </v-table>

      <!-- Pagination Footer -->
      <v-divider></v-divider>
      <div class="pa-4 d-flex align-center justify-space-between flex-wrap">
        <div class="text-caption text-medium-emphasis">
          Gesamt: {{ totalCount }} Benutzer (Seite {{ currentPage }} von {{ totalPages || 1 }})
        </div>
        <v-pagination
          v-model="currentPage"
          :length="totalPages"
          :total-visible="7"
          density="comfortable"
          @update:model-value="onPageChanged"
        ></v-pagination>
      </div>
    </v-card>

    <!-- Dialog 1: Create Internal User -->
    <v-dialog v-model="createDialog" max-width="600" persistent>
      <v-card class="rounded-lg">
        <v-card-title class="pa-4 bg-primary text-white d-flex align-center">
          <v-icon icon="mdi-account-plus" class="mr-2"></v-icon>
          <span>Neuen internen Benutzer anlegen</span>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" size="small" @click="createDialog = false"></v-btn>
        </v-card-title>

        <v-card-text class="pa-6">
          <v-form ref="createFormRef" v-model="createFormValid">
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="createForm.username"
                  label="Benutzername *"
                  placeholder="z.B. mmuster20"
                  :rules="[rules.required]"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="createForm.password"
                  label="Passwort *"
                  type="password"
                  :rules="[rules.required, rules.minPassword]"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="createForm.prename"
                  label="Vorname *"
                  placeholder="Max"
                  :rules="[rules.required]"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="createForm.surname"
                  label="Nachname *"
                  placeholder="Mustermann"
                  :rules="[rules.required]"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="createForm.email"
                  label="E-Mail-Adresse *"
                  placeholder="max.mustermann@mni.thm.de"
                  :rules="[rules.required, rules.email]"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="createForm.alias"
                  label="Alias (optional)"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>

              <v-col cols="12">
                <v-select
                  v-model="createForm.globalRole"
                  :items="['USER', 'MODERATOR', 'ADMIN']"
                  label="Globale Rolle *"
                  variant="outlined"
                  density="comfortable"
                ></v-select>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-divider></v-divider>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="createDialog = false">Abbrechen</v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            :loading="actionLoading"
            :disabled="!createFormValid"
            @click="submitCreateUser"
          >
            Benutzer anlegen
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog 2: Edit User Details -->
    <v-dialog v-model="editDialog" max-width="550" persistent>
      <v-card class="rounded-lg">
        <v-card-title class="pa-4 bg-primary text-white d-flex align-center">
          <v-icon icon="mdi-account-edit" class="mr-2"></v-icon>
          <span>Benutzerdaten bearbeiten ({{ selectedUser?.username }})</span>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" size="small" @click="editDialog = false"></v-btn>
        </v-card-title>

        <v-card-text class="pa-6">
          <v-form ref="editFormRef" v-model="editFormValid">
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editForm.prename"
                  label="Vorname *"
                  :rules="[rules.required]"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editForm.surname"
                  label="Nachname *"
                  :rules="[rules.required]"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>

              <v-col cols="12">
                <v-text-field
                  v-model="editForm.email"
                  label="E-Mail-Adresse *"
                  :rules="[rules.required, rules.email]"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>

              <v-col cols="12">
                <v-text-field
                  v-model="editForm.alias"
                  label="Alias (optional)"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-divider></v-divider>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="editDialog = false">Abbrechen</v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            :loading="actionLoading"
            :disabled="!editFormValid"
            @click="submitEditUser"
          >
            Speichern
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog 3: Change Global Role -->
    <v-dialog v-model="roleDialog" max-width="450" persistent>
      <v-card class="rounded-lg">
        <v-card-title class="pa-4 bg-warning text-white d-flex align-center">
          <v-icon icon="mdi-shield-edit" class="mr-2"></v-icon>
          <span>Globale Rolle ändern</span>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" size="small" @click="roleDialog = false"></v-btn>
        </v-card-title>

        <v-card-text class="pa-6">
          <p class="text-body-1 mb-4">
            Wählen Sie die neue Berechtigungsstufe für <strong>{{ selectedUser?.username }}</strong>:
          </p>
          <v-select
            v-model="newRole"
            :items="['USER', 'MODERATOR', 'ADMIN']"
            label="Globale Rolle *"
            variant="outlined"
            density="comfortable"
          ></v-select>
        </v-card-text>

        <v-divider></v-divider>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="roleDialog = false">Abbrechen</v-btn>
          <v-btn
            color="warning"
            variant="elevated"
            :loading="actionLoading"
            @click="submitChangeRole"
          >
            Rolle aktualisieren
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog 4: Reset Password (Admin) -->
    <v-dialog v-model="passwordDialog" max-width="450" persistent>
      <v-card class="rounded-lg">
        <v-card-title class="pa-4 bg-secondary text-white d-flex align-center">
          <v-icon icon="mdi-lock-reset" class="mr-2"></v-icon>
          <span>Passwort neu vergeben</span>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" size="small" @click="passwordDialog = false"></v-btn>
        </v-card-title>

        <v-card-text class="pa-6">
          <p class="text-body-2 mb-4">
            Geben Sie ein neues Passwort für <strong>{{ selectedUser?.username }}</strong> ein:
          </p>
          <v-form ref="passwordFormRef" v-model="passwordFormValid">
            <v-text-field
              v-model="passwordForm.newPassword"
              label="Neues Passwort *"
              type="password"
              :rules="[rules.required, rules.minPassword]"
              variant="outlined"
              density="comfortable"
              class="mb-3"
            ></v-text-field>

            <v-text-field
              v-model="passwordForm.newPasswordRepeat"
              label="Neues Passwort wiederholen *"
              type="password"
              :rules="[rules.required, rules.passwordMatch]"
              variant="outlined"
              density="comfortable"
            ></v-text-field>
          </v-form>
        </v-card-text>

        <v-divider></v-divider>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="passwordDialog = false">Abbrechen</v-btn>
          <v-btn
            color="secondary"
            variant="elevated"
            :loading="actionLoading"
            :disabled="!passwordFormValid"
            @click="submitResetPassword"
          >
            Passwort setzen
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog 5: Deactivate User Confirmation -->
    <v-dialog v-model="deactivateDialog" max-width="480">
      <v-card class="rounded-lg">
        <v-card-title class="pa-4 bg-error text-white d-flex align-center">
          <v-icon icon="mdi-alert" class="mr-2"></v-icon>
          <span>Benutzerkonto deaktivieren</span>
        </v-card-title>
        <v-card-text class="pa-6 text-body-1">
          Möchten Sie das Benutzerkonto <strong>{{ selectedUser?.username }}</strong> ({{ selectedUser?.displayName }}) wirklich deaktivieren? Der Benutzer wird anonymisiert und kann sich nicht mehr anmelden.
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="deactivateDialog = false">Abbrechen</v-btn>
          <v-btn
            color="error"
            variant="elevated"
            :loading="actionLoading"
            @click="submitDeactivateUser"
          >
            Deaktivieren bestätigen
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar Notifications -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="4000">
      {{ snackbar.text }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { userGraphQlApi } from '@/services/graphql'
import type { User, GlobalRole, CreateUserInput, UpdateUserInput } from '@/types/user'

const users = ref<User[]>([])
const totalCount = ref(0)
const loading = ref(false)
const actionLoading = ref(false)

const searchQuery = ref('')
const selectedRoleFilter = ref<string>('ALL')

const currentPage = ref(1)
const pageSize = 15

const roleFilterOptions = [
  { text: 'Alle Rollen', value: 'ALL' },
  { text: 'Administratoren', value: 'ADMIN' },
  { text: 'Dozenten / Moderatoren', value: 'MODERATOR' },
  { text: 'Studenten / Standardnutzer', value: 'USER' }
]

const totalPages = computed(() => Math.ceil(totalCount.value / pageSize) || 1)

// Selected user for modals
const selectedUser = ref<User | null>(null)

// Create modal
const createDialog = ref(false)
const createFormValid = ref(false)
const createFormRef = ref<any>(null)
const createForm = ref<CreateUserInput>({
  username: '',
  password: '',
  prename: '',
  surname: '',
  email: '',
  alias: '',
  globalRole: 'USER'
})

// Edit modal
const editDialog = ref(false)
const editFormValid = ref(false)
const editFormRef = ref<any>(null)
const editForm = ref<UpdateUserInput>({
  userId: '',
  prename: '',
  surname: '',
  email: '',
  alias: ''
})

// Role modal
const roleDialog = ref(false)
const newRole = ref<GlobalRole>('USER')

// Password modal
const passwordDialog = ref(false)
const passwordFormValid = ref(false)
const passwordFormRef = ref<any>(null)
const passwordForm = ref({
  newPassword: '',
  newPasswordRepeat: ''
})

// Deactivate modal
const deactivateDialog = ref(false)

const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
})

const rules = {
  required: (v: any) => !!v || 'Dieses Feld ist erforderlich',
  minPassword: (v: string) => (v && v.length >= 8) || 'Mindestens 8 Zeichen erforderlich',
  passwordMatch: (v: string) =>
    v === passwordForm.value.newPassword || 'Die Passwörter stimmen nicht überein',
  email: (v: string) => /.+@.+\..+/.test(v) || 'Gültige E-Mail-Adresse erforderlich'
}

let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null

onMounted(() => {
  loadUsers()
})

function onFilterChanged() {
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
  searchDebounceTimer = setTimeout(() => {
    currentPage.value = 1
    loadUsers()
  }, 350)
}

function onPageChanged(page: number) {
  currentPage.value = page
  loadUsers()
}

async function loadUsers() {
  loading.value = true
  try {
    const role = selectedRoleFilter.value !== 'ALL' ? (selectedRoleFilter.value as GlobalRole) : null
    const filter = {
      query: searchQuery.value?.trim() || null,
      globalRole: role
    }
    const pagination = {
      limit: pageSize,
      offset: (currentPage.value - 1) * pageSize
    }

    const data = await userGraphQlApi.getUsers(filter, pagination)
    users.value = data.items
    totalCount.value = data.totalCount
  } catch (e: any) {
    showSnackbar(e.message || 'Fehler beim Laden der Benutzer', 'error')
  } finally {
    loading.value = false
  }
}

function getRoleColor(role: GlobalRole): string {
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
  createForm.value = {
    username: '',
    password: '',
    prename: '',
    surname: '',
    email: '',
    alias: '',
    globalRole: 'USER'
  }
  createDialog.value = true
}

async function submitCreateUser() {
  if (!createFormRef.value) return
  const { valid } = await createFormRef.value.validate()
  if (!valid) return

  actionLoading.value = true
  try {
    await userGraphQlApi.createUser(createForm.value)
    showSnackbar('Benutzer erfolgreich angelegt', 'success')
    createDialog.value = false
    await loadUsers()
  } catch (e: any) {
    showSnackbar(e.message || 'Fehler beim Anlegen des Benutzers', 'error')
  } finally {
    actionLoading.value = false
  }
}

function openEditDialog(user: User) {
  selectedUser.value = user
  editForm.value = {
    userId: user.id,
    prename: user.prename,
    surname: user.surname,
    email: user.email,
    alias: user.alias || ''
  }
  editDialog.value = true
}

async function submitEditUser() {
  if (!editFormRef.value) return
  const { valid } = await editFormRef.value.validate()
  if (!valid) return

  actionLoading.value = true
  try {
    await userGraphQlApi.updateUser(editForm.value)
    showSnackbar('Benutzerdaten erfolgreich aktualisiert', 'success')
    editDialog.value = false
    await loadUsers()
  } catch (e: any) {
    showSnackbar(e.message || 'Fehler beim Aktualisieren der Benutzerdaten', 'error')
  } finally {
    actionLoading.value = false
  }
}

function openRoleDialog(user: User) {
  selectedUser.value = user
  newRole.value = user.globalRole
  roleDialog.value = true
}

async function submitChangeRole() {
  if (!selectedUser.value) return
  actionLoading.value = true
  try {
    await userGraphQlApi.updateGlobalRole({
      userId: selectedUser.value.id,
      globalRole: newRole.value
    })
    showSnackbar(`Rolle für ${selectedUser.value.username} geändert zu ${newRole.value}`, 'success')
    roleDialog.value = false
    await loadUsers()
  } catch (e: any) {
    showSnackbar(e.message || 'Fehler beim Ändern der Rolle', 'error')
  } finally {
    actionLoading.value = false
  }
}

function openPasswordDialog(user: User) {
  selectedUser.value = user
  passwordForm.value = {
    newPassword: '',
    newPasswordRepeat: ''
  }
  passwordDialog.value = true
}

async function submitResetPassword() {
  if (!passwordFormRef.value || !selectedUser.value) return
  const { valid } = await passwordFormRef.value.validate()
  if (!valid) return

  actionLoading.value = true
  try {
    await userGraphQlApi.changeUserPassword({
      userId: selectedUser.value.id,
      newPassword: passwordForm.value.newPassword,
      newPasswordRepeat: passwordForm.value.newPasswordRepeat
    })
    showSnackbar(`Passwort für ${selectedUser.value.username} erfolgreich aktualisiert`, 'success')
    passwordDialog.value = false
  } catch (e: any) {
    showSnackbar(e.message || 'Fehler beim Zurücksetzen des Passworts', 'error')
  } finally {
    actionLoading.value = false
  }
}

function openDeactivateDialog(user: User) {
  selectedUser.value = user
  deactivateDialog.value = true
}

async function submitDeactivateUser() {
  if (!selectedUser.value) return
  actionLoading.value = true
  try {
    await userGraphQlApi.deactivateUser(selectedUser.value.id)
    showSnackbar(`Benutzer ${selectedUser.value.username} wurde deaktiviert`, 'success')
    deactivateDialog.value = false
    await loadUsers()
  } catch (e: any) {
    showSnackbar(e.message || 'Fehler beim Deaktivieren', 'error')
  } finally {
    actionLoading.value = false
  }
}

function showSnackbar(text: string, color = 'success') {
  snackbar.value = { show: true, text, color }
}
</script>
