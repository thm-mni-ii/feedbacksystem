<template>
  <v-container fluid class="pa-6">
    <v-row class="mb-4 align-center">
      <v-col cols="12" sm="8">
        <h1 class="text-h4 font-weight-bold d-flex align-center">
          <v-icon icon="mdi-view-grid-plus" class="mr-3" color="primary"></v-icon>
          Anwendungsverwaltung
        </h1>
        <p class="text-subtitle-1 text-medium-emphasis mt-1">
          Registrieren und verwalten Sie Fachanwendungen (ApplicationProviders) und deren OIDC-Clients für die Web Shell.
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
            <th class="text-center">OIDC Client</th>
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
              <td colspan="10" class="text-center py-8">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
                <div class="mt-2 text-caption">Lade Anwendungen...</div>
              </td>
            </tr>
          </template>
          <template v-else-if="filteredApps.length === 0">
            <tr>
              <td colspan="10" class="text-center py-8 text-medium-emphasis">
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
                  <v-chip
                    v-if="app.isInternal"
                    size="x-small"
                    color="info"
                    class="ml-2 font-weight-bold"
                  >
                    Intern
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
                  v-if="app.oidcEnabled || app.clientId"
                  size="small"
                  :color="app.clientType === 'CONFIDENTIAL' ? 'warning' : 'indigo-darken-1'"
                  variant="tonal"
                  :prepend-icon="app.clientType === 'CONFIDENTIAL' ? 'mdi-shield-key' : 'mdi-shield-key-outline'"
                  class="cursor-pointer"
                  title="OIDC Konfiguration & Secret anzeigen"
                  @click="openSecretDialog(app)"
                >
                  {{ app.clientId || app.id }}
                  <span v-if="app.clientType === 'CONFIDENTIAL'" class="ml-1 text-caption font-weight-bold">(Secret)</span>
                </v-chip>
                <span v-else class="text-caption text-medium-emphasis">–</span>
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
                  icon="mdi-key-variant"
                  size="small"
                  variant="text"
                  color="indigo-darken-1"
                  title="OIDC Secret anzeigen / neu generieren"
                  @click="openSecretDialog(app)"
                ></v-btn>
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
    <v-dialog v-model="dialog" max-width="750" persistent>
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

              <!-- General Switches -->
              <v-col cols="12" sm="6" class="d-flex align-center flex-wrap">
                <v-switch
                  v-model="form.showInNavbar"
                  color="primary"
                  label="In Navbar"
                  class="mr-4"
                  hide-details
                ></v-switch>
                <v-switch
                  v-model="form.isDefault"
                  color="secondary"
                  label="Standard-App"
                  class="mr-4"
                  hide-details
                ></v-switch>
                <v-switch
                  v-model="form.isActive"
                  color="success"
                  label="Aktiv"
                  hide-details
                ></v-switch>
              </v-col>

              <!-- Internal Component Switch -->
              <v-col cols="12">
                <v-switch
                  v-model="form.isInternal"
                  color="info"
                  label="Interne FBS-Komponente (sub = User-ID)"
                  hint="Nur für Kernkomponenten des Feedback-Systems aktivieren (sub = numerische User-ID). Externe Anwendungen erhalten sub = Username."
                  persistent-hint
                  density="compact"
                ></v-switch>
              </v-col>

              <!-- OIDC Client Card Section -->
              <v-col cols="12">
                <v-card variant="outlined" class="pa-4 rounded-lg bg-surface">
                  <div class="d-flex align-center justify-space-between mb-2">
                    <div class="d-flex align-center font-weight-bold">
                      <v-icon icon="mdi-shield-key-outline" color="primary" class="mr-2"></v-icon>
                      <span>OAuth 2.0 / OIDC Client Konfiguration</span>
                    </div>
                    <v-switch
                      v-model="oidcEnabled"
                      color="primary"
                      label="OIDC-Client aktivieren"
                      hide-details
                      density="compact"
                    ></v-switch>
                  </div>

                  <template v-if="oidcEnabled">
                    <p class="text-caption text-medium-emphasis mb-4">
                      Konfiguriert den OAuth2-Client im Identity Service. Erlaubt dieser Fachanwendung die Single-Sign-On-Authentifizierung gegen das Feedback System.
                    </p>

                    <v-row>
                      <!-- Client ID -->
                      <v-col cols="12" sm="6">
                        <v-text-field
                          v-model="form.clientId"
                          label="OIDC Client ID *"
                          :placeholder="form.id || 'z.B. local'"
                          hint="Standardmäßig die Anwendungs-ID"
                          persistent-hint
                          variant="outlined"
                          density="comfortable"
                        ></v-text-field>
                      </v-col>

                      <!-- Client Type -->
                      <v-col cols="12" sm="6">
                        <v-select
                          v-model="clientType"
                          :items="['PUBLIC', 'CONFIDENTIAL']"
                          label="Client-Typ *"
                          variant="outlined"
                          density="comfortable"
                          hint="PUBLIC (mit PKCE für SPAs) oder CONFIDENTIAL (Backend)"
                          persistent-hint
                        ></v-select>
                      </v-col>

                      <!-- Client Secret (for CONFIDENTIAL clients) -->
                      <v-col v-if="clientType === 'CONFIDENTIAL'" cols="12">
                        <v-text-field
                          v-model="form.clientSecret"
                          label="Client Secret (Geheimnis)"
                          :type="showSecretInForm ? 'text' : 'password'"
                          variant="outlined"
                          density="comfortable"
                          placeholder="Automatisch generiert oder manuell eingeben"
                          hint="Geheimnis für Server-Authentifizierung (Confidential Client)"
                          persistent-hint
                        >
                          <template #append-inner>
                            <v-btn
                              :icon="showSecretInForm ? 'mdi-eye-off' : 'mdi-eye'"
                              variant="text"
                              density="compact"
                              :title="showSecretInForm ? 'Secret verbergen' : 'Secret anzeigen'"
                              @click="showSecretInForm = !showSecretInForm"
                            ></v-btn>
                            <v-btn
                              v-if="form.clientSecret"
                              icon="mdi-content-copy"
                              variant="text"
                              density="compact"
                              title="In Zwischenablage kopieren"
                              @click="copyToClipboard(form.clientSecret)"
                            ></v-btn>
                            <v-btn
                              icon="mdi-refresh"
                              variant="text"
                              density="compact"
                              title="Neues Secret im Formular erzeugen"
                              @click="generateRandomFormSecret"
                            ></v-btn>
                          </template>
                        </v-text-field>
                      </v-col>

                      <!-- Redirect URIs -->
                      <v-col cols="12">
                        <v-textarea
                          v-model="redirectUrisText"
                          label="Erlaubte Redirect URIs (Callback URLs)"
                          placeholder="https://fbs-local.mni.thm.de/login&#10;http://localhost:3000/oauth2/callback"
                          rows="3"
                          variant="outlined"
                          density="comfortable"
                          hint="Zeilen- oder kommagetrennte Liste der autorisierten Callback-URIs"
                          persistent-hint
                        ></v-textarea>
                      </v-col>

                      <!-- Post Logout Redirect URIs -->
                      <v-col cols="12">
                        <v-textarea
                          v-model="postLogoutRedirectUrisText"
                          label="Erlaubte Post-Logout Redirect URIs (optional)"
                          placeholder="https://fbs-local.mni.thm.de/&#10;http://localhost:3000/"
                          rows="2"
                          variant="outlined"
                          density="comfortable"
                          hint="Zeilen- oder kommagetrennte Liste der Redirect-URIs nach dem Abmelden"
                          persistent-hint
                        ></v-textarea>
                      </v-col>

                      <!-- Scopes -->
                      <v-col cols="12">
                        <v-combobox
                          v-model="selectedScopes"
                          :items="['openid', 'profile', 'email']"
                          label="Erlaubte Scopes"
                          multiple
                          chips
                          variant="outlined"
                          density="comfortable"
                        ></v-combobox>
                      </v-col>
                    </v-row>
                  </template>
                </v-card>
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

    <!-- OIDC Client Secret Management Dialog -->
    <v-dialog v-model="secretDialog" max-width="600" persistent>
      <v-card class="rounded-lg">
        <v-card-title class="pa-4 bg-primary text-white d-flex align-center">
          <v-icon icon="mdi-shield-key" class="mr-2"></v-icon>
          <span>OIDC Secret: {{ selectedAppForSecret?.title }}</span>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" size="small" @click="secretDialog = false"></v-btn>
        </v-card-title>

        <v-card-text class="pa-6">
          <v-row class="mb-2">
            <v-col cols="12" sm="6" class="py-1">
              <div class="text-caption text-medium-emphasis">Anwendungs-ID</div>
              <div class="font-weight-medium font-family-monospace"><code>{{ selectedAppForSecret?.id }}</code></div>
            </v-col>
            <v-col cols="12" sm="6" class="py-1">
              <div class="text-caption text-medium-emphasis">OIDC Client-ID</div>
              <div class="font-weight-medium font-family-monospace"><code>{{ selectedAppForSecret?.clientId || selectedAppForSecret?.id }}</code></div>
            </v-col>
            <v-col cols="12" sm="6" class="py-1">
              <div class="text-caption text-medium-emphasis">Client-Typ</div>
              <v-chip size="small" :color="selectedAppForSecret?.clientType === 'CONFIDENTIAL' ? 'warning' : 'primary'" class="mt-1">
                {{ selectedAppForSecret?.clientType || 'PUBLIC' }}
              </v-chip>
            </v-col>
            <v-col cols="12" sm="6" class="py-1">
              <div class="text-caption text-medium-emphasis">OIDC Status</div>
              <v-chip size="small" :color="selectedAppForSecret?.oidcEnabled ? 'success' : 'grey'" class="mt-1">
                {{ selectedAppForSecret?.oidcEnabled ? 'Aktiviert' : 'Deaktiviert' }}
              </v-chip>
            </v-col>
          </v-row>

          <v-divider class="my-4"></v-divider>

          <div v-if="selectedAppForSecret?.clientSecret">
            <div class="text-subtitle-2 font-weight-bold mb-2">Generiertes Client Secret:</div>
            <v-text-field
              :model-value="selectedAppForSecret.clientSecret"
              :type="showSecretInModal ? 'text' : 'password'"
              variant="outlined"
              density="comfortable"
              readonly
              hide-details
              class="mb-2"
            >
              <template #append-inner>
                <v-btn
                  :icon="showSecretInModal ? 'mdi-eye-off' : 'mdi-eye'"
                  variant="text"
                  density="compact"
                  :title="showSecretInModal ? 'Secret verbergen' : 'Secret anzeigen'"
                  @click="showSecretInModal = !showSecretInModal"
                ></v-btn>
                <v-btn
                  icon="mdi-content-copy"
                  variant="text"
                  density="compact"
                  title="In Zwischenablage kopieren"
                  @click="copyToClipboard(selectedAppForSecret?.clientSecret)"
                ></v-btn>
              </template>
            </v-text-field>
            <v-alert
              type="info"
              variant="tonal"
              density="compact"
              class="mb-2"
              text="Wichtig: Bitte kopieren Sie dieses Secret jetzt. Aus Sicherheitsgründen wird es nach Schließen dieses Dialogs nicht erneut im Klartext angezeigt."
            ></v-alert>
          </div>
          <div v-else-if="selectedAppForSecret?.hasClientSecret || selectedAppForSecret?.clientType === 'CONFIDENTIAL'">
            <v-alert
              type="info"
              variant="tonal"
              density="compact"
              class="mb-2"
              title="Client Secret ist sicher konfiguriert"
              text="Diese Anwendung ist als vertraulicher Client (CONFIDENTIAL) konfiguriert und das Secret wird sicher gehasht gespeichert. Falls Sie das Secret verloren haben oder rotieren möchten, können Sie unten ein neues Secret generieren."
            ></v-alert>
          </div>
          <div v-else>
            <v-alert
              type="info"
              variant="tonal"
              density="compact"
              class="mb-2"
              title="Kein Client Secret vorhanden"
              text="Diese Anwendung ist aktuell als öffentlicher Client (PUBLIC mit PKCE) konfiguriert. Wenn Sie ein Client-Secret generieren, wird der Client-Typ automatisch auf CONFIDENTIAL umgestellt."
            ></v-alert>
          </div>

          <v-alert
            v-if="selectedAppForSecret?.clientSecret"
            type="warning"
            variant="tonal"
            density="compact"
            class="mt-4"
            text="Hinweis: Beim Neugenerieren des Secrets wird das bisherige Secret sofort ungültig. Verknüpfte Backend-Dienste müssen aktualisiert werden."
          ></v-alert>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4">
          <v-btn
            color="warning"
            variant="outlined"
            prepend-icon="mdi-refresh"
            :loading="regeneratingSecret"
            @click="openRegenerateConfirmDialog"
          >
            Neues Secret generieren
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="secretDialog = false">Schließen</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Regenerate Secret Confirmation Dialog -->
    <v-dialog v-model="regenerateConfirmDialog" max-width="480">
      <v-card class="rounded-lg">
        <v-card-title class="pa-4 bg-warning text-white d-flex align-center">
          <v-icon icon="mdi-alert" class="mr-2"></v-icon>
          <span>Client Secret neu generieren?</span>
        </v-card-title>
        <v-card-text class="pa-6 text-body-1">
          Möchten Sie für <strong>{{ selectedAppForSecret?.title }}</strong> wirklich ein neues Client Secret generieren?
          <br><br>
          <span class="text-error font-weight-bold">Das bisherige Secret wird sofort ungültig!</span>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="regenerateConfirmDialog = false">Abbrechen</v-btn>
          <v-btn
            color="warning"
            variant="elevated"
            :loading="regeneratingSecret"
            @click="confirmRegenerateSecret"
          >
            Secret neu generieren
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
  AppRequiredRole,
  OidcClientType
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

const oidcEnabled = ref(false)
const redirectUrisText = ref('')
const postLogoutRedirectUrisText = ref('')
const clientType = ref<OidcClientType>('PUBLIC')
const selectedScopes = ref<string[]>(['openid', 'profile', 'email'])

// Secret modal & management
const secretDialog = ref(false)
const selectedAppForSecret = ref<ApplicationProvider | null>(null)
const showSecretInModal = ref(false)
const showSecretInForm = ref(false)
const regenerateConfirmDialog = ref(false)
const regeneratingSecret = ref(false)

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
  isInternal: false,
  clientId: '',
  clientSecret: ''
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
  oidcEnabled.value = false
  redirectUrisText.value = ''
  postLogoutRedirectUrisText.value = ''
  clientType.value = 'PUBLIC'
  selectedScopes.value = ['openid', 'profile', 'email']
  showSecretInForm.value = false
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
    isInternal: app.isInternal ?? false,
    clientId: app.clientId || '',
    clientSecret: app.clientSecret || ''
  }
  oidcEnabled.value = app.oidcEnabled ?? !!app.clientId
  redirectUrisText.value = (app.redirectUris || []).join('\n')
  postLogoutRedirectUrisText.value = (app.postLogoutRedirectUris || []).join('\n')
  clientType.value = app.clientType || 'PUBLIC'
  selectedScopes.value = app.scopes?.length ? [...app.scopes] : ['openid', 'profile', 'email']
  showSecretInForm.value = false
  dialog.value = true
}

function openSecretDialog(app: ApplicationProvider) {
  selectedAppForSecret.value = app
  showSecretInModal.value = false
  secretDialog.value = true
}

function openRegenerateConfirmDialog() {
  regenerateConfirmDialog.value = true
}

async function confirmRegenerateSecret() {
  if (!selectedAppForSecret.value) return
  regeneratingSecret.value = true
  try {
    const updated = await appProviderApi.regenerateSecret(selectedAppForSecret.value.id)
    selectedAppForSecret.value = updated
    showSecretInModal.value = true
    regenerateConfirmDialog.value = false
    showSnackbar('Neues Client Secret erfolgreich generiert!', 'success')
    await loadApps()
  } catch (e: any) {
    showSnackbar(e.response?.data?.message || e.message || 'Fehler beim Generieren des Secrets', 'error')
  } finally {
    regeneratingSecret.value = false
  }
}

function generateRandomFormSecret() {
  const arr = new Uint8Array(32)
  window.crypto.getRandomValues(arr)
  let binary = ''
  for (let i = 0; i < arr.byteLength; i++) {
    binary += String.fromCharCode(arr[i])
  }
  const base64 = window.btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  form.value.clientSecret = base64
  showSecretInForm.value = true
  showSnackbar('Neues Client Secret im Formular erzeugt', 'info')
}

async function copyToClipboard(text?: string | null) {
  if (!text) return
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
    } else {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    showSnackbar('Client Secret in die Zwischenablage kopiert', 'success')
  } catch {
    showSnackbar('Kopieren fehlgeschlagen', 'error')
  }
}

async function saveApp() {
  if (!formRef.value) return
  const { valid } = await formRef.value.validate()
  if (!valid) return

  const parsedRedirectUris = redirectUrisText.value
    ? redirectUrisText.value.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean)
    : []
  const parsedPostLogoutUris = postLogoutRedirectUrisText.value
    ? postLogoutRedirectUrisText.value.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean)
    : []

  const effectiveClientId = oidcEnabled.value
    ? (form.value.clientId?.trim() || form.value.id.trim())
    : null

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
        isInternal: form.value.isInternal,
        clientId: effectiveClientId,
        oidcEnabled: oidcEnabled.value,
        redirectUris: parsedRedirectUris,
        postLogoutRedirectUris: parsedPostLogoutUris,
        clientType: clientType.value,
        scopes: selectedScopes.value,
        clientSecret: clientType.value === 'CONFIDENTIAL' ? (form.value.clientSecret?.trim() || null) : null
      })
      showSnackbar('Fachanwendung erfolgreich aktualisiert', 'success')
    } else {
      const created = await appProviderApi.createProvider({
        ...form.value,
        isInternal: form.value.isInternal,
        clientId: effectiveClientId,
        oidcEnabled: oidcEnabled.value,
        redirectUris: parsedRedirectUris,
        postLogoutRedirectUris: parsedPostLogoutUris,
        clientType: clientType.value,
        scopes: selectedScopes.value,
        clientSecret: clientType.value === 'CONFIDENTIAL' ? (form.value.clientSecret?.trim() || null) : null
      })
      showSnackbar('Fachanwendung erfolgreich registriert', 'success')
      if (created.clientSecret) {
        selectedAppForSecret.value = created
        showSecretInModal.value = true
        secretDialog.value = true
      }
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
