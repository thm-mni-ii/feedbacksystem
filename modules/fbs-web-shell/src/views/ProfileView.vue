<template>
  <v-container class="py-8" style="max-width: 800px;">
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 font-weight-bold d-flex align-center mb-2">
          <v-icon icon="mdi-account" class="mr-3" color="primary"></v-icon>
          Mein Benutzerprofil
        </h1>
        <p class="text-subtitle-1 text-medium-emphasis">
          Übersicht Ihrer Kontoinformationen und Sicherheitseinstellungen.
        </p>
      </v-col>

      <!-- Profile Overview Card -->
      <v-col cols="12">
        <v-card elevation="2" class="rounded-lg mb-6">
          <v-card-title class="pa-4 bg-primary text-white d-flex align-center">
            <v-icon icon="mdi-card-account-details" class="mr-2"></v-icon>
            <span>Persönliche Daten</span>
          </v-card-title>

          <v-card-text class="pa-6">
            <template v-if="loading">
              <div class="text-center py-6">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
              </div>
            </template>
            <template v-else-if="user">
              <v-row dense>
                <v-col cols="12" sm="6" class="py-2">
                  <div class="text-caption text-medium-emphasis">Benutzername</div>
                  <div class="text-body-1 font-weight-bold font-family-monospace">{{ user.username }}</div>
                </v-col>

                <v-col cols="12" sm="6" class="py-2">
                  <div class="text-caption text-medium-emphasis">Anzeigename</div>
                  <div class="text-body-1 font-weight-medium">{{ user.displayName }}</div>
                </v-col>

                <v-col cols="12" sm="6" class="py-2">
                  <div class="text-caption text-medium-emphasis">Vorname / Nachname</div>
                  <div class="text-body-1">{{ user.prename }} {{ user.surname }}</div>
                </v-col>

                <v-col cols="12" sm="6" class="py-2">
                  <div class="text-caption text-medium-emphasis">E-Mail-Adresse</div>
                  <div class="text-body-1">{{ user.email || '—' }}</div>
                </v-col>

                <v-col cols="12" sm="6" class="py-2">
                  <div class="text-caption text-medium-emphasis">Alias</div>
                  <div class="text-body-1">{{ user.alias || 'Kein Alias hinterlegt' }}</div>
                </v-col>

                <v-col cols="12" sm="6" class="py-2">
                  <div class="text-caption text-medium-emphasis">Globale Berechtigungsstufe</div>
                  <div class="mt-1">
                    <v-chip size="small" :color="getRoleColor(user.globalRole)" class="font-weight-bold">
                      {{ user.globalRole }}
                    </v-chip>
                  </div>
                </v-col>

                <v-col cols="12" sm="6" class="py-2">
                  <div class="text-caption text-medium-emphasis">Authentifizierungs-Quelle</div>
                  <div class="mt-1">
                    <v-chip
                      size="small"
                      :color="user.source === 'INTERNAL' ? 'primary' : 'success'"
                      :prepend-icon="user.source === 'INTERNAL' ? 'mdi-database' : 'mdi-shield-account'"
                    >
                      {{ user.source === 'INTERNAL' ? 'Lokales Konto (Intern)' : 'SAML Single Sign-On' }}
                    </v-chip>
                  </div>
                </v-col>
              </v-row>
            </template>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Password Change Card (Internal Users) -->
      <v-col cols="12" v-if="user?.source === 'INTERNAL' || user?.hasPassword">
        <v-card elevation="2" class="rounded-lg">
          <v-card-title class="pa-4 bg-secondary text-white d-flex align-center">
            <v-icon icon="mdi-key-change" class="mr-2"></v-icon>
            <span>Passwort ändern</span>
          </v-card-title>

          <v-card-text class="pa-6">
            <v-form ref="pwFormRef" v-model="pwFormValid" @submit.prevent="submitChangePassword">
              <v-text-field
                v-model="pwForm.currentPassword"
                label="Aktuelles Passwort *"
                type="password"
                :rules="[rules.required]"
                variant="outlined"
                density="comfortable"
                class="mb-3"
              ></v-text-field>

              <v-text-field
                v-model="pwForm.newPassword"
                label="Neues Passwort *"
                type="password"
                :rules="[rules.required, rules.minPassword]"
                variant="outlined"
                density="comfortable"
                class="mb-3"
              ></v-text-field>

              <v-text-field
                v-model="pwForm.newPasswordRepeat"
                label="Neues Passwort wiederholen *"
                type="password"
                :rules="[rules.required, rules.passwordMatch]"
                variant="outlined"
                density="comfortable"
                class="mb-4"
              ></v-text-field>

              <v-btn
                type="submit"
                color="secondary"
                size="large"
                variant="elevated"
                :loading="pwSaving"
                :disabled="!pwFormValid"
                class="text-none font-weight-bold"
              >
                Passwort jetzt aktualisieren
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Snackbar Notifications -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="4000">
      {{ snackbar.text }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { userGraphQlApi } from '@/services/graphql'
import type { User, GlobalRole } from '@/types/user'

const user = ref<User | null>(null)
const loading = ref(false)

const pwFormValid = ref(false)
const pwFormRef = ref<any>(null)
const pwSaving = ref(false)
const pwForm = ref({
  currentPassword: '',
  newPassword: '',
  newPasswordRepeat: ''
})

const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
})

const rules = {
  required: (v: any) => !!v || 'Dieses Feld ist erforderlich',
  minPassword: (v: string) => (v && v.length >= 8) || 'Mindestens 8 Zeichen erforderlich',
  passwordMatch: (v: string) =>
    v === pwForm.value.newPassword || 'Die Passwörter stimmen nicht überein'
}

onMounted(() => {
  loadUserProfile()
})

async function loadUserProfile() {
  loading.value = true
  try {
    user.value = await userGraphQlApi.getCurrentUser()
  } catch (e: any) {
    showSnackbar(e.message || 'Fehler beim Laden des Profils', 'error')
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

async function submitChangePassword() {
  if (!pwFormRef.value) return
  const { valid } = await pwFormRef.value.validate()
  if (!valid) return

  pwSaving.value = true
  try {
    await userGraphQlApi.changeOwnPassword({
      currentPassword: pwForm.value.currentPassword,
      newPassword: pwForm.value.newPassword,
      newPasswordRepeat: pwForm.value.newPasswordRepeat
    })
    showSnackbar('Passwort erfolgreich geändert', 'success')
    pwForm.value = {
      currentPassword: '',
      newPassword: '',
      newPasswordRepeat: ''
    }
    pwFormRef.value.resetValidation()
  } catch (e: any) {
    showSnackbar(e.message || 'Fehler beim Ändern des Passworts', 'error')
  } finally {
    pwSaving.value = false
  }
}

function showSnackbar(text: string, color = 'success') {
  snackbar.value = { show: true, text, color }
}
</script>
